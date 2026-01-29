"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "./Timer";
import TodoList from "./TodoList";
import FlashcardDeck from "./FlashcardDeck";
import QuizMode from "./QuizMode";

export default function StudyTools() {
    const [activeTab, setActiveTab] = useState<"focus" | "learn">("focus");
    const [learnMode, setLearnMode] = useState<"flashcards" | "quiz">("flashcards");

    return (
        <div className="flex flex-col h-full bg-surface/50 backdrop-blur-md border border-border shadow-sm rounded-2xl overflow-hidden relative">
            {/* Organic Tab Switcher */}
            <div className="flex border-b border-border/50 relative z-10 bg-surface/80">
                {(["focus", "learn"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-center text-xs md:text-sm transition-colors relative font-medium ${activeTab === tab ? "text-primary" : "text-muted hover:text-foreground"}`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-background/50">
                <AnimatePresence mode="wait" initial={false}>
                    {activeTab === "focus" ? (
                        <motion.div
                            key="focus"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col gap-3 p-3 overflow-hidden"
                        >
                            <div className="flex-none bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                                <Timer />
                            </div>
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <TodoList />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="learn"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            {/* Sub-navigation for Learn Mode */}
                            <div className="flex justify-center gap-2 py-2 border-b border-border/50 bg-surface/50">
                                {(["flashcards", "quiz"] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setLearnMode(mode)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-all border ${learnMode === mode ? "bg-primary/10 text-primary border-primary/20" : "bg-transparent text-muted border-transparent hover:text-foreground hover:bg-surface"}`}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-hidden relative p-3">
                                <AnimatePresence mode="wait">
                                    {learnMode === "flashcards" ? (
                                        <motion.div
                                            key="flashcards"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full w-full"
                                        >
                                            <FlashcardDeck />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="quiz"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full w-full"
                                        >
                                            <QuizMode />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
