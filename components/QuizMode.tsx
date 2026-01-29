"use client";

import { useState } from "react";
import { Check, X, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface Question {
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
}

interface QuizData {
    title: string;
    questions: Question[];
}

export default function QuizMode() {
    const [topic, setTopic] = useState("");
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const generateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            const data = await res.json();
            setQuiz(data);
            setCurrentQIndex(0);
            setScore(0);
            setIsFinished(false);
            setSelectedOption(null);
        } catch (error) {
            console.error("Failed to generate quiz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionClick = (option: string) => {
        if (selectedOption) return; // Prevent changing after selection
        setSelectedOption(option);

        if (option === quiz?.questions[currentQIndex].correct_answer) {
            setScore(prev => prev + 1);
        }

        // Auto advance after short delay
        setTimeout(() => {
            if (currentQIndex < (quiz?.questions.length || 0) - 1) {
                setCurrentQIndex(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setIsFinished(true);
            }
        }, 1500);
    };

    const restartQuiz = () => {
        setQuiz(null);
        setTopic("");
        setIsFinished(false);
    }

    return (
        <div className="h-full flex flex-col p-4 md:p-6 animate-in fade-in duration-300">
            {/* Generator Input - Always at top like Flashcards */}
            <form onSubmit={generateQuiz} className="flex gap-2 mb-6 flex-shrink-0">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Quiz Topic (e.g., 'Calculus')"
                    className="flex-1 p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition-all placeholder:font-sans"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="p-3 bg-secondary/20 hover:bg-secondary/30 text-foreground rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
            </form>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {!quiz ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                        <p className="text-muted italic text-sm">
                            Create a generic quiz on any topic.
                        </p>
                    </div>
                ) : isFinished ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-50 duration-300">
                        <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center">
                            <span className="text-4xl text-primary font-serif">{Math.round((score / quiz.questions.length) * 100)}%</span>
                        </div>
                        <div>
                            <h3 className="text-2xl text-foreground font-serif">Quiz Complete!</h3>
                            <p className="text-muted mt-2">You scored {score} out of {quiz.questions.length}</p>
                        </div>
                        <button onClick={restartQuiz} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-sm">
                            <RefreshCw className="w-4 h-4" /> Try Another
                        </button>
                    </div>
                ) : !quiz || !quiz.questions || !quiz.questions[currentQIndex] ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-muted" />
                        <p className="text-muted text-sm">Loading question...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs uppercase tracking-widest text-muted truncate max-w-[120px]">{quiz.title}</span>
                            <span className="text-xs text-muted font-medium bg-surface px-2 py-1 rounded-md border border-border">Q{currentQIndex + 1} / {quiz.questions.length}</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar">
                            <h3 className="text-lg md:text-xl text-foreground mb-6 text-center leading-relaxed font-serif">
                                {quiz.questions[currentQIndex].question}
                            </h3>

                            <div className="space-y-3 pb-2">
                                {quiz.questions[currentQIndex].options.map((option, idx) => {
                                    const isSelected = selectedOption === option;
                                    const isCorrect = option === quiz.questions[currentQIndex].correct_answer;

                                    let buttonClass = "bg-surface border-border hover:border-primary/50 hover:bg-surface-hover";
                                    if (selectedOption) {
                                        if (isSelected && isCorrect) buttonClass = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300";
                                        else if (isSelected && !isCorrect) buttonClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-300";
                                        else if (isCorrect) buttonClass = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300 opacity-70";
                                        else buttonClass = "opacity-40 border-border";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(option)}
                                            disabled={!!selectedOption}
                                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 font-light flex items-center justify-between text-sm md:text-base ${buttonClass}`}
                                        >
                                            <span className="flex-1">{option}</span>
                                            {selectedOption && isCorrect && option === quiz.questions[currentQIndex].correct_answer && <Check className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />}
                                            {selectedOption && isSelected && !isCorrect && <X className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
