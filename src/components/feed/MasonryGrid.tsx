"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useSyncExternalStore } from "react";
import { MediaItem } from "@/lib/types";
import { Card } from "./Card";
import { useStore } from "@/lib/store";

interface MasonryGridProps {
    items: MediaItem[];
    onItemClick?: (item: MediaItem) => void;
}

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function MasonryGrid({ items, onItemClick }: MasonryGridProps) {
    const { settings } = useStore();
    const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

    // Calculate gutter based on card size
    const gutterMap = {
        small: '2px',
        medium: '4px',
        large: '8px',
    };

    const cards = items.map((item) => (
        <Card key={item.id} item={item} onClick={() => onItemClick?.(item)} />
    ));

    // Keep SSR + initial hydration HTML deterministic.
    if (!mounted) {
        return (
            <Masonry columnsCount={settings.columns} gutter={gutterMap[settings.cardSize]}>
                {cards}
            </Masonry>
        );
    }

    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{
                350: Math.min(2, settings.columns),
                750: Math.min(3, settings.columns),
                900: Math.min(4, settings.columns),
                1200: settings.columns
            }}
        >
            <Masonry gutter={gutterMap[settings.cardSize]}>
                {cards}
            </Masonry>
        </ResponsiveMasonry>
    );
}

