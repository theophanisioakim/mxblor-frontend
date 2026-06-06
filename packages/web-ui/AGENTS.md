# `@workspace/web-ui` — shadcn/ui components (VENDORED, web-only)

> Layer rules for this package. The root **`AGENTS.md`** (§2, §4) is authoritative; this adds the
> package-specific detail. Read the root guide first.

## What this is

The complete set of **shadcn/ui** components for the **web** (Next.js / React DOM), added by the
shadcn CLI. Styling is **Tailwind v4** (`src/styles/globals.css`). Config lives in `components.json`.
Components are under `src/components/ui/`; the `cn` helper under `src/lib/`.

## ⛔ Boundary

- **Private to `@workspace/ui`.** Nothing outside `packages/ui` may import `@workspace/web-ui`.
  Screens and apps consume the web variant **only** through `@workspace/ui`. (The web app's
  `transpilePackages` listing it is fine — that's the bundler following the transitive `ui` → `web-ui`
  edge, not a direct import.)

## ⚠️ This is vendored / CLI-managed — don't edit unless absolutely necessary

- `pnpm shadcn-update` runs `shadcn add -c packages/web-ui --all --overwrite`, which **overwrites
  every component file here**. Any hand-edit is lost on the next run and desyncs the component from
  its upstream registry.
- **Adding a new** shadcn component (one not yet present) via the CLI is fine and expected.
  **Modifying an existing** vendored component is what to avoid.
- Need different behavior or styling? Do it in the **`@workspace/ui`** wrapper, not here. If a fix
  genuinely must live in the vendored file, keep it minimal, flag it explicitly, and document it so
  the next CLI run doesn't silently revert it.

## Conventions

- Match shadcn output exactly: `cva` variants, `data-slot`/`data-*` attributes, `cn(...)` class
  merging, `radix-ui` / `@base-ui/react` primitives.
- Import the helper as `@workspace/web-ui/lib/utils` (`cn`). Use the `exports` subpaths, not relative
  cross-package paths.
- Biome: no semicolons, double quotes, Tailwind class sorting. Run `pnpm format`. (Component files
  under `src/components/**` are formatted but not linted — they're vendored; AGENTS.md §4.)
