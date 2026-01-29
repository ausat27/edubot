"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Trash2, Loader2, Circle } from "lucide-react";

interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export default function TodoList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch("/tasks");
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) { console.error("Failed to fetch tasks", error); } finally { setLoading(false); }
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            const res = await fetch("/tasks", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTask }),
            });
            if (res.ok) {
                const task = await res.json();
                setTasks([task, ...tasks]);
                setNewTask("");
            }
        } catch (error) { console.error("Failed to add task", error); }
    };

    const toggleTask = async (id: number, completed: boolean) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
        try {
            await fetch(`/tasks/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !completed }),
            });
        } catch (error) { fetchTasks(); }
    };

    const deleteTask = async (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
        try {
            await fetch(`/tasks/${id}`, { method: "DELETE" });
        } catch (error) { fetchTasks(); }
    };

    const clearCompleted = async () => {
        // Optimistic update
        setTasks(tasks.filter(t => !t.completed));
        try {
            await fetch("/tasks/completed", { method: "DELETE" });
        } catch (error) {
            console.error("Failed to clear tasks", error);
            fetchTasks(); // Revert on error
        }
    };

    return (
        <div className="h-full flex flex-col bg-surface border border-border rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden">
            <h3 className="text-xl text-foreground mb-4">To-Do List</h3>

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                {loading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted" /></div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-start justify-start h-20 text-muted opacity-50 pt-2">
                        <p className="text-sm italic">No tasks pending.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="group flex items-center gap-3 py-2 transition-all">
                            <button
                                onClick={() => toggleTask(task.id, task.completed)}
                                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${task.completed
                                    ? "bg-muted border-muted"
                                    : "border-muted hover:border-primary bg-transparent"
                                    }`}
                            >
                                {task.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`text-sm flex-1 truncate transition-all ${task.completed ? "text-muted-light line-through" : "text-foreground font-light"}`}>
                                {task.title}
                            </span>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="transition-all text-muted hover:text-red-400 opacity-70 hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Clear Completed Button - Only shows if there are completed tasks */}
            {tasks.some(t => t.completed) && (
                <div className="flex justify-end mt-2">
                    <button
                        onClick={clearCompleted}
                        className="text-xs text-muted hover:text-red-400 transition-colors italic"
                    >
                        Clear completed
                    </button>
                </div>
            )}

            <form onSubmit={addTask} className="mt-2 flex items-center gap-2 pt-3 border-t border-border/50">
                <Plus className="w-4 h-4 text-muted" />
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add item..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder-muted font-light"
                />
            </form>
        </div>
    );
}
