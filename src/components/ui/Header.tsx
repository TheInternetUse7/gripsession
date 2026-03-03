"use client";

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { SearchOverlay } from './SearchOverlay';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export function Header() {
    const { subs } = useStore();
    const [showSearch, setShowSearch] = useState(false);

    const activeSubs = subs.filter(s => s.enabled);

    return (
        <>
            <header
                className="sticky top-0 z-50 w-full border-b border-border bg-background px-4 py-3"
                style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
            >
                <div className="flex items-center justify-between">
                    <Link href="/" className="font-serif text-3xl font-bold tracking-tighter text-foreground uppercase antialiased">
                        Gripsession
                    </Link>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="font-mono text-sm uppercase text-muted hover:text-foreground"
                        >
                            [SEARCH]
                        </button>
                        <Link href="/settings" className="font-mono text-sm uppercase text-muted hover:text-foreground">
                            [SETTINGS]
                        </Link>
                        <Link href="/favorites" className="font-mono text-sm uppercase text-muted hover:text-foreground">
                            [SAVED]
                        </Link>
                        <span className="font-mono text-xs text-muted">
                            {activeSubs.length} SUBS
                        </span>
                    </div>
                </div>
                <InstallPrompt />
            </header>

            <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
