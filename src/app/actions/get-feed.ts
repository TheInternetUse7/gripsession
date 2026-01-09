'use server';

import { RedditAdapter } from '@/lib/adapters/reddit-adapter';
import { FilterOptions } from '@/types/content';

const adapter = new RedditAdapter();

export async function getFeedAction(cursor?: string, filters: FilterOptions = {}) {
    try {
        return await adapter.fetchFeed(cursor, filters);
    } catch (error) {
        console.error('Fetch Feed Error:', error);
        return { posts: [], nextCursor: undefined };
    }
}
