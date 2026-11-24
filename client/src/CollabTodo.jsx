// DESCRIPTION: loads list for both "owned by me" and "shared with me"
//              also allows actions: add, edit, check off, delete tasks

import { useState, useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";
import {
    useListTasks,
    useUserNames,
    addListTask,
    updateListTask,
    toggleListTaskStatus,
    deleteListTask,
} from "./ListService";

import ListMembers from "./ListMembers";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import Breadcrumbs from "./components/Breadcrumbs";

//helper functions for due dates & overdue 
function getDueTime(task) {
    if (!task.dueDate) return null;
    if (typeof task.dueDate?.toDate === "function") {
        return task.dueDate.toDate().getTime();
    }
    const timeStr = task.dueTime || "23:59";
    const parsed = new Date(`${task.dueDate}T${timeStr}`).getTime();
    return Number.isNaN(parsed) ? null : parsed;
}

function isOverdue(task) {
    if (task.completed) return false;
    const due = getDueTime(task);
    return due !== null && due < Date.now();
}


function ChevronIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="h-4 w-4"
        >
            <path strokeLinecap="round" d="M10 4v12M4 10h12" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            />
            <circle cx="9" cy="7" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m2 0v9.5A1.5 1.5 0 0112.5 17h-5A1.5 1.5 0 016 15.5V6"
            />
        </svg>
    );
}

//custom  dropdown component
function FilterSelect({ value, onChange, placeholder, options }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selected
                        ? "border-[#7a0f3d] bg-[#7a0f3d] text-white"
                        : "border-pink-200 bg-white text-[#4a1f33] hover:bg-pink-50"
                }`}
            >
                <span>{selected ? selected.label : placeholder}</span>
                <ChevronIcon />
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute left-0 z-10 mt-2 w-40 overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-lg"
                >
                    <button
                        type="button"
                        onClick={() => {
                            onChange("all");
                            setOpen(false);
                        }}
                        className={`block w-full cursor-pointer px-4 py-2 text-left text-sm ${
                            value === "all"
                                ? "bg-pink-50 font-semibold text-[#7a0f3d]"
                                : "text-[#4a1f33] hover:bg-pink-50"
                        }`}
                    >
                        Any
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`block w-full cursor-pointer px-4 py-2 text-left text-sm ${
                                value === opt.value
                                    ? "bg-pink-50 font-semibold text-[#7a0f3d]"
                                    : "text-[#4a1f33] hover:bg-pink-50"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function CollabTodo() {
    const { listId } = useParams();

    const { user } = useAuth();
    const { tasks, error: tasksError } = useListTasks(listId);
    const [list, setList] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [actionError, setActionError] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false); // add/edit popup
    const [isMembersOpen, setIsMembersOpen] = useState(false); // members popup
    const [taskToDelete, setTaskToDelete] = useState(null); // 
    const [sortBy, setSortBy] = useState("dateAdded");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [priorityFilter, setFilterByPriority] = useState("all");
    const [categoryFilter, setFilterByCategory] = useState("all");
    const sortMenuRef = useRef(null);

    const sortOptions = [
        { value: "dateAdded", label: "Date Added" },
        { value: "dueDate", label: "Due Date" },
        { value: "priority", label: "Priority" },
        { value: "category", label: "Category" },
    ];

    const priorityOptions = [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
    ];

    const categoryOptions = [
        { value: "school", label: "School" },
        { value: "personal", label: "Personal" },
        { value: "work", label: "Work" },
        { value: "others", label: "Others" },
    ];

    const names = useUserNames(list?.memberIds); // ? to not crash if undefined since initially list is null

    useEffect(() => {
        return onSnapshot(
            doc(db, "lists", listId),
            (snap) => snap.exists() && setList({ id: snap.id, ...snap.data() }),
            () => {}, // ListGuard already handles access
        );
    }, [listId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
                setSortMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const run = async (fn) => {
        setActionError("");
        try {
            await fn();
        } catch (err) {
            setActionError(err.message);
        }
    };

    if (tasksError) return <Navigate to="/" replace />;

    if (!list) {
        return (
            <div className="py-20 text-center font-semibold text-[#7a0f3d]">
                Loading list...
            </div>
        );
    }

    const isOwner = list?.ownerId === user.uid;
    const memberCount = list.memberIds?.length || 0;
    const allActive = priorityFilter === "all" && categoryFilter === "all";
    const taskPendingDeletion = tasks.find((t) => t.id === taskToDelete);

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
            priorityFilter === "all" ||
            task.priority?.toLowerCase() === priorityFilter;

        const matchesCategory =
            categoryFilter === "all" ||
            task.category?.toLowerCase() === categoryFilter;

        return matchesPriority && matchesCategory;
    });

    // SORT: priority rank used when sorting by priority (lower = higher priority)
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    // SORT: derives a sorted copy of the filtered tasks based on the currently selected sortBy key
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case "dueDate":
                return (getDueTime(a) ?? Infinity) - (getDueTime(b) ?? Infinity);
            case "priority":
                return (
                    (priorityOrder[a.priority?.toLowerCase()] ?? 3) -
                    (priorityOrder[b.priority?.toLowerCase()] ?? 3)
                );
            case "category":
                return (a.category || "").localeCompare(b.category || "");
            case "dateAdded":
            default:
                return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
        }
    });

    return (
        <>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4">
                {/* breadcrumbs */}
                <div className="-mb-2">
                    <Breadcrumbs
                        items={[
                            {
                                label: isOwner ? "Owned by me" : "Shared with me",
                                to: isOwner ? "/collab/owned" : "/collab/shared",
                            },
                            { label: list.name },
                        ]}
                    />
                </div>


                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="truncate font-serif text-3xl leading-tight font-bold text-[#7a0f3d] md:text-4xl">
                            {list.name}
                        </h1>
                        {/* [ownership and member count  */}
                        <p className="mt-1 text-sm text-[#6b4a58]">
                            {isOwner
                                ? "Owned by you"
                                : `Shared by ${names[list.ownerId] || "owner"}`}{" "}
                            · {memberCount} {memberCount === 1 ? "member" : "members"}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">

                        <button
                            onClick={() => setIsMembersOpen(true)}
                            className="flex cursor-pointer items-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#7a0f3d] transition-colors hover:bg-pink-50"
                        >
                            <UsersIcon />
                            {isOwner ? "Manage members" : "Members"}
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-[#7a0f3d]">
                                {memberCount}
                            </span>
                        </button>

                        {/* add new taskk*/}
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#c2185b] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-300/50 transition-colors hover:bg-[#a8144d]"
                        >
                            <PlusIcon />
                            Add new task
                        </button>
                    </div>
                </div>

                {actionError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-[#b3261e]">
                        {actionError}
                    </p>
                )}

                {/* filter &sort bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* all*/}
                        <button
                            onClick={() => {
                                setFilterByPriority("all");
                                setFilterByCategory("all");
                            }}
                            aria-pressed={allActive}
                            className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                allActive
                                    ? "border-[#7a0f3d] bg-[#7a0f3d] text-white"
                                    : "border-pink-200 bg-white text-[#4a1f33] hover:bg-pink-50"
                            }`}
                        >
                            All
                        </button>

                        {/* pass props to custom FilterSelect for unif*/}
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
                            className="flex cursor-pointer items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-[#4a1f33] transition-colors hover:bg-pink-50"
                        >
                            Sort by
                            <ChevronIcon />
                        </button>

                        {sortMenuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-lg"
                            >
                                {sortOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        role="menuitem"
                                        onClick={() => {
                                            setSortBy(opt.value);
                                            setSortMenuOpen(false);
                                        }}
                                        className={`block w-full cursor-pointer px-4 py-2 text-left text-sm ${
                                            sortBy === opt.value
                                                ? "bg-pink-50 font-semibold text-[#7a0f3d]"
                                                : "text-[#4a1f33] hover:bg-pink-50"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Task list */}
                <div className="flex flex-col gap-3">
                    {filteredTasks.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-sm font-medium text-[#6b4a58]/70">
                            {tasks.length === 0
                                ? "No tasks in this list yet. Create one now!"
                                : "No tasks match this filter."}
                        </div>
                    ) : (
                        sortedTasks.map((task) => (
                            <TodoItem
                                key={task.id}
                                task={task}
                                isOverdue={isOverdue(task)}  //highlight overdue same w todo
                                onToggleStatus={() =>
                                    run(() => toggleListTaskStatus(listId, task))
                                }
                                onDelete={handleRequestDelete}
                                onEdit={setEditingTask}
                            />
                        ))
                    )}
                </div>
            </div>


            {isMembersOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d0a22]/45 p-4"
                    onClick={() => setIsMembersOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="members-title"
                        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-5 shadow-2xl md:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                            <h2
                                id="members-title"
                                className="font-serif text-xl font-bold text-[#7a0f3d]"
                            >
                                {isOwner ? "Manage members" : "List members"}
                            </h2>
                            <button
                                onClick={() => setIsMembersOpen(false)}
                                className="cursor-pointer rounded-xl px-3 py-1.5 text-sm font-semibold text-[#7a0f3d] hover:bg-pink-50"
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a1426]/50 p-4"
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

            //del task
            {taskToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d0a22]/45 p-4"
                    onClick={handleCancelDelete}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl md:p-6"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-[#b3261e]">
                            <TrashIcon />
                        </div>

                        <h2
                            id="delete-title"
                            className="font-serif text-xl font-bold text-[#7a0f3d]"
                        >
                            Delete this task?
                        </h2>

                        <p className="text-sm text-[#6b4a58]">
                            {taskPendingDeletion
                                ? `“${taskPendingDeletion.taskName}” will be permanently removed from this list.`
                                : "This task will be permanently removed from this list."}
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                                onClick={handleCancelDelete}
                                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[#7a0f3d] hover:bg-pink-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmDelete}
                                className="cursor-pointer rounded-xl bg-[#b3261e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-300/50 hover:bg-[#8f1d17]"
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