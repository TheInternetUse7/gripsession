"use client";

import Link from 'next/link';
import { Input } from './Input';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { SearchOverlay } from './SearchOverlay';

// We can use the global font var or import here if we want specific overrides.
// Using global font-serif class as per layout.

export function Header() {
    const { kinks, addKink, removeKink } = useStore();
    const [value, setValue] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showKinks, setShowKinks] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && value.trim()) {
            addKink(value.trim());
            setValue('');
        }
    };


    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white bg-black px-4 py-3">
                <div className="flex items-center justify-between mb-2">
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
                        <Input
                            placeholder="ADD KINK..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-32 focus:w-48 text-xs uppercase"
                        />
                        <Link href="/favorites" className="font-mono text-sm uppercase text-gray-400 hover:text-white">
                            [SAVED]
                        </Link>
                    </div>
                </div>

                {/* Active Kinks Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowKinks(!showKinks)}
                        className="font-mono text-xs text-neutral-500 hover:text-white"
                    >
                        {showKinks ? '[-]' : '[+]'} KINKS ({kinks.length})
                    </button>
                    {showKinks && kinks.map((kink) => (
                        <div key={kink} className="flex items-center gap-1 border border-neutral-700 px-2 py-1">
                            <span className="font-mono text-xs text-neutral-400">r/{kink}</span>
                            <button
                                onClick={() => removeKink(kink)}
                                className="font-mono text-xs text-neutral-500 hover:text-white ml-1"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </header>

            <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
