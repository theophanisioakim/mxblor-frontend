---
description: Format the codebase with Biome (pnpm format) and report what changed.
allowed-tools: Bash(pnpm format:*), PowerShell(pnpm:*), Bash(git status:*), Bash(git diff:*)
---

Run `pnpm format` (Biome `check --write --unsafe` — no semicolons, double quotes, Tailwind class
sorting via `useSortedClasses`, plus import organizing and safe+unsafe autofixes).

After it runs, summarize which files changed (`git status --short`). Don't reformat vendored or
generated trees by hand — `pnpm format` already scopes correctly via `biome.json` (vendored component
trees and the Orval-generated client are excluded from linting; the latter is formatted by Orval).
