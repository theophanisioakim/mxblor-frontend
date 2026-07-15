---
name: worktree-merge
description: Merge a completed feature worktree's feat/<feature-name> branch into main from the main worktree, run the tests, then remove the worktree and delete the branch. Use when a worktree feature is finished and the user wants to keep its commits on main. For staged changes without a commit, use worktree-soft-merge instead.
---

<!-- Purpose: land a feature worktree into main and clean it up. Canonical body; .claude/skills/worktree-merge is a thin stub. -->

# Merge a worktree into main and delete it

**Trigger:** a feature developed in a worktree (see **worktree-start**) is complete and the user
wants to **keep** it.

**Constraint (AGENTS.md §12):** the merge must run from the **main worktree** — the directory that
has `main` checked out (the repo root) — not from the feature worktree.

## Steps

```bash
# 1. Move into the main worktree (the directory that has `main` checked out):
cd <path-to-main-worktree>

# 2. Merge the feature branch into main:
git merge feat/<feature-name>

# 3. Run the test suite (AGENTS.md §0 allows unit `test`):
pnpm test
#    If merging MULTIPLE feature branches, do them ONE AT A TIME — merge one, test it,
#    then move to the next — so any failure is traceable to a single branch.

# 4. On success, remove the worktree:
git worktree remove ../<repo-name>-<feature-name>

# 5. Delete the now-merged branch:
git branch -d feat/<feature-name>
```

If a merge conflict or test failure appears, resolve it before removing the worktree — do not delete
work that hasn't landed. Do not push unless the user asks.
