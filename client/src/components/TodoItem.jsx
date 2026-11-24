// DESCRIPTION: Modular card component for displaying individual tasks

const PRIORITY_STYLES = {
    low: { pill: "bg-green-100 text-green-800", dot: "bg-green-700" },
    medium: { pill: "bg-amber-100 text-amber-900", dot: "bg-amber-700" },
    high: { pill: "bg-red-100 text-red-900", dot: "bg-red-700" },
};

const FALLBACK_PRIORITY = { pill: "bg-pink-100 text-[#7a0f3d]", dot: "bg-[#7a0f3d]" };

function CalendarIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 shrink-0"
        >
            <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
            <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute inset-0 m-auto w-3.5 h-3.5 text-white hidden peer-checked:block"
        >
            <path d="M4.5 10.5l3.5 3.5 7.5-8" />
        </svg>
    );
}

// "Oct 1, 2026 · 8:00 AM" (falls back to the raw values if the date can't be parsed)
function formatDue(dueDate, dueTime) {
    if (!dueDate) return "No due date";

    const date = new Date(`${dueDate}T${dueTime || "00:00"}`);
    if (Number.isNaN(date.getTime())) {
        return dueTime ? `${dueDate} · ${dueTime}` : dueDate;
    }

    const day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    if (!dueTime) return day;

    const time = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    return `${day} · ${time}`;
}

function TodoItem({ task, isOverdue, onToggleStatus, onDelete, onUndo, onEdit, isPendingDelete }) {
    const isDone = task.status === "done";
    const priority = PRIORITY_STYLES[task.priority?.toLowerCase()] || FALLBACK_PRIORITY;

    return (
        <div
            className={`px-4 py-3 md:px-5 rounded-2xl border border-pink-200 bg-white shadow-sm flex items-center justify-between gap-4 transition-opacity ${
                isPendingDelete ? "opacity-50" : ""
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                {/* checkbox */}
                <label className="relative shrink-0 w-6 h-6 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => onToggleStatus(task.id)}
                        aria-label={`Mark "${task.taskName}" as ${isDone ? "not done" : "done"}`}
                        className="peer appearance-none w-6 h-6 rounded-md border-2 border-[#b06a85] bg-white cursor-pointer transition-colors checked:bg-[#c2185b] checked:border-[#c2185b] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c2185b] outline-none"
                    />
                    <CheckIcon />
                </label>

                <div className="flex flex-col gap-1.5 min-w-0">
                    <h3
                        className={`font-semibold text-base md:text-lg break-words ${
                            isDone ? "line-through text-[#9a4a68]" : "text-[#3d1226]"
                        }`}
                    >
                        {task.taskName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                        {/* date turns red when the task is overdue */}
                        <span
                            className={`flex items-center gap-1.5 ${
                                isOverdue ? "text-red-700" : "text-[#6b4a58]"
                            }`}
                        >
                            <CalendarIcon />
                            {formatDue(task.dueDate, task.dueTime)}
                        </span>

                        <span
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${priority.pill}`}
                        >
                            <span aria-hidden="true" className={`w-2 h-2 rounded-full ${priority.dot}`} />
                            {task.priority} Priority
                        </span>

                        <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-[#7a0f3d]">
                            {task.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* edit / delete, or undo if a delete is pending */}
            <div className="flex items-center gap-2 shrink-0">
                {isPendingDelete ? (
                    <button
                        onClick={() => onUndo(task.id)}
                        className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white bg-[#c2185b] hover:bg-[#a8144d] transition-colors cursor-pointer"
                    >
                        Undo
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => onEdit(task)}
                            disabled={isDone}
                            className="px-2.5 py-1.5 rounded-xl text-sm font-semibold text-[#7a0f3d] hover:bg-pink-50 transition-colors cursor-pointer disabled:text-[#7a0f3d]/40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="px-3 py-1.5 rounded-xl text-sm font-semibold text-[#b0124f] bg-pink-100 hover:bg-pink-200 transition-colors cursor-pointer"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default TodoItem;