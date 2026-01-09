'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export function SessionTimer() {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        // Get or create start time
        const startTimeKey = 'sessionStartTime';
        let startTime = sessionStorage.getItem(startTimeKey);

        if (!startTime) {
            startTime = Date.now().toString();
            sessionStorage.setItem(startTimeKey, startTime);
        }

        // Update elapsed time every second
        const interval = setInterval(() => {
            const elapsed = Date.now() - parseInt(startTime!, 10);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono tabular-nums">{formatTime(elapsedTime)}</span>
        </div>
    );
}
