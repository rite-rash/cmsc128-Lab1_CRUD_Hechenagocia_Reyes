// DESCRIPTION: personal todo
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
import Breadcrumbs from './components/Breadcrumbs';
import FilterSelect from './components/FilterSelect';

// small icons (inline so no extra dependency)
function ChevronIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3.5 h-3.5 ${className}`}
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="w-4 h-4"
    >
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

// how long the undo toast stays available before the task is really deleted
const UNDO_SECONDS = 5;

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M5.5 6l.7 9.2A1.5 1.5 0 0 0 7.7 16.5h4.6a1.5 1.5 0 0 0 1.5-1.3L14.5 6M8.5 9.5v4M11.5 9.5v4" />
    </svg>
  );
}

// returns the due date as a timestamp, or null if the task has no valid due date
function getDueTime(task) {
  if (!task.dueDate) return null;
  const t = new Date(`${task.dueDate}T${task.dueTime || '23:59'}`).getTime();
  return Number.isNaN(t) ? null : t;
}

function isOverdue(task) {
  const due = getDueTime(task);
  return task.status !== 'done' && due !== null && due < Date.now();
}

function Todo() {
  const { user } = useAuth();

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
  const [now, setNow] = useState(Date.now()); // ticks while a delete is pending (drives the toast countdown)

  const sortMenuRef = useRef(null);

  const sortOptions = [
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'category', label: 'Category' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const categoryOptions = [
    { value: 'school', label: 'School' },
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'others', label: 'Others' },
  ];

  // FIREBASE: subscribe to this user's tasks in Firestore and keep state in sync in real time
  useEffect(() => {
    if (!user) return;

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // tick every 250ms while at least one delete is pending so the toast countdown updates
  const hasPendingDeletes = Object.keys(pendingDeletes).length > 0;
  useEffect(() => {
    if (!hasPendingDeletes) return;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [hasPendingDeletes]);

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

  // FIREBASE: flip a task's status between 'done' and 'not started'
  const handleToggleStatus = async (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nextStatus = targetTask.status === 'done' ? 'not started' : 'done';

    try {
      await updateDoc(doc(db, "tasks", taskId), { status: nextStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // DELETE: opens the confirmation dialog
  const handleRequestDelete = (taskId) => setTaskToDelete(taskId);

  // DELETE: user confirmed; start the undo-able delete
  const handleConfirmDelete = () => {
    if (taskToDelete) handleDeleteTask(taskToDelete);
    setTaskToDelete(null);
  };

  // DELETE: user cancelled; nothing is deleted
  const handleCancelDelete = () => setTaskToDelete(null);

  // DELETE / FIREBASE: hides the task right away, then removes it from Firestore after the undo window
  const handleDeleteTask = (taskId) => {
    if (pendingDeletes[taskId]) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const timeoutId = setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "tasks", taskId));
      } catch (err) {
        console.error("Error deleting task:", err);
      }

      setPendingDeletes((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }, UNDO_SECONDS * 1000);

    setPendingDeletes((prev) => ({
      ...prev,
      [taskId]: {
        timeoutId,
        taskName: task.taskName,
        expiresAt: Date.now() + UNDO_SECONDS * 1000,
      },
    }));
  };

  // UNDO: cancels a pending delete before it fires, so the task reappears
  const handleUndoDelete = (taskId) => {
    const pending = pendingDeletes[taskId];
    if (pending) clearTimeout(pending.timeoutId);

    setPendingDeletes((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  // EDIT: puts a task into edit mode, pre-filling the shared TodoForm
  const handleStartEdit = (task) => setEditingTask(task);

  // EDIT / FIREBASE: saves the edited fields and exits edit mode
  const handleUpdateTask = async (updatedData) => {
    if (!editingTask) return;

    try {
      await updateDoc(doc(db, "tasks", editingTask.id), updatedData);
      setEditingTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // FORM: closes the popup for both add and edit, without saving
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // tasks waiting out their undo window are hidden from the list
  const visibleTasks = tasks.filter((task) => !pendingDeletes[task.id]);

  // FILTER
  const filteredTasks = visibleTasks.filter((task) => {
    const matchesPriority =
      priorityFilter === 'all' ||
      task.priority?.toLowerCase() === priorityFilter;

    const matchesCategory =
      categoryFilter === 'all' ||
      task.category?.toLowerCase() === categoryFilter;

    return matchesPriority && matchesCategory;
  });

  // SORT: priority rank (lower = higher priority)
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        // tasks without a valid due date go last
        return (getDueTime(a) ?? Infinity) - (getDueTime(b) ?? Infinity);

      case 'priority':
        return (
          (priorityOrder[a.priority?.toLowerCase()] ?? 3) -
          (priorityOrder[b.priority?.toLowerCase()] ?? 3)
        );

      case 'category':
        return (a.category || '').localeCompare(b.category || '');

      case 'dateAdded':
      default:
        return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
    }
  });

  // subtitle: "Monday, Nov 23, 2026"
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const allActive = priorityFilter === 'all' && categoryFilter === 'all';

  if (loading) {
    return (
      <div className="text-[#7a0f3d] text-center py-20 font-semibold">
        Loading your tasks...
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col gap-5">

        {/* breadcrumbs */}
        <div className="-mb-2">
          <Breadcrumbs items={[{ label: 'Personal list' }]} />
        </div>

        {/* header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#7a0f3d] leading-tight">
              My tasks
            </h1>

            <p className="text-sm text-[#6b4a58] mt-1">
              {todayLabel}
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="shrink-0 flex items-center gap-2 bg-[#c2185b] hover:bg-[#a8144d] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-pink-300/50 transition-colors cursor-pointer"
          >
            <PlusIcon />
            Add new task
          </button>
        </div>

        {/* filters (left) + sort (right) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setFilterByPriority('all');
                setFilterByCategory('all');
              }}
              aria-pressed={allActive}
              className={`rounded-full border px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                allActive
                  ? 'bg-[#7a0f3d] border-[#7a0f3d] text-white'
                  : 'bg-white border-pink-200 text-[#4a1f33] hover:bg-pink-50'
              }`}
            >
              All
            </button>

            <FilterSelect
              value={priorityFilter}
              onChange={setFilterByPriority}
              placeholder="Priority"
              options={priorityOptions}
            />

            <FilterSelect
              value={categoryFilter}
              onChange={setFilterByCategory}
              placeholder="Category"
              options={categoryOptions}
            />
          </div>

          {/* SORT dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setSortMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={sortMenuOpen}
              className="flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-[#4a1f33] cursor-pointer hover:bg-pink-50 transition-colors"
            >
              Sort by
              <ChevronIcon />
            </button>

            {sortMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 bg-white border border-pink-200 rounded-2xl shadow-lg overflow-hidden z-10"
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    role="menuitem"
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                      sortBy === opt.value
                        ? 'bg-pink-50 text-[#7a0f3d] font-semibold'
                        : 'text-[#4a1f33] hover:bg-pink-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* task cards, filtered + sorted */}
        <div className="flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center text-[#6b4a58]/70 font-medium text-sm py-12">
              {visibleTasks.length === 0
                ? "No tasks added yet. Create now!"
                : "No tasks match this filter."}
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TodoItem
                key={task.id}
                task={task}
                isOverdue={isOverdue(task)}
                onToggleStatus={handleToggleStatus}
                onDelete={handleRequestDelete}
                onEdit={handleStartEdit}
              />
            ))
          )}
        </div>
      </div>

      {/* ADD / EDIT: popup containing the form */}
      {(isFormOpen || editingTask) && (
        <div
          className="fixed inset-0 bg-[#3a1426]/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseForm}
        >
          <div
            className="w-full max-w-[44rem]"
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
        <div
          className="fixed inset-0 bg-[#3d0a22]/45 flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-5 md:p-6 w-full max-w-md flex flex-col gap-4"
          >
            <div className="w-9 h-9 rounded-full bg-pink-100 text-[#b3261e] flex items-center justify-center">
              <TrashIcon />
            </div>

            <h2 id="delete-title" className="font-serif text-[#7a0f3d] font-bold text-xl">
              Delete this task?
            </h2>

            <p className="text-[#6b4a58] text-sm">
              “{tasks.find((t) => t.id === taskToDelete)?.taskName}” will be removed from your
              list. You’ll have {UNDO_SECONDS} seconds to undo.
            </p>

            <div className="flex justify-end items-center gap-2 mt-1">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-2 rounded-xl text-[#7a0f3d] hover:bg-pink-50 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#b3261e] hover:bg-[#8f1d17] text-white text-sm font-semibold shadow-md shadow-red-300/50 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO: toast(s) shown while a delete is waiting out its undo window */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 inset-x-0 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        {Object.entries(pendingDeletes).map(([taskId, pending]) => {
          const secondsLeft = Math.min(
            UNDO_SECONDS,
            Math.max(0, Math.ceil((pending.expiresAt - now) / 1000))
          );

          return (
            <div
              key={taskId}
              className="pointer-events-auto w-full max-w-sm flex items-center gap-3 bg-[#3d1226] text-white rounded-2xl shadow-xl px-4 py-3"
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-7 h-7 rounded-full border-2 border-pink-200/70 flex items-center justify-center text-xs font-semibold"
              >
                {secondsLeft}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">“{pending.taskName}” deleted</p>
                <p className="text-xs text-pink-100/80">
                  Undo available for {secondsLeft} more {secondsLeft === 1 ? 'second' : 'seconds'}
                </p>
              </div>

              <button
                onClick={() => handleUndoDelete(taskId)}
                className="shrink-0 px-2 py-1 rounded-lg text-sm font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                Undo
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Todo;