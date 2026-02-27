import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSync } from "@/components/theme/ThemeSync";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <title>GRIPSESSION</title>
        <meta name="description" content="Digital Brutalism" />
      </head>
      <body
        className={`${playfair.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
