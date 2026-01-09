export interface FilterOptions {
    source?: string;
    category?: string;
}

export interface Post {
    id: string;
    title: string;
    url: string;
    type: 'video' | 'image';
    source: 'reddit' | 'local';
    thumbnail?: string;
}

export interface ContentAdapter {
    fetchFeed(cursor: string | undefined, filters: FilterOptions): Promise<{ posts: Post[]; nextCursor?: string }>;
}
