import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// ---------- Helpers ----------

// Tasks of a collab list live inside that list: lists/{listId}/tasks
const tasksRef = (listId) => collection(db, "lists", listId, "tasks");

// Turns a Firestore "permission denied" into a friendly message
function friendlyError(err, fallback) {
  if (err.code === "permission-denied") {
    return new Error(fallback);
  }
  return err;
}

// ---------- Lists ----------

// Create a collaborative list. The owner is also put in memberIds.
export async function createList(name) {
  const uid = auth.currentUser.uid;
  const ref = await addDoc(collection(db, "lists"), {
    name: name.trim(),
    ownerId: uid,
    memberIds: [uid],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Owner adds someone by username. Rules block non-owners from succeeding.
export async function addMemberByUsername(listId, username) {
  const key = username.trim().replace(/^@/, "").toLowerCase();
  if (!key) throw new Error("Enter a username");

  const snap = await getDoc(doc(db, "usernames", key));
  if (!snap.exists()) throw new Error("No user with that username");

  try {
    await updateDoc(doc(db, "lists", listId), {
      memberIds: arrayUnion(snap.data().uid),
    });
  } catch (err) {
    throw friendlyError(err, "Only the list owner can add members");
  }
}

// Owner deletes a list. Its tasks are deleted first so none are left behind.
export async function deleteList(listId) {
  try {
    const snap = await getDocs(tasksRef(listId));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, "lists", listId));
  } catch (err) {
    throw friendlyError(err, "Only the list owner can delete this list");
  }
}

// ---------- Tasks inside a list ----------

// Add a task. Saves your own uid as userId (the rules require it).
export async function addListTask(listId, data) {
  const uid = auth.currentUser.uid;
  try {
    await addDoc(tasksRef(listId), {
      taskName: data.taskName,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      status: data.status || "not started",
      priority: data.priority || "low",
      category: data.category || "school",
      userId: uid,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    throw friendlyError(err, "You don't have access to this list");
  }
}

// Edit a task. Only the changed fields are sent; userId is never touched.
export async function updateListTask(listId, taskId, changes) {
  const { userId, createdAt, id, ...safe } = changes; // never send these back
  try {
    await updateDoc(doc(db, "lists", listId, "tasks", taskId), safe);
  } catch (err) {
    throw friendlyError(err, "You don't have access to this list");
  }
}

// Flip a task between 'done' and 'not started'
export async function toggleListTaskStatus(listId, task) {
  const next = task.status === "done" ? "not started" : "done";
  await updateListTask(listId, task.id, { status: next });
}

// Delete a task
export async function deleteListTask(listId, taskId) {
  try {
    await deleteDoc(doc(db, "lists", listId, "tasks", taskId));
  } catch (err) {
    throw friendlyError(err, "You don't have access to this list");
  }
}

// ---------- Hooks ----------

// Live list of every collaborative list the current user belongs to
export function useMyLists() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "lists"),
      where("memberIds", "array-contains", uid)
    );
    return onSnapshot(
      q,
      (snap) => {
        setLists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("useMyLists:", err);
        setLoading(false);
      }
    );
  }, [uid]);

  return { lists, loading };
}

// Live tasks of one collaborative list.
// `error` becomes true if access is lost (e.g. removed from the list).
export function useListTasks(listId) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setTasks([]);
    setError(false);

    if (!uid || !listId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      tasksRef(listId),
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("useListTasks:", err);
        setError(true);
        setLoading(false);
      }
    );
  }, [uid, listId]);

  return { tasks, loading, error };
}