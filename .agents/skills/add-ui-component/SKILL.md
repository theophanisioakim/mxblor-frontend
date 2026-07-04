---
description: Add a synchronized cross-platform component to @workspace/ui that wraps the shadcn (web-ui) and react-native-reusables (native-ui) implementations, with matching exports, props, and behavior. Use when the user wants to expose a new shared UI primitive to screens/apps, or to bring an existing shadcn/rnr component into the abstraction layer.
argument-hint: <Name>   e.g. Card   (PascalCase component; lowercase kebab file name)
---

Add the cross-platform primitive **$ARGUMENTS** to `@workspace/ui`. `@workspace/ui` is the **only**
package allowed to import `@workspace/web-ui` / `@workspace/native-ui`; everything else consumes UI
through it (root `AGENTS.md` §2, §4).

### Before writing

1. Read `packages/ui/AGENTS.md`, `packages/web-ui/AGENTS.md`, `packages/native-ui/AGENTS.md`, and
   `.claude/rules/ui-abstraction.md`. Use `checklist.md` in this skill dir as the per-file checklist.
2. Confirm both source components exist:
   - `packages/web-ui/src/components/ui/<name>.tsx` (shadcn)
   - `packages/native-ui/src/components/ui/<name>.tsx` (rnr)
     If one is missing, add it via the CLI — `pnpm shadcn-update` or `pnpm rnr-update` — but **ask the
     user first**, because both run `--all --overwrite` and replace every vendored file. Never hand-write
     a vendored component.
3. Read both source components to learn their exported names, props, and helper exports
   (e.g. `buttonVariants`, `*Variants`, context providers).

### Create the synchronized pair

Mirror the existing `button.tsx` / `button.native.tsx`:

- `packages/ui/src/components/<name>.tsx` — **web**: import from `@workspace/web-ui/components/...`,
  re-export with a thin wrapper (pass props through).
- `packages/ui/src/components/<name>.native.tsx` — **native**: import from
  `@workspace/native-ui/components/ui/...`, re-export the same names.
- Register every export (component + helpers + types) in `packages/ui/src/index.ts`.

### Parity requirements (root `AGENTS.md` §4)

- **Same exported names** from both variants (component, helpers, types).
- **Same prop names & meaning** — the contract a screen sees must match, even if the type _source_
  differs per platform.
- **Same business logic** wherever the platform allows; only DOM-vs-`Pressable`-style irreducible
  differences may diverge.
- **Theme-token Tailwind classes** valid on both Tailwind v4 (web) and NativeWind v3 (native).
- **Shared props file** — if the component declares its own prop type, define it once in
  `<name>.shared.ts` (or `.shared.tsx`) and import it from both variants. Never copy-paste the type.
- **All component functions must accept `Readonly<Props>`** — wrap the props parameter with the
  `Readonly<>` utility in every component function signature, in both variants. Example:
  `export function Button(props: Readonly<ButtonProps>)`.
- **Shared logic** — any state, derived values, or event handlers that don't call platform APIs must
  live in the shared file or a `use-<name>.shared.ts` hook, not be duplicated across variants.

### Finish

- `pnpm --filter @workspace/ui typecheck` (and `pnpm format`).
- Optionally run the `ui-sync-reviewer` agent to confirm parity.
- Report the files created/changed and the typecheck result.
