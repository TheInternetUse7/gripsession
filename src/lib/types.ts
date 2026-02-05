export type MediaSource = 'reddit' | 'future-source-1' | 'future-source-2';

export interface MediaItem {
    id: string;
    url: string; // Direct link to mp4/jpg
    thumbnail: string;
    type: 'video' | 'image' | 'gallery';
    aspectRatio: number;
    sourceUrl: string; // Reddit thread
    title: string;
    source: MediaSource;
}

export interface Sub {
    name: string;
    enabled: boolean;
    source: MediaSource;
}

export interface AppSettings {
    // Media Filters
    allowImages: boolean;
    allowVideos: boolean;
    allowGifs: boolean;

    // Playback
    autoplay: boolean;
    muted: boolean;
    loopVideos: boolean;

    // Display
    columns: number; // 2-6
    cardSize: 'small' | 'medium' | 'large';
    showTitles: 'never' | 'hover' | 'always';
    theme: 'dark' | 'light' | 'oled';

    // Feed
    sortBy: 'hot' | 'new' | 'top';
    topTimeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
    hideViewed: boolean;

    // Advanced
    postsPerLoad: number; // 10-50
    preloadNext: boolean;
}
