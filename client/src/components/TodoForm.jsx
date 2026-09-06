// DESCRIPTION: take input values and send to parent

import { useState } from 'react';

function TodoForm({ initialValues = {}, onSubmit, buttonText = 'Add Task' }) {
    const today = new Date().toISOString().split('T')[0];

    const [taskName, setTaskName] = useState(initialValues.taskName || '');
    const [dueDate, setDueDate] = useState(initialValues.dueDate || today);
    const [dueTime, setDueTime] = useState(initialValues.dueTime || '08:00');
    const [status, setStatus] = useState(initialValues.status || 'not started');
    const [priority, setPriority] = useState(initialValues.priority || 'low');
    const [category, setCategory] = useState(initialValues.category || 'school');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        onSubmit({
            taskName: taskName.trim(),
            dueDate,
            dueTime,
            status,
            priority,
            category
        });

        if (!initialValues.taskName) {
            setTaskName('');
            setDueDate(today);
            setDueTime('08:00');
            setStatus('not started');
            setPriority('low');
            setCategory('school');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 w-full bg-[#8c4362] p-2 rounded-xl text-xs">
            {/* task name */}
            <input
                type="text"
                placeholder="+ Add new task"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="flex-1 min-w-[150px] bg-[#6e324c] text-white placeholder-pink-200/50 px-3 py-2 rounded-lg outline-none"
            />

            {/* date */}
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            />

            {/* time */}
            <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            />

            {/* categ */}
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            >
                <option value="school">School</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="others">others</option>
            </select>

            {/* prio */}
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>

            {/* status */}
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            >
                <option value="not started">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            
            <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            > {buttonText}
            </button>
        </form>
    );
}

export default TodoForm;