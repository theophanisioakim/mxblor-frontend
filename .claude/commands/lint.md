---
description: Lint the workspace (pnpm lint).
allowed-tools: Bash(pnpm lint:*), PowerShell(pnpm:*), Bash(pnpm --filter:*)
argument-hint: "[--filter <workspace>]"
---

Run `pnpm lint $ARGUMENTS` (ESLint flat config per workspace).

- `eslint-plugin-only-warn` surfaces issues as warnings — treat warnings on code you touched as
  must-fix (root `AGENTS.md` §7).
- Narrow with `pnpm --filter web lint`.
- Report the findings with file:line; don't suppress rules to silence them without approval.
