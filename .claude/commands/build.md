---
description: Build all workspaces via Turborepo (pnpm build).
allowed-tools: Bash(pnpm build:*), PowerShell(pnpm:*), Bash(pnpm --filter:*)
argument-hint: "[--filter <workspace>]  e.g. --filter web"
---

Run `pnpm build $ARGUMENTS` (Turbo `build` across the workspace graph).

- Turbo respects the dependency order and caches unchanged packages.
- To build one app/package: `pnpm --filter web build` / `pnpm --filter @workspace/ui build`.
- Report the real outcome: which workspace/task failed and the key error lines. If a workspace was a
  cache hit, that's fine to note but don't claim a build ran when it was cached.
