# CLAUDE.md

Next.js 15 (App Router) + TypeScript PWA. UI text is Thai; keep new UI copy in Thai. Deployed to Vercel from GitHub `main`.

- State lives in `components/TripApp.tsx` (one `TripState`, persisted to localStorage key `khaokho-trip-v1`). Change state only through `mutate` / `mutateStop` (they clone, stamp `updatedAt`, and the save effect writes localStorage).
- Seed plan, day/tab metadata and stop types are in `lib/seed.ts`; shared types in `lib/types.ts`; helpers in `lib/utils.ts`.
- Components are client components; render user text as JSX children (React escapes it), never `dangerouslySetInnerHTML`.
- Colors come only from CSS variables on `:root` in `app/globals.css`; dark values exist under both `prefers-color-scheme` and `[data-theme="dark"]`.
- Fonts via `next/font/google` (`--font-plex`, `--font-jam`).
- PWA: `public/manifest.webmanifest`, `public/sw.js` (registered by `components/RegisterSW.tsx`, production only). Bump `CACHE` in `public/sw.js` when caching behavior changes.
- `legacy/` is the original vanilla JS version, kept for reference only (excluded from tsconfig).
- Check with `npm run lint` (tsc) and `npm run build`. On the `G:` drive `next build` fails with EISDIR readlink; build from a copy on a local drive, or let Vercel build.
