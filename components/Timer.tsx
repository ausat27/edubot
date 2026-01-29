"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Timer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft]);

    const [initialTime, setInitialTime] = useState(25 * 60);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setTimeLeft(initialTime); };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col bg-surface border border-border rounded-2xl p-4 md:p-2 shadow-sm overflow-hidden min-h-[300px] md:min-h-0 relative">

            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-start z-10 mb-2 md:mb-0.5">
                <h3 className="text-lg font-medium text-foreground">Focus Timer</h3>
            </div>

            {/* Main Content: Flex Column on Mobile, Row on Desktop */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full min-h-0 gap-2 md:gap-4 overflow-hidden">

                {/* Left: Timer & Main Controls - Scales with container */}
                <div className="flex-1 w-full md:w-auto h-full flex flex-col items-center justify-center gap-2">
                    {/* Fluid SVG Timer - Scales based on available height/width */}
                    <div className="relative w-full h-[60%] md:h-[70%] max-h-[220px] aspect-square flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 208 208">
                            <circle
                                cx="104"
                                cy="104"
                                r="96"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-border"
                            />
                            <circle
                                cx="104"
                                cy="104"
                                r="96"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray="603"
                                strokeDashoffset={initialTime > 0 ? 603 - (603 * (timeLeft / initialTime)) : 603}
                                strokeLinecap="round"
                                className="text-primary transition-all duration-1000 ease-linear"
                            />
                            {/* SVG Text - No changes needed as it scales with SVG viewBox */}
                            <text
                                x="104"
                                y="112"
                                textAnchor="middle"
                                className="fill-current text-foreground font-serif font-light tracking-wider"
                                style={{ fontSize: formatTime(timeLeft).length > 5 ? "40px" : "48px" }}
                                transform="rotate(90 104 104)"
                            >
                                {formatTime(timeLeft)}
                            </text>
                        </svg>
                    </div>

                    {/* Play Controls - Fixed size for touch targets, but compact layout */}
                    <div className="flex items-center gap-3 md:gap-4 h-[15%] min-h-[40px]">
                        <button
                            onClick={toggleTimer}
                            className="aspect-square h-full max-h-[50px] rounded-full border border-border flex items-center justify-center hover:bg-surface-hover text-foreground transition-all active:scale-95 shadow-sm bg-background/50"
                        >
                            {isActive ? <Pause className="w-[40%] h-[40%] fill-current" /> : <Play className="w-[40%] h-[40%] fill-current pl-[5%]" />}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="aspect-square h-full max-h-[50px] rounded-full border border-border flex items-center justify-center hover:bg-surface-hover text-muted hover:text-foreground transition-all shadow-sm bg-background/50"
                        >
                            <RotateCcw className="w-[40%] h-[40%]" />
                        </button>
                    </div>
                </div>

                {/* Right: Settings Panel - Collapsible/Compact */}
                <div className="flex-shrink-0 w-full md:w-auto md:h-full md:border-l md:border-t-0 border-t border-border/50 pt-2 md:pt-0 md:pl-4 flex flex-row md:flex-col items-center md:justify-center gap-2 overflow-hidden">
                    <span className="hidden md:inline text-[10px] text-muted uppercase tracking-widest opacity-50 mb-1">Presets</span>

                    {/* Presets List */}
                    <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible w-full md:w-auto pb-1 md:pb-0 justify-start md:justify-center">
                        {[15, 25, 45, 60].map((min) => (
                            <button
                                key={min}
                                onClick={() => { setInitialTime(min * 60); setTimeLeft(min * 60); setIsActive(false); }}
                                className={`text-xs px-3 py-1.5 rounded-md border text-center transition-all whitespace-nowrap min-w-[3.5rem] ${initialTime === min * 60
                                    ? "bg-secondary/30 border-secondary text-foreground font-medium"
                                    : "border-transparent bg-background/50 hover:bg-surface-hover text-muted hover:text-foreground hover:border-border/50"
                                    }`}
                            >
                                {min}m
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:block w-full h-[1px] bg-border/50 my-1"></div>

                    {/* Custom Input */}
                    <div className="flex items-center gap-1 border border-border/50 hover:border-border rounded-md px-2 py-1 transition-all bg-background/50">
                        <input
                            type="number"
                            placeholder="00"
                            className="w-4 bg-transparent outline-none text-center font-sans text-foreground placeholder:text-muted/50 text-[10px]"
                            onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (val > 240) val = 240; if (val < 0) val = 0;
                                setInitialTime((val * 60) + (initialTime % 60));
                                setTimeLeft((val * 60) + (initialTime % 60));
                                setIsActive(false);
                            }}
                        />
                        <span className="text-muted text-[10px]">:</span>
                        <input
                            type="number"
                            placeholder="00"
                            className="w-4 bg-transparent outline-none text-center font-sans text-foreground placeholder:text-muted/50 text-[10px]"
                            onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (val > 59) val = 59; if (val < 0) val = 0;
                                setInitialTime((Math.floor(initialTime / 60) * 60) + val);
                                setTimeLeft((Math.floor(initialTime / 60) * 60) + val);
                                setIsActive(false);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
