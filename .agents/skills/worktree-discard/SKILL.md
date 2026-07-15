---
name: worktree-discard
description: Abandon a feature worktree and throw its work away by force-removing the sibling worktree and force-deleting its unmerged feature branch from the main worktree. Use when the user wants to discard a worktree feature without merging.
---

<!-- Purpose: destroy a feature worktree and its branch. Canonical body; .claude/skills/worktree-discard is a thin stub. -->

# Discard a worktree without merging

**Trigger:** a feature developed in a worktree (see **worktree-start**) is being **abandoned**; its
work should be **thrown away** (not merged).

**Constraint (AGENTS.md §12):** run this from the **main worktree** — the directory that has `main`
checked out (the repo root). This is destructive: the branch's commits are discarded.

## Steps

```bash
# 1. Move into the main worktree:
cd <path-to-main-worktree>

# 2. Force-remove the worktree (--force handles uncommitted changes inside it):
git worktree remove --force ../<repo-name>-<feature-name>

# 3. Force-delete the unmerged branch (capital -D force-deletes unmerged work):
git branch -D feat/<feature-name>

# 4. Optional — clear any stale worktree metadata:
git worktree prune
```

Because this permanently drops the branch's commits, confirm with the user that the work is truly
meant to be discarded before running it.
