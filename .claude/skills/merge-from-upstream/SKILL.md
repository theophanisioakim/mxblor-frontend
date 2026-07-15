---
description: Merge a user-selected react-mono-core tag or branch into the current branch of a child repository. Does nothing in either core repository.
argument-hint: <tag|branch> <ref-name>
---

<!-- Thin pointer: the canonical, tool-agnostic skill lives in .agents/skills/. -->

Read `.agents/skills/merge-from-upstream/SKILL.md` and follow it exactly for **$ARGUMENTS**. Require
an explicit tag or branch and ref name; never infer one. Exit without Git mutation when the
repository is `react-mono-core` or `springboot-core`.
