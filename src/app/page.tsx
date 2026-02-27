"use client";

import useSWRInfinite from 'swr/infinite';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Header } from "@/components/ui/Header";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import { fetchFeed, RedditResponse } from "@/lib/parsers/reddit";
import { MediaItem } from "@/lib/types";

export default function Home() {
  const { subs, settings, viewedItems } = useStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Create stable references for subs and settings
  const activeSubs = useMemo(
    () => subs.filter(s => s.enabled && s.source === 'reddit').map(s => s.name),
    [subs]
  );

  const subsKey = useMemo(() => activeSubs.join('+'), [activeSubs]);

  // Use refs to avoid closure issues in fetcher
  const settingsRef = useRef(settings);
  const activeSubsRef = useRef(activeSubs);
  useEffect(() => {
    settingsRef.current = settings;
    activeSubsRef.current = activeSubs;
  }, [settings, activeSubs]);

  // Stable cache key that only changes when feed-affecting settings change
  const cacheKey = useMemo(
    () =>
      `${subsKey}:${settings.sortBy}:${settings.topTimeframe || 'day'}:${settings.postsPerLoad}:${settings.allowImages}:${settings.allowVideos}:${settings.allowGifs}`,
    [
      subsKey,
      settings.sortBy,
      settings.topTimeframe,
      settings.postsPerLoad,
      settings.allowImages,
      settings.allowVideos,
      settings.allowGifs,
    ]
  );

  const getKey = useCallback((pageIndex: number, previousPageData: RedditResponse | null) => {
    const after = previousPageData?.after ?? null;
    if (activeSubsRef.current.length === 0) return null;
    if (pageIndex > 0 && !after) return null;
    if (pageIndex === 0) return ['feed', cacheKey, null];
    return ['feed', cacheKey, after];
  }, [cacheKey]);

  // Stable fetcher using refs
  const fetcher = useCallback(async ([, , after]: [string, string, string | null]) => {
    return fetchFeed(activeSubsRef.current, after, settingsRef.current);
  }, []);

  const { data, size, setSize, isLoading, isValidating, error } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateFirstPage: false,
      persistSize: true,
      parallel: false,
      dedupingInterval: 10000,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  // Apply client-side filters (hideViewed)
  const items = useMemo(
    () => data
      ? data.flatMap(d => d.items)
        .filter(item => !settings.hideViewed || !viewedItems.has(item.id))
      : [],
    [data, settings.hideViewed, viewedItems]
  );

  const hasPendingPage = Boolean(size > 0 && data && typeof data[size - 1] === "undefined");
  const hasMore = Boolean(data?.[size - 1]?.after);
  const isLoadingMore = !error && (isLoading || isValidating || hasPendingPage);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !error) {
          // Increment by one page per render cycle to avoid burst requests.
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, setSize, size, error]);

  return (
    <main className="min-h-screen bg-background text-foreground">
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
              {error && (
                <div className="text-red-500 font-mono text-xs">
                  {error?.status === 429 ? 'RATE LIMITED - PLEASE WAIT' : 'FAILED TO LOAD'}
                </div>
              )}
              {!error && isLoadingMore && (
                <div className="font-mono text-xs text-neutral-500 animate-pulse">
                  LOADING MORE...
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
