"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { useStore } from "@/lib/store";
import { MediaItem } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";

export default function FavoritesPage() {
  const { favorites } = useStore();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="p-3 sm:p-4">
        <h1 className="font-serif text-3xl sm:text-4xl mb-4 sm:mb-6 uppercase">Saved</h1>
        
        {favorites.length === 0 ? (
          <div className="flex h-[50vh] items-center justify-center font-mono text-sm text-neutral-500">
            NO SAVED ITEMS
          </div>
        ) : (
          <MasonryGrid items={favorites} onItemClick={setSelectedItem} />
        )}
      </div>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}

