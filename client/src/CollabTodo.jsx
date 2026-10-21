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

                {/* header */}
                {/* same lang sa personal todo, just added members btn  */}
                <div className="flex justify-between items-start border-b border-pink-400/30 pb-4">
                    <div>
                        <Link
                            to={isOwner ? "/collab/owned" : "/collab/shared"}
                            className="text-xs font-semibold text-pink-100 hover:text-white"
                        >
                            ← Back
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{list.name}</h1>
                        <p className="text-xs text-pink-200/80">
                            {isOwner ? "You own this list" : "Shared with you"}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">

                        {/* opens popup with the member list, and add form for ownerr*/}

                        <button
                            onClick={() => setIsMembersOpen(true)}
                            className="bg-[#8c4362]/60 text-pink-100 hover:bg-[#8c4362]/80 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                            Members ({list.memberIds?.length || 0})
                        </button>

                        {/* all button +priority/category filters */}

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
                </div>

                {actionError && <p className="text-pink-100 text-sm">{actionError}</p>}

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

                <div className="flex flex-col gap-3 min-h-[200px]">
                    {/* FIX: was `tasks.length === 0`. It now checks filteredTasks, so a filter that matches nothing
                             shows the empty message instead of a blank area. */}
                    {filteredTasks.length === 0 ? (
                        // FIX: two messages now: the list is really empty, or tasks exist but the filter hides them
                        <p className="text-pink-200/60 text-sm text-center py-12">
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
                        className="w-full max-w-md bg-[#bc688c] rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-white font-bold text-lg">Members</h2>
                            <button
                                onClick={() => setIsMembersOpen(false)}
                                className="text-xs font-semibold text-pink-100 hover:text-white cursor-pointer"
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

export default CollabTodo;