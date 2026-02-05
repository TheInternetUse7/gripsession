import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem, AppSettings, Sub } from './types';

interface State {
    favorites: MediaItem[];
    subs: Sub[];
    settings: AppSettings;
    viewedItems: Set<string>;

    // Favorites
    addFavorite: (item: MediaItem) => void;
    removeFavorite: (id: string) => void;

    // Subs
    addSub: (name: string, source?: 'reddit') => void;
    removeSub: (name: string) => void;
    toggleSub: (name: string) => void;

    // Settings
    updateSettings: (settings: Partial<AppSettings>) => void;

    // Viewed items
    markViewed: (id: string) => void;

    // Data management
    clearAllData: () => void;
    exportData: () => string;
    importData: (json: string) => void;
}

export const useStore = create<State>()(
    persist(
        (set, get) => ({
            favorites: [],
            subs: [
                { name: 'gonewild', enabled: true, source: 'reddit' },
                { name: 'rule34', enabled: true, source: 'reddit' },
                { name: 'simps', enabled: true, source: 'reddit' },
            ],
            settings: {
                // Media Filters
                allowImages: true,
                allowVideos: true,
                allowGifs: true,

                // Playback
                autoplay: true,
                muted: true,
                loopVideos: true,

                // Display
                columns: 4,
                cardSize: 'medium',
                showTitles: 'hover',
                theme: 'dark',

                // Feed
                sortBy: 'hot',
                topTimeframe: 'day',
                hideViewed: false,

                // Advanced
                postsPerLoad: 25,
                preloadNext: false,
            },
            viewedItems: new Set(),

            addFavorite: (item) =>
                set((state) => ({ favorites: [...state.favorites, item] })),
            removeFavorite: (id) =>
                set((state) => ({
                    favorites: state.favorites.filter((i) => i.id !== id),
                })),

            addSub: (name, source = 'reddit') =>
                set((state) => ({
                    subs: [...state.subs, { name, enabled: true, source }]
                })),
            removeSub: (name) =>
                set((state) => ({
                    subs: state.subs.filter((s) => s.name !== name),
                })),
            toggleSub: (name) =>
                set((state) => ({
                    subs: state.subs.map((s) =>
                        s.name === name ? { ...s, enabled: !s.enabled } : s
                    ),
                })),

            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings }
                })),

            markViewed: (id) =>
                set((state) => ({
                    viewedItems: new Set([...state.viewedItems, id]),
                })),

            clearAllData: () =>
                set({
                    favorites: [],
                    subs: [],
                    viewedItems: new Set(),
                }),

            exportData: () => {
                const state = get();
                return JSON.stringify({
                    favorites: state.favorites,
                    subs: state.subs,
                    settings: state.settings,
                    viewedItems: Array.from(state.viewedItems),
                }, null, 2);
            },

            importData: (json) => {
                try {
                    const data = JSON.parse(json);
                    set({
                        favorites: data.favorites || [],
                        subs: data.subs || [],
                        settings: { ...get().settings, ...data.settings },
                        viewedItems: new Set(data.viewedItems || []),
                    });
                } catch (error) {
                    console.error('Failed to import data:', error);
                }
            },
        }),
        {
            name: 'gripsession-storage-v2',
            partialize: (state) => ({
                favorites: state.favorites,
                subs: state.subs,
                settings: state.settings,
                viewedItems: Array.from(state.viewedItems),
            }),
            merge: (persistedState: any, currentState) => ({
                ...currentState,
                ...persistedState,
                viewedItems: new Set(persistedState?.viewedItems || []),
            }),
        }
    )
);
