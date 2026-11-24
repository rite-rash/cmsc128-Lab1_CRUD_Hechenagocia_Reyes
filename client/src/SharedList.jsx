//DESCRIPTION: show lists shared with the account

import { Link } from "react-router-dom";

import { useSharedLists } from "./ListService";

function SharedLists() {
    const { lists: shared, loading } = useSharedLists();

    if (loading) {
        return (
            <div className="py-20 text-center font-semibold text-[#7a0f3d]">
                Loading...
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4">
            {/* Header: title + subtitle on the left, list count on the right */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl leading-tight font-bold text-[#7a0f3d] md:text-4xl">
                        Shared With Me
                    </h1>
                    <p className="mt-1 text-sm text-[#6b4a58]">
                        To-do lists other people have added you to.
                    </p>
                </div>
                <span className="shrink-0 rounded-full bg-pink-100 px-3.5 py-1.5 text-xs font-bold text-[#7a0f3d]">
                    {shared.length} {shared.length === 1 ? "to-do list" : "to-do lists"}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                {shared.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-sm font-medium text-[#6b4a58]/70">
                        No one has shared a to-do list with you yet.
                    </div>
                ) : (
                    shared.map((l) => {
                        const count = l.memberIds?.length || 0;
                        return (
                            <Link
                                key={l.id}
                                to={`/lists/${l.id}`}
                                className="group flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-white px-5 py-4 font-semibold text-[#4a1f33] shadow-sm transition-colors hover:border-pink-300"
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    <span className="truncate text-base transition-colors group-hover:text-[#c2185b]">
                                        {l.name}
                                    </span>
                                    {/* Member count pill */}
                                    <span className="shrink-0 rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-[#7a0f3d]">
                                        {count} {count === 1 ? "member" : "members"}
                                    </span>
                                </span>
                                <span className="text-[#7a0f3d]/70 transition-all group-hover:translate-x-1 group-hover:text-[#c2185b]">
                                    →
                                </span>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SharedLists;