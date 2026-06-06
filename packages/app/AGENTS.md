# `@workspace/app` — shared cross-platform screens

> Layer rules for this package. The root **`AGENTS.md`** (§2) is authoritative.

## What this is

The **write-once screens** consumed by **both** `apps/web` and `apps/native`. A screen lives here
once and renders on both platforms because it builds **only** on `@workspace/ui` primitives, which
resolve to the right platform implementation at build time.

Layout: `src/screens/<name>-screen.tsx`, re-exported from `src/index.ts` (and via the
`./screens/*` export). See `home-screen.tsx` for the pattern.

## ⛔ Rules

- **Build screens from `@workspace/ui` only.** Never import `@workspace/web-ui` or
  `@workspace/native-ui` here (root `AGENTS.md` §2 rule 1) — that would bind a "shared" screen to one
  platform. If a primitive you need isn't in `ui` yet, add it there (synchronized pair) first.
- **No platform branching in screen code.** Push platform differences down into `ui` primitives (the
  `.tsx` / `.native.tsx` split), or into `storage`/`api-client`/`i18n`. A screen file should read the
  same regardless of target.
- May use `@workspace/api-client` (data) and `@workspace/i18n` (text) — both are cross-platform.
- Keep the public surface typed; consumers import from `@workspace/app`.
