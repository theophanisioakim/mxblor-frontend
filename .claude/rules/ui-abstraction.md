---
paths:
  - "packages/ui/src/components/**"
---

# `@workspace/ui` primitive — keep the web/native pair in sync

You are editing the **cross-platform abstraction layer** (root `AGENTS.md` §4, `packages/ui/AGENTS.md`).
This is the **only** package allowed to import `@workspace/web-ui` / `@workspace/native-ui`.

When you add or change a primitive:

1. **Update both variants together** — `<name>.tsx` (web, wraps `web-ui`) and `<name>.native.tsx`
   (native, wraps `native-ui`). Never ship one without the other.
2. **Register it in `packages/ui/src/index.ts`** so consumers `import { X } from "@workspace/ui"`.
3. **Identical public API** across the pair: same exported component & helper names, same prop names
   and meaning. Type sources may differ per platform; the contract the screen sees must match.
4. **Same business logic wherever the platform allows** — write each behavior once; only the
   irreducibly platform-specific bits differ (DOM vs. `Pressable`, `<span>` vs. rnr `Text`, hover vs.
   press).
5. **Theme-token Tailwind classes** valid in both Tailwind v4 (web) and NativeWind/Tailwind v3
   (native): `bg-primary`, `text-foreground`, `border-border`, …
6. **Customize here, not in the vendored source.** Changes to a shadcn/rnr component's behavior or
   styling belong in this wrapper, never in `web-ui`/`native-ui` (which get overwritten).

Follow `button.tsx` / `button.native.tsx` as the canonical pattern.
