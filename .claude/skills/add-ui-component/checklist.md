# `@workspace/ui` component parity checklist

Use for every primitive added to or changed in `@workspace/ui`.

## Files

- [ ] `packages/ui/src/components/<name>.tsx` exists (web variant).
- [ ] `packages/ui/src/components/<name>.native.tsx` exists (native variant).
- [ ] Both are registered in `packages/ui/src/index.ts` (component + helpers + `export type`).

## Boundary

- [ ] Web variant imports only from `@workspace/web-ui/components/...` (+ `@workspace/ui/lib`).
- [ ] Native variant imports only from `@workspace/native-ui/components/ui/...` (+ `@workspace/ui/lib`).
- [ ] Neither variant imports the other platform's library.
- [ ] No package outside `packages/ui` imports `web-ui`/`native-ui` because of this change.

## API parity

- [ ] Same exported component name from both variants.
- [ ] Same helper exports from both (e.g. `*Variants`, context providers) — or intentionally omitted
      and documented.
- [ ] Same `export type` names (prop types) from both.
- [ ] Prop names and their meaning match across variants (type _source_ may differ per platform).

## Behavior parity

- [ ] State, event handlers, variant selection, conditional rendering are equivalent.
- [ ] Only irreducibly platform-specific bits differ (DOM element vs. `Pressable`, `<span>` vs. rnr
      `Text`, hover vs. press, `Platform.select` web-only styles).
- [ ] Any behavior customization lives in the wrapper, **not** in the vendored `web-ui`/`native-ui`
      source.

## Styling

- [ ] Uses theme-token Tailwind classes valid on both Tailwind v4 (web) and NativeWind v3 (native).

## Verify

- [ ] `pnpm --filter @workspace/ui typecheck` passes.
- [ ] `pnpm format` run.
- [ ] (Optional) `ui-sync-reviewer` agent reports no parity gaps.
