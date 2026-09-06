// DESCRIPTION: Modular card component for displaying individual tasks

function TodoItem({ task }) {

    const handleEditClick = () => {
        console.log("working click", task.id);
    };

    const handleDeleteClick = () => {
        console.log("Delete clicked for task:", task.id);
    };

    return (
    <div className="p-4 bg-[#7a3755] text-white rounded-2xl flex items-center justify-between shadow-md hover:bg-[#863e5f] transition-all">
        <div className="flex items-center gap-3">

        <div className="flex flex-col gap-1">
            <h3 className={`font-bold text-sm md:text-base tracking-wide ${task.status === 'done' ?'line-through text-pink-200/50' : ''}`}>
            {task.taskName}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs text-pink-200/80">
                {/* due date, time */}
                <span>{task.dueDate} • {task.dueTime}</span>
                
                {/*status*/}
                <span className="bg-[#59243e] px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                {task.status}
                </span>

                {/*priorty*/}
                <span className="bg-[#59243e] px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                {task.priority}
                </span>

                {/* categ */}
                <span className="bg-[#59243e] px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                {task.category}
                </span>
            </div>
        </div>
    </div>

        {/* buttons for del and edit*/}
        <div className="flex items-center gap-2 shrink-0">
            <button 
            onClick={handleEditClick}
            className="px-2.5 py-1 text-xs text-pink-100 hover:text-white bg-[#59243e] hover:bg-pink-600 rounded-lg transition-colors cursor-pointer"
            >
            Edit
            </button>
            <button 
            onClick={handleDeleteClick}
            className="px-2.5 py-1 text-xs text-rose-200 hover:text-white bg-rose-900/60 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            >
            Delete
            </button>
        </div>
    </div>
    );
}


export default TodoItem;