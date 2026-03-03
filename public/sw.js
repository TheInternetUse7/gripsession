const SW_VERSION = "v1";
const SHELL_CACHE = `gripsession-shell-${SW_VERSION}`;
const FEED_CACHE = `gripsession-feed-${SW_VERSION}`;
const MEDIA_CACHE = `gripsession-media-${SW_VERSION}`;
const META_CACHE = `gripsession-meta-${SW_VERSION}`;

const OFFLINE_URL = "/offline";
const FEED_TTL_MS = 24 * 60 * 60 * 1000;
const MEDIA_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_MEDIA_ENTRIES = 120;

const PRECACHE_URLS = [
  "/",
  "/favorites",
  "/settings",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keepCaches = new Set([SHELL_CACHE, FEED_CACHE, MEDIA_CACHE, META_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !keepCaches.has(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (isRedditFeedRequest(url)) {
    event.respondWith(
      staleWhileRevalidateWithTtl(event, request, FEED_CACHE, FEED_TTL_MS)
    );
    return;
  }

  if (isMediaRequest(request, url)) {
    event.respondWith(
      staleWhileRevalidateWithTtl(
        event,
        request,
        MEDIA_CACHE,
        MEDIA_TTL_MS,
        MAX_MEDIA_ENTRIES
      )
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, FEED_CACHE));
  }
});

function isShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  );
}

function isRedditFeedRequest(url) {
  return url.hostname.endsWith("reddit.com") && url.pathname.endsWith(".json");
}

function isMediaRequest(request, url) {
  const destination = request.destination;
  if (destination === "image" || destination === "video") return true;

  if (!url.pathname) return false;
  return /\.(png|jpg|jpeg|gif|webp|avif|mp4|webm)$/i.test(url.pathname);
}

async function handleNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (canCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (canCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

async function staleWhileRevalidateWithTtl(
  event,
  request,
  cacheName,
  ttlMs,
  maxEntries
) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const timestamp = await getTimestamp(request.url);
  const isFresh = Number.isFinite(timestamp) && Date.now() - timestamp <= ttlMs;

  if (cached && isFresh) {
    event.waitUntil(updateCache(request, cacheName, maxEntries));
    return cached;
  }

  try {
    const networkResponse = await updateCache(request, cacheName, maxEntries);
    return networkResponse;
  } catch {
    if (cached) return cached;
    return Response.error();
  }
}

async function updateCache(request, cacheName, maxEntries) {
  const response = await fetch(request);
  if (!canCacheResponse(response)) return response;

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  await setTimestamp(request.url);

  if (typeof maxEntries === "number") {
    await pruneCache(cacheName, maxEntries);
  }

  return response;
}

function canCacheResponse(response) {
  return response.ok || response.type === "opaque";
}

function getMetadataRequest(url) {
  return new Request(`https://gripsession-meta.local/${encodeURIComponent(url)}`);
}

async function setTimestamp(url) {
  const metadataCache = await caches.open(META_CACHE);
  await metadataCache.put(getMetadataRequest(url), new Response(String(Date.now())));
}

async function getTimestamp(url) {
  const metadataCache = await caches.open(META_CACHE);
  const response = await metadataCache.match(getMetadataRequest(url));
  if (!response) return Number.NaN;
  const value = Number(await response.text());
  return Number.isFinite(value) ? value : Number.NaN;
}

async function pruneCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length <= maxEntries) return;

  const toDelete = keys.length - maxEntries;
  for (let index = 0; index < toDelete; index += 1) {
    await cache.delete(keys[index]);
  }
}
