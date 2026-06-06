---
description: Run the full CI gate (pnpm check:all = generate -> format -> typecheck -> lint -> build).
allowed-tools: Bash(pnpm check:all), PowerShell(pnpm:*)
---

Run `pnpm check:all` — the full gate in order: **generate → format → typecheck → lint → build**.

- This is the same sequence CI / a reviewer expects to pass. Run it before declaring multi-file work
  done.
- Note that it runs `generate` first (refreshes the Orval client) and `format` (may modify files) —
  if it changes generated/formatted files, that's expected; review the diff.
- Report the first failing stage with its key error lines; don't claim a pass unless every stage
  succeeded.
