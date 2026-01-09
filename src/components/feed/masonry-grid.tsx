'use client';

import { Post } from '@/types/content';
import { MediaCard } from './media-card';

interface MasonryGridProps {
    posts: Post[];
    onPostClick?: (post: Post) => void;
}

export function MasonryGrid({ posts, onPostClick }: MasonryGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
                <MediaCard
                    key={post.id}
                    post={post}
                    onClick={() => onPostClick?.(post)}
                />
            ))}
        </div>
    );
}
