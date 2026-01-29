"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Volume1, SkipForward, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                    // Autoplay restriction or interruption
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
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-3 md:px-6 py-2">
            <audio
                ref={audioRef}
                src={currentTrack.src}
                loop
                onEnded={nextTrack}
                onError={() => setError(true)}
            />

            {/* Track Info & Vinyl */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                    style={{ animationPlayState: isPlaying ? "running" : "paused" }}
                    className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-black border border-border shadow-xl flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(#222_0px,#222_1px,#111_2px,#111_3px)] opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full shadow-inner border border-white/20 z-10 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black/60 rounded-full" />
                    </div>
                </motion.div>

                <div className="flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.h3
                            key={currentTrack.name}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm md:text-base font-medium text-foreground truncate leading-tight"
                        >
                            {currentTrack.name}
                        </motion.h3>
                    </AnimatePresence>
                    <div className="flex items-center gap-1.5 h-3 md:h-4">
                        <span className="text-[9px] md:text-[10px] text-primary/80 font-bold tracking-wider uppercase">Focus Audio</span>
                        {isPlaying && (
                            <div className="flex items-end gap-0.5 h-2.5">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ["20%", "100%", "20%"] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.8,
                                            ease: "easeInOut",
                                            delay: i * 0.1
                                        }}
                                        className="w-0.5 bg-primary rounded-full"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 md:gap-6">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlay}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                >
                    {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />}
                </motion.button>

                <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextTrack}
                    className="p-2 text-muted hover:text-foreground transition-colors"
                >
                    <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
            </div>

            {/* Volume (Desktop) */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
                <div className="group flex items-center gap-3 bg-surface/50 hover:bg-surface border border-transparent hover:border-border rounded-full py-2 px-4 transition-all w-48">
                    <Volume2 className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary cursor-pointer hover:h-2 transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
