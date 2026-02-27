import { MediaItem, AppSettings } from '@/lib/types';

const DIRECT_IMAGE_REGEX = /\.(?:jpeg|jpg|gif|png)(?:$|[?#])/i;
const DIRECT_VIDEO_REGEX = /\.(?:mp4|webm)(?:$|[?#])/i;
const GIF_REGEX = /\.gif(?:$|[?#])/i;
const GIFV_REGEX = /\.gifv(?=$|[?#])/i;
const MP4_REGEX = /\.mp4(?:$|[?#])/i;

interface RedditPostData {
    id: string;
    title: string;
    url: string;
    url_overridden_by_dest?: string;
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
}

interface RedditPost {
    data?: Partial<RedditPostData>;
}

interface RedditListing {
    data?: {
        children?: RedditPost[];
        after?: string | null;
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

    let json: RedditListing;
    try {
        json = (await response.json()) as RedditListing;
    } catch {
        const error = new Error('Failed to parse reddit feed response') as Error & { status: number };
        error.status = response.status;
        throw error;
    }

    const posts = Array.isArray(json.data?.children) ? json.data.children : [];
    const newAfter = typeof json.data?.after === 'string' ? json.data.after : null;

    const items = posts
        .map((post): MediaItem | null => {
            try {
                const data = post.data;
                if (!data) return null;

                const id = typeof data.id === 'string' ? data.id : null;
                const title = typeof data.title === 'string' ? data.title : '';
                const permalink = typeof data.permalink === 'string' ? data.permalink : null;
                const thumbnail = typeof data.thumbnail === 'string' ? data.thumbnail : '';
                const primaryUrl = typeof data.url === 'string'
                    ? data.url
                    : typeof data.url_overridden_by_dest === 'string'
                        ? data.url_overridden_by_dest
                        : null;

                if (!id || !permalink || !primaryUrl) return null;

                let type: MediaItem['type'] = 'image';
                let url = primaryUrl;
                const aspectRatio = 1;

                // 1. Handle Reddit Video (Direct)
                const redditVideoUrl = data.secure_media?.reddit_video?.fallback_url;
                if (data.is_video === true && typeof redditVideoUrl === 'string') {
                    type = 'video';
                    url = redditVideoUrl;
                }
                // 2. Handle RedGifs
                else if (data.domain === 'redgifs.com' || url.includes('redgifs.com')) {
                    const redgifsFallback = data.preview?.reddit_video_preview?.fallback_url;
                    if (typeof redgifsFallback === 'string') {
                        type = 'video';
                        url = redgifsFallback;
                    } else {
                        return null;
                    }
                }
                // 3. Handle Imgur (.gifv -> .mp4)
                else if (url.includes('imgur.com') && GIFV_REGEX.test(url)) {
                    type = 'video';
                    url = url.replace(GIFV_REGEX, '.mp4');
                }
                // 4. Handle Galleries (Reddit Metadata)
                else if (data.gallery_data && data.media_metadata) {
                    const firstId = data.gallery_data.items?.[0]?.media_id;
                    const meta = firstId ? data.media_metadata[firstId] : null;
                    const galleryUrl = meta?.s?.u;
                    if (typeof galleryUrl === 'string') {
                        url = galleryUrl.replace(/&amp;/g, '&');
                    }
                    type = 'image';
                }
                // 5. Generic MP4 detection
                else if (MP4_REGEX.test(url)) {
                    type = 'video';
                }

                // Validation
                const isDirectImage = DIRECT_IMAGE_REGEX.test(url);
                const isDirectVideo = DIRECT_VIDEO_REGEX.test(url) || type === 'video';

                if (!isDirectImage && !isDirectVideo) return null;
                if (type === 'video' && url.includes('redgifs.com/watch')) return null;

                // Apply media type filters
                const isGif = GIF_REGEX.test(url);
                if (type === 'image' && !isGif && !settings.allowImages) return null;
                if (type === 'image' && isGif && !settings.allowGifs) return null;
                if (type === 'video' && !settings.allowVideos) return null;

                return {
                    id: id,
                    url: url,
                    thumbnail: thumbnail,
                    type: type,
                    aspectRatio: aspectRatio,
                    sourceUrl: permalink.startsWith('http') ? permalink : `https://reddit.com${permalink}`,
                    title: title,
                    source: 'reddit',
                };
            } catch {
                // Drop malformed posts instead of failing the entire page fetch.
                return null;
            }
        })
        .filter((item): item is MediaItem => item !== null);

    return { items, after: newAfter };
}
