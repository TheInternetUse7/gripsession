'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseVideoObserverOptions {
    threshold?: number;
    isMuted?: boolean;
}

export function useVideoObserver(options: UseVideoObserverOptions = {}) {
    const { threshold = 0.5, isMuted = true } = options;
    const videoRef = useRef<HTMLVideoElement>(null);
    const { ref: inViewRef, inView } = useInView({
        threshold,
    });

    // Merge refs
    const setRefs = (element: HTMLVideoElement | null) => {
        videoRef.current = element;
        inViewRef(element);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (inView) {
            // Play video when in view
            video.muted = isMuted;
            video.play().catch(() => {
                // Autoplay failed, might need user interaction
            });
        } else {
            // Pause when out of view
            video.pause();
        }
    }, [inView, isMuted]);

    return setRefs;
}
