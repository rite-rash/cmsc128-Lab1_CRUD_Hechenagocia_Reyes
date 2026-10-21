//DESCRIPTION: loads list for both "owned by me" and "shared with me"
//          also allows actions: add, edit, check off, delete tasks

import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";
import {
    useListTasks, useUserNames, addListTask, updateListTask,
    toggleListTaskStatus, deleteListTask,
} from "./ListService";


import ListMembers from "./ListMembers";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";


// Button styles shared with OwnedList / TodoItem so the whole app feels consistent
const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-200/80";

const btnBase = `rounded-lg text-xs font-semibold transition-colors cursor-pointer ${focusRing}`;
const btnPrimary = `${btnBase} px-4 py-2 text-white bg-pink-500 hover:bg-pink-600`;
const btnCancel  = `${btnBase} px-4 py-2 text-pink-100 hover:text-white bg-[#59243e] hover:bg-[#59243e]/70`;
const btnDanger  = `${btnBase} px-4 py-2 text-white bg-rose-600 hover:bg-rose-700`;

// Toolbar chips (back, members, sort, filters). Active = pink, idle = muted plum
const chip       = `${btnBase} inline-flex items-center gap-2 px-3 py-1.5`;
const chipIdle   = "bg-[#8c4362]/60 text-pink-100 hover:bg-[#8c4362]/80 hover:text-white";
const chipActive = "bg-pink-500 text-white hover:bg-pink-600";


function CollabTodo() {
    const { listId } = useParams();

    const { user } = useAuth();
    const { tasks, error: tasksError } = useListTasks(listId);
    const [list, setList] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [actionError, setActionError] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);          // add/edit popup (same as Todo.jsx)
    const [isMembersOpen, setIsMembersOpen] = useState(false);    // members popup (new)
    const [taskToDelete, setTaskToDelete] = useState(null);       // task waiting for delete confirmation
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

    const names = useUserNames(list?.memberIds); //? to not crash if undefined since initially list is null

    useEffect(() => {
        return onSnapshot(
            doc(db, "lists", listId),
            (snap) => snap.exists() && setList({ id: snap.id, ...snap.data() }),
            () => {} // ListGuard already handles access
        );
    }, [listId]);

    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
                setSortMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const run = async (fn) => {
        setActionError("");
        try { await fn(); } catch (err) { setActionError(err.message); }
    };

    if (tasksError) return <Navigate to="/" replace />;
    if (!list) return <p className="text-white font-semibold p-8">Loading...</p>;

    const isOwner = list?.ownerId === user.uid;
    const memberCount = list.memberIds?.length || 0;
    const filtersActive = priorityFilter !== 'all' || categoryFilter !== 'all';
    const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label;


    const handleRequestDelete = (taskId) => setTaskToDelete(taskId);

    const handleConfirmDelete = () => {
        if (taskToDelete) run(() => deleteListTask(listId, taskToDelete));
        setTaskToDelete(null);
    };

    const handleCancelDelete = () => setTaskToDelete(null);


    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTask(null);
    };

    const clearFilters = () => {
        setFilterByPriority('all');
        setFilterByCategory('all');
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
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    // SORT: derives a sorted copy of the filtered tasks based on the currently selected sortBy key
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'dueDate':
                return new Date(`${a.dueDate}T${a.dueTime}`) - new Date(`${b.dueDate}T${b.dueTime}`);
            case 'priority':
                return (priorityOrder[a.priority?.toLowerCase()] ?? 3) - (priorityOrder[b.priority?.toLowerCase()] ?? 3);
            case 'category':
                return (a.category || '').localeCompare(b.category || '');
            case 'dateAdded':
            default:
                return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
        }
    });

    return (
        <>
            {/* main container */}
            <div className="w-full max-w-6xl flex-1 bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">

                {/* header: back on its own row, then title + role on the left, members on the right */}
                <div className="flex flex-col gap-3 border-b border-white/20 pb-4">

                    <Link
                        to={isOwner ? "/collab/owned" : "/collab/shared"}
                        className={`${chip} ${chipIdle} self-start`}
                    >
                        <span aria-hidden="true">←</span> Back
                    </Link>

                    <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide truncate">
                                {list.name}
                            </h1>
                        </div>

                        {/* opens popup with the member list (and the add form for the owner) */}
                        <button
                            onClick={() => setIsMembersOpen(true)}
                            className={`${chip} ${chipIdle} shrink-0`}
                        >
                            {/* people icon */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                                <circle cx="10" cy="7" r="4" />
                                <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {isOwner ? "Manage members" : "Members"}
                            <span className="text-[11px] font-bold bg-pink-200/20 text-pink-100 px-2 py-0.5 rounded-full">
                                {memberCount}
                            </span>
                        </button>
                    </div>
                </div>

                {actionError && <p className="text-pink-100 text-sm">{actionError}</p>}

                {/* toolbar: sort + filters on the left, add task on the right */}
                <div className="flex flex-wrap items-center justify-between gap-3">

                    <div className="flex flex-wrap items-center gap-2">

                        {/* SORT: dropdown for choosing the active sortBy key */}
                        <div className="relative w-fit" ref={sortMenuRef}>
                            <button
                                onClick={() => setSortMenuOpen((prev) => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={sortMenuOpen}
                                className={`${chip} ${chipIdle}`}
                            >
                                Sort: {currentSortLabel}
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
                                            className={`block w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
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

                        {/* priority / category filters (pink when active) */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setFilterByPriority(e.target.value)}
                            aria-label="Filter by priority"
                            className={`${chip} ${priorityFilter !== 'all' ? chipActive : chipIdle}`}
                        >
                            <option value="all" className="bg-[#8c4362] text-pink-100">Priority</option>
                            <option value="low" className="bg-[#8c4362] text-pink-100">Low</option>
                            <option value="medium" className="bg-[#8c4362] text-pink-100">Medium</option>
                            <option value="high" className="bg-[#8c4362] text-pink-100">High</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setFilterByCategory(e.target.value)}
                            aria-label="Filter by category"
                            className={`${chip} ${categoryFilter !== 'all' ? chipActive : chipIdle}`}
                        >
                            <option value="all" className="bg-[#8c4362] text-pink-100">Category</option>
                            <option value="school" className="bg-[#8c4362] text-pink-100">School</option>
                            <option value="personal" className="bg-[#8c4362] text-pink-100">Personal</option>
                            <option value="work" className="bg-[#8c4362] text-pink-100">Work</option>
                            <option value="others" className="bg-[#8c4362] text-pink-100">Others</option>
                        </select>

                        {/* only shows when a filter is on, so it's not extra clutter otherwise */}
                        {filtersActive && (
                            <button
                                onClick={clearFilters}
                                className={`${btnBase} px-2 py-1.5 text-pink-100 hover:text-white underline underline-offset-2`}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* ADD: opens the popup with a blank form */}
                    <button onClick={() => setIsFormOpen(true)} className={btnPrimary}>
                        + Add New Task
                    </button>
                </div>

                <div className="flex flex-col gap-3 min-h-[200px]">
                    {filteredTasks.length === 0 ? (
                        <p className="text-pink-100/70 text-sm text-center py-12">
                            {tasks.length === 0 ? "No tasks in this list yet." : "No tasks match this filter."}
                        </p>
                    ) : (
                        //del task
                        //use popup instead
                        sortedTasks.map((task) => (
                            <TodoItem
                                key={task.id}
                                task={task}
                                onToggleStatus={() => run(() => toggleListTaskStatus(listId, task))}
                                onDelete={handleRequestDelete}
                                onUndo={() => {}}
                                onEdit={setEditingTask}
                                isPendingDelete={false}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* members popup  */}
            {isMembersOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsMembersOpen(false)}
                >
                    <div
                        className="w-full max-w-lg bg-[#bc688c] rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-white font-extrabold text-xl">Members</h2>
                            <button
                                onClick={() => setIsMembersOpen(false)}
                                className={`${btnBase} px-4 py-2 text-pink-100 hover:text-white bg-[#59243e] hover:bg-[#59243e]/70`}
                            >
                                Close
                            </button>
                        </div>

                        <ListMembers list={list} names={names} />
                    </div>
                </div>
            )}


            {(isFormOpen || editingTask) && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseForm}
                >
                    <div
                        className="w-full max-w-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* check state first  */}
                        {editingTask ? (
                            <TodoForm
                                key={editingTask.id}
                                initialValues={editingTask}
                                onSubmit={(data) =>
                                    run(async () => {
                                        await updateListTask(listId, editingTask.id, data);
                                        setEditingTask(null);
                                    })
                                }
                                onCancel={handleCloseForm}
                                buttonText="Save Changes"
                            />
                        ) : (

                            //creating task
                            <TodoForm
                                key="new"
                                onSubmit={(data) =>
                                    run(async () => {
                                        await addListTask(listId, data);
                                        setIsFormOpen(false);
                                    })
                                }
                                onCancel={handleCloseForm}
                                buttonText="Add Task"
                            />

                        )}
                    </div>
                </div>
            )}

            
            {taskToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#bc688c] rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4">
                        <h2 className="text-white font-bold text-lg">
                            Delete this task?
                        </h2>

                        <p className="text-pink-100 text-sm">
                            This can't be undone.
                        </p>

                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={handleCancelDelete} className={btnCancel}>
                                Cancel
                            </button>

                            <button onClick={handleConfirmDelete} className={btnDanger}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CollabTodo;