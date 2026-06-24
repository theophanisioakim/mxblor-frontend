# `apps/web` — Next.js 16 web app

> Layer rules for this app. The root **`AGENTS.md`** is authoritative; this adds app-specific detail.

> ⚠️ **This is NOT the Next.js you know.** Next 16 has breaking changes — read the relevant guide in
> `node_modules/next/dist/docs/` before writing app/router/config code. Heed deprecation notices.

## What this is

The web consumer (App Router, React 19, Tailwind v4). It renders the shared screens from
`@workspace/app`; UI comes through `@workspace/ui`; data through `@workspace/api-client`.

Layout: `app/` (routes, `layout.tsx`, `page.tsx`), `components/` (web-only local components),
`e2e/` (Playwright browser E2E), `playwright.config.ts`,
`next.config.ts`, `components.json` (shadcn aliases pointing at `@workspace/ui`),
`postcss.config.mjs`.

## Rules

- **Consume UI via `@workspace/ui`**, screens via `@workspace/app`, and shared navigation via
  `@workspace/router` — don't import `@workspace/web-ui` directly (root `AGENTS.md` §2 rule 1).
- Root provider composition comes from `@workspace/providers` via `app/layout.tsx`. Keep shared
  cross-platform providers there; keep only truly web-only shell providers in this app.
- Shared screens should not import `next/link` or `next/navigation`; use `@workspace/router`.
  App-local route files can still use Next router APIs for web-only shell behavior.
- **`transpilePackages`** in `next.config.ts` must list every `@workspace/*` package the app pulls in
  (incl. `web-ui` transitively via `ui`). Add new workspace deps there too.
- The app's own `components.json` adds shadcn components into the **app** (`@/components`) when they're
  app-specific; shared components belong in `@workspace/ui` (wrapping `web-ui`).
- Web theme tokens come from `@workspace/ui/globals.css` (imported in `app/layout.tsx`).
- **Page width:** Route `page.tsx` / layout shells should not wrap shared screens in narrow
  `max-w-*` containers. Full-width layout is defined in `@workspace/app` screens (root `AGENTS.md`
  §7, `packages/app/AGENTS.md`).
- `pnpm --filter web dev` to run; `pnpm --filter web test:e2e` for Playwright E2E (install browsers
  first with `pnpm --filter web exec playwright install chromium`); `pnpm --filter web typecheck`
  (lint/format run repo-wide via `pnpm lint` / `pnpm format` — Biome from the root, not per-package)
  before done.
