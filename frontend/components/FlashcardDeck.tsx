"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Loader2 } from "lucide-react";

interface Flashcard {
    front: string;
    back: string;
}

export default function FlashcardDeck() {
    const [topic, setTopic] = useState("");
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const generateCards = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/flashcards/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            const data = await res.json();
            setCards(data);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (error) {
            console.error("Failed to generate flashcards", error);
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 animate-in fade-in duration-300">
            {/* Generator Input */}
            <form onSubmit={generateCards} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Topic (e.g., 'Photosynthesis')"
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

            {/* Deck Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {cards.length > 0 ? (
                    <div className="w-full h-full flex flex-col items-center">
                        <div className="relative w-full aspect-[4/3] max-h-64 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                            <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden bg-white border border-border rounded-2xl flex items-center justify-center p-8 text-center shadow-sm">
                                    <div>
                                        <p className="text-xs text-muted uppercase tracking-widest mb-4">Question</p>
                                        <h3 className="text-xl text-foreground leading-relaxed">{cards[currentIndex].front}</h3>
                                    </div>
                                </div>
                                {/* Back */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/10 border border-border rounded-2xl flex items-center justify-center p-8 text-center shadow-sm">
                                    <div>
                                        <p className="text-xs text-muted uppercase tracking-widest mb-4">Answer</p>
                                        <h3 className="text-xl text-foreground leading-relaxed">{cards[currentIndex].back}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mt-6">
                            <button onClick={prevCard} disabled={currentIndex === 0} className="p-2 text-muted hover:text-foreground disabled:opacity-20 transition-all">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-sm text-muted">
                                {currentIndex + 1} / {cards.length}
                            </span>
                            <button onClick={nextCard} disabled={currentIndex === cards.length - 1} className="p-2 text-muted hover:text-foreground disabled:opacity-20 transition-all">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted italic opacity-60">
                        Create a deck to start learning.
                    </div>
                )}
            </div>
        </div>
    );
}
