---
name: import-core-commits
description: "Import commits whose subjects start exactly with core: from a selected child repository into a chosen react-mono-core branch. Use from react-mono-core when core changes were committed in a child project and need to be cherry-picked back. Ask for the child repository or remote, child source branch, and core destination branch; do nothing outside the matching core repository."
---

# Import core commits from a child repository

Cherry-pick eligible `core:` commits from one child repository branch into a chosen local
`react-mono-core` branch.

## 1. Enforce the core-only guard

Before asking for a child repository, fetching, switching branches, or changing Git state, inspect
the repository root name and the repository name in the `origin` URL.

Proceed only when either identifies `react-mono-core`. Otherwise, report that this workflow is
core-only and stop successfully. Do not fetch, checkout, cherry-pick, commit, or push.

## 2. Require the repository and branches

Ask the user for all three values and wait for the answer:

- the child repository, identified by an existing remote alias or exact repository name
- the child source branch containing the `core:` commits
- the local `react-mono-core` destination branch that should receive them

Treat all three values explicitly included in the invocation as the answer. Never infer a child
remote, the current branch, or `main`.

## 3. Run preflight checks

1. Require a clean index and worktree. If changes exist, stop and ask the user to commit or stash
   them; never stash automatically.
2. Inspect `git remote -v` and resolve the selected child repository to one existing remote. The
   remote must not point to `react-mono-core` or `springboot-core`.
3. If no remote matches, stop and ask the user to configure it. Do not invent a URL or add a remote.
   If several match, ask which alias to use.
4. Verify that the destination is an existing local branch. Inspect `git worktree list` and stop if
   that branch is checked out in another worktree.
5. Fetch the child source branch explicitly:

   ```bash
   git fetch <child-remote> refs/heads/<source>:refs/remotes/<child-remote>/<source>
   ```

6. Verify that the fetched source exists. Do not create or update any child branch.

## 4. Select only eligible commits

List commits reachable from the fetched child source but not from the core destination, oldest
first:

```bash
git log --reverse --topo-order --format="%H%x09%s" <destination>..<child-remote>/<source>
```

Select a commit only when the text after the tab starts exactly with the case-sensitive prefix
`core:`. Do not select a commit merely because `core:` appears later in its subject or body.

Use `git cherry -v <destination> <child-remote>/<source>` to detect patch-equivalent changes already
present in core, and omit only entries Git marks as equivalent. Never silently omit a distinct
`core:` commit. Preserve the selected commits' chronological/topological order.

Show the selected hashes and subjects before continuing. If none remain, report that there is
nothing to import and stop without switching branches or creating commits. If a selected commit is
a merge commit, stop and ask which mainline parent to use; never guess.

## 5. Cherry-pick into core

Switch to the user-selected destination branch:

```bash
git switch <destination>
```

Cherry-pick only the selected hashes, oldest first. Never cherry-pick child-only commits to make a
selected commit apply. Resolve straightforward conflicts according to `AGENTS.md`; if a conflict
requires product or architecture judgment, stop with the cherry-pick state intact and ask the user.
Do not abort, skip, reset, or discard either side silently.

Run the full React core validation gate (`pnpm check:all`) after the cherry-picks succeed. Do not
start applications, dev servers, devices, emulators, or forbidden end-to-end runs. If validation
fails, leave the imported commits and worktree intact, report the failure, and do not push.

Report the child repository and branch, imported hashes and subjects, destination branch, conflicts,
and validation result. Do not push unless the user separately asks.
