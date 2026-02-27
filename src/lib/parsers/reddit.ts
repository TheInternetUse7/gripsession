import { MediaItem, AppSettings, GalleryItem } from '@/lib/types';

const DIRECT_IMAGE_REGEX = /\.(?:jpeg|jpg|gif|png)(?:$|[?#])/i;
const DIRECT_VIDEO_REGEX = /\.(?:mp4|webm)(?:$|[?#])/i;
const GIF_REGEX = /\.gif(?:$|[?#])/i;
const GIFV_REGEX = /\.gifv(?=$|[?#])/i;
const MP4_REGEX = /\.mp4(?:$|[?#])/i;

interface RedditMediaMetadata {
    e?: string;
    m?: string;
    s?: {
        u?: string;
        mp4?: string;
        gif?: string;
        x?: number;
        y?: number;
    };
}

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
    media_metadata?: Record<string, RedditMediaMetadata>;
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

function decodeRedditUrl(url: string): string {
    return url.replace(/&amp;/g, '&');
}

function normalizeMediaUrl(url: string): string {
    const decoded = decodeRedditUrl(url);
    if (decoded.includes('imgur.com') && GIFV_REGEX.test(decoded)) {
        return decoded.replace(GIFV_REGEX, '.mp4');
    }
    return decoded;
}

function getMediaTypeFromUrl(url: string): GalleryItem['type'] | null {
    if (DIRECT_VIDEO_REGEX.test(url)) return 'video';
    if (DIRECT_IMAGE_REGEX.test(url)) return 'image';
    return null;
}

function isAllowedBySettings(type: GalleryItem['type'], url: string, settings: AppSettings): boolean {
    if (type === 'video') return settings.allowVideos;

    const isGif = GIF_REGEX.test(url);
    if (isGif) return settings.allowGifs;
    return settings.allowImages;
}

function parseGalleryItems(data: Partial<RedditPostData>, settings: AppSettings): GalleryItem[] {
    const galleryDataItems = data.gallery_data?.items;
    const mediaMetadata = data.media_metadata;
    if (!galleryDataItems || !mediaMetadata) return [];

    const galleryItems: GalleryItem[] = [];

    for (const galleryDataItem of galleryDataItems) {
        const metadata = mediaMetadata[galleryDataItem.media_id];
        if (!metadata?.s) continue;

        const candidates: Array<{ url: string; type?: GalleryItem['type'] }> = [];
        if (typeof metadata.s.mp4 === 'string') candidates.push({ url: metadata.s.mp4, type: 'video' });
        if (typeof metadata.s.gif === 'string') candidates.push({ url: metadata.s.gif });
        if (typeof metadata.s.u === 'string') candidates.push({ url: metadata.s.u });

        let picked: GalleryItem | null = null;
        for (const candidate of candidates) {
            const normalizedUrl = normalizeMediaUrl(candidate.url);
            let type = candidate.type ?? getMediaTypeFromUrl(normalizedUrl);

            if (!type) {
                const mime = metadata.m?.toLowerCase() ?? '';
                if (mime.startsWith('video/')) type = 'video';
                if (mime.startsWith('image/')) type = 'image';
            }

            if (!type) continue;
            if (type === 'video' && normalizedUrl.includes('redgifs.com/watch')) continue;
            if (!isAllowedBySettings(type, normalizedUrl, settings)) continue;

            picked = { url: normalizedUrl, type };
            break;
        }

        if (picked) galleryItems.push(picked);
    }

    return galleryItems;
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
                let url = normalizeMediaUrl(primaryUrl);
                const aspectRatio = 1;

                const galleryItems = parseGalleryItems(data, settings);
                if (galleryItems.length > 0) {
                    return {
                        id: id,
                        url: galleryItems[0].url,
                        thumbnail: thumbnail,
                        type: 'gallery',
                        galleryItems: galleryItems,
                        aspectRatio: aspectRatio,
                        sourceUrl: permalink.startsWith('http') ? permalink : `https://reddit.com${permalink}`,
                        title: title,
                        source: 'reddit',
                    };
                }

                // 1. Handle Reddit Video (Direct)
                const redditVideoUrl = data.secure_media?.reddit_video?.fallback_url;
                if (data.is_video === true && typeof redditVideoUrl === 'string') {
                    type = 'video';
                    url = normalizeMediaUrl(redditVideoUrl);
                }
                // 2. Handle RedGifs
                else if (data.domain === 'redgifs.com' || url.includes('redgifs.com')) {
                    const redgifsFallback = data.preview?.reddit_video_preview?.fallback_url;
                    if (typeof redgifsFallback === 'string') {
                        type = 'video';
                        url = normalizeMediaUrl(redgifsFallback);
                    } else {
                        return null;
                    }
                }
                // 3. Generic MP4 detection
                else if (MP4_REGEX.test(url)) {
                    type = 'video';
                }

                // Validation
                const resolvedType = type === 'video' ? 'video' : (getMediaTypeFromUrl(url) ?? 'image');
                const isDirectImage = DIRECT_IMAGE_REGEX.test(url);
                const isDirectVideo = DIRECT_VIDEO_REGEX.test(url) || resolvedType === 'video';

                if (!isDirectImage && !isDirectVideo) return null;
                if (resolvedType === 'video' && url.includes('redgifs.com/watch')) return null;

                // Apply media type filters
                if (!isAllowedBySettings(resolvedType, url, settings)) return null;

                return {
                    id: id,
                    url: url,
                    thumbnail: thumbnail,
                    type: resolvedType,
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
