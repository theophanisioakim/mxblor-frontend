---
description: Push only core-prefixed child commits to a chosen react-mono-core branch without force. Does nothing in either core repository.
argument-hint: <child-source-branch> <core-destination-branch>
---

<!-- Thin pointer: the canonical, tool-agnostic skill lives in .agents/skills/. -->

Read `.agents/skills/push-to-upstream/SKILL.md` and follow it exactly for **$ARGUMENTS**. Require an
explicit child source branch and upstream destination branch; never infer either. Transfer only
commits whose subject starts exactly with `core:` and never force-push.
