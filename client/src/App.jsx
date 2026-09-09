// DESCRIPTION: Controls app structure, state management, and persistence

import { useState, useEffect, useRef } from 'react';

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
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);

  const sortOptions = [
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'category', label: 'Category' },
  ];

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

  // close sort menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // add task to firestore
  const handleAddTask = async (newTaskData) => {
    if (!newTaskData.taskName || !newTaskData.taskName.trim() || !user) return;

    try {
      await addDoc(collection(db, "tasks"), {
        taskName: newTaskData.taskName,
        dueDate: newTaskData.dueDate,
        dueTime: newTaskData.dueTime,
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

  // called when the user clicks the delete icon on a task
  const handleRequestDelete = (taskId) => {
    setTaskToDelete(taskId);
  };

  // called when the user confirms in the dialog
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete); // your existing function, unchanged
    }
    setTaskToDelete(null);
  };

  // called when the user cancels
  const handleCancelDelete = () => {
    setTaskToDelete(null);
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

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(`${a.dueDate}T${a.dueTime}`) - new Date(`${b.dueDate}T${b.dueTime}`);
      case 'priority':
        return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'dateAdded':
      default:
        return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
    }
  });

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

        {/* sorting options */}
        <div className="relative w-fit" ref={sortMenuRef}>
          <button
            onClick={() => setSortMenuOpen((prev) => !prev)}
            className="flex items-center gap-1 bg-[#8c4362]/60 text-pink-100 text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#8c4362]/80 transition-colors"
          >
            Sort by
            <span className="text-[10px]">▾</span>
          </button>

          {sortMenuOpen && (
            <div className="absolute mt-1 w-44 bg-[#8c4362] rounded-lg shadow-lg overflow-hidden z-10">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setSortMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2.5 text-sm ${
                    sortBy === opt.value
                      ? 'bg-pink-500 text-white font-semibold'
                      : 'text-pink-100 hover:bg-[#6e324c]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* task cards */}
        <div className="flex flex-col gap-3 min-h-[200px] max-h-[450px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-pink-200/60 font-medium text-sm py-12">
              No tasks added yet. Create now!
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TodoItem 
                key={task.id} 
                task={task} 
                onToggleStatus={handleToggleStatus}
                onDelete={handleRequestDelete}
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

      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#bc688c] rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4">
            <h2 className="text-white font-bold text-lg">Delete this task?</h2>
            <p className="text-pink-100 text-sm">
              This can't be undone after a few seconds.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg text-pink-100 hover:bg-[#8c4362]/60 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default App;