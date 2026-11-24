// DESCRIPTION: Handles creating, deleting, renaming and displaying existing owned lists with counts

import { useState } from "react";
import { Link } from "react-router-dom";

import { useOwnedLists, createList, deleteList, renameList } from "./ListService";

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

export default function OwnedList() {
    const [name, setName] = useState(""); //input for creating list
    const [error, setError] = useState(""); //msg feedback
    const [listToDelete, setListToDelete] = useState(null); //for custom pop up del msg

    const [listToRename, setListToRename] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const { lists, loading } = useOwnedLists(); //get list owned by user

    //create list
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setError("");
        try {
            await createList(name);
            setName("");
        } catch (err) {
            setError(err.message);
        }
    };

    const startRename = (list) => {
        setListToRename(list);
        setRenameValue(list.name);
    };

    const confirmRename = async (e) => {
        e.preventDefault();
        if (!listToRename || !renameValue.trim()) return;
        setError("");
        try {
            await renameList(listToRename.id, renameValue);
        } catch (err) {
            setError(err.message);
        }
        setListToRename(null);
    };

    //del list
    const confirmDelete = async () => {
        if (!listToDelete) return;
        try {
            await deleteList(listToDelete.id);
            setListToDelete(null); // Close modal
        } catch (err) {
            setError(err.message);
            setListToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center font-semibold text-[#7a0f3d]">
                Loading...
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4">
                {/* Header: title + subtitle on the left, list count on the right */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl leading-tight font-bold text-[#7a0f3d] md:text-4xl">
                            My Collaborative Lists
                        </h1>
                        <p className="mt-1 text-sm text-[#6b4a58]">
                            To-do lists you've created and shared with other people.
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-pink-100 px-3.5 py-1.5 text-xs font-bold text-[#7a0f3d]">
                        {lists.length} {lists.length === 1 ? "to-do list" : "to-do lists"}
                    </span>
                </div>

                {/* form for creating list */}
                <form onSubmit={handleCreate} className="flex gap-2.5">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="New list name"
                        className="flex-1 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm text-[#4a1f33] placeholder-[#6b4a58]/50 transition-colors outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-pink-200"
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#c2185b] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-300/50 transition-colors hover:bg-[#a8144d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#c2185b]"
                    >
                        <PlusIcon />
                        Create
                    </button>
                </form>

                {error && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-[#b3261e]">
                        {error}
                    </p>
                )}

                {/* Lists */}
                <div className="flex flex-col gap-3">
                    {lists.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-sm font-medium text-[#6b4a58]/70">
                            You haven't created any lists yet.
                        </div>
                    ) : (
                        // main content
                        lists.map((l) => {
                            const count = l.memberIds?.length || 0;
                            return (
                                <div
                                    key={l.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white px-5 py-4 shadow-sm transition-colors hover:border-pink-300"
                                >
                                    <Link
                                        to={`/lists/${l.id}`}
                                        className="flex min-w-0 flex-1 items-center gap-3 font-semibold text-[#4a1f33] transition-colors hover:text-[#c2185b]"
                                    >
                                        <span className="truncate text-base">{l.name}</span>
                                        {/* Member count pill */}
                                        <span className="shrink-0 rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-[#7a0f3d]">
                                            {count} {count === 1 ? "member" : "members"}
                                        </span>
                                    </Link>

                                    {/* btn for renaming the list and delete */}
                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            onClick={() => startRename(l)}
                                            aria-label={`Edit ${l.name}`}
                                            className="cursor-pointer rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#7a0f3d] transition-colors hover:bg-pink-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setListToDelete(l)}
                                            aria-label={`Delete ${l.name}`}
                                            className="cursor-pointer rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-[#b3261e] transition-colors hover:bg-rose-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* pop up for renaming same lang sa del */}
            {listToRename && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d0a22]/45 p-4"
                    onClick={() => setListToRename(null)}
                >
                    <form
                        onSubmit={confirmRename}
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl md:p-6"
                    >
                        <h2 className="font-serif text-xl font-bold text-[#7a0f3d]">
                            Rename List
                        </h2>
                        <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            placeholder="List name"
                            className="rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm text-[#4a1f33] outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-pink-200"
                        />
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setListToRename(null)}
                                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[#7a0f3d] hover:bg-pink-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!renameValue.trim()}
                                className="cursor-pointer rounded-xl bg-[#c2185b] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-300/50 transition-colors hover:bg-[#a8144d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* style for delete pop up */}
            {listToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d0a22]/45 p-4"
                    onClick={() => setListToDelete(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-list-title"
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl md:p-6"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-[#b3261e]">
                            <TrashIcon />
                        </div>

                        <h2
                            id="delete-list-title"
                            className="font-serif text-xl font-bold text-[#7a0f3d]"
                        >
                            Delete this list?
                        </h2>

                        <p className="text-sm text-[#6b4a58]">
                            “{listToDelete.name}” and all of its tasks will be permanently removed.
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setListToDelete(null)}
                                className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[#7a0f3d] hover:bg-pink-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
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