"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { MediaItem } from "@/lib/types";
import { Card } from "./Card";

interface MasonryGridProps {
    items: MediaItem[];
}

export function MasonryGrid({ items }: MasonryGridProps) {
    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4, 1600: 5 }}
        >
            <Masonry gutter="0px">
                {items.map((item) => (
                    <Card key={item.id} item={item} />
                ))}
            </Masonry>
        </ResponsiveMasonry>
    );
}
