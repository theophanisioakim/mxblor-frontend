---
name: merge-from-upstream
description: Merge an explicitly selected tag or branch from react-mono-core into the current branch of a child repository. Use when asked to update or synchronize a React child project from its core upstream. Require the user to choose the tag or branch, validate the upstream remote, and do nothing when invoked inside react-mono-core or springboot-core.
---

# Merge from upstream

Merge one user-selected `react-mono-core` ref into the current branch of a child repository.

## 1. Enforce the core-repository no-op

Before asking for a ref, fetching, or changing Git state, inspect the repository root name and the
repository name in the `origin` URL.

If either identifies `react-mono-core` or `springboot-core`, report that this workflow applies only
to child repositories and stop successfully. Do not fetch, checkout, merge, commit, or push.

## 2. Require the upstream ref

Ask the user which upstream ref to merge and require both:

- ref type: `tag` or `branch`
- exact ref name

Wait for the answer. Treat a type and name explicitly included in the invocation as the answer, but
never infer `main`, the latest tag, or any other default.

## 3. Run preflight checks

1. Confirm the repository is a Git worktree on a local branch, not detached HEAD.
2. Require a clean index and worktree. If changes exist, stop and ask the user to commit or stash
   them; never stash automatically.
3. Inspect `git remote -v` and find the remote whose URL repository name is exactly
   `react-mono-core`. The remote alias may be any name.
4. If none exists, stop and ask the user to configure the core remote. Do not invent a URL or add a
   remote. If several match, ask which alias to use.

## 4. Fetch only the selected ref

For a branch, fetch it into its remote-tracking ref:

```bash
git fetch <core-remote> refs/heads/<branch>:refs/remotes/<core-remote>/<branch>
```

Use `refs/remotes/<core-remote>/<branch>` as the merge ref.

For a tag, fetch the exact tag:

```bash
git fetch <core-remote> refs/tags/<tag>:refs/tags/<tag>
```

Use `refs/tags/<tag>` as the merge ref. Never force-update a conflicting local tag; stop and report
the mismatch instead.

Verify that the fetched ref exists. Show the current branch, chosen upstream ref, and incoming
commits with `git log --oneline --decorate HEAD..<merge-ref>` before merging. If the selected ref is
already an ancestor of `HEAD`, report that the child is already up to date and stop without creating
a commit.

## 5. Merge and verify

Merge the fetched ref into the current branch without rewriting existing commits:

```bash
git merge --no-edit <merge-ref>
```

Never substitute rebase, squash, reset, or a force operation. Resolve straightforward conflicts in
accordance with the child repository's `AGENTS.md`; if the correct resolution is ambiguous, stop
with the merge state intact and ask the user. Do not discard either side silently.

Run the child repository's documented full validation gate after a successful merge. For an
unmodified inherited React workflow, use `pnpm check:all`. Do not start applications, dev servers,
devices, emulators, or end-to-end runs forbidden by the repository instructions.

Report the target branch, upstream ref, merge result, conflicts resolved or remaining, and the
validation result. Do not push unless the user separately asks.
