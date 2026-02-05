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
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

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
                        videoRef.current?.play().catch(() => { });
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

    // Reset loading state when item changes
    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);
    }, [item.url]);

    const Skeleton = () => (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-neutral-700 border-t-white animate-spin" />
                <span className="font-mono text-xs text-neutral-600 animate-pulse">LOADING</span>
            </div>
        </div>
    );

    const ErrorState = () => (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <span className="font-mono text-xs text-red-500">[FAILED]</span>
        </div>
    );

    if (item.type === "image") {
        return (
            <div className="relative w-full bg-neutral-900 group cursor-pointer min-h-[200px]" onClick={onClick}>
                {!isLoaded && !hasError && <Skeleton />}
                {hasError && <ErrorState />}
                <img
                    src={item.url}
                    alt={item.title}
                    className={clsx(
                        "w-full h-auto object-cover block transition-opacity duration-300",
                        isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
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
        <div className="relative w-full bg-neutral-900 group cursor-pointer min-h-[200px]" onClick={onClick}>
            {!isLoaded && !hasError && <Skeleton />}
            {hasError && <ErrorState />}
            <video
                ref={videoRef}
                src={item.url}
                className={clsx(
                    "w-full h-auto object-cover block transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                loop
                muted={settings.muted}
                playsInline
                onLoadedData={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
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
            {isLoaded && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-mono text-xs bg-black px-1">PAUSED</span>
                </div>
            )}
        </div>
    );
}
