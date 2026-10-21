//DESCRIPTION: show lists shared with the account

import { Link } from "react-router-dom";

import { useSharedLists } from "./ListService";

function SharedLists() {

    const { lists: shared, loading } = useSharedLists();

    if (loading) return <p className="text-white p-8">Loading...</p>;

    return (

        <div className="w-full max-w-6xl max-h-[calc(100dvh-6.5rem)] md:max-h-[calc(100dvh-9rem)] bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 m-4">

            {/* Header: title + subtitle on the left, list count on the right */}
            <div className="shrink-0 flex items-end justify-between gap-4 border-b border-white/20 pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                        Shared With Me
                    </h1>
                    <p className="text-xs text-pink-100/80 italic mt-0.5">
                        To-do lists other people have added you to.
                    </p>
                </div>
                <span className="shrink-0 text-xs font-bold bg-white/15 text-white px-3 py-1 rounded-full">
                    {shared.length} {shared.length === 1 ? "to-do list" : "to-do lists"}
                </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
                {shared.length === 0 ? (
                    <p className="text-pink-100/70 text-sm text-center py-12">
                        No one has shared a to-do list with you yet.
                    </p>
                ) : (
                    shared.map((l) => {
                        const count = l.memberIds?.length || 0;
                        return (
                            <Link
                                key={l.id}
                                to={`/lists/${l.id}`}
                                className="group flex items-center justify-between gap-3 bg-[#8c4362]/60 hover:bg-[#8c4362] rounded-xl px-4 py-3 text-white font-semibold shadow-sm transition"
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <span className="truncate">{l.name}</span>
                                    {/* Member count pill */}
                                    <span className="shrink-0 text-xs font-semibold bg-pink-200/20 text-pink-100 px-2.5 py-0.5 rounded-full">
                                        {count} {count === 1 ? "member" : "members"}
                                    </span>
                                </span>
                                <span className="text-pink-200 transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SharedLists;