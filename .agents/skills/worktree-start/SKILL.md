---
name: worktree-start
description: Start a new feature in an isolated git worktree on its own feat/<feature-name> branch, in a sibling directory of the repo root. Use ONLY after the user has confirmed (per AGENTS.md §12) they want a worktree rather than working directly on main.
---

<!-- Purpose: create an isolated worktree + branch for a new feature. Canonical body; .claude/skills/worktree-start is a thin stub. -->

# Start a feature in a new worktree

**Trigger:** the user has been asked "Work on this in a dedicated worktree, or directly on main?"
(AGENTS.md §12) and **confirmed they want a worktree** for a new feature. If they have not confirmed,
do not run this — ask first.

**Naming (AGENTS.md §12):**

- Branch: `feat/<feature-name>`
- Worktree directory: sibling of the repo root, `../<repo-name>-<feature-name>` (`<repo-name>` is
  the basename of the repo root directory — for this repo, `react-mono-core`).

**Constraint:** git will not check out the same branch in two worktrees, so the new worktree gets its
own `feat/<feature-name>` branch — never `main`.

## Steps

```bash
# 1. From the repo root — create the branch and its sibling worktree in one command:
git worktree add -b feat/<feature-name> ../<repo-name>-<feature-name>

# 2. Move into the new worktree:
cd ../<repo-name>-<feature-name>

# 3. Do all work for this feature here. Commit locally as you go.
#    Do NOT push unless the user explicitly asks.
```

When the feature is done: land it with **worktree-merge** (commits on `main`), **worktree-soft-merge**
(staged diff on `main`, no commit), or throw it away with **worktree-discard**.
