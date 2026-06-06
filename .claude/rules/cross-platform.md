---
paths:
  - "**/*.native.ts"
  - "**/*.native.tsx"
---

# Cross-platform `.native` file — keep it paired and API-compatible

You are editing a **native** platform file. Platform selection in this repo is by **file extension**,
resolved at build time (root `AGENTS.md` §6):

- `foo.native.ts(x)` → React Native (Metro). Its sibling `foo.ts(x)` → web (Next/webpack). A plain
  `foo.ts(x)` with no `.native` sibling is shared by both.

Rules:

- **Keep the pair API-compatible.** The `.native` file must export the **same names and a compatible
  type contract** as its web sibling, so shared code (`@workspace/app`, other packages) works
  unchanged on both platforms.
- **Don't branch on platform in shared code.** Push the difference into the `.native` split, not into
  `if (Platform.OS === ...)` inside an otherwise-shared file.
- For `@workspace/ui` primitives, also follow `.claude/rules/ui-abstraction.md` (web wraps `web-ui`,
  native wraps `native-ui`, both registered in `index.ts`).
- Native styling uses **NativeWind (Tailwind v3)** — prefer the design-token classes that both theme
  layers define; use `Platform.select({ web: ... })` for web-on-native-only styles.
