import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem, AppSettings, Sub, SubTemplate } from './types';

const SUPPORTED_SOURCES: Sub['source'][] = ['reddit', 'future-source-1', 'future-source-2'];
const STARTER_TEMPLATE_UPDATED_AT = '2026-02-27T00:00:00.000Z';
const STARTER_TEMPLATES: SubTemplate[] = [
    {
        id: 'starter-milf',
        name: 'MILF',
        subs: ['gonewild30plus', 'hotmoms', 'milf', 'realgirls'],
        updatedAt: STARTER_TEMPLATE_UPDATED_AT,
    },
    {
        id: 'starter-ass',
        name: 'ASS',
        subs: ['ass', 'pawg', 'simps', 'realgirls'],
        updatedAt: STARTER_TEMPLATE_UPDATED_AT,
    },
    {
        id: 'starter-boobs',
        name: 'BOOBS',
        subs: ['boobs', 'tits', 'gonewild', 'realgirls'],
        updatedAt: STARTER_TEMPLATE_UPDATED_AT,
    },
    {
        id: 'starter-anime-18-plus',
        name: 'ANIME (18+)',
        subs: ['rule34', 'hentai', 'ecchi', 'simps'],
        updatedAt: STARTER_TEMPLATE_UPDATED_AT,
    },
];

function cloneStarterTemplates(): SubTemplate[] {
    return STARTER_TEMPLATES.map((template) => ({
        ...template,
        subs: [...template.subs],
    }));
}

function createTemplateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSubName(name: string): string {
    return name.trim().toLowerCase().replace(/^r\//, '');
}

function toUniqueSubNames(subNames: string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const subName of subNames) {
        const normalized = normalizeSubName(subName);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        unique.push(normalized);
    }

    return unique;
}

function normalizeSubs(subs: unknown): Sub[] {
    if (!Array.isArray(subs)) return [];

    const seen = new Set<string>();
    const nextSubs: Sub[] = [];

    for (const sub of subs) {
        if (!sub || typeof sub !== 'object') continue;
        const maybeName = (sub as { name?: unknown }).name;
        const maybeEnabled = (sub as { enabled?: unknown }).enabled;
        const maybeSource = (sub as { source?: unknown }).source;

        if (typeof maybeName !== 'string') continue;
        const name = normalizeSubName(maybeName);
        if (!name || seen.has(name)) continue;

        const source = SUPPORTED_SOURCES.includes(maybeSource as Sub['source'])
            ? (maybeSource as Sub['source'])
            : 'reddit';

        nextSubs.push({
            name,
            enabled: typeof maybeEnabled === 'boolean' ? maybeEnabled : true,
            source,
        });
        seen.add(name);
    }

    return nextSubs;
}

function normalizeTemplates(templates: unknown): SubTemplate[] {
    if (!Array.isArray(templates)) return [];

    const byName = new Map<string, SubTemplate>();

    for (const template of templates) {
        if (!template || typeof template !== 'object') continue;

        const maybeName = (template as { name?: unknown }).name;
        const maybeSubs = (template as { subs?: unknown }).subs;
        const maybeId = (template as { id?: unknown }).id;
        const maybeUpdatedAt = (template as { updatedAt?: unknown }).updatedAt;

        if (typeof maybeName !== 'string') continue;
        const name = maybeName.trim();
        if (!name) continue;

        const subs = toUniqueSubNames(
            Array.isArray(maybeSubs)
                ? maybeSubs.filter((value): value is string => typeof value === 'string')
                : []
        );
        if (subs.length === 0) continue;

        const normalizedNameKey = name.toLowerCase();
        byName.set(normalizedNameKey, {
            id: typeof maybeId === 'string' && maybeId.trim() ? maybeId : createTemplateId(),
            name,
            subs,
            updatedAt: typeof maybeUpdatedAt === 'string' && maybeUpdatedAt
                ? maybeUpdatedAt
                : new Date().toISOString(),
        });
    }

    return Array.from(byName.values());
}

interface State {
    favorites: MediaItem[];
    subs: Sub[];
    templates: SubTemplate[];
    settings: AppSettings;
    viewedItems: Set<string>;

    // Favorites
    addFavorite: (item: MediaItem) => void;
    removeFavorite: (id: string) => void;

    // Subs
    addSub: (name: string, source?: 'reddit') => void;
    removeSub: (name: string) => void;
    toggleSub: (name: string) => void;

    // Templates (subs only)
    saveTemplate: (name: string) => void;
    applyTemplate: (id: string) => void;
    renameTemplate: (id: string, name: string) => void;
    deleteTemplate: (id: string) => void;
    exportTemplates: () => string;
    importTemplates: (json: string) => void;

    // Settings
    updateSettings: (settings: Partial<AppSettings>) => void;

    // Viewed items
    markViewed: (id: string) => void;

    // Data management
    clearAllData: () => void;
    exportData: () => string;
    importData: (json: string) => void;
}

type PersistedState = Pick<State, 'favorites' | 'subs' | 'templates' | 'settings'> & {
    viewedItems: string[];
};

export const useStore = create<State>()(
    persist(
        (set, get) => ({
            favorites: [],
            subs: [
                { name: 'gonewild', enabled: true, source: 'reddit' },
                { name: 'rule34', enabled: true, source: 'reddit' },
                { name: 'simps', enabled: true, source: 'reddit' },
            ],
            templates: cloneStarterTemplates(),
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
                galleryPreloadCount: 3,
            },
            viewedItems: new Set(),

            addFavorite: (item) =>
                set((state) => ({ favorites: [...state.favorites, item] })),
            removeFavorite: (id) =>
                set((state) => ({
                    favorites: state.favorites.filter((i) => i.id !== id),
                })),

            addSub: (name, source = 'reddit') =>
                set((state) => {
                    const cleanName = normalizeSubName(name);
                    if (!cleanName || state.subs.some((sub) => sub.name === cleanName)) {
                        return {};
                    }

                    return {
                        subs: [...state.subs, { name: cleanName, enabled: true, source }],
                    };
                }),
            removeSub: (name) =>
                set((state) => ({
                    subs: state.subs.filter((s) => s.name !== normalizeSubName(name)),
                })),
            toggleSub: (name) =>
                set((state) => ({
                    subs: state.subs.map((s) =>
                        s.name === normalizeSubName(name) ? { ...s, enabled: !s.enabled } : s
                    ),
                })),

            saveTemplate: (name) =>
                set((state) => {
                    const templateName = name.trim();
                    if (!templateName) return {};

                    const templateSubs = toUniqueSubNames(
                        state.subs
                            .filter((sub) => sub.source === 'reddit' && sub.enabled)
                            .map((sub) => sub.name)
                    );
                    if (templateSubs.length === 0) return {};

                    const now = new Date().toISOString();
                    const existingIndex = state.templates.findIndex(
                        (template) => template.name.toLowerCase() === templateName.toLowerCase()
                    );

                    if (existingIndex >= 0) {
                        const nextTemplates = [...state.templates];
                        nextTemplates[existingIndex] = {
                            ...nextTemplates[existingIndex],
                            name: templateName,
                            subs: templateSubs,
                            updatedAt: now,
                        };
                        return { templates: nextTemplates };
                    }

                    return {
                        templates: [
                            ...state.templates,
                            {
                                id: createTemplateId(),
                                name: templateName,
                                subs: templateSubs,
                                updatedAt: now,
                            },
                        ],
                    };
                }),

            applyTemplate: (id) =>
                set((state) => {
                    const template = state.templates.find((item) => item.id === id);
                    if (!template) return {};

                    return {
                        subs: template.subs.map((subName) => ({
                            name: subName,
                            enabled: true,
                            source: 'reddit',
                        })),
                    };
                }),

            renameTemplate: (id, name) =>
                set((state) => {
                    const nextName = name.trim();
                    if (!nextName) return {};

                    const currentTemplate = state.templates.find((template) => template.id === id);
                    if (!currentTemplate) return {};

                    const conflictTemplate = state.templates.find(
                        (template) =>
                            template.id !== id &&
                            template.name.toLowerCase() === nextName.toLowerCase()
                    );

                    const renamedTemplate: SubTemplate = {
                        ...currentTemplate,
                        name: nextName,
                        updatedAt: new Date().toISOString(),
                    };

                    if (conflictTemplate) {
                        return {
                            templates: state.templates
                                .filter((template) => template.id !== id && template.id !== conflictTemplate.id)
                                .concat(renamedTemplate),
                        };
                    }

                    return {
                        templates: state.templates.map((template) =>
                            template.id === id ? renamedTemplate : template
                        ),
                    };
                }),

            deleteTemplate: (id) =>
                set((state) => ({
                    templates: state.templates.filter((template) => template.id !== id),
                })),

            exportTemplates: () => {
                const state = get();
                return JSON.stringify({ templates: state.templates }, null, 2);
            },

            importTemplates: (json) => {
                try {
                    const parsed = JSON.parse(json) as { templates?: unknown } | unknown[];
                    const rawTemplates = Array.isArray(parsed) ? parsed : parsed.templates;
                    set({ templates: normalizeTemplates(rawTemplates) });
                } catch (error) {
                    console.error('Failed to import templates:', error);
                }
            },

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
                    templates: cloneStarterTemplates(),
                    viewedItems: new Set(),
                }),

            exportData: () => {
                const state = get();
                return JSON.stringify({
                    favorites: state.favorites,
                    subs: state.subs,
                    templates: state.templates,
                    settings: state.settings,
                    viewedItems: Array.from(state.viewedItems),
                }, null, 2);
            },

            importData: (json) => {
                try {
                    const data = JSON.parse(json) as {
                        favorites?: unknown;
                        subs?: unknown;
                        templates?: unknown;
                        settings?: Partial<AppSettings>;
                        viewedItems?: unknown;
                    };
                    set({
                        favorites: Array.isArray(data.favorites) ? data.favorites : [],
                        subs: normalizeSubs(data.subs),
                        templates: Array.isArray(data.templates)
                            ? normalizeTemplates(data.templates)
                            : get().templates,
                        settings: { ...get().settings, ...data.settings },
                        viewedItems: new Set(
                            Array.isArray(data.viewedItems)
                                ? data.viewedItems.filter((item): item is string => typeof item === 'string')
                                : []
                        ),
                    });
                } catch (error) {
                    console.error('Failed to import data:', error);
                }
            },
        }),
        {
            name: 'gripsession-storage-v2',
            version: 3,
            migrate: (persistedState: unknown, version) => {
                const state = (persistedState ?? {}) as Partial<PersistedState>;
                if (version >= 3) return state;

                const existingTemplates = normalizeTemplates(state.templates);
                return {
                    ...state,
                    templates: existingTemplates.length > 0
                        ? existingTemplates
                        : cloneStarterTemplates(),
                };
            },
            partialize: (state) => ({
                favorites: state.favorites,
                subs: state.subs,
                templates: state.templates,
                settings: state.settings,
                viewedItems: Array.from(state.viewedItems),
            }),
            merge: (persistedState: unknown, currentState) => {
                const state = (persistedState ?? {}) as Partial<PersistedState>;
                const viewedItems = Array.isArray(state.viewedItems)
                    ? state.viewedItems.filter((item): item is string => typeof item === 'string')
                    : [];
                const hasSubs = Array.isArray(state.subs);
                const hasTemplates = Array.isArray(state.templates);

                return {
                    ...currentState,
                    ...state,
                    subs: hasSubs ? normalizeSubs(state.subs) : currentState.subs,
                    templates: hasTemplates ? normalizeTemplates(state.templates) : currentState.templates,
                    viewedItems: new Set(viewedItems),
                };
            },
        }
    )
);
