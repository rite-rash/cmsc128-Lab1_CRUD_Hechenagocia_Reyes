// DESCRIPTION: take input values and send to parent

import { useState } from 'react';
import FilterSelect from './FilterSelect';

const CATEGORY_OPTIONS = [
    { value: 'school', label: 'School' },
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'others', label: 'Others' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const fieldClass =
    'w-full bg-[#fff7fa] border border-pink-200 text-[#3d1226] rounded-xl px-3.5 py-2.5 outline-none transition-colors ' +
    'placeholder:text-[#a5788b] focus:border-[#c2185b] focus:ring-2 focus:ring-pink-200';
const labelClass = 'block text-sm font-semibold text-[#3d1226] mb-1';

function TodoForm({ initialValues = {}, onSubmit, onCancel, buttonText = 'Add Task' }) {

    const today = new Date().toLocaleDateString('en-CA');
    const isEditing = !!initialValues.taskName;

    const [taskName, setTaskName] = useState(initialValues.taskName || '');
    const [dueDate, setDueDate] = useState(initialValues.dueDate || today);
    const [dueTime, setDueTime] = useState(initialValues.dueTime || '08:00');
    // stored lowercase so they match the filters, sorting and the select options
    const [priority, setPriority] = useState((initialValues.priority || '').toLowerCase());
    const [category, setCategory] = useState((initialValues.category || '').toLowerCase());
    const [error, setError] = useState('');

    //listener for form submission
    const handleSubmit = (e) => {
        e.preventDefault(); //prevent refreshing of page

        // guard for submitting an empty field
        if (!taskName.trim() || !category || !priority) {
            setError('Kindly fill in the task name, category, and priority');
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
            className="w-full bg-white rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col gap-4"
        >
            <h3 className="font-serif text-xl md:text-2xl font-bold text-[#7a0f3d]">
                {isEditing ? 'Edit task' : 'Add new task'}
            </h3>

            {/* task name */}
            <div>
                <label htmlFor="task-name" className={labelClass}>Task name</label>
                <input
                    id="task-name"
                    type="text"
                    placeholder="e.g. Finish 128 quiz"
                    value={taskName}
                    onChange={(e) => {
                        setTaskName(e.target.value);
                        if (error) setError('');
                    }}
                    aria-invalid={!!error}
                    className={`${fieldClass} text-sm ${
                        error ? 'border-rose-500 ring-2 ring-rose-200' : ''
                    }`}
                />
                {error && (
                    <p role="alert" className="text-rose-600 text-sm font-semibold mt-1.5">
                        {error}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.15fr_1.15fr] gap-3">
                {/* date */}
                <div>
                    <label htmlFor="task-date" className={labelClass}>Due date</label>
                    <input
                        id="task-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`${fieldClass} text-sm cursor-pointer`}
                    />
                </div>

                {/* time */}
                <div>
                    <label htmlFor="task-time" className={labelClass}>Due time</label>
                    <input
                        id="task-time"
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className={`${fieldClass} text-sm cursor-pointer`}
                    />
                </div>

                {/* categ */}
                {/* TODO: implement customized category when others is selected  */}
                <div>
                    <label htmlFor="task-category" className={labelClass}>Category</label>
                    <FilterSelect
                        id="task-category"
                        ariaLabel="Category"
                        value={category}
                        onChange={setCategory}
                        placeholder="Select category"
                        options={CATEGORY_OPTIONS}
                    />
                </div>

                {/* priority */}
                <div>
                    <label htmlFor="task-priority" className={labelClass}>Priority</label>
                    <FilterSelect
                        id="task-priority"
                        ariaLabel="Priority"
                        value={priority}
                        onChange={setPriority}
                        placeholder="Select priority"
                        options={PRIORITY_OPTIONS}
                    />
                </div>
            </div>

            {/* submit + cancel */}
            <div className="flex justify-end items-center gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-2 rounded-xl text-sm font-semibold text-[#7a0f3d] hover:bg-pink-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!taskName.trim() || !category || !priority}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#c2185b] hover:bg-[#a8144d] transition-colors cursor-pointer disabled:bg-[#ecc4d8] disabled:text-[#7a0f3d]/70 disabled:cursor-not-allowed"
                >
                    {buttonText}
                </button>
            </div>
        </form>
    );
}

export default TodoForm;