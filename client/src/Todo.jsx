// DESCRIPTION: Controls app structure, state management, and persistence
import { useState, useEffect, useRef } from 'react';

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

import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";

import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';

function Todo() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeletes, setPendingDeletes] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [priorityFilter, setFilterByPriority] = useState('all');
  const [categoryFilter, setFilterByCategory] = useState('all');

  const sortMenuRef = useRef(null);

  const sortOptions = [
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'category', label: 'Category' },
  ];

  // FIREBASE: subscribe to this user's tasks in Firestore and keep state in sync in real time
  useEffect(() => {
    if (!user) return;

    // get tasks from that userId
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTasks = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setTasks(fetchedTasks);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Listener Error:", error);
        setLoading(false);
      }
    );

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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        priority: newTaskData.priority || 'low',
        category: newTaskData.category || 'school',
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      setIsFormOpen(false);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // FIREBASE: flip a task's status between 'done' and 'not started' in Firestore
  const handleToggleStatus = async (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);

    if (!targetTask) return;

    const nextStatus =
      targetTask.status === 'done' ? 'not started' : 'done';

    const taskRef = doc(db, "tasks", taskId);

    try {
      await updateDoc(taskRef, { status: nextStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // DELETE: called when the user clicks the delete icon on a task; opens the confirmation dialog
  const handleRequestDelete = (taskId) => {
    setTaskToDelete(taskId);
  };

  // DELETE: called when the user confirms in the dialog; kicks off the actual (undo-able) delete
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete);
    }

    setTaskToDelete(null);
  };

  // DELETE: called when the user cancels the dialog; just closes it, nothing is deleted
  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  // DELETE / FIREBASE: starts a 5s undo window before permanently removing the task from Firestore
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

    setPendingDeletes((prev) => ({
      ...prev,
      [taskId]: timeoutId
    }));
  };

  // UNDO: cancels a pending delete's timeout before it fires, keeping the task alive
  const handleUndoDelete = (taskId) => {
    const timeoutId = pendingDeletes[taskId];

    if (timeoutId) clearTimeout(timeoutId);

    setPendingDeletes((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  // EDIT: puts a task into edit mode, pre-filling the shared TodoForm
  const handleStartEdit = (task) => {
    setEditingTask(task);
  };

  // EDIT / FIREBASE: saves the edited fields to Firestore and exits edit mode
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

  // FORM: closes the popup for both add and edit, without saving anything
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // handles filter task
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === 'all' ||
      task.priority?.toLowerCase() === priorityFilter;

    const matchesCategory =
      categoryFilter === 'all' ||
      task.category?.toLowerCase() === categoryFilter;

    return matchesPriority && matchesCategory;
  });

  // SORT: priority rank used when sorting by priority (lower = higher priority)
  const priorityOrder = {
    high: 0,
    medium: 1,
    low: 2
  };

  // SORT: derives a sorted copy of the filtered tasks based on the currently selected sortBy key
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return (
          new Date(`${a.dueDate}T${a.dueTime}`) -
          new Date(`${b.dueDate}T${b.dueTime}`)
        );

      case 'priority':
        return (
          (priorityOrder[a.priority?.toLowerCase()] ?? 3) -
          (priorityOrder[b.priority?.toLowerCase()] ?? 3)
        );

      case 'category':
        return (a.category || '').localeCompare(b.category || '');

      case 'dateAdded':
      default:
        return (a.createdAt?.seconds ?? 0) -
          (b.createdAt?.seconds ?? 0);
    }
  });

  if (loading) {
    return (
      <div className="text-white text-center py-20 font-semibold">
        Loading your tasks...
      </div>
    );
  }

  return (
    <>
      {/* main container */}
      <div className="w-full max-w-6xl flex-1 bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">

        {/* header */}
        <div className="flex justify-between items-center border-b border-pink-400/30 pb-4">
          <div>
            <h2 className="text-sm text-pink-100 mb-1">
              Hello, {user.displayName || user.email}
            </h2>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              My Todo List
            </h1>

            <p className="text-xs text-pink-200/80 italic mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* All button + priority/category filters */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                setFilterByPriority('all');
                setFilterByCategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                priorityFilter === 'all' && categoryFilter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-[#8c4362]/60 text-pink-100 hover:bg-[#8c4362]/80'
              }`}
            >
              All
            </button>

            <select
              value={priorityFilter}
              onChange={(e) => setFilterByPriority(e.target.value)}
              className={`px-2 py-1.5 rounded-lg outline-none cursor-pointer transition-colors ${
                priorityFilter !== 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-[#8c4362]/60 text-pink-100 hover:bg-[#8c4362]/80'
              }`}
            >
              <option value="all" className="bg-[#8c4362] text-pink-100">Priority</option>
              <option value="low" className="bg-[#8c4362] text-pink-100">Low</option>
              <option value="medium" className="bg-[#8c4362] text-pink-100">Medium</option>
              <option value="high" className="bg-[#8c4362] text-pink-100">High</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setFilterByCategory(e.target.value)}
              className={`px-2 py-1.5 rounded-lg outline-none cursor-pointer transition-colors ${
                categoryFilter !== 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-[#8c4362]/60 text-pink-100 hover:bg-[#8c4362]/80'
              }`}
            >
              <option value="all" className="bg-[#8c4362] text-pink-100">Category</option>
              <option value="school" className="bg-[#8c4362] text-pink-100">School</option>
              <option value="personal" className="bg-[#8c4362] text-pink-100">Personal</option>
              <option value="work" className="bg-[#8c4362] text-pink-100">Work</option>
              <option value="others" className="bg-[#8c4362] text-pink-100">Others</option>
            </select>
          </div>
        </div>

        {/* toolbar row: sort menu on the left, add button on the right */}
        <div className="flex justify-between items-center">

          {/* SORT: dropdown for choosing the active sortBy key */}
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

          {/* ADD: opens the popup with a blank form */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            + Add New Task
          </button>
        </div>

        {/* task cards, rendered in filtered + sorted order */}
        <div className="flex flex-col gap-3 flex-1 min-h-[200px] overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-pink-200/60 font-medium text-sm py-12">
              {tasks.length === 0
                ? "No tasks added yet. Create now!"
                : "No tasks match this filter."}
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
                isPendingDelete={!!pendingDeletes[task.id]}
              />
            ))
          )}
        </div>
      </div>

      {/* ADD / EDIT: popup containing the form */}
      {(isFormOpen || editingTask) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseForm}
        >
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {editingTask ? (
              <TodoForm
                key={editingTask.id}
                initialValues={editingTask}
                onSubmit={handleUpdateTask}
                onCancel={handleCloseForm}
                buttonText="Save Changes"
              />
            ) : (
              <TodoForm
                key="new"
                onSubmit={handleAddTask}
                onCancel={handleCloseForm}
                buttonText="Add Task"
              />
            )}
          </div>
        </div>
      )}

      {/* DELETE: confirmation modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#bc688c] rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4">
            <h2 className="text-white font-bold text-lg">
              Delete this task?
            </h2>

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
    </>
  );
}

export default Todo;
