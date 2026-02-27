"use client";

import { useEffect, useRef, useState } from "react";
import { AppSettings, MediaItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import clsx from "clsx";

interface CardProps {
    item: MediaItem;
    onClick?: () => void;
}

function SkeletonOverlay() {
    return (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-neutral-700 border-t-white animate-spin" />
                <span className="font-mono text-xs text-neutral-600 animate-pulse">LOADING</span>
            </div>
        </div>
    );
}

function ErrorOverlay() {
    return (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <span className="font-mono text-xs text-red-500">[FAILED]</span>
        </div>
    );
}

interface TitleOverlayProps {
    showTitles: AppSettings['showTitles'];
    title: string;
}

function TitleOverlay({ showTitles, title }: TitleOverlayProps) {
    if (showTitles === 'never') return null;

    return (
        <div
            className={clsx(
                "absolute bottom-0 left-0 right-0 p-2 bg-black/80",
                showTitles === 'hover' && "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
        >
            <p className="text-xs font-mono truncate">{title}</p>
        </div>
    );
}

export function Card(props: CardProps) {
    return <CardContent key={props.item.url} {...props} />;
}

function CardContent({ item, onClick }: CardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { settings, favorites, addFavorite, removeFavorite, markViewed } = useStore();
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

    const handleClick = () => {
        markViewed(item.id);
        onClick?.();
    };

    useEffect(() => {
        if (item.type !== "video" || !settings.autoplay) return;

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
    }, [item.type, settings.autoplay]);

    if (item.type === "image") {
        return (
            <div className="relative w-full bg-neutral-900 group cursor-pointer min-h-[200px]" onClick={handleClick}>
                {!isLoaded && !hasError && <SkeletonOverlay />}
                {hasError && <ErrorOverlay />}
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
                <TitleOverlay showTitles={settings.showTitles} title={item.title} />
            </div>
        );
    }

    return (
        <div className="relative w-full bg-neutral-900 group cursor-pointer min-h-[200px]" onClick={handleClick}>
            {!isLoaded && !hasError && <SkeletonOverlay />}
            {hasError && <ErrorOverlay />}
            <video
                ref={videoRef}
                src={item.url}
                className={clsx(
                    "w-full h-auto object-cover block transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                loop={settings.loopVideos}
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
            <TitleOverlay showTitles={settings.showTitles} title={item.title} />
        </div>
    );
}
