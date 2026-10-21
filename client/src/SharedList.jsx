//DESCRIPTION: show lists shared with the account

import {Link} from "react-router-dom";


import {useSharedLists} from "./ListService";

function SharedLists() {


    const { lists: shared, loading } = useSharedLists();



    if (loading) return <p className="text-white p-8">Loading...</p>;

    return (

        <div className="w-full max-w-6xl max-h-[calc(100dvh-6.5rem)] md:max-h-[calc(100dvh-9rem)] bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 m-4">

            <div className="shrink-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Shared With Me</h1>
            </div>


            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
                {shared.length === 0 ? (
                    <p className="text-pink-200/60 text-sm text-center py-12">
                        No one has shared a list with you yet.
                    </p>
                ) : (
                    shared.map((l) => (
                        <Link
                            key={l.id}
                            to={`/lists/${l.id}`}
                            className="bg-[#8c4362]/60 rounded-xl px-4 py-3 text-white font-semibold hover:underline"
                        >
                            {l.name}
                            <span className="text-xs text-pink-200/80 ml-2">
                                {l.memberIds?.length || 0} member{l.memberIds?.length !== 1 && "s"}
                            </span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default SharedLists;