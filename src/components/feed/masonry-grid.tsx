'use client';

import { Post } from '@/types/content';
import { MediaCard } from './media-card';

interface MasonryGridProps {
    posts: Post[];
    onPostClick?: (post: Post) => void;
}

export function MasonryGrid({ posts, onPostClick }: MasonryGridProps) {
    return (
        <div className="columns-1 gap-3 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
            {posts.map((post) => (
                <div key={post.id} className="mb-3 break-inside-avoid">
                    <MediaCard
                        post={post}
                        onClick={() => onPostClick?.(post)}
                    />
                </div>
            ))}
        </div>
    );
}
