// DESCRIPTION: Handles creating, deleting, renaming and displaying existing owned lists with counts

import { useState } from 'react';
import { Link } from "react-router-dom";

import { useOwnedLists, createList, deleteList, renameList } from "./ListService";

// Button styles shared with TodoItem so the whole app feels consistent
const btnBase =
    "rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-200/80";

const btnPrimary = `${btnBase} px-4 py-2 text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:hover:bg-pink-500`;
const btnCancel  = `${btnBase} px-4 py-2 text-pink-100 hover:text-white bg-[#59243e] hover:bg-[#59243e]/70`;
const btnDanger  = `${btnBase} px-4 py-2 text-white bg-rose-600 hover:bg-rose-700`;

// Small buttons on each list row (same as Edit / Delete in TodoItem)
const btnEdit      = `${btnBase} px-2.5 py-1 text-pink-100 hover:text-white bg-[#59243e] hover:bg-pink-600`;
const btnRowDelete = `${btnBase} px-2.5 py-1 text-rose-200 hover:text-white bg-rose-900/60 hover:bg-rose-700`;

export default function OwnedList () {
    const [name, setName] = useState(""); //input for creating list
    const [error, setError] = useState(""); //msg feedback
    const [listToDelete, setListToDelete] = useState(null); //for custom pop up del msg


    const [listToRename, setListToRename] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const {lists, loading } = useOwnedLists(); //get list owned by user 

    //create list
    const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
        await createList(name);
        setName("");
    } catch (err) {
        setError(err.message);
    }};


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
    
    if (loading) return <p className="text-white p-8">Loading...</p>;

    return (

        <div className="w-full max-w-6xl max-h-[calc(100dvh-6.5rem)] md:max-h-[calc(100dvh-9rem)] bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 m-4 relative">


            <div className="shrink-0 flex flex-col gap-4">

                {/* Header: title + subtitle on the left, list count on the right */}
                <div className="flex items-end justify-between gap-4 border-b border-white/20 pb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                            My Collaborative Lists
                        </h1>
                        <p className="text-xs text-pink-100/80 italic mt-0.5">
                            To-do lists you've created and shared with other people.
                        </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold bg-white/15 text-white px-3 py-1 rounded-full">
                        {lists.length} {lists.length === 1 ? "to-do list" : "to-do lists"}
                    </span>
                </div>

                {/* form for creating list */}
                <form onSubmit={handleCreate} className="flex gap-2">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New list name"
                    className="flex-1 px-3 py-2 rounded-lg bg-pink-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className={`${btnPrimary} shrink-0`}
                >
                    + Create
                </button>
                </form>

                {error && <p className="text-pink-100 text-sm">{error}</p>}
            </div>


        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">

            {lists.length === 0 ? (
            <p className="text-pink-100/70 text-sm text-center py-12">
                You haven't created any lists yet.
            </p>
            ) : (
            // main content 
            lists.map((l) => {
            const count = l.memberIds?.length || 0;
            return (
            <div key={l.id} className="flex items-center justify-between gap-3 bg-[#8c4362]/60 hover:bg-[#8c4362] rounded-xl px-4 py-3 shadow-sm transition">
            <Link to={`/lists/${l.id}`} className="flex items-center gap-3 min-w-0 text-white font-semibold hover:underline">
                <span className="truncate">{l.name}</span>
                {/* Member count pill */}
                <span className="shrink-0 text-xs font-semibold bg-pink-200/20 text-pink-100 px-2.5 py-0.5 rounded-full">
                    {count} {count === 1 ? "member" : "members"}
                </span>
            </Link>

            {/* btn for renaming the list and delete  */}
            <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startRename(l)} aria-label={`Edit ${l.name}`} className={btnEdit}>
                    Edit
                </button>

                <button onClick={() => setListToDelete(l)} aria-label={`Delete ${l.name}`} className={btnRowDelete}>
                    Delete
                </button>
            </div>
            </div>
            );
        })
            )}
        </div>

        {/* pop up for renaming same lang sa del  */}
        {listToRename&&(
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <form
                    onSubmit={confirmRename}
                    className="bg-[#8c4362] p-6 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col gap-4 text-white border border-pink-400/20"
                >
                    <h2 className="text-lg font-bold">Rename List</h2>
                    <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        placeholder="List name"
                        className="px-3 py-2 rounded-lg bg-pink-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={() => setListToRename(null)}
                            className={btnCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!renameValue.trim()}
                            className={btnPrimary}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* style for delete pop up */}
        {listToDelete&&(
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-[#8c4362] p-6 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col gap-4 text-white border border-pink-400/20">
                    <h2 className="text-lg font-bold">Delete List?</h2>
                    <p className="text-sm text-pink-100">
                        Are you sure you want to delete <span className="font-semibold text-white">"{listToDelete.name}"</span> and all of its tasks? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            onClick={() => setListToDelete(null)}
                            className={btnCancel}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className={btnDanger}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}