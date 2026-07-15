---
name: "source-command-check"
description: "Run the full CI gate with pnpm check:all: generate → format → typecheck → lint → build."
---

# source-command-check

Use this skill when the user asks to run the migrated source command `check`.

## Command Template

Run `pnpm check:all` — the full gate in order: **generate → format → typecheck → lint → build**.

- This is the same sequence CI / a reviewer expects to pass. Run it before declaring multi-file work
  done.
- Note that it runs `generate` first (refreshes the Orval client) and `format` (may modify files) —
  if it changes generated/formatted files, that's expected; review the diff.
- Report the first failing stage with its key error lines; don't claim a pass unless every stage
  succeeded.
