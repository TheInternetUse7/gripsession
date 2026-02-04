export interface MediaItem {
    id: string;
    url: string; // Direct link to mp4/jpg
    thumbnail: string;
    type: 'video' | 'image' | 'gallery';
    aspectRatio: number;
    sourceUrl: string; // Reddit thread
    title: string;
}

export interface AppSettings {
    muted: boolean;
    allowImages: boolean;
    quality: 'sd' | 'hd';
}
