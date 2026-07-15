---
name: push-to-upstream
description: "Safely contribute child-repository commits whose subjects start exactly with core: back to react-mono-core. Use when asked to push or contribute core changes from a React child project upstream. Ask for the child source branch and upstream destination branch, replay only matching commits onto the fetched upstream tip, validate, and push without force; do nothing inside either core repository."
---

# Push core commits upstream

Transfer only commits whose subject starts exactly with `core:` from a child repository branch to a
chosen branch in `react-mono-core`.

## 1. Enforce the core-repository no-op

Before asking for branches, fetching, creating a worktree, or changing Git state, inspect the
repository root name and the repository name in the `origin` URL.

If either identifies `react-mono-core` or `springboot-core`, report that this workflow applies only
to child repositories and stop successfully. Do not fetch, checkout, cherry-pick, commit, or push.

## 2. Require both branches

Ask the user for both branch names and wait for the answer:

- the child repository source branch containing the `core:` commits
- the `react-mono-core` destination branch that should receive them

Treat two branches explicitly included in the invocation as the answer. Never infer the current
branch or `main`.

## 3. Run preflight checks

1. Inspect `git remote -v` and find the remote whose URL repository name is exactly
   `react-mono-core`. The remote alias may be any name.
2. If none exists, stop and ask the user to configure the core remote. Do not invent a URL or add a
   remote. If several match, ask which alias to use.
3. Verify that the source is an existing local branch. Do not rewrite or commit on that branch.
4. Fetch the destination branch explicitly:

   ```bash
   git fetch <core-remote> refs/heads/<destination>:refs/remotes/<core-remote>/<destination>
   ```

5. Stop if the destination does not exist upstream. Creating a new upstream branch requires a
   separate explicit user request.

## 4. Select only eligible commits

List commits reachable from the source branch but not from the fetched destination, oldest first:

```bash
git log --reverse --topo-order --format="%H%x09%s" <core-remote>/<destination>..<source>
```

Select a commit only when the text after the tab starts exactly with the case-sensitive prefix
`core:`. Do not select a commit merely because `core:` appears later in its subject or body.

Use `git cherry -v <core-remote>/<destination> <source>` to detect patch-equivalent changes already
present upstream, and omit only entries Git marks as equivalent. Never silently omit a distinct
`core:` commit. Preserve the selected commits' chronological/topological order.

Show the selected hashes and subjects before continuing. If none remain, report that there is
nothing to push and stop without creating a branch, worktree, or remote update. If a selected commit
is a merge commit, stop and ask which mainline parent to use; never guess.

## 5. Replay in an isolated temporary worktree

Create a uniquely named temporary branch and worktree from the fetched destination tip. Keep the
user's current branch and worktree untouched.

```bash
git worktree add -b <temporary-branch> <temporary-path> <core-remote>/<destination>
```

Cherry-pick only the selected hashes, oldest first. Resolve straightforward conflicts according to
the repository instructions. If a conflict needs product or architecture judgment, stop with the
temporary worktree intact and ask the user. Never cherry-pick child-only commits to make a selected
commit apply.

Run the inherited React validation gate in the temporary worktree (`pnpm check:all`, unless the
child's `AGENTS.md` requires a stricter command). Do not push when validation fails.

## 6. Push without rewriting upstream

Fetch the destination again immediately before pushing. If it advanced, replay/rebase the temporary
commits onto the new fetched tip and rerun validation. Then push only the temporary HEAD:

```bash
git push <core-remote> HEAD:refs/heads/<destination>
```

Never use `--force`, `--force-with-lease`, or a refspec that includes the child source branch. If the
push is rejected, preserve the temporary worktree, report the rejection, and do not bypass branch
protection.

After a successful push, remove only the temporary worktree and temporary branch created by this
run. Never delete or alter the child source branch. Report the pushed hashes/subjects, destination,
validation result, and cleanup result.
