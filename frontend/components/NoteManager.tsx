"use client";

import { useState, useEffect } from "react";
import { Trash2, FileText, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Note {
    id: number;
    title: string;
    content: string;
    summary: string;
    created_at: string;
}

export default function NoteManager() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch("/api/notes");
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            await fetch(`/api/notes/${id}`, { method: "DELETE" });
            setNotes(notes.filter((n) => n.id !== id));
            if (selectedNote?.id === id) setSelectedNote(null);
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    return (
        <div className="h-full flex flex-col bg-surface border border-border shadow-sm rounded-3xl overflow-hidden">
            {/* Header */}
            <header className="px-8 py-6 border-b border-border/50 bg-background/50 flex items-center gap-3">
                <div className="p-2 border border-border rounded-lg bg-white">
                    <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl text-foreground">My Study Notes</h2>
                    <p className="text-xs text-muted font-sans font-light">
                        {notes.length} {notes.length === 1 ? 'lesson' : 'lessons'} saved
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative md:flex md:flex-row">
                {/* List View */}
                <div className={`h-full overflow-y-auto p-6 transition-all duration-300 ${selectedNote ? 'w-1/3 border-r border-border hidden md:block' : 'w-full'}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-muted" />
                            <p className="text-sm text-muted">Loading your notes...</p>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-muted" />
                            </div>
                            <p className="text-muted italic text-lg">No notes yet.</p>
                            <p className="text-sm text-muted/60 max-w-xs">
                                Save a chat session to create your first study note.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => setSelectedNote(note)}
                                    className={`group p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md
                                        ${selectedNote?.id === note.id
                                            ? "bg-surface-hover border-primary ring-1 ring-primary shadow-sm"
                                            : "bg-surface border-border hover:border-primary/50"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-lg leading-snug line-clamp-2 ${selectedNote?.id === note.id ? "text-foreground font-medium" : "text-foreground/90"}`}>
                                            {note.title}
                                        </h3>
                                        <button
                                            onClick={(e) => deleteNote(note.id, e)}
                                            className="p-1.5 text-muted hover:text-red-400 hover:bg-red-900/20 rounded-md transition-all"
                                            title="Delete Note"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted font-light mb-3">
                                        {new Date(note.created_at).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                    {note.summary && (
                                        <div className="bg-secondary/10 p-2.5 rounded-lg border border-secondary/20">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Sparkles className="w-3 h-3 text-primary" />
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">AI Summary</span>
                                            </div>
                                            <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                                                {note.summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View (Overlay on mobile, Split on Desktop) */}
                {selectedNote && (
                    <div className={`absolute inset-0 md:static md:w-2/3 md:inset-auto h-full bg-surface z-20 flex flex-col md:block overflow-hidden transition-all duration-300 pl-0 md:pl-0`}>
                        {/* Mobile Header for Detail */}
                        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="flex items-center gap-1 text-muted hover:text-foreground"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" /> Back
                            </button>
                        </div>

                        <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-3xl text-foreground mb-2">{selectedNote.title}</h1>
                                <p className="text-sm text-muted mb-8 border-b border-border pb-4">
                                    Saved on {new Date(selectedNote.created_at).toLocaleString()}
                                </p>

                                <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-a:text-primary">
                                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
