import { MediaItem, AppSettings } from '@/lib/types';

interface RedditPost {
    data: {
        id: string;
        title: string;
        url: string;
        thumbnail: string;
        permalink: string;
        is_video: boolean;
        secure_media?: {
            reddit_video?: {
                fallback_url: string;
            };
        };
        preview?: {
            images: Array<{
                source: {
                    url: string;
                    width: number;
                    height: number;
                };
            }>;
            reddit_video_preview?: {
                fallback_url: string;
                height: number;
                width: number;
            };
        };
        gallery_data?: {
            items: Array<{ media_id: string; id: number }>;
        };
        media_metadata?: Record<string, { s: { u: string; x: number; y: number } }>;
        post_hint?: string;
        domain?: string;
    };
}

export interface RedditResponse {
    items: MediaItem[];
    after: string | null;
}

export async function fetchFeed(
    subreddits: string[],
    after: string | null = null,
    settings: AppSettings
): Promise<RedditResponse> {
    const query = subreddits.join('+');

    const urlPath = settings.sortBy === 'top' ? 'top.json' : `${settings.sortBy}.json`;
    const params = new URLSearchParams({
        limit: String(settings.postsPerLoad),
        raw_json: '1',
    });

    if (settings.sortBy === 'top' && settings.topTimeframe) {
        params.set('t', settings.topTimeframe);
    }

    let url = `https://old.reddit.com/r/${query}/${urlPath}?${params.toString()}`;
    if (after) {
        url += `&after=${after}`;
    }

    const response = await fetch(url, {
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const error = new Error(`Failed to fetch reddit feed: ${response.status}`) as Error & { status: number };
        error.status = response.status;
        throw error;
    }

    const json = await response.json();
    const posts: RedditPost[] = json.data.children;
    const newAfter = json.data.after;

    const items = posts
        .map((post): MediaItem | null => {
            const { data } = post;

            let type: MediaItem['type'] = 'image';
            let url = data.url;
            const aspectRatio = 1;

            // 1. Handle Reddit Video (Direct)
            if (data.is_video && data.secure_media?.reddit_video) {
                type = 'video';
                url = data.secure_media.reddit_video.fallback_url;
            }
            // 2. Handle RedGifs
            else if (data.domain === 'redgifs.com' || url.includes('redgifs.com')) {
                if (data.preview?.reddit_video_preview?.fallback_url) {
                    type = 'video';
                    url = data.preview.reddit_video_preview.fallback_url;
                } else {
                    return null;
                }
            }
            // 3. Handle Imgur (.gifv -> .mp4)
            else if (url.includes('imgur.com') && url.endsWith('.gifv')) {
                type = 'video';
                url = url.replace('.gifv', '.mp4');
            }
            // 4. Handle Galleries (Reddit Metadata)
            else if (data.gallery_data && data.media_metadata) {
                const firstId = data.gallery_data.items[0]?.media_id;
                const meta = data.media_metadata[firstId];
                if (meta && meta.s) {
                    url = meta.s.u.replace(/&amp;/g, '&');
                }
                type = 'image';
            }
            // 5. Generic MP4 detection
            else if (url.endsWith('.mp4')) {
                type = 'video';
            }

            // Validation
            const isDirectImage = url.match(/\.(jpeg|jpg|gif|png)$/) != null;
            const isDirectVideo = (url.match(/\.(mp4|webm)$/) != null) || (type === 'video');

            if (!isDirectImage && !isDirectVideo) return null;
            if (type === 'video' && url.includes('redgifs.com/watch')) return null;

            // Apply media type filters
            const isGif = url.endsWith('.gif');
            if (type === 'image' && !isGif && !settings.allowImages) return null;
            if (type === 'image' && isGif && !settings.allowGifs) return null;
            if (type === 'video' && !settings.allowVideos) return null;

            return {
                id: data.id,
                url: url,
                thumbnail: data.thumbnail,
                type: type,
                aspectRatio: aspectRatio,
                sourceUrl: `https://reddit.com${data.permalink}`,
                title: data.title,
                source: 'reddit',
            };
        })
        .filter((item): item is MediaItem => item !== null);

    return { items, after: newAfter };
}
