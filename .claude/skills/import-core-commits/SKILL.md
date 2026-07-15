---
description: Import core-prefixed commits from a chosen child repository into react-mono-core. Runs only from the matching core repository.
argument-hint: <child-repo-or-remote> <child-source-branch> <core-destination-branch>
---

<!-- Thin pointer: the canonical, tool-agnostic skill lives in .agents/skills/. -->

Read `.agents/skills/import-core-commits/SKILL.md` and follow it exactly for **$ARGUMENTS**. Require
the child repository/remote, child source branch, and core destination branch; never infer them.
Cherry-pick only commits whose subjects start exactly with `core:` and do not push unless separately
asked.
