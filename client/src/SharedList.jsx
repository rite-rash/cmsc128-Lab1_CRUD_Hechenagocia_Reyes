//DESCRIPTION: show lists shared with the account, same flow w owned but w no actions

import {Link} from "react-router-dom";

import {useSharedLists} from "./ListService";

function SharedLists() {

    const {lists: shared, loading } = useSharedLists();

    if(loading) return <p className="text-white p-8">Loading...</p>;

    return (
        <div className="w-full max-w-6xl bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 m-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Shared With Me</h1>

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
    );
}

export default SharedLists;