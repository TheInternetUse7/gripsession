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
  const { subs, settings, viewedItems } = useStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Get active subs
  const activeSubs = subs.filter(s => s.enabled && s.source === 'reddit').map(s => s.name);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (activeSubs.length === 0) return null;
    if (pageIndex > 0 && !previousPageData?.after) return null;
    if (pageIndex === 0) return ['feed', activeSubs, null, settings];
    return ['feed', activeSubs, previousPageData.after, settings];
  }

  const { data, size, setSize, isLoading, error } = useSWRInfinite(
    getKey,
    ([, subs, after]) => fetchFeed(subs, after, settings),
    {
      revalidateOnFocus: false,
      persistSize: true,
    }
  );

  // Apply hideViewed filter
  const items = data
    ? data.flatMap(d => d.items)
      .filter(item => !settings.hideViewed || !viewedItems.has(item.id))
    : [];

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
        {activeSubs.length === 0 ? (
          <div className="flex h-[50vh] items-center justify-center font-mono text-sm text-neutral-500">
            NO ACTIVE SUBS - GO TO SETTINGS
          </div>
        ) : (
          <>
            <MasonryGrid items={items} onItemClick={setSelectedItem} />

            <div ref={observerRef} className="h-20 w-full flex items-center justify-center py-8">
              {isLoadingMore && (
                <div className="font-mono text-xs text-neutral-500 animate-pulse">
                  LOADING MORE...
                </div>
              )}
              {error && <div className="text-red-500 font-mono text-xs">FAILED TO LOAD</div>}
            </div>
          </>
        )}
      </div>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
