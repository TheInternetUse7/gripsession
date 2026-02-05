"use client";

import { useEffect, useRef } from "react";
import { MediaItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import clsx from "clsx";

interface ModalProps {
    item: MediaItem | null;
    onClose: () => void;
}

export function Modal({ item, onClose }: ModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { favorites, addFavorite, removeFavorite, settings } = useStore();

    const isSaved = item ? favorites.some(f => f.id === item.id) : false;

    const toggleSave = () => {
        if (!item) return;
        if (isSaved) {
            removeFavorite(item.id);
        } else {
            addFavorite(item);
        }
    };

    const openSource = () => {
        if (item) {
            window.open(item.sourceUrl, '_blank');
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (item) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [item, onClose]);

    useEffect(() => {
        if (item?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, [item]);

    if (!item) return null;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
            onClick={onClose}
        >
            {/* Controls - Top Right */}
            <div
                className="absolute top-4 right-4 flex gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={toggleSave}
                    className={clsx(
                        "font-mono text-xs px-3 py-2 border",
                        isSaved
                            ? "bg-white text-black border-white"
                            : "bg-black text-white border-white hover:bg-white hover:text-black"
                    )}
                >
                    {isSaved ? "[SAVED]" : "[SAVE]"}
                </button>
                <button
                    onClick={openSource}
                    className="font-mono text-xs px-3 py-2 border border-white bg-black text-white hover:bg-white hover:text-black"
                >
                    [SOURCE]
                </button>
                <button
                    onClick={onClose}
                    className="font-mono text-xs px-3 py-2 border border-white bg-black text-white hover:bg-white hover:text-black"
                >
                    [ESC]
                </button>
            </div>

            {/* Media Content */}
            <div
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {item.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={item.url}
                        className="max-w-full max-h-[90vh] object-contain"
                        controls
                        autoPlay
                        loop
                        muted={settings.muted}
                        playsInline
                    />
                ) : (
                    <img
                        src={item.url}
                        alt={item.title}
                        className="max-w-full max-h-[90vh] object-contain"
                    />
                )}
            </div>

            {/* Title - Bottom */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="font-mono text-xs text-neutral-500 truncate">
                    {item.title}
                </p>
            </div>
        </div>
    );
}
