'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Post } from '@/types/content';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/store/session-store';

interface TheaterModalProps {
    post: Post | null;
    allPosts: Post[];
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
}

export function TheaterModal({ post, allPosts, onClose, onNavigate }: TheaterModalProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const isMuted = useSessionStore((state) => state.isMuted);

    useEffect(() => {
        if (!post) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    onNavigate('prev');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    onNavigate('next');
                    break;
                case ' ':
                    e.preventDefault();
                    if (post.type === 'video') {
                        const video = document.querySelector('video');
                        if (video) {
                            if (video.paused) {
                                video.play();
                                setIsPlaying(true);
                            } else {
                                video.pause();
                                setIsPlaying(false);
                            }
                        }
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [post, onClose, onNavigate]);

    if (!post) return null;

    const currentIndex = allPosts.findIndex((p) => p.id === post.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allPosts.length - 1;

    return (
        <Dialog open={!!post} onOpenChange={onClose}>
            <DialogContent className="max-w-screen max-h-screen h-screen w-screen border-0 bg-black p-0">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Navigation Buttons */}
                {hasPrev && (
                    <button
                        onClick={() => onNavigate('prev')}
                        className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={() => onNavigate('next')}
                        className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                )}

                {/* Media Content */}
                <div className="flex h-full w-full items-center justify-center p-4">
                    {post.type === 'video' ? (
                        <video
                            src={post.url}
                            className="max-h-[calc(100vh-120px)] max-w-full object-contain"
                            controls
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                        />
                    ) : (
                        <img
                            src={post.url}
                            alt={post.title}
                            className="max-h-[calc(100vh-120px)] max-w-full object-contain"
                        />
                    )}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <p className="text-center text-sm text-white md:text-base">
                        {post.title}
                    </p>
                    <p className="mt-1 text-center text-xs text-white/60">
                        {currentIndex + 1} / {allPosts.length}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
