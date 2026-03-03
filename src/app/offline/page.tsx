"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Offline Mode</p>
      <h1 className="font-serif text-4xl font-bold uppercase tracking-tight">You&apos;re Offline</h1>
      <p className="max-w-sm font-mono text-sm text-muted">
        Previously loaded content is still available. Reconnect to refresh your feed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase">
        <Link href="/" className="border border-border px-3 py-2 hover:bg-surface">
          Home
        </Link>
        <Link href="/favorites" className="border border-border px-3 py-2 hover:bg-surface">
          Saved
        </Link>
        <Link href="/settings" className="border border-border px-3 py-2 hover:bg-surface">
          Settings
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="border border-border px-3 py-2 hover:bg-surface"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
