---
description: Scaffold a synchronized cross-platform primitive in @workspace/ui (web .tsx + native .native.tsx + index export).
argument-hint: "<Name>  e.g. Card   (PascalCase component name; lowercase file name)"
---

Add a new cross-platform primitive **$ARGUMENTS** to `@workspace/ui`, wrapping the matching
`@workspace/web-ui` (shadcn) and `@workspace/native-ui` (rnr) components. This delegates to the
`/add-ui-component` skill — follow its parity checklist.

Before writing:

1. Read `packages/ui/AGENTS.md`, `packages/web-ui/AGENTS.md`, `packages/native-ui/AGENTS.md` and
   `.claude/rules/ui-abstraction.md`.
2. Confirm both source components exist: `packages/web-ui/src/components/ui/<name>.tsx` and
   `packages/native-ui/src/components/ui/<name>.tsx`. If one is missing, add it via the CLI
   (`pnpm shadcn-update` / `pnpm rnr-update` — **ask first**, they overwrite all vendored files),
   not by hand.

Create, mirroring the existing `button` pair:

- `packages/ui/src/components/<name>.tsx` — web variant wrapping `@workspace/web-ui`.
- `packages/ui/src/components/<name>.native.tsx` — native variant wrapping `@workspace/native-ui`.
- Register both exports (component + helpers + types) in `packages/ui/src/index.ts`.

Keep **identical exported names, props, and behavior** across the pair (root `AGENTS.md` §4). Finish
with `pnpm --filter @workspace/ui typecheck` and report what you created.
