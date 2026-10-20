//DESCRIPTION: loads list for both "owned by me" and "shared with me"
//          also allows actions: add, edit, check off, delete tasks

import { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";
import {
    useListTasks, useUserNames, addListTask, updateListTask,
    toggleListTaskStatus, deleteListTask,
} from "./ListService";


import ListMembers from "./ListMembers";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";


function CollabTodo() {
    const { listId } = useParams();

    const { user } = useAuth();
    const { tasks, error: tasksError } = useListTasks(listId);
    const [list, setList] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [actionError, setActionError] = useState("");

    const names = useUserNames(list?.memberIds); //? to not crash if undefined since initially list is null

    useEffect(() => {
        return onSnapshot(
            doc(db, "lists", listId),
            (snap) => snap.exists() && setList({ id: snap.id, ...snap.data() }),
            () => {} // ListGuard already handles access
        );
    }, [listId]);

    // wraps any action so failures show up instead of silently vanishing
    const run = async (fn) => {
        setActionError("");
        try { await fn(); } catch (err) { setActionError(err.message); }
    };

    if (tasksError) return <Navigate to="/" replace />;
    if (!list) return <p className="text-white font-semibold p-8">Loading...</p>;

    const isOwner = list?.ownerId === user.uid;

    return (
        <div className="w-full max-w-6xl bg-[#bc688c] p-4 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 m-4">
            <div>
                <Link
                    to={isOwner ? "/collab/owned" : "/collab/shared"}
                    className="text-xs font-semibold text-pink-100 hover:text-white"
                >
                    ← Back
                </Link>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">{list.name}</h1>
                <p className="text-xs text-pink-200/80">
                    {isOwner ? "You own this list" : "Shared with you"}
                </p>
            </div>

            <ListMembers list={list} names={names} />


            {actionError && <p className="text-pink-100 text-sm">{actionError}</p>}

            <div className="flex flex-col gap-3 min-h-[200px]">
                {tasks.length === 0 ? (
                    <p className="text-pink-200/60 text-sm text-center py-12">
                        No tasks in this list yet.
                    </p>
                ) : (
                    //del task
                    tasks.map((task) => (
                        <TodoItem
                            key={task.id}
                            task={task}
                            onToggleStatus={() => run(() => toggleListTaskStatus(listId, task))}
                            onDelete={(id) =>
                                window.confirm("Delete this task?") &&
                                run(() => deleteListTask(listId, id))
                            }
                            onUndo={() => {}}
                            onEdit={setEditingTask}
                            isPendingDelete={false}
                        />
                    ))
                )}
            </div>

            {/* check state first  */}
            {editingTask ? (
                <TodoForm
                    key={editingTask.id}
                    initialValues={editingTask}
                    onSubmit={(data) =>
                        run(async () => {
                            await updateListTask(listId, editingTask.id, data);
                            setEditingTask(null);
                        })
                    }
                    onCancel={() => setEditingTask(null)}
                    buttonText="Save Changes"
                />
            ) : (

                //creating task
                <TodoForm
                    key="new"
                    onSubmit={(data) => run(() => addListTask(listId, data))}
                    buttonText="Add Task"
                />


            )}
        </div>
    );
}

export default CollabTodo;