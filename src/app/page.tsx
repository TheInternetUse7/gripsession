'use client';

import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { MasonryGrid } from '@/components/feed/masonry-grid';
import { TheaterModal } from '@/components/viewer/theater-modal';
import { useSessionStore } from '@/store/session-store';
import { useInView } from 'react-intersection-observer';
import { Post } from '@/types/content';

export default function Home() {
  const activeSource = useSessionStore((state) => state.activeSource);
  const { ref: loadMoreRef, inView } = useInView();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['feed', activeSource],
    queryFn: async ({ pageParam }) => {
      // Client-side fetching
      const { RedditAdapter } = await import('@/lib/adapters/reddit-adapter');
      const adapter = new RedditAdapter();
      return await adapter.fetchFeed(pageParam, { category: activeSource });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Trigger fetchNextPage when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages and deduplicate by post ID
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const uniquePosts = Array.from(
    new Map(allPosts.map(post => [post.id, post])).values()
  );

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedPost) return;
    const currentIndex = uniquePosts.findIndex((p) => p.id === selectedPost.id);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedPost(uniquePosts[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < uniquePosts.length - 1) {
      setSelectedPost(uniquePosts[currentIndex + 1]);
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
        </div>
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center text-destructive">
          <p className="text-lg font-semibold mb-2">Failed to load content</p>
          <p className="text-sm text-foreground/70 mb-6 max-w-md">
            This likely implies that Reddit is blocking requests from Vercel's IP addresses.
          </p>
          {error && (
            <div className="w-full max-w-md overflow-hidden rounded bg-black/50 p-4 font-mono text-xs text-left text-muted-foreground">
              {error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : uniquePosts.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No posts found</p>
        </div>
      ) : (
        <>
          <MasonryGrid
            posts={uniquePosts}
            onPostClick={setSelectedPost}
          />

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            )}
          </div>
        </>
      )}

      {/* Theater Mode */}
      <TheaterModal
        post={selectedPost}
        allPosts={uniquePosts}
        onClose={() => setSelectedPost(null)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
