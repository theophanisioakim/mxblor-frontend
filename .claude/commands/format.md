---
description: Format the codebase with Prettier (pnpm format) and report what changed.
allowed-tools: Bash(pnpm format:*), PowerShell(pnpm:*), Bash(git status:*), Bash(git diff:*)
---

Run `pnpm format` (Prettier — no semicolons, double quotes, Tailwind class sorting via
`prettier-plugin-tailwindcss`).

After it runs, summarize which files changed (`git status --short`). Don't reformat vendored or
generated trees by hand — `pnpm format` already scopes correctly per workspace.
