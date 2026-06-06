---
description: Run TypeScript typecheck across the workspace (pnpm typecheck).
allowed-tools: Bash(pnpm typecheck:*), PowerShell(pnpm:*), Bash(pnpm --filter:*)
argument-hint: "[--filter <workspace>]  e.g. --filter @workspace/ui"
---

Run `pnpm typecheck $ARGUMENTS` (Turbo runs `tsc --noEmit` per workspace).

- Narrow to one workspace with `pnpm --filter @workspace/ui typecheck`.
- Packages ship `.ts` source via their `exports`, so type errors in a shared package break its
  consumers — fix at the source.
- Report the failing files/lines, not just pass/fail.
