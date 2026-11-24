//DESCRIPTION: Show who is in list and add members by username

import { useState, useId } from "react";
import { useAuth } from "./AuthContext";
import { addMemberByUsername } from "./ListService";

// Button styles shared with the rest of the app
const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300";
const btnPrimary =
    `shrink-0 rounded-xl text-sm font-semibold px-4 py-2.5 text-white bg-[#c2185b] hover:bg-[#a8144d] ` +
    `shadow-md shadow-pink-300/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#c2185b] ${focusRing}`;

// props from collabtodo,
//      if new member is added -> snapShot listens then the list is updated and rendered in collabtodo
//      this function just receives the list, no fetching
export default function ListMembers({ list, names = {} }) {
    const { user } = useAuth();
    const inputId = useId();

    //create states
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const [success, setSuccess] = useState(""); //for confimration message
    const [submitting, setSubmitting] = useState(false); // takes care of no multiple submits and feedback to user
    const isOwner = list?.ownerId === user?.uid;

    const handleAdd = async (e) => {
        e.preventDefault();
        //clear messages
        setError("");
        setSuccess("");

        // trim, and ignore a leading "@" in case they type it
        const cleaned = username.trim().replace(/^@/, "");
        if (!cleaned) return; //checker, enforce username

        //disables the submit btn while adding
        setSubmitting(true);

        //add member using the func from listservice and passing the necessary prop from parent
        try {
            await addMemberByUsername(list.id, cleaned);

            setSuccess(`Added @${cleaned} to the list.`);
            setUsername(""); //clear username
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false); //enable submit btn again
        }
    };

    // typing again clears old feedback so it never goes stale
    const handleChange = (e) => {
        setUsername(e.target.value);
        if (error) setError("");
        if (success) setSuccess("");
    };

    const memberCount = list?.memberIds?.length || 0;

    return (
        <div className="flex flex-col gap-5">
            {/* add member form: owners get the form, everyone else gets a short explanation */}
            {isOwner ? (
                <form onSubmit={handleAdd} className="flex flex-col gap-2">
                    <label htmlFor={inputId} className="text-sm font-semibold text-[#4a1f33]">
                        Add a member
                    </label>

                    <div className="flex gap-2">
                        <input
                            id={inputId}
                            value={username}
                            onChange={handleChange}
                            placeholder="Enter a username"
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-invalid={!!error}
                            aria-describedby={`${inputId}-feedback`}
                            className="min-w-0 flex-1 rounded-xl border border-pink-200 bg-white px-3.5 py-2.5 text-sm text-[#4a1f33] placeholder-[#6b4a58]/50 transition-colors outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-pink-200"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !username.trim()}
                            className={btnPrimary}
                        >
                            {submitting ? "Adding..." : "Add to list"}
                        </button>
                    </div>

                    {/* feedback sits right under the input, and screen readers announce it */}
                    <div id={`${inputId}-feedback`} aria-live="polite" className="min-h-5">
                        {error && (
                            <p className="text-sm font-semibold text-[#b3261e]">{error}</p>
                        )}
                        {success && (
                            <p className="text-sm font-semibold text-emerald-700">{success}</p>
                        )}
                    </div>
                </form>
            ) : (
                <p className="rounded-xl border border-pink-100 bg-pink-50/70 px-3.5 py-2.5 text-xs font-medium text-[#6b4a58]">
                    Only the list owner can add members.
                </p>
            )}

            {/* member list */}
            <div className="flex flex-col gap-2.5">
                <h3 className="text-sm font-bold text-[#7a0f3d]">
                    People in this list ({memberCount})
                </h3>
                <MembersList list={list} user={user} names={names} />
            </div>
        </div>
    );
}

//helper function for building member list
function MembersList({ list, user, names = {} }) {
    const memberIds = list?.memberIds || [];

    // build a row for each member
    const members = memberIds.map((uid) => {
        const rawName = names[uid];
        return {
            uid,
            isOwner: uid === list.ownerId, //check if uid is owner of list
            isMe: uid === user?.uid, //check if the row matches ur uid
            label: rawName ? `@${rawName}` : `Member ${uid.slice(0, 6)}...`,
            initial: (rawName || uid).charAt(0).toUpperCase(),
        };
    });

    // owner first, then you, then everyone else (alphabetical)
    members.sort((a, b) => {
        if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
        if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
        return a.label.localeCompare(b.label);
    });

    //render
    return (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {members.map((m) => (
                <li
                    key={m.uid}
                    className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/60 px-3.5 py-2.5"
                >
                    {/* initial avatar */}
                    <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-[#7a0f3d]"
                    >
                        {m.initial}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#4a1f33]">
                        {m.label}
                    </span>

                    {/* role tags */}
                    <span className="flex shrink-0 items-center gap-1.5">
                        {m.isMe && (
                            <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#7a0f3d]">
                                You
                            </span>
                        )}
                        {m.isOwner && (
                            <span className="rounded-full bg-[#c2185b] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                Owner
                            </span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}