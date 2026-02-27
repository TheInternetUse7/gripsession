"use client";

import { useState, useEffect } from "react";
import { Input } from "./Input";
import useSWR from "swr";
import { fetchFeed } from "@/lib/parsers/reddit";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { useStore } from "@/lib/store";
import { MediaItem } from "@/lib/types";
import { Modal } from "./Modal";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const { settings } = useStore();
    const [query, setQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

    const { data, isLoading, error } = useSWR(
        activeSearch ? ['search', activeSearch] : null,
        ([, q]) => fetchFeed([q], null, settings),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5000,
            errorRetryCount: 2,
            errorRetryInterval: 3000,
        }
    );

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const cleanQuery = query.trim().toLowerCase().replace(/^r\//, '');
        if (e.key === 'Enter' && cleanQuery) {
            setActiveSearch(cleanQuery);
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedItem) return;
                onClose();
                setQuery("");
                setActiveSearch(null);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, selectedItem]);

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

                {error && (
                    <div className="flex items-center justify-center h-full font-mono text-sm text-red-500">
                        FAILED TO SEARCH - TRY AGAIN
                    </div>
                )}

                {data && <MasonryGrid items={data.items} onItemClick={setSelectedItem} />}
            </div>

            <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </div>
    );
}
