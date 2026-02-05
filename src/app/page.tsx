"use client";

import useSWRInfinite from 'swr/infinite';
import { useRef, useEffect, useState } from 'react';
import { Header } from "@/components/ui/Header";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import { fetchFeed } from "@/lib/parsers/reddit";
import { MediaItem } from "@/lib/types";

export default function Home() {
  const { kinks } = useStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (pageIndex > 0 && !previousPageData?.after) return null;
    if (pageIndex === 0) return ['feed', kinks, null];
    return ['feed', kinks, previousPageData.after];
  }

  const { data, size, setSize, isLoading, error } = useSWRInfinite(
    getKey,
    ([, k, after]) => fetchFeed(k, after),
    {
      revalidateOnFocus: false,
      persistSize: true,
    }
  );

  const items = data ? data.flatMap(d => d.items) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, setSize, size]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <div className="p-1">
        <MasonryGrid items={items} onItemClick={setSelectedItem} />

        <div ref={observerRef} className="h-20 w-full flex items-center justify-center py-8">
          {isLoadingMore && (
            <div className="font-mono text-xs text-neutral-500 animate-pulse">
              LOADING MORE...
            </div>
          )}
          {error && <div className="text-red-500 font-mono text-xs">FAILED TO LOAD</div>}
        </div>
      </div>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
