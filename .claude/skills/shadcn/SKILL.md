---
name: shadcn
description: Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset".
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
---

<!-- Thin pointer: the canonical copy (with its rules/, docs, and assets) lives in .agents/skills/shadcn/. -->

Read `.agents/skills/shadcn/SKILL.md` and follow it, resolving its relative references
(`rules/*.md`, `cli.md`, `registry.md`, `customization.md`, `mcp.md`) inside
`.agents/skills/shadcn/`.

## Current Project Context

```json
!`npx shadcn@latest info --json`
```
