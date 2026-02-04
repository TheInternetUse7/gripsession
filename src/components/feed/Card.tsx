"use client";

import { useEffect, useRef, useState } from "react";
import { MediaItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import clsx from "clsx";

interface CardProps {
    item: MediaItem;
}

export function Card({ item }: CardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { settings } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);

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
            <div className="relative w-full bg-neutral-900 group">
                <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto object-cover block"
                    loading="lazy"
                />
                {/* Overlay info typically hidden in brutalist, maybe show on hover? */}
            </div>
        );
    }

    return (
        <div className="relative w-full bg-neutral-900 group">
            <video
                ref={videoRef}
                src={item.url}
                className="w-full h-auto object-cover block"
                loop
                muted={settings.muted}
                playsInline
            />
            {/* Optional: Status indicator */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-mono text-xs bg-black px-1">PAUSED</span>
                </div>
            )}
        </div>
    );
}
