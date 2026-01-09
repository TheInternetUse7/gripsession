'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, ChevronUp } from 'lucide-react';
import { useSessionStore } from '@/store/session-store';
import { cn } from '@/lib/utils';

export function AutoScroller() {
    const { autoScrollSpeed, setScrollSpeed } = useSessionStore();
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        if (!isScrolling || autoScrollSpeed === 0) return;

        let animationFrameId: number;
        let lastTimestamp: number;

        const scroll = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp;

            const delta = timestamp - lastTimestamp;
            const scrollAmount = (autoScrollSpeed / 1000) * delta; // pixels per ms

            window.scrollBy({ top: scrollAmount, behavior: 'instant' as ScrollBehavior });

            lastTimestamp = timestamp;
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isScrolling, autoScrollSpeed]);

    const toggleScroll = () => {
        if (isScrolling) {
            setIsScrolling(false);
            setScrollSpeed(0);
        } else {
            setIsScrolling(true);
            setScrollSpeed(50); // Default speed: 50px per second
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Auto-Scroll FAB */}
            <button
                onClick={toggleScroll}
                className={cn(
                    'fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all md:bottom-4',
                    isScrolling
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'glass-panel text-foreground hover:bg-accent'
                )}
                title={isScrolling ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
            >
                {isScrolling ? (
                    <Pause className="h-6 w-6" />
                ) : (
                    <Play className="h-6 w-6" />
                )}
            </button>

            {/* Scroll to Top FAB */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-40 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full glass-panel text-foreground shadow-lg transition-all hover:bg-accent md:bottom-20"
                title="Scroll to Top"
            >
                <ChevronUp className="h-5 w-5" />
            </button>
        </>
    );
}
