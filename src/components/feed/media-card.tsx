'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types/content';
import { cn } from '@/lib/utils';
import { useVideoObserver } from '@/hooks/use-video-observer';
import { useSessionStore } from '@/store/session-store';

interface MediaCardProps {
    post: Post;
    onClick?: () => void;
}

export function MediaCard({ post, onClick }: MediaCardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const isMuted = useSessionStore((state) => state.isMuted);
    const videoRef = useVideoObserver({ isMuted });

    const handleLoadComplete = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <div className="flex h-48 items-center justify-center rounded-xl bg-card/50 border border-border">
                <p className="text-sm text-muted-foreground">Failed to load</p>
            </div>
        );
    }

    return (
        <div
            className="group relative overflow-hidden rounded-xl bg-card/50 border border-border shadow-lg transition-all hover:shadow-xl cursor-pointer"
            onMouseEnter={() => setShowTitle(true)}
            onMouseLeave={() => setShowTitle(false)}
            onClick={onClick}
        >
            {/* Loading Skeleton */}
            {isLoading && (
                <div className="absolute inset-0 z-10 animate-pulse bg-muted" />
            )}

            {/* Media Content */}
            {post.type === 'video' ? (
                <video
                    ref={videoRef}
                    src={post.url}
                    className="h-full w-full object-cover"
                    loop
                    muted={isMuted}
                    playsInline
                    onLoadedData={handleLoadComplete}
                    onError={handleError}
                />
            ) : (
                <Image
                    src={post.url}
                    alt={post.title}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                    onLoad={handleLoadComplete}
                    onError={handleError}
                    unoptimized
                />
            )}

            {/* Title Overlay */}
            <div
                className={cn(
                    'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity',
                    showTitle ? 'opacity-100' : 'opacity-0'
                )}
            >
                <p className="line-clamp-2 text-sm font-medium text-white">
                    {post.title}
                </p>
            </div>
        </div>
    );
}
