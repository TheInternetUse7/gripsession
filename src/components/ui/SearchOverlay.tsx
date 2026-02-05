"use client";

import { useState, useEffect } from "react";
import { Input } from "./Input";
import useSWR from "swr";
import { fetchFeed } from "@/lib/parsers/reddit";
import { MasonryGrid } from "@/components/feed/MasonryGrid";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState<string | null>(null);

    const { data, isLoading } = useSWR(
        activeSearch ? ['search', activeSearch] : null,
        ([, q]) => fetchFeed([q], null),
        { revalidateOnFocus: false }
    );

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            setActiveSearch(query.trim());
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                setQuery("");
                setActiveSearch(null);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black">
            <div className="sticky top-0 z-50 border-b border-white bg-black p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-serif text-2xl uppercase">Search</h2>
                    <button
                        onClick={onClose}
                        className="font-mono text-xs border border-white px-2 py-1 hover:bg-white hover:text-black"
                    >
                        [ESC]
                    </button>
                </div>
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder="ENTER SUBREDDIT..."
                    className="w-full"
                    autoFocus
                />
            </div>

            <div className="p-4 overflow-auto h-[calc(100vh-120px)]">
                {isLoading && (
                    <div className="flex items-center justify-center h-full font-mono text-sm text-neutral-500 animate-pulse">
                        SEARCHING...
                    </div>
                )}

                {!activeSearch && !isLoading && (
                    <div className="flex items-center justify-center h-full font-mono text-sm text-neutral-500">
                        TYPE A SUBREDDIT AND HIT ENTER
                    </div>
                )}

                {data && <MasonryGrid items={data.items} />}
            </div>
        </div>
    );
}
