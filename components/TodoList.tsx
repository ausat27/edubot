"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Trash2, Loader2, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
            const res = await fetch("/api/tasks");
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
            const res = await fetch("/api/tasks", {
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
            await fetch(`/api/tasks/${id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !completed }),
            });
        } catch (error) { fetchTasks(); }
    };

    const deleteTask = async (id: number) => {
        // Optimistically remove
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        } catch (error) { fetchTasks(); }
    };

    const clearCompleted = async () => {
        setTasks(tasks.filter(t => !t.completed));
        try {
            await fetch("/api/tasks/completed", { method: "DELETE" });
        } catch (error) {
            fetchTasks();
        }
    };

    return (
        <div className="h-full flex flex-col bg-surface border border-border rounded-xl p-4 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
                </div>
                {tasks.some(t => t.completed) && (
                    <button
                        onClick={clearCompleted}
                        className="text-[10px] text-muted hover:text-red-400 transition-colors uppercase tracking-wider font-medium"
                    >
                        Clear Done
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 -mr-2 space-y-1">
                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted" /></div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-muted opacity-50 space-y-1">
                        <ListTodo className="w-8 h-8 opacity-20" />
                        <p className="text-xs italic">No tasks yet.</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                        {tasks.map((task) => (
                            <motion.div
                                layout
                                key={task.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="group flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-surface-hover/50 transition-colors"
                            >
                                <button
                                    onClick={() => toggleTask(task.id, task.completed)}
                                    className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${task.completed
                                        ? "bg-primary border-primary"
                                        : "border-muted hover:border-primary bg-transparent"
                                        }`}
                                >
                                    {task.completed && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                </button>
                                <span className={`text-sm flex-1 truncate transition-all ${task.completed ? "text-muted line-through decoration-muted/50" : "text-foreground font-light"}`}>
                                    {task.title}
                                </span>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-400 p-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <form onSubmit={addTask} className="mt-2 pt-3 border-t border-border/50">
                <div className="relative flex items-center">
                    <Plus className="absolute left-2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task..."
                        className="w-full bg-surface-hover/50 border border-transparent focus:border-border rounded-lg pl-8 pr-3 py-2 text-xs outline-none text-foreground placeholder-muted transition-all"
                    />
                </div>
            </form>
        </div>
    );
}
