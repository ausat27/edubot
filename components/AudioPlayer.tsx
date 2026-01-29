"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Volume1, SkipForward, Music } from "lucide-react";

const TRACKS = [
    { name: "Heavy Rain", src: "/audio/rain.ogg" },
    { name: "Jungle Night", src: "/audio/forest.ogg" },
    { name: "Fan Noise", src: "/audio/fan.ogg" },
    { name: "Coffee Shop", src: "/audio/coffee.ogg" }
];

export default function AudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentTrack = TRACKS[currentTrackIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const playAudio = async () => {
            if (isPlaying && audioRef.current) {
                try {
                    await audioRef.current.play();
                    setError(false);
                } catch (err) {
                    console.error("Playback interrupted:", err);
                    // Don't set error state for AbortError as it's often harmless during rapid switching
                }
            } else if (audioRef.current) {
                audioRef.current.pause();
            }
        };
        playAudio();
    }, [isPlaying, currentTrackIndex]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        setError(false);
    };

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
        setError(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6 py-1.5 md:py-2">
            <audio
                ref={audioRef}
                src={currentTrack.src}
                loop
                onEnded={nextTrack}
                onError={() => setError(true)}
            />

            {/* Premium Vinyl & Info */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {/* Vinyl Record Animation - Sleeker */}
                <div className={`relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-zinc-900 border border-zinc-700 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-1000
                    ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                >
                    {/* Realistic Grooves */}
                    <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(#111_0px,#111_2px,#222_3px,#222_4px)] opacity-60"></div>
                    {/* Spectral Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 rounded-full pointer-events-none"></div>
                    {/* Center Label */}
                    <div className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary shadow-inner border border-white/20 z-10 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black/50 rounded-full"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-0 md:gap-0.5 overflow-hidden">
                    <h3 className="text-sm md:text-base font-medium text-foreground truncate max-w-[120px] md:max-w-[200px] leading-tight">
                        {currentTrack.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] md:text-[10px] text-primary font-bold tracking-wider uppercase">Focus Mode</span>
                        {isPlaying && (
                            <div className="hidden md:flex items-end gap-0.5 h-2.5">
                                <div className="w-0.5 bg-primary/60 animate-[bounce_0.8s_infinite] h-1.5"></div>
                                <div className="w-0.5 bg-primary/60 animate-[bounce_1.1s_infinite] h-full"></div>
                                <div className="w-0.5 bg-primary/60 animate-[bounce_0.9s_infinite] h-1"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-3 md:gap-6">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg ring-2 md:ring-4 ring-background/50"
                >
                    {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />}
                </button>

                <button onClick={nextTrack} className="group p-1.5 md:p-2 rounded-full hover:bg-surface-hover text-muted hover:text-foreground transition-all">
                    <SkipForward className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Volume & Extras - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
                <div className="flex items-center gap-3 w-40 group bg-surface/40 hover:bg-surface/80 backdrop-blur-sm p-2.5 rounded-full border border-white/5 transition-all">
                    <Volume1 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-secondary/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary transition-all cursor-pointer hover:h-2"
                    />
                </div>
            </div>
        </div>
    );
}
