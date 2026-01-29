"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Loader2, Sparkles, ChevronDown, RefreshCw, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className={`flex flex-col h-full bg-surface/50 backdrop-blur-sm border border-border shadow-sm rounded-2xl overflow-hidden ${className}`}>
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 border border-border rounded-lg bg-surface shadow-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-foreground leading-tight">Study Buddy</h1>
                        <div className="relative">
                            <button
                                onClick={() => setIsModeOpen(!isModeOpen)}
                                className="flex items-center gap-1 text-[10px] text-muted hover:text-primary transition-colors font-medium tracking-wide uppercase"
                            >
                                {selectedMode}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            <AnimatePresence>
                                {isModeOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 mt-2 w-40 bg-surface rounded-xl shadow-xl border border-border py-1 z-50 overflow-hidden"
                                    >
                                        {MODES.map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => {
                                                    setSelectedMode(mode);
                                                    setIsModeOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs hover:bg-surface-hover hover:text-primary transition-colors ${selectedMode === mode ? 'text-primary font-bold bg-surface-hover' : 'text-foreground'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={async () => {
                            if (messages.length === 0) return;
                            try {
                                const noteContent = messages.map(m => `**${m.role === 'user' ? 'User' : 'Assistant'}**: ${m.message}`).join('\n\n');
                                const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Study Session - ${new Date().toLocaleString()}`, content: noteContent }), });
                                if (res.ok) alert("Chat saved as note!");
                            } catch (e) { alert("Failed to save note."); }
                        }}
                        className="p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all"
                        title="Save as Note"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={resetChat}
                        className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-all"
                        title="Reset Chat"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center text-muted space-y-4"
                    >
                        <div className="w-16 h-16 border border-border rounded-2xl flex items-center justify-center bg-surface/50 shadow-inner">
                            <Sparkles className="w-8 h-8 text-primary/50" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-medium text-foreground">Ready to learn?</h2>
                            <p className="text-xs opacity-60">Ask me anything about your coursework.</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex max-w-[85%] md:max-w-[80%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${msg.role === "user" ? "bg-foreground text-background border-transparent" : "bg-surface border-border text-primary"}`}>
                                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-surface border border-border text-foreground rounded-tl-sm"}`}>
                                            {msg.role === "assistant" ? (
                                                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/10">
                                                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.message
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-muted animate-spin" />
                                    </div>
                                    <div className="px-4 py-2 rounded-2xl bg-surface/50 border border-border/50 rounded-tl-sm">
                                        <span className="text-xs text-muted flex gap-1">Thinking<span className="animate-pulse">...</span></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>
                )}
            </main>

            {/* Input Area */}
            <footer className="flex-shrink-0 p-4 bg-background/50 border-t border-border backdrop-blur-md">
                <form onSubmit={sendMessage} className="relative flex items-center gap-3 max-w-4xl mx-auto w-full">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3.5 pr-12 rounded-xl border border-border bg-surface/50 focus:bg-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/50 text-foreground text-sm shadow-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-sm active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
