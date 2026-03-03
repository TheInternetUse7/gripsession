# gripsession

a grimy little media feed app for reddit where you pick your subs, scroll forever, save what you like.

built with next.js + react + typescript, all client-side.

## what this does

- pulls media posts from `old.reddit.com/r/<subs>` using your selected sort + filters
- supports images, videos, and gallery posts (with prev/next nav in modal)
- infinite scroll feed with swr pagination
- lets you save favorites and view them on `/favorites`
- lets you manage subs and sub templates on `/settings`
- persists your settings/data locally (zustand + persist middleware)
- supports theme switching (`dark`, `light`, `oled`)
- supports import/export for full app data and template-only backups

## routes

- `/` main feed
- `/settings` subs, templates, filters, playback, display, feed, backup controls
- `/favorites` saved posts grid

## quick start

```bash
npm install
npm run dev
```

then open `http://localhost:3000`.

## scripts

- `npm run dev` start dev server
- `npm run build` production build
- `npm run start` run production build
- `npm run lint` run eslint

## how state works

global store is in `src/lib/store.ts`:

persisted slices:

- favorites
- subs
- templates
- settings
- viewed items

## media fetching notes

- fetcher lives in `src/lib/parsers/reddit.ts`
- uses `old.reddit.com` json listings (`hot`, `new`, `top`)
- applies media filters before items hit the UI
- skips unsupported links and malformed posts instead of crashing the whole page
- reddit can rate-limit (`429`), so the UI retries a bit and then shows an error state

## heads up

- this app is client-rendered and currently only wired to reddit as a source.
- if all subs are disabled/removed, home feed will be empty until you enable/add some.
- import/export expects json produced by this app.
