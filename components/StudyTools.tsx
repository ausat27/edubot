"use client";

import { useState } from "react";
import Timer from "./Timer";
import TodoList from "./TodoList";
import FlashcardDeck from "./FlashcardDeck";
import QuizMode from "./QuizMode";

export default function StudyTools() {
    const [activeTab, setActiveTab] = useState<"focus" | "learn">("focus");
    const [learnMode, setLearnMode] = useState<"flashcards" | "quiz">("flashcards");

    return (
        <div className="flex flex-col h-full bg-surface border border-border shadow-sm rounded-3xl overflow-hidden">
            {/* Organic Tab Switcher */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab("focus")}
                    className={`flex-1 py-2 md:py-2.5 text-center text-xs md:text-sm transition-all
                        ${activeTab === "focus"
                            ? "text-foreground font-medium bg-surface"
                            : "text-muted bg-surface-hover hover:text-foreground"
                        }`}
                >
                    Focus
                </button>
                <div className="w-[1px] bg-border"></div>
                <button
                    onClick={() => setActiveTab("learn")}
                    className={`flex-1 py-2 md:py-2.5 text-center text-xs md:text-sm transition-all
                        ${activeTab === "learn"
                            ? "text-foreground font-medium bg-surface"
                            : "text-muted bg-surface-hover hover:text-foreground"
                        }`}
                >
                    Learn
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-background">

                {/* Focus Tab Content */}
                <div className={`h-full flex flex-col gap-2 md:gap-3 p-3 md:p-4 overflow-y-auto md:overflow-hidden ${activeTab === "focus" ? "block" : "hidden"}`}>
                    <div className="flex-shrink-0 min-h-min bg-surface rounded-2xl overflow-hidden">
                        <Timer />
                    </div>
                    <div className="flex-1 min-h-[300px] md:min-h-0 overflow-hidden">
                        <TodoList />
                    </div>
                </div>

                {/* Learn Tab Content */}
                <div className={`h-full flex flex-col ${activeTab === "learn" ? "block" : "hidden"}`}>
                    {/* Sub-navigation for Learn Mode */}
                    <div className="flex justify-center gap-4 py-3 border-b border-border/50 bg-surface/50">
                        <button
                            onClick={() => setLearnMode("flashcards")}
                            className={`text-sm px-3 py-1 rounded-full transition-all ${learnMode === "flashcards" ? "bg-secondary/20 text-foreground" : "text-muted hover:text-foreground"}`}
                        >
                            Flashcards
                        </button>
                        <button
                            onClick={() => setLearnMode("quiz")}
                            className={`text-sm px-3 py-1 rounded-full transition-all ${learnMode === "quiz" ? "bg-secondary/20 text-foreground" : "text-muted hover:text-foreground"}`}
                        >
                            Quiz
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <div className={`h-full w-full absolute top-0 left-0 ${learnMode === "flashcards" ? "block" : "hidden"}`}>
                            <FlashcardDeck />
                        </div>
                        <div className={`h-full w-full absolute top-0 left-0 ${learnMode === "quiz" ? "block" : "hidden"}`}>
                            <QuizMode />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
