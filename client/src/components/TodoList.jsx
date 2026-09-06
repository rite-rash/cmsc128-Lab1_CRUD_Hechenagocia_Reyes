// DESCRIPTION: container for todo cards

import { useState } from 'react';
import TodoItem from './TodoItem';
import AddTaskForm from './AddTaskForm';

function TodoList() {
    const [tasks, setTasks]= useState([]);

    return (
    <div className="w-full max-w-6xl h-[80vh] bg-pink-900/40 backdrop-blur-md rounded-3xl p-8 border border-pink-800/60 shadow-2xl flex flex-col justify-between">

    {/*header*/}
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-pink-800/50 gap-4 shrink-0">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Mga delubyo</h1>
            <p className="text-sm text-white-300/80 mt-0.5">dateee here</p>
        </div>

        {/*filters still not functional tho */}
        <div className="flex bg-pink-950/60 p-1.5 rounded-xl border border-pink-800/50">
            <button className="px-5 py-2 rounded-lg text-xs font-semibold bg-pink-600 text-white shadow-md">All</button>
            <button className="px-5 py-2 rounded-lg text-xs font-semibold text-pink-300 hover:text-white">To Do</button>
            <button className="px-5 py-2 rounded-lg text-xs font-semibold text-pink-300 hover:text-white">In Progress</button>
            <button className="px-5 py-2 rounded-lg text-xs font-semibold text-pink-300 hover:text-white">Done</button>
        </div>
    </div>

    {/* task sec */}
    <div className="flex-1 my-4 overflow-y-auto pr-2 flex flex-col gap-3">
        {tasks.map((task) => (
        <TodoItem key={task.id} task={task} />
        ))}
    </div>

    {/* add task form bott */}
    <div className="pt-4 border-t border-pink-800/40 shrink-0">
        <AddTaskForm tasks={tasks} setTasks={setTasks} />
    </div>

    </div>
    );
}

export default TodoList;