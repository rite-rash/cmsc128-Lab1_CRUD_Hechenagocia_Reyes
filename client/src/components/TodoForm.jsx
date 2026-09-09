// DESCRIPTION: take input values and send to parent

import { useState } from 'react';

function TodoForm({ initialValues = {}, onSubmit, onCancel, buttonText = 'Add Task' }) {


    const today = new Date().toISOString().split('T')[0];

    const [taskName, setTaskName] = useState(initialValues.taskName || '');
    const [dueDate, setDueDate] = useState(initialValues.dueDate || today);
    const [dueTime, setDueTime] = useState(initialValues.dueTime || '08:00');
    // const [status, setStatus] = useState(initialValues.status || 'not started');
    const [priority, setPriority] = useState(initialValues.priority || '');
    const [category, setCategory] = useState(initialValues.category || '');
    const [error, setError] = useState('');


    //listener for form submission
    const handleSubmit = (e) => {

        e.preventDefault(); //prevent refreshing of page

        // guard for submitting an empty field
        if (!taskName.trim()) {
            setError('Kindly add task name');
            return;
        }
        setError(''); 



        //include the ff. when submitting
        onSubmit({
            taskName: taskName.trim(),
            dueDate: dueDate || today ,
            dueTime:  dueTime || '08:00',
            // status,
            priority,
            category
        });

        if (!initialValues.taskName) {
            setTaskName('');
            setDueDate(today);
            setDueTime('08:00');
            setPriority('');
            setCategory('');
        }
        };

    return (
        <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 w-full bg-[#8c4362] p-2 rounded-xl text-xs">


            {/* task name */}
            <input
                type="text"
                placeholder="Enter task name..."
                value={taskName}
                onChange={(e) => {
                    setTaskName(e.target.value);
                    if (error) setError('');
                }}
                className={`flex-1 min-w-[150px] bg-[#6e324c] text-white placeholder-pink-200/50 px-3 py-2 rounded-lg outline-none ${
                    error ? 'ring-2 ring-rose-500' : ''
                }`}
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
            {/* TODO: implement customized category when others is selected  */}

            <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            >
                <option value="" disabled hidden className="text-black">Category</option>
                <option value="School" className="text-black">School</option>
                <option value="Personal" className="text-black">Personal</option>
                <option value="Work" className="text-black">Work</option>
                <option value="Others" className="text-black">Others</option>
            </select>

            <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            >
                <option value="" disabled hidden className="text-black">Priority</option>
                <option value="Low" className="text-black">Low</option>
                <option value="Medium" className="text-black">Medium</option>
                <option value="High" className="text-black">High</option>
            </select>
            {/* status
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#6e324c] text-pink-100 px-2 py-2 rounded-lg outline-none cursor-pointer"
            >
                <option value="not started">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
            </select> */}




            {/* submit + cancel */}
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                > {buttonText}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-[#6e324c] hover:bg-[#59243e] text-pink-100 font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
        {error && (
            <p className="text-rose-300 text-xs font-semibold mt-1.5 ml-1">{error}</p>
        )}
        </div>
    );
}

export default TodoForm;