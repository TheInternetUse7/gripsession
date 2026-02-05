"use client";

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { SearchOverlay } from './SearchOverlay';

export function Header() {
    const { subs } = useStore();
    const [showSearch, setShowSearch] = useState(false);

    const activeSubs = subs.filter(s => s.enabled);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white bg-black px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link href="/" className="font-serif text-3xl font-bold tracking-tighter text-white uppercase antialiased">
                        Gripsession
                    </Link>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="font-mono text-sm uppercase text-gray-400 hover:text-white"
                        >
                            [SEARCH]
                        </button>
                        <Link href="/settings" className="font-mono text-sm uppercase text-gray-400 hover:text-white">
                            [SETTINGS]
                        </Link>
                        <Link href="/favorites" className="font-mono text-sm uppercase text-gray-400 hover:text-white">
                            [SAVED]
                        </Link>
                        <span className="font-mono text-xs text-neutral-500">
                            {activeSubs.length} SUBS
                        </span>
                    </div>
                </div>
            </header>

            <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
