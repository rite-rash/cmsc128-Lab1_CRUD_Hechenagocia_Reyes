// DESCRIPTION: renders  add task then handles input state and appends task to list

import { useState } from 'react';

function AddTaskForm({ tasks, setTasks }) {
    const [taskName, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('not started');

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    //format date 
    const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }): '7:00 AM'; //idk i think we can format our default time in here?
    const newTask = {
        id: Date.now(),
        title: taskName.trim(),
        status: status, 
        dueDate: formattedDate 
    };
    setTasks([...tasks, newTask]);
    
    //clear input fields after adding prev task
    setTitle('');
    setDueDate('');
    setStatus('not started');
    };

    return (
    <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col md:flex-row items-center gap-2 bg-pink-950/60 border border-pink-700/50 rounded-2xl p-2.5 transition-all focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/20 shadow-sm">
        
        {/* input task*/}
        <input
            type="text"
            laceholder="+ Add new task"
            value={taskName}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 w-full bg-transparent text-slate-100 placeholder-pink-300/40 text-sm font-medium px-3 py-1 focus:outline-none"
        />

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* date */}
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-pink-900/40 text-pink-200 border border-pink-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
        />

        {/*  status*/}
        <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-pink-900/40 text-pink-200 border border-pink-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
        >
            <option value="not started" className="bg-pink-950 text-white">To Do</option>
            <option value="in progress" className="bg-pink-950 text-white">In Progress</option>
            <option value="completed" className="bg-pink-950 text-white">Completed</option>
        </select>

        {/* submit*/}
        <button
            type="submit"
            className="px-5 py-2 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer whitespace-nowrap"
        >
            Add Task
        </button>
        </div>

    </div>
    </form>
    );
}

export default AddTaskForm;