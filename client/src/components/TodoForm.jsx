// DESCRIPTION: take input values and send to parent

import { useState } from 'react';

function TodoForm({ initialValues = {}, onSubmit, onCancel, buttonText = 'Add Task' }) {

    const today = new Date().toLocaleDateString('en-CA');
    const isEditing = !!initialValues.taskName;

    const [taskName, setTaskName] = useState(initialValues.taskName || '');
    const [dueDate, setDueDate] = useState(initialValues.dueDate || today);
    const [dueTime, setDueTime] = useState(initialValues.dueTime || '08:00');
    const [priority, setPriority] = useState(initialValues.priority || '');
    const [category, setCategory] = useState(initialValues.category || '');
    const [error, setError] = useState('');

    const fieldClass =
        'w-full bg-white border border-pink-200 text-[#5a2a40] text-sm rounded-lg px-3 py-2 outline-none ' +
        'focus:border-pink-500 focus:ring-2 focus:ring-pink-200';
    const labelClass = 'block text-xs font-semibold text-[#8c4362] mb-1';

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
            dueDate: dueDate || today,
            dueTime: dueTime || '08:00',
            priority,
            category
        });

        if (!isEditing) {
            setTaskName('');
            setDueDate(today);
            setDueTime('08:00');
            setPriority('');
            setCategory('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full bg-pink-50 border border-pink-200 rounded-2xl shadow-lg p-5 flex flex-col gap-4"
        >
            <h3 className="text-[#8c4362] font-bold text-base">
                {isEditing ? 'Edit Task' : 'Add New Task'}
            </h3>

            {/* task name */}
            <div>
                <label className={labelClass}>Task name</label>
                <input
                    type="text"
                    placeholder="Enter task name..."
                    value={taskName}
                    onChange={(e) => {
                        setTaskName(e.target.value);
                        if (error) setError('');
                    }}
                    className={`${fieldClass} placeholder:text-pink-300 ${
                        error ? 'border-rose-500 ring-2 ring-rose-200' : ''
                    }`}
                />
                {error && (
                    <p className="text-rose-600 text-xs font-semibold mt-1">{error}</p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* date */}
                <div>
                    <label className={labelClass}>Due date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`${fieldClass} cursor-pointer`}
                    />
                </div>

                {/* time */}
                <div>
                    <label className={labelClass}>Due time</label>
                    <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className={`${fieldClass} cursor-pointer`}
                    />
                </div>

                {/* categ */}
                {/* TODO: implement customized category when others is selected  */}
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`${fieldClass} cursor-pointer ${category === '' ? 'text-pink-300' : ''}`}
                    >
                        <option value="" disabled hidden>Select category</option>
                        <option value="School" className="text-black">School</option>
                        <option value="Personal" className="text-black">Personal</option>
                        <option value="Work" className="text-black">Work</option>
                        <option value="Others" className="text-black">Others</option>
                    </select>
                </div>

                {/* priority */}
                <div>
                    <label className={labelClass}>Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className={`${fieldClass} cursor-pointer ${priority === '' ? 'text-pink-300' : ''}`}
                    >
                        <option value="" disabled hidden>Select priority</option>
                        <option value="Low" className="text-black">Low</option>
                        <option value="Medium" className="text-black">Medium</option>
                        <option value="High" className="text-black">High</option>
                    </select>
                </div>
            </div>

            {/* submit + cancel */}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-[#8c4362] hover:bg-pink-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 transition-colors cursor-pointer"
                >
                    {buttonText}
                </button>
            </div>
        </form>
    );
}

export default TodoForm;