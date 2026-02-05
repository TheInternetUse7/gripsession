"use client";

import { Header } from "@/components/ui/Header";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { useStore } from "@/lib/store";

export default function FavoritesPage() {
  const { favorites } = useStore();

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="p-4">
        <h1 className="font-serif text-4xl mb-6 uppercase">Saved</h1>
        
        {favorites.length === 0 ? (
          <div className="flex h-[50vh] items-center justify-center font-mono text-sm text-neutral-500">
            NO SAVED ITEMS
          </div>
        ) : (
          <MasonryGrid items={favorites} />
        )}
      </div>
    </main>
  );
}
