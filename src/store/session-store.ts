import { create } from 'zustand';

interface SessionStore {
    isMuted: boolean;
    autoScrollSpeed: number;
    activeSource: string;
    toggleMute: () => void;
    setScrollSpeed: (speed: number) => void;
    setActiveSource: (source: string) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
    isMuted: true, // Default muted for autoplay
    autoScrollSpeed: 0,
    activeSource: 'nsfw_gifs+holdthemoan+nsfwhardcore+gonewild',
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    setScrollSpeed: (speed) => set({ autoScrollSpeed: speed }),
    setActiveSource: (source) => set({ activeSource: source }),
}));
