// DESCRIPTION: Controls app structure, state management, and persistence

import { useState, useEffect } from 'react';


import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";


import Layout from './components/Layout';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeletes, setPendingDeletes] = useState({});
  const [editingTask, setEditingTask] = useState(null);

  // anonymous auth
  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth error:", err));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) return; //create anonym user first before fetching task

    // listen only to tasks belonging to this user's UID
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listener Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // add task to firestore
  const handleAddTask = async (newTaskData) => {
    if (!newTaskData.taskName || !newTaskData.taskName.trim() || !user) return;

    try {
      await addDoc(collection(db, "tasks"), {
        taskName: newTaskData.taskName,
        status: newTaskData.status || 'not started',
        priority: newTaskData.priority || 'Low',     
        category: newTaskData.category || 'General', 
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Toggle task status in Firestore
  const handleToggleStatus = async (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nextStatus = targetTask.status === 'done' ? 'not started' : 'done';
    const taskRef = doc(db, "tasks", taskId);

    try {
      await updateDoc(taskRef, { status: nextStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (pendingDeletes[taskId]) return; 

    const timeoutId = setTimeout(async () => {
      const taskRef = doc(db, "tasks", taskId);
      try {
        await deleteDoc(taskRef);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
      setPendingDeletes((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }, 5000);

    setPendingDeletes((prev) => ({ ...prev, [taskId]: timeoutId }));
  };

  const handleUndoDelete = (taskId) => {
    const timeoutId = pendingDeletes[taskId];
    if (timeoutId) clearTimeout(timeoutId);

    setPendingDeletes((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const handleStartEdit = (task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (updatedData) => {
    if (!editingTask) return;
    const taskRef = doc(db, "tasks", editingTask.id);
    try {
      await updateDoc(taskRef, updatedData);
      setEditingTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };


  if (loading) {
    return (
      <Layout>
        <div className="text-white text-center py-20 font-semibold">
          Loading your tasks...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* main container */}
      <div className="w-full max-w-4xl bg-[#bc688c] p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
        
        {/* header */}
        <div className="flex justify-between items-center border-b border-pink-400/30 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              My Todo List
            </h1>
            <p className="text-xs text-pink-200/80 italic mt-0.5">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          {/* status filter */}
          <div className="flex gap-1.5 text-xs font-semibold bg-[#8c4362]/60 p-1 rounded-xl">
            <button className="bg-pink-500 text-white px-3 py-1 rounded-lg">All</button>
            <button className="text-pink-100 hover:text-white px-3 py-1 rounded-lg transition-colors">To Do</button>
            <button className="text-pink-100 hover:text-white px-3 py-1 rounded-lg transition-colors">In Progress</button>
            <button className="text-pink-100 hover:text-white px-3 py-1 rounded-lg transition-colors">Done</button>
          </div>
        </div>

        {/* task cards */}
        <div className="flex flex-col gap-3 min-h-[200px] max-h-[450px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-pink-200/60 font-medium text-sm py-12">
              No tasks added yet. Create now!
            </div>
          ) : (
            tasks.map((task) => (
              <TodoItem 
                key={task.id} 
                task={task} 
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onUndo={handleUndoDelete}
                onEdit={handleStartEdit}
                isPendingDelete={!!pendingDeletes[[task.id]]}
              />
            ))
          )}
        </div>

        {editingTask ? (
          <TodoForm 
            key={editingTask.id}
            initialValues={editingTask} 
            onSubmit={handleUpdateTask} 
            onCancel={handleCancelEdit}
            buttonText="Save Changes" 
          />
        ) : (
          <TodoForm key="new" onSubmit={handleAddTask} buttonText="Add Task" />
        )}

      </div>
    </Layout>
  );
}

export default App;