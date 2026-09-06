// DESCRIPTION: serves as cards pertaining to each indiv tasks

// function TodoItem (props){


//     return(
//         <div className="p-4 rounded-lg bg-pink-800 text-slate-100 shadow">
//             <p>{props.taskName}</p>
//         </div>
//     );
// }

// export default TodoItem;



function TodoItem({ task, onEdit, onDelete }) {
    return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-pink-950/60 border border-pink-800/40 text-slate-100 shadow-sm transition-all hover:border-pink-700/60">      
    {/* checkbox */}
        <input 
        type="checkbox" 
        checked={task.status === 'completed'}
        readOnly
        className="w-5 h-5 shrink-0 mt-0.5 accent-pink-500 rounded cursor-default"
        />

        <div className="flex flex-col">
        <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-pink-400/50' : 'text-slate-100'}`}>
            {task.title}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-pink-300/60">{task.dueDate}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                task.status === 'completed' ? 'bg-pink-900/60 text-pink-300' :
                task.status === 'in progress' ? 'bg-pink-900/60 text-amber-100' :'bg-slate-800/60 text-slate-300'
        }`}>
            {task.status}
            </span>
        </div>
        </div>
        <div className="group-hover:opacity-100 transition-opacity flex items-center gap-2 shrink-0">
            <button 
                onClick={() => onEdit && onEdit(task)}
                className="p-1.5 text-xs text-pink-300 hover:text-white bg-pink-900/50 hover:bg-pink-800 rounded-lg transition-colors cursor-pointer"
            >
                Edit
            </button>
            <button 
                onClick={() => onDelete && onDelete(task.id)}
                className="p-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/50 hover:bg-pinkee-900 rounded-lg transition-colors cursor-pointer"
            >
                Delete
            </button>
        </div>
    </div>
    );
}

export default TodoItem;