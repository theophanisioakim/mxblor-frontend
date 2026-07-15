---
name: worktree-soft-merge
description: Squash-merge a completed feature worktree onto main as staged, uncommitted changes (no commit), run tests, then remove the worktree and delete the branch. Use when the user wants the feature diff on main for manual review or a single commit of their own.
---

<!-- Purpose: land a feature worktree onto main without creating commits. Canonical body; .claude/skills/worktree-soft-merge is a thin stub. -->

# Soft-merge a worktree onto main (staged, no commit)

**Trigger:** a feature developed in a worktree (see **worktree-start**) is complete and the user
wants to **keep the changes on `main`** but **not** land the worktree's commits as-is — they prefer
one staged diff to review, edit, test, and commit themselves.

**Contrast with worktree-merge:** that skill runs a normal `git merge` and creates merge/commits on
`main`. This skill uses `git merge --squash` so all feature-branch changes appear **staged and
uncommitted** on `main`.

**Constraint (AGENTS.md §12):** run from the **main worktree** (repo root with `main` checked out),
not from the feature worktree.

## Steps

```bash
# 1. Move into the main worktree:
cd <path-to-main-worktree>

# 2. Ensure you are on main with a clean merge target (stash or commit any WIP on main first):
git checkout main

# 3. Squash-merge the feature branch — stages all its changes, does NOT commit:
git merge --squash feat/<feature-name>

# 4. Run the test suite against the staged tree (AGENTS.md §0 allows unit `test`):
pnpm test
#    If soft-merging MULTIPLE feature branches, do them ONE AT A TIME.

# 5. On success, remove the worktree:
git worktree remove ../<repo-name>-<feature-name>

# 6. Delete the feature branch (squash does not mark it merged — use -D):
git branch -D feat/<feature-name>
```

## After the skill

- Changes are **staged** on `main`. The user (or agent, if asked) commits when ready.
- To leave changes **unstaged**, run `git reset` after step 3 — only if the user asks for that.
- Do **not** push unless the user explicitly asks.

If step 3 or 4 fails, **stop** — resolve conflicts or fix tests before removing the worktree.
