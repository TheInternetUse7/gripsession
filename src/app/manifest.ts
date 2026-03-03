import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GRIPSESSION",
    short_name: "GRIPSESSION",
    description: "Digital Brutalism media feed app",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#101215",
    theme_color: "#101215",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Saved",
        short_name: "Saved",
        description: "Open saved media",
        url: "/favorites",
      },
      {
        name: "Settings",
        short_name: "Settings",
        description: "Manage sources and filters",
        url: "/settings",
      },
    ],
  };
}
