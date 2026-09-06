// DESCRIPTION: Controls app structure, state management, and persistence

import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('my_todo_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem('my_todo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // add task
  const handleAddTask = (newTaskData) => {
    if (!newTaskData.taskName || !newTaskData.taskName.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      ...newTaskData,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

//toggle status
  const handleToggleStatus = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'done' ? 'not started' : 'done' }
          : task
      )
    );
  };

  return (
    <Layout>
      {/* main container */}
      <div className="w-full max-w-4xl bg-[#bc688c] p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
        
        {/* header */}
        <div className="flex justify-between items-center border-b border-pink-400/30 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              My Todo List
            </h1>
            <p className="text-xs text-pink-200/80 italic mt-0.5">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          {/* status filter */}
          <div className="flex gap-1.5 text-xs font-semibold bg-[#8c4362]/60 p-1 rounded-xl">
            <button className="bg-pink-500 text-white px-3 py-1 rounded-lg">All</button>
            <button className="text-pink-100 hover:text-white px-3 py-1 rounded-lg transition-colors">To Do</button>
            <button className="text-pink-100 hover:text-white px-3 py-1 rounded-lg transition-colors">In Progress</button>
            <button className="text-pink-100 hover:text-white px-3 py-1 rounded-lg transition-colors">Done</button>
          </div>
        </div>

        {/* task cards */}
        <div className="flex flex-col gap-3 min-h-[200px] max-h-[450px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-pink-200/60 font-medium text-sm py-12">
              No tasks added yet. create now!
            </div>
          ) : (
            tasks.map((task) => (
              <TodoItem 
                key={task.id} 
                task={task} 
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>


        <TodoForm onSubmit={handleAddTask} buttonText="Add Task" />

      </div>
    </Layout>
  );
}

export default App;