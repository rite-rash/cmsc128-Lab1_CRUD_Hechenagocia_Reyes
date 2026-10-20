// DESCRIPTION: Handles creating, del lists and, displaying existing owned lists with counts


import {useState} from 'react';
import {Link} from "react-router-dom";
import { useOwnedLists, createList, deleteList } from "./ListService";

export default function OwnedList () {
    const [name, setName] = useState(""); //input for creating list
    const [error, setError] = useState(""); //msg feedback
    const [listToDelete, setListToDelete] = useState(null); //for custom pop up del msg
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
    <div className="w-full max-w-6xl bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 m-4 relative">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Lists</h1>

        {/* form for creating list */}
        <form onSubmit={handleCreate} className="flex gap-2">
        <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New list name"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
        />
        <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
            + Create
        </button>
        </form>

        {error && <p className="text-pink-100 text-sm">{error}</p>}


        {lists.length === 0 ? (
        <p className="text-pink-200/60 text-sm text-center py-12">
            You haven't created any lists yet.
        </p>
        ) : (
        // main content 
        lists.map((l) => (
        <div key={l.id} className="flex items-center justify-between bg-[#8c4362]/60 rounded-xl px-4 py-3">
        <Link to={`/lists/${l.id}`} className="text-white font-semibold hover:underline">
            {l.name}
            <span className="text-xs text-pink-200/80 ml-2">
            {l.memberIds?.length || 0} member{(l.memberIds?.length || 0) !== 1 && "s"}
            </span>
        </Link>

        <button onClick={() => setListToDelete(l)} className="text-xs text-pink-100 hover:text-white">
            Delete
        </button>
        </div>
    ))
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
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-pink-900/40 hover:bg-pink-900/60 text-pink-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white"
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