"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2, AlertCircle } from "lucide-react";

interface PlannerEvent {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    type: 'study' | 'break' | 'exam' | 'deadline';
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 12 AM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyPlanner() {
    const [events, setEvents] = useState<PlannerEvent[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<{
        title: string;
        day: string;
        startHour: string;
        duration: number;
        type: 'study' | 'break' | 'exam' | 'deadline';
    }>({
        title: "",
        day: "Mon",
        startHour: "09:00",
        duration: 1, // hours
        type: "study"
    });
    const [loading, setLoading] = useState(true);

    function getMonday(d: Date) {
        d = new Date(d);
        const day = d.getDay(),
            diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/planner");
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const addEvent = async () => {
        if (!newEvent.title) return;

        // Calculate ISO timestamps based on selected day and week
        const dayIndex = DAYS.indexOf(newEvent.day);
        const start = new Date(currentWeekStart);
        start.setDate(start.getDate() + dayIndex);
        const [hours, minutes] = newEvent.startHour.split(':').map(Number);
        start.setHours(hours, minutes, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + Math.floor(newEvent.duration), (newEvent.duration % 1) * 60);

        try {
            const res = await fetch("/api/planner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newEvent.title,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    type: newEvent.type
                }),
            });

            if (res.ok) {
                const createdEvent = await res.json();
                setEvents([...events, createdEvent]);
                setIsAddModalOpen(false);
                setNewEvent({ ...newEvent, title: "" }); // Reset title
            }
        } catch (error) {
            console.error("Failed to add event", error);
        }
    };

    const deleteEvent = async (id: number) => {
        if (!confirm("Remove this event?")) return;
        try {
            await fetch(`/api/planner/${id}`, { method: "DELETE" });
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    const getEventsForCell = (dayIndex: number, hour: number) => {
        const cellStart = new Date(currentWeekStart);
        cellStart.setDate(cellStart.getDate() + dayIndex);
        cellStart.setHours(hour, 0, 0, 0);

        const cellEnd = new Date(cellStart);
        cellEnd.setHours(hour + 1);

        return events.filter(e => {
            const eventStart = new Date(e.start_time);
            return eventStart >= cellStart && eventStart < cellEnd;
        });
    };

    // Helper to format date header (e.g., "Mon 28")
    const getDayHeader = (index: number) => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + index);
        return {
            name: DAYS[index],
            date: date.getDate()
        };
    };

    const changeWeek = (offset: number) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + (offset * 7));
        setCurrentWeekStart(newStart);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam': return 'bg-red-100 border-red-200 text-red-700';
            case 'deadline': return 'bg-orange-100 border-orange-200 text-orange-700';
            case 'break': return 'bg-blue-50 border-blue-100 text-blue-600';
            default: return 'bg-secondary/20 border-border text-foreground';
        }
    };

    return (
        <div className="h-full flex flex-col bg-background border border-border shadow-sm rounded-3xl overflow-hidden">
            {/* Header */}
            <header className="px-4 py-4 md:px-8 md:py-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-background gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 border border-border rounded-lg bg-surface">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl text-foreground">Weekly Schedule</h2>
                        <p className="text-xs text-muted font-sans font-light">
                            {currentWeekStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
                        <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-surface-hover transition-colors border-r border-border">
                            <ChevronLeft className="w-4 h-4 text-muted" />
                        </button>
                        <button onClick={() => setCurrentWeekStart(getMonday(new Date()))} className="px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors">
                            Today
                        </button>
                        <button onClick={() => changeWeek(1)} className="p-2 hover:bg-surface-hover transition-colors border-l border-border">
                            <ChevronRight className="w-4 h-4 text-muted" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-sm hover:bg-primary-hover transition-all text-sm font-medium whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Event</span><span className="sm:hidden">Add</span>
                    </button>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="w-full min-w-[300px] md:min-w-[800px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-background z-30">
                        <div className="p-1 md:p-4 border-r border-border bg-surface/50"></div> {/* Time axis header */}
                        {DAYS.map((_, index) => {
                            const { name, date } = getDayHeader(index);
                            const isToday = new Date().getDate() === date && new Date().getMonth() === currentWeekStart.getMonth();
                            return (
                                <div key={index} className={`p-1 md:p-4 border-r border-border text-center ${isToday ? 'bg-secondary/10' : ''}`}>
                                    <div className="text-[10px] md:text-xs font-bold text-muted uppercase tracking-wider truncate">{name}</div>
                                    <div className={`text-sm md:text-lg mt-0.5 md:mt-1 ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>{date}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Grid */}
                    <div className="grid grid-cols-8">
                        {/* Time Column */}
                        <div className="border-r border-border bg-surface/30">
                            {HOURS.map(hour => (
                                <div key={hour} className="h-16 md:h-20 border-b border-border p-1 md:p-2 text-[10px] md:text-xs text-muted text-right font-light flex items-start justify-end pt-1">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Event Columns */}
                        {DAYS.map((_, dayIndex) => (
                            <div key={dayIndex} className="border-r border-border relative">
                                {HOURS.map(hour => {
                                    const eventsInCell = getEventsForCell(dayIndex, hour);
                                    return (
                                        <div key={hour} className="h-16 md:h-20 border-b border-border relative group">
                                            {/* Render events that START in this hour */}
                                            {eventsInCell.map(event => {
                                                const start = new Date(event.start_time);
                                                const end = new Date(event.end_time);
                                                const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                                const topOffset = (start.getMinutes() / 60) * 100; // Percentage down
                                                // Adjust height for Tailwind h-16/h-20 (4rem=64px / 5rem=80px) scaling
                                                // We used px values before, but now height varies.
                                                // Simplified: assume responsive base height.

                                                // Calculating height percentage relative to cell is complex with varying px heights.
                                                // Better approach: use percentage height * duration? No, can't overlap next cell easily with overflow-hidden on parent.
                                                // Actually, sticky positioning or absolute with calc helps.
                                                // For now, let's just stick to absolute % height relative to cell seems wrong if > 1 hour.
                                                // BUT, the original code used hardcoded px height which breaks if I change row height.
                                                // I will verify row height: md:h-20 (80px), h-16 (64px).

                                                const mobileRowHeight = 64;
                                                const desktopRowHeight = 80;

                                                // We can use a CSS variable or js detection, but here simpler: 
                                                // Just use `height: calc(duration * 100%)`? No, parent is just one cell.
                                                // We need strict pixel text updates.

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-[4px] md:rounded-md p-1 md:p-2 text-[8px] md:text-xs border shadow-sm z-10 overflow-hidden cursor-pointer hover:brightness-95 transition-all flex flex-col gap-0.5 ${getTypeColor(event.type)}`}
                                                        style={{
                                                            top: `${topOffset}%`,
                                                            height: `calc(${durationHours} * 100% + ${durationHours - 1}px)`, // Approximate expanding over borders
                                                            minHeight: '24px'
                                                        }}
                                                        onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                                                        title={`${event.title} (Click to delete)`}
                                                    >
                                                        <span className="font-bold truncate leading-tight">{event.title}</span>
                                                        <span className="hidden md:inline opacity-75 text-[10px]">
                                                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Add to Schedule</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-muted hover:text-foreground">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1 block">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full p-2 rounded-lg border border-border bg-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="e.g. Physics Revision"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1 block">Day</label>
                                    <select
                                        className="w-full p-2 rounded-lg border border-border bg-surface outline-none"
                                        value={newEvent.day}
                                        onChange={e => setNewEvent({ ...newEvent, day: e.target.value })}
                                    >
                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1 block">Start Time</label>
                                    <select
                                        className="w-full p-2 rounded-lg border border-border bg-surface outline-none"
                                        value={newEvent.startHour}
                                        onChange={e => setNewEvent({ ...newEvent, startHour: e.target.value })}
                                    >
                                        {HOURS.map(h => {
                                            const time = `${h.toString().padStart(2, '0')}:00`;
                                            return <option key={time} value={time}>{time}</option>
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1 block">Duration (Hrs)</label>
                                    <input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        className="w-full p-2 rounded-lg border border-border bg-surface outline-none"
                                        value={newEvent.duration}
                                        onChange={e => setNewEvent({ ...newEvent, duration: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1 block">Type</label>
                                    <select
                                        className="w-full p-2 rounded-lg border border-border bg-surface outline-none"
                                        value={newEvent.type}
                                        onChange={e => setNewEvent({ ...newEvent, type: e.target.value as "study" | "exam" | "deadline" | "break" })}
                                    >
                                        <option value="study">Study</option>
                                        <option value="exam">Exam</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="break">Break</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={addEvent}
                                disabled={!newEvent.title}
                                className="w-full py-2 bg-primary text-white rounded-xl shadow-sm hover:bg-primary-hover disabled:opacity-50 transition-all font-medium"
                            >
                                Add Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
