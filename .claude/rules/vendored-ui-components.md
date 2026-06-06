---
paths:
  - "packages/web-ui/src/components/**"
  - "packages/native-ui/src/components/**"
---

# Vendored UI component — don't hand-edit unless absolutely necessary

You are editing a file in **`@workspace/web-ui`** (shadcn/ui) or **`@workspace/native-ui`**
(react-native-reusables). These are **CLI-vendored** component libraries (root `AGENTS.md` §4).

- `pnpm shadcn-update` / `pnpm rnr-update` run with `--all --overwrite` — they **replace every
  component file here**. Any manual edit is **lost on the next run** and desyncs the component from
  its upstream registry.
- **Adding a new** component the CLI supports (not yet present) is fine — that's what the CLI is for.
  **Modifying an existing** vendored component is what to avoid.
- Need different behavior or styling? Do it in the **`@workspace/ui`** wrapper (the abstraction
  layer), not here. These packages are **private to `@workspace/ui`** — nothing else may import them.
- If a change truly must live in the vendored file (e.g. a genuinely broken registry component), keep
  it minimal, call it out explicitly, and document it so the next CLI run doesn't silently revert it.

The PreToolUse guard will **ask for confirmation** before it lets you edit these files.
