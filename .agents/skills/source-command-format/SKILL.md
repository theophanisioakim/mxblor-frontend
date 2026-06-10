---
name: "source-command-format"
description: "Format the codebase with Biome (pnpm format) and report what changed."
---

# source-command-format

Use this skill when the user asks to run the migrated source command `format`.

## Command Template

Run `pnpm format` (Biome `check --write --unsafe` — no semicolons, double quotes, Tailwind class
sorting via `useSortedClasses`, plus import organizing and safe+unsafe autofixes).

After it runs, summarize which files changed (`git status --short`). Don't reformat vendored or
generated trees by hand — `pnpm format` already scopes correctly via `biome.json` (vendored component
trees and the Orval-generated client are excluded from linting; the latter is formatted by Orval).
