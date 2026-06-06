---
description: Lint the workspace (pnpm lint).
allowed-tools: Bash(pnpm lint:*), PowerShell(pnpm:*), Bash(pnpm --filter:*)
argument-hint: "[--filter <workspace>]"
---

Run `pnpm lint $ARGUMENTS` (Biome, single root `biome.json`).

- `pnpm lint` (`biome lint`) fails on errors; `pnpm lint:strict` (`--error-on-warnings`) also fails on
  warnings — treat warnings on code you touched as must-fix (root `AGENTS.md` §7).
- Narrow with `pnpm --filter web lint`.
- Report the findings with file:line; don't suppress rules (`biome-ignore`) to silence them without
  approval.
