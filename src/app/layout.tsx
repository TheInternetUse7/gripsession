import type { Metadata, Viewport } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GRIPSESSION",
  description: "Digital Brutalism",
  applicationName: "GRIPSESSION",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GRIPSESSION",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101215" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
