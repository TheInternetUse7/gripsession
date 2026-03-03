"use client";

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { SearchOverlay } from './SearchOverlay';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export function Header() {
    const { subs } = useStore();
    const [showSearch, setShowSearch] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const activeSubs = subs.filter(s => s.enabled);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            <header
                className="sticky top-0 z-50 w-full border-b border-border bg-background px-3 py-2 sm:px-4 sm:py-3"
                style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
            >
                <div className="flex min-h-10 items-center justify-between gap-3">
                    <Link
                        href="/"
                        onClick={closeMenu}
                        className="font-serif text-2xl sm:text-3xl font-bold tracking-tighter text-foreground uppercase antialiased leading-none"
                    >
                        Gripsession
                    </Link>

                    <div className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-2">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="inline-flex h-8 items-center font-mono text-[11px] sm:text-sm uppercase text-muted hover:text-foreground whitespace-nowrap"
                        >
                            [SEARCH]
                        </button>
                        <Link href="/settings" className="inline-flex h-8 items-center font-mono text-[11px] sm:text-sm uppercase text-muted hover:text-foreground whitespace-nowrap">
                            [SETTINGS]
                        </Link>
                        <Link href="/favorites" className="inline-flex h-8 items-center font-mono text-[11px] sm:text-sm uppercase text-muted hover:text-foreground whitespace-nowrap">
                            [SAVED]
                        </Link>
                        <span className="inline-flex h-8 items-center font-mono text-[10px] sm:text-xs text-muted whitespace-nowrap">
                            {activeSubs.length} SUBS
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((value) => !value)}
                        className="sm:hidden inline-flex h-8 items-center font-mono text-[11px] uppercase border border-border px-2 text-muted hover:text-foreground"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? '[CLOSE]' : '[MENU]'}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="mt-2 border-t border-border pt-2 sm:hidden">
                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                onClick={() => {
                                    setShowSearch(true);
                                    closeMenu();
                                }}
                                className="w-full text-left font-mono text-xs uppercase text-muted hover:text-foreground"
                            >
                                [SEARCH]
                            </button>
                            <Link
                                href="/settings"
                                onClick={closeMenu}
                                className="w-full text-left font-mono text-xs uppercase text-muted hover:text-foreground"
                            >
                                [SETTINGS]
                            </Link>
                            <Link
                                href="/favorites"
                                onClick={closeMenu}
                                className="w-full text-left font-mono text-xs uppercase text-muted hover:text-foreground"
                            >
                                [SAVED]
                            </Link>
                            <span className="font-mono text-[10px] text-muted">
                                {activeSubs.length} SUBS
                            </span>
                        </div>
                        <InstallPrompt />
                    </div>
                )}

                <div className="hidden sm:block">
                    <InstallPrompt />
                </div>
            </header>

            <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
