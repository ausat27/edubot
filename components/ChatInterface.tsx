"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Loader2, Sparkles, ChevronDown, RefreshCw, Save } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    message: string;
}

interface ChatInterfaceProps {
    className?: string;
}

const MODES = ["School", "High School", "College", "University", "Researcher"];

export default function ChatInterface({ className }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState("University");
    const [isModeOpen, setIsModeOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const storedId = localStorage.getItem("conversation_id");
        if (storedId) {
            setConversationId(storedId);
        }
    }, []);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", message: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_id: conversationId,
                    mode: selectedMode,
                }),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.statusText}`);
            }

            const data = await res.json();

            if (data.conversation_id && data.conversation_id !== conversationId) {
                setConversationId(data.conversation_id);
                localStorage.setItem("conversation_id", data.conversation_id);
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", message: data.response },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", message: "Error: Could not connect to the bot." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetChat = async () => {
        if (!conversationId) return;
        try {
            await fetch("/api/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation_id: conversationId }),
            });
            setMessages([]);
        } catch (error) {
            console.error("Error resetting chat:", error);
        }
    };

    return (
        <div className={`flex flex-col h-full bg-surface border border-border shadow-sm rounded-3xl overflow-hidden ${className}`}>
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 border border-border rounded-full bg-surface">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-medium text-foreground leading-tight">Study Session</h1>
                        <div className="relative">
                            <button
                                onClick={() => setIsModeOpen(!isModeOpen)}
                                className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition-colors font-medium tracking-wide uppercase"
                            >
                                {selectedMode} MODE
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {isModeOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {MODES.map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setSelectedMode(mode);
                                                setIsModeOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-2.5 text-sm hover:bg-surface-hover hover:text-primary transition-colors ${selectedMode === mode ? 'text-primary font-bold bg-surface-hover' : 'text-foreground'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={async () => {
                            if (messages.length === 0) return;
                            try {
                                const noteContent = messages.map(m => `**${m.role === 'user' ? 'User' : 'Assistant'}**: ${m.message}`).join('\n\n');
                                const res = await fetch("/api/notes", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        title: `Study Session - ${new Date().toLocaleString()}`,
                                        content: noteContent
                                    }),
                                });
                                if (res.ok) {
                                    alert("Chat saved as note!");
                                } else {
                                    throw new Error("Failed to save note");
                                }
                            } catch (error) {
                                console.error("Error saving note:", error);
                                alert("Failed to save note.");
                            }
                        }}
                        className="p-1.5 text-muted hover:text-primary transition-all"
                        title="Save as Note"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={resetChat}
                        className="p-1.5 text-muted hover:text-foreground transition-all"
                        title="Reset Chat"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header >

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-background">
                {
                    messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted space-y-4">
                            <div className="w-16 h-16 border border-border rounded-full flex items-center justify-center bg-white shadow-sm">
                                <Sparkles className="w-6 h-6 text-secondary" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl text-foreground">Ready to learn?</h2>
                                <p className="text-xs opacity-70 max-w-xs mx-auto font-light">
                                    I&apos;m set to {selectedMode} mode. Ask me anything.
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex max-w-[90%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div
                                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-border ${msg.role === "user"
                                            ? "bg-foreground text-background"
                                            : "bg-surface text-primary"
                                            }`}
                                    >
                                        {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                    </div>
                                    <div
                                        className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-primary text-white rounded-tr-sm"
                                            : "bg-surface border border-border text-foreground rounded-tl-sm"
                                            }`}
                                    >
                                        {msg.role === "assistant" ? (
                                            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-ol:text-foreground prose-ul:text-foreground prose-a:text-primary font-medium">
                                                <ReactMarkdown>{msg.message}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.message
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                }
                {
                    isLoading && (
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full border border-border bg-surface flex items-center justify-center">
                                    <Bot className="w-3 h-3 text-muted" />
                                </div>
                                <div className="bg-surface border border-border px-4 py-2 rounded-2xl rounded-tl-sm">
                                    <span className="text-xs text-muted italic">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )
                }
                <div ref={messagesEndRef} />
            </main >

            {/* Input Area */}
            <footer className="p-4 bg-surface border-t border-border" >
                <form
                    onSubmit={sendMessage}
                    className="relative flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 pr-10 rounded-xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted text-foreground font-light text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-1.5 text-primary hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer >
        </div >
    );
}
