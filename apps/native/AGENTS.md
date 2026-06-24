# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

---

# `apps/native` — Expo SDK 55 / React Native 0.83 app

> Layer rules for this app. The root **`AGENTS.md`** is authoritative; this adds app-specific detail.

## What this is

The native consumer (Expo SDK 55, RN 0.83 **New Architecture**, expo-router, NativeWind v4). It
renders the same shared screens from `@workspace/app`; UI comes through `@workspace/ui`; data
through `@workspace/api-client`; app-shell provider composition comes through
`@workspace/providers`.

Layout: `src/app/` (expo-router routes — `_layout.tsx`, `index.tsx`), `src/global.css` (NativeWind
input), `__tests__/` (Jest + React Native Testing Library startup/component tests),
`jest.config.js`, root `.maestro/` flows (Maestro E2E), `metro.config.js`, `tailwind.config.js`
(v3 + nativewind preset), `babel.config.js`, `app.json`, `plugins/withMonorepoRoot.js`,
`components.json`.

## Rules

- **Consume UI via `@workspace/ui`**, screens via `@workspace/app`, and shared navigation via
  `@workspace/router`. Do **not** import `@workspace/native-ui` directly (root `AGENTS.md` §2 rule
  1).
- Root provider composition comes from `@workspace/providers` via `src/app/_layout.tsx`. Keep shared
  cross-platform providers there; keep only truly native-only shell providers in this app.
- Shared screens should not import `expo-router`; use `@workspace/router`. App-local route/layout
  files can still use Expo Router primitives for native-only shell behavior, such as `Stack`.
  - Native overlay hosting is provided by `@workspace/providers`, which owns the
    `@rn-primitives/portal` dependency for `PortalHost`.
- **Metro monorepo setup** (`metro.config.js`) watches the workspace root and uses
  `nodeLinker: hoisted` (set in `pnpm-workspace.yaml`) — required for the RN New-Arch C++ build on
  Windows path-length limits. Don't undo it.
- **Tailwind content globs** in `tailwind.config.js` must include any new workspace package whose
  classes need compiling (currently `ui`, `native-ui`, `app`, `providers`). NativeWind input is
  `src/global.css`.
- **Page width:** Expo route files should not wrap shared screens in narrow `max-w-*` containers.
  Full-width layout is defined in `@workspace/app` screens (root `AGENTS.md` §7,
  `packages/app/AGENTS.md`).
- A single React / React Native version is enforced via the catalog + `overrides`
  (`react`, `react-dom`, `react-native` in `pnpm-workspace.yaml`) — never introduce a second copy.
  The `react` override exists because `react-native-mmkv` / `react-native-nitro-modules` otherwise
  pull a newer nested React; keep the overrides in lockstep with the catalog versions.
- `pnpm --filter native start` (Metro); `pnpm --filter native test` (Jest startup/component tests);
  `pnpm --filter native test:e2e` (Maestro; requires the app installed on an emulator/simulator and
  the Maestro CLI); `prebuild` / `android` / `ios` for native builds;
  `pnpm --filter native typecheck` before done (lint/format run repo-wide via `pnpm lint` /
  `pnpm format` — Biome from the root, not per-package).
