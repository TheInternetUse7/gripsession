'use client';

import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedAction } from '@/app/actions/get-feed';
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
  } = useInfiniteQuery({
    queryKey: ['feed', activeSource],
    queryFn: async ({ pageParam }) => {
      return await getFeedAction(pageParam, { category: activeSource });
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
