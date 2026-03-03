"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MediaItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import clsx from "clsx";

interface ModalProps {
    item: MediaItem | null;
    onClose: () => void;
}

export function Modal({ item, onClose }: ModalProps) {
    if (!item) return null;
    return <ModalContent key={item.id} item={item} onClose={onClose} />;
}

interface ModalContentProps {
    item: MediaItem;
    onClose: () => void;
}

function ModalContent({ item, onClose }: ModalContentProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const preloadedImagesRef = useRef<Set<string>>(new Set());
    const { favorites, addFavorite, removeFavorite, settings } = useStore();
    const [galleryIndex, setGalleryIndex] = useState(0);

    const isSaved = favorites.some(f => f.id === item.id);
    const galleryItems = useMemo(
        () =>
            item.type === 'gallery' && item.galleryItems?.length
                ? item.galleryItems
                : [{ url: item.url, type: item.type === 'video' ? 'video' as const : 'image' as const }],
        [item]
    );
    const activeMedia = galleryItems[galleryIndex] ?? null;
    const hasGalleryNav = item.type === 'gallery' && galleryItems.length > 1;

    const toggleSave = () => {
        if (isSaved) {
            removeFavorite(item.id);
        } else {
            addFavorite(item);
        }
    };

    const openSource = () => {
        window.open(item.sourceUrl, '_blank');
    };

    const goPrev = () => {
        if (!hasGalleryNav) return;
        setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    };

    const goNext = () => {
        if (!hasGalleryNav) return;
        setGalleryIndex((prev) => (prev + 1) % galleryItems.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (!hasGalleryNav) return;

            if (e.key === 'ArrowLeft') {
                setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
                return;
            }
            if (e.key === 'ArrowRight') {
                setGalleryIndex((prev) => (prev + 1) % galleryItems.length);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose, hasGalleryNav, galleryItems.length]);

    useEffect(() => {
        if (activeMedia?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, [activeMedia?.type, activeMedia?.url]);

    useEffect(() => {
        if (item.type !== 'gallery') return;

        const preloadCount = Math.max(0, Math.floor(settings.galleryPreloadCount));
        if (preloadCount === 0 || galleryItems.length <= 1) return;

        const maxLookahead = Math.min(preloadCount, galleryItems.length - 1);
        for (let offset = 1; offset <= maxLookahead; offset++) {
            const index = (galleryIndex + offset) % galleryItems.length;
            const media = galleryItems[index];
            if (!media || media.type !== 'image') continue;
            if (preloadedImagesRef.current.has(media.url)) continue;

            const image = new Image();
            image.src = media.url;
            preloadedImagesRef.current.add(media.url);
        }
    }, [item.type, galleryItems, galleryIndex, settings.galleryPreloadCount]);

    if (!activeMedia) return null;

    return (
        <div
            className="fixed inset-0 z-[200] bg-background/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Controls - Top Right */}
            <div
                className="absolute top-3 left-3 right-3 flex flex-wrap justify-end gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={toggleSave}
                    className={clsx(
                        "font-mono text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 border",
                        isSaved
                            ? "bg-foreground text-background border-border"
                            : "bg-background text-foreground border-border hover:bg-foreground hover:text-background"
                    )}
                >
                    {isSaved ? "[SAVED]" : "[SAVE]"}
                </button>
                <button
                    onClick={openSource}
                    className="font-mono text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 border border-border bg-background text-foreground hover:bg-foreground hover:text-background"
                >
                    [SOURCE]
                </button>
                <button
                    onClick={onClose}
                    className="font-mono text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 border border-border bg-background text-foreground hover:bg-foreground hover:text-background"
                >
                    [ESC]
                </button>
            </div>

            {/* Media Content */}
            <div
                className="max-w-[94vw] sm:max-w-[90vw] max-h-[82vh] sm:max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {activeMedia.type === 'video' ? (
                    <video
                        ref={videoRef}
                        key={activeMedia.url}
                        src={activeMedia.url}
                        className="max-w-full max-h-[82vh] sm:max-h-[90vh] object-contain"
                        controls
                        autoPlay
                        loop
                        muted={settings.muted}
                        playsInline
                    />
                ) : (
                    <img
                        key={activeMedia.url}
                        src={activeMedia.url}
                        alt={item.title}
                        className="max-w-full max-h-[82vh] sm:max-h-[90vh] object-contain"
                    />
                )}
            </div>

            {hasGalleryNav && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goPrev();
                        }}
                        className="absolute left-3 bottom-14 sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2 font-mono text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 border border-border bg-background/90 text-foreground hover:bg-foreground hover:text-background"
                    >
                        [PREV]
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goNext();
                        }}
                        className="absolute right-3 bottom-14 sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 font-mono text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 border border-border bg-background/90 text-foreground hover:bg-foreground hover:text-background"
                    >
                        [NEXT]
                    </button>
                </>
            )}

            {/* Title - Bottom */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 text-center">
                <p className="font-mono text-[11px] sm:text-xs text-neutral-500 break-words">
                    {item.title}
                    {hasGalleryNav && `  [${galleryIndex + 1}/${galleryItems.length}]`}
                </p>
            </div>
        </div>
    );
}
