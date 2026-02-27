"use client";

import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { useStore } from "@/lib/store";
import { useSyncExternalStore } from "react";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = useStore();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <html lang="en" data-theme={mounted ? settings.theme : 'dark'}>
      <head>
        <title>GRIPSESSION</title>
        <meta name="description" content="Digital Brutalism" />
      </head>
      <body
        className={`${playfair.variable} ${jetbrainsMono.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
