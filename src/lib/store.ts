import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem, AppSettings } from './types';

interface State {
    favorites: MediaItem[];
    kinks: string[]; // List of subreddits
    settings: AppSettings;
    actions: {
        addFavorite: (item: MediaItem) => void;
        removeFavorite: (id: string) => void;
        addKink: (subreddit: string) => void;
        removeKink: (subreddit: string) => void;
        updateSettings: (settings: Partial<AppSettings>) => void;
    };
}

export const useStore = create<State>()(
    persist(
        (set) => ({
            favorites: [],
            kinks: ['gonewild', 'rule34', 'simps'], // Default kinks
            settings: {
                muted: true,
                allowImages: true,
                quality: 'sd',
            },
            actions: {
                addFavorite: (item) =>
                    set((state) => ({ favorites: [...state.favorites, item] })),
                removeFavorite: (id) =>
                    set((state) => ({
                        favorites: state.favorites.filter((i) => i.id !== id),
                    })),
                addKink: (subreddit) =>
                    set((state) => ({ kinks: [...state.kinks, subreddit] })),
                removeKink: (subreddit) =>
                    set((state) => ({
                        kinks: state.kinks.filter((k) => k !== subreddit),
                    })),
                updateSettings: (newSettings) =>
                    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
            },
        }),
        {
            name: 'gripsession-storage',
        }
    )
);
