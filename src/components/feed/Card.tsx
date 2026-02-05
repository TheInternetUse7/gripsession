"use client";

import { useEffect, useRef, useState } from "react";
import { MediaItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import clsx from "clsx";

interface CardProps {
    item: MediaItem;
    onClick?: () => void;
}

export function Card({ item, onClick }: CardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { settings, favorites, addFavorite, removeFavorite } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);

    const isSaved = favorites.some(f => f.id === item.id);

    const toggleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSaved) {
            removeFavorite(item.id);
        } else {
            addFavorite(item);
        }
    };


    useEffect(() => {
        if (item.type !== "video") return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => {
                            // Autoplay might fail if not muted or user interaction required
                        });
                        setIsPlaying(true);
                    } else {
                        videoRef.current?.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [item.type]);

    if (item.type === "image") {
        return (
            <div className="relative w-full bg-neutral-900 group cursor-pointer" onClick={onClick}>
                <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto object-cover block"
                    loading="lazy"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={toggleSave}
                        className={clsx(
                            "font-mono text-xs px-2 py-1 border",
                            isSaved
                                ? "bg-white text-black border-white"
                                : "bg-black text-white border-white hover:bg-white hover:text-black"
                        )}
                    >
                        {isSaved ? "[SAVED]" : "[SAVE]"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full bg-neutral-900 group cursor-pointer" onClick={onClick}>
            <video
                ref={videoRef}
                src={item.url}
                className="w-full h-auto object-cover block"
                loop
                muted={settings.muted}
                playsInline
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={toggleSave}
                    className={clsx(
                        "font-mono text-xs px-2 py-1 border",
                        isSaved
                            ? "bg-white text-black border-white"
                            : "bg-black text-white border-white hover:bg-white hover:text-black"
                    )}
                >
                    {isSaved ? "[SAVED]" : "[SAVE]"}
                </button>
            </div>
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-mono text-xs bg-black px-1">PAUSED</span>
                </div>
            )}
        </div>
    );
}
