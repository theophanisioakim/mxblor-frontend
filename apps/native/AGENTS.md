# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

---

# `apps/native` — Expo SDK 55 / React Native 0.83 app

> Layer rules for this app. The root **`AGENTS.md`** is authoritative; this adds app-specific detail.

## What this is

The native consumer (Expo SDK 55, RN 0.83 **New Architecture**, expo-router, NativeWind v4). It
renders the same shared screens from `@workspace/app`; UI comes through `@workspace/ui`; data through
`@workspace/api-client`.

Layout: `src/app/` (expo-router routes — `_layout.tsx`, `index.tsx`), `src/global.css` (NativeWind
input), `metro.config.js`, `tailwind.config.js` (v3 + nativewind preset), `babel.config.js`,
`app.json`, `plugins/withMonorepoRoot.js`, `components.json`.

## Rules

- **Consume UI via `@workspace/ui`**, screens via `@workspace/app`. Do **not** import
  `@workspace/native-ui` directly (root `AGENTS.md` §2 rule 1).
  - **Cleanup:** `package.json` currently lists `@workspace/native-ui` as a dependency but nothing
    imports it — only `@rn-primitives/portal` (`PortalHost`, required by rnr overlay components) is
    used. Remove the unused `@workspace/native-ui` dependency.
- **Metro monorepo setup** (`metro.config.js`) watches the workspace root and uses
  `nodeLinker: hoisted` (set in `pnpm-workspace.yaml`) — required for the RN New-Arch C++ build on
  Windows path-length limits. Don't undo it.
- **Tailwind content globs** in `tailwind.config.js` must include any new workspace package whose
  classes need compiling (currently `ui`, `native-ui`, `app`). NativeWind input is `src/global.css`.
- A single React / React Native version is enforced via the catalog + `overrides.react-native`
  (`pnpm-workspace.yaml`) — never introduce a second copy.
- `pnpm --filter native start` (Metro); `prebuild` / `android` / `ios` for native builds;
  `pnpm --filter native typecheck` before done (lint/format run repo-wide via `pnpm lint` /
  `pnpm format` — Biome from the root, not per-package).
