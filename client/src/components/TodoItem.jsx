// DESCRIPTION: Modular card component for displaying individual tasks

function TodoItem({ task, onToggleStatus, onDelete, onUndo, onEdit, isPendingDelete }) {

    return (
    <div className={`p-4 rounded-2xl flex items-center justify-between shadow-md transition-all ${
        isPendingDelete 
            ? 'bg-[#59243e]/60 opacity-50' 
            : task.status === 'done'
            ? 'bg-[#4a2438]/80 text-pink-200/70'
            : 'bg-[#7a3755] hover:bg-[#863e5f] text-white'
    }`}>
        <div className="flex items-center gap-3">

            {/* checkbox */}
            <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => onToggleStatus(task.id)}
                className="w-4 h-4 rounded accent-pink-500 cursor-pointer shrink-0"
            />

            <div className="flex flex-col gap-1">
                <h3 className={`font-bold text-sm md:text-base tracking-wide ${task.status === 'done' ? 'line-through text-pink-200/50' : ''}`}>
                {task.taskName}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-pink-200/80">
                    <span>{task.dueDate} • {task.dueTime}</span>

                    <span className="bg-[#59243e] px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {task.status}
                    </span>

                    <span className="bg-[#59243e] px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {task.priority}
                    </span>

                    <span className="bg-[#59243e] px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {task.category}
                    </span>
                </div>
            </div>
        </div>

        {/* buttons for del and edit, or undo if pending */}
        <div className="flex items-center gap-2 shrink-0">
            {isPendingDelete ? (
                <button
                onClick={() => onUndo(task.id)}
                className="px-3 py-1 text-xs font-semibold text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors cursor-pointer"
                >
                Undo
                </button>
            ) : (
                <>
                <button 
                onClick={() => onEdit(task)}
                disabled={task.status === 'done'}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    task.status === 'done'
                    ? 'text-pink-200/30 bg-[#59243e]/40 cursor-not-allowed'
                    : 'text-pink-100 hover:text-white bg-[#59243e] hover:bg-pink-600 cursor-pointer'
                }`}
                >
                Edit
                </button>
                <button 
                onClick={() => onDelete(task.id)}
                className="px-2.5 py-1 text-xs text-rose-200 hover:text-white bg-rose-900/60 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
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