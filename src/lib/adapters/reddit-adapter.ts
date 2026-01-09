import axios from 'axios';
import { ContentAdapter, FilterOptions, Post } from '@/types/content';

export class RedditAdapter implements ContentAdapter {
    private baseUrl = 'https://www.reddit.com';

    async fetchFeed(cursor: string | undefined, filters: FilterOptions) {
        // Default to NSFW content subreddits if no category specified
        const subreddit = filters.category || 'nsfw_gifs+holdthemoan+nsfwhardcore+gonewild';

        const params = new URLSearchParams();
        if (cursor) params.append('after', cursor);
        params.append('limit', '25');
        params.append('raw_json', '1'); // Crucial for unescaped URLs

        try {
            const response = await axios.get(`${this.baseUrl}/r/${subreddit}.json`, {
                params,
                headers: {
                    'User-Agent': 'Gripsession/1.0.0'
                }
            });

            const children = response.data.data.children;
            const nextCursor = response.data.data.after;

            const posts: Post[] = children
                .map((child: any) => this.transformPost(child.data))
                .filter((post: Post | null) => post !== null) as Post[];

            return { posts, nextCursor };
        } catch (error) {
            console.error('Reddit API Error:', error);
            return { posts: [], nextCursor: undefined };
        }
    }

    private transformPost(data: any): Post | null {
        // Filter out self posts and stickies
        if (data.is_self || data.stickied) return null;

        // Detect type
        let type: 'video' | 'image' = 'image';
        let url = data.url;
        let thumbnail = data.thumbnail;

        // Fix thumbnail if it's 'default', 'self', 'nsfw'
        if (['default', 'self', 'nsfw', 'image'].includes(thumbnail)) {
            thumbnail = undefined; // Or try to find a preview image
            if (data.preview?.images?.[0]?.source?.url) {
                thumbnail = data.preview.images[0].source.url;
            }
        }

        // Handle Reddit Video
        if (data.is_video && data.media?.reddit_video) {
            type = 'video';
            url = data.media.reddit_video.fallback_url; // or hls_url
        }
        // Handle RedGifs/Gfycat
        else if (data.domain.includes('redgifs') || data.domain.includes('gfycat')) {
            type = 'video';
            // Redgifs often provides a preview or needs a different handling.
            // Usually data.preview.reddit_video_preview.fallback_url exists for some.
            // Or data.media.oembed.thumbnail_url / width / height and extracting mp4.
            // For MVP, if we can't get a direct video link easily, we might fallback to iframe or source url.
            // But Redgifs direct mp4 is often in `cards` or `preview`.
            if (data.preview?.reddit_video_preview?.fallback_url) {
                url = data.preview.reddit_video_preview.fallback_url;
            } else if (data.url.endsWith('.mp4')) {
                url = data.url;
            } else {
                // Fallback for redgifs link without direct video
                // Might need a specific resolver or just treat as link (but we want feed)
                // Check `media`
                if (data.media?.oembed?.html) {
                    // It's an iframe. We want direct video if possible.
                    // Sometimes `data.url` is arguably okay if we render it as iframe, 
                    // but `Post` interface expects `url` and `type`.
                    // If type is video, we expect a video source.
                    // Let's try to get `preview` video.
                    if (data.preview?.images?.[0]?.variants?.mp4?.source?.url) {
                        url = data.preview.images[0].variants.mp4.source.url;
                    }
                }
            }
        }
        // Handle Imgur .gifv / .mp4
        else if (data.domain.includes('imgur.com') && (data.url.endsWith('.gifv') || data.url.endsWith('.mp4'))) {
            type = 'video';
            url = data.url.replace('.gifv', '.mp4');
        }
        // Handle generic images
        else if (
            data.url.endsWith('.jpg') ||
            data.url.endsWith('.png') ||
            data.url.endsWith('.gif') ||
            data.url.endsWith('.jpeg') ||
            data.url.includes('i.redd.it') ||
            data.url.includes('i.imgur.com')
        ) {
            type = 'image';
        } else {
            // If we can't determine it's media, skip
            return null;
        }

        return {
            id: data.name, // 't3_xxxxx'
            title: data.title,
            url,
            type,
            source: 'reddit',
            thumbnail
        };
    }
}
