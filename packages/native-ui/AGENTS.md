# `@workspace/native-ui` — react-native-reusables components (VENDORED, native-only)

> Layer rules for this package. The root **`AGENTS.md`** (§2, §4) is authoritative; this adds the
> package-specific detail. Read the root guide first.

## What this is

The complete set of **react-native-reusables (rnr)** components for **native** (React Native + Expo),
added by the rnr CLI. Styling is **NativeWind v4 on Tailwind v3** (`catalog:tailwind3`). Components
are under `src/components/ui/`; the `cn` helper under `src/lib/`. Built on `@rn-primitives/*`
unstyled primitives. `Text` exposes `TextClassContext` so wrappers (e.g. `Button`) can color labels.

## ⛔ Boundary

- **Private to `@workspace/ui`.** Nothing outside `packages/ui` may import `@workspace/native-ui`.
  Screens and the native app consume the native variant **only** through `@workspace/ui`.
- Native overlay hosting is owned by `@workspace/providers`, which imports
  `@rn-primitives/portal` for `PortalHost`. Do not add `@workspace/native-ui` as an app dependency.

## ⚠️ This is vendored / CLI-managed — don't edit unless absolutely necessary

- `pnpm rnr-update` runs `@react-native-reusables/cli add -c packages/native-ui --all --overwrite`,
  which **overwrites every component file here**. Hand-edits are lost on the next run.
- **Adding a new** rnr component via the CLI is fine. **Modifying an existing** vendored component is
  what to avoid — customize in the **`@workspace/ui`** wrapper instead. If a fix must live here, keep
  it minimal, flag it, and document it.

## Conventions

- rnr/NativeWind idioms: `cva` + `Platform.select({ web: ... })` for web-on-native styling,
  `Pressable`/`View`/rnr `Text`, `TextClassContext` for label colors, `role`/accessibility props.
- Import the helper as `@workspace/native-ui/lib/utils` (`cn`). Tailwind classes must be valid for
  NativeWind (Tailwind v3) — prefer the design tokens defined in `apps/native/tailwind.config.js`.
- Biome: no semicolons, double quotes, Tailwind class sorting. Run `pnpm format`. (Component files
  under `src/components/**` are formatted but not linted — they're vendored; AGENTS.md §4.)
