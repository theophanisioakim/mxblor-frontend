---
name: add-screen
description: Add a feature end-to-end through every layer of react-mono-core — data hooks, ui primitives if needed, a shared screen in @workspace/app, web + native routes, i18n keys, and navigation — finishing with the full gate. Use when asked to add a new page/screen/feature that must work on both web and native.
---

<!-- Purpose: the repeatable cross-layer procedure for shipping a new screen/feature to both apps. -->

# Add a screen / feature end-to-end

Obey the layering in root `AGENTS.md` §2 at every step: dependencies flow downward only, UI goes
through `@workspace/ui`, platform differences are resolved by file extension — never runtime
branching in shared code.

## 1. Data layer (`@workspace/api-client`)

Check whether the React Query hooks you need already exist (`packages/api-client/src/generated/`,
imported from `@workspace/api-client`). If not: the backend spec is the source of truth — refresh
`openapi.json` from `springboot-core`, run `pnpm generate`, and never hand-edit `src/generated/**`
(AGENTS.md §5).

## 2. UI primitives (`@workspace/ui`) — only if the screen needs one that doesn't exist

Follow `.agents/skills/add-ui-component/SKILL.md`: a synchronized `<name>.tsx` +
`<name>.native.tsx` pair wrapping `web-ui`/`native-ui`, same exports/props/behavior, registered in
`packages/ui/src/index.ts` (AGENTS.md §4).

## 3. Shared state (`@workspace/providers`) — only if state must outlive the screen

Cross-screen state (auth, menus, theme, …) belongs in a provider, not in screen-local state or a
`ui` component.

## 4. The screen (`@workspace/app`)

- Create it under `packages/app/src/screens/`, importing UI from `@workspace/ui` and routing
  (`Link`, `useRouter`, `usePathname`, `useSearchParams`) from `@workspace/router` — never
  `next/*` or `expo-router` (AGENTS.md §6).
- Layout: full width inside the shell (`w-full` + responsive padding); no `max-w-*` at the page
  root unless the UX is genuinely a narrow column. Cap only a form block, scaling up at `lg`/`xl`
  (AGENTS.md §7, `packages/app/AGENTS.md`).

## 5. Routes in both apps — always both, in the same change

- **Web**: a route in `apps/web/app/**` rendering the shared screen. If this pulled a new
  `@workspace/*` package into the web app, add it to `transpilePackages` in
  `apps/web/next.config.ts`.
- **Native**: the matching expo-router route in `apps/native/src/app/**`. If a new package's
  Tailwind classes are used on native, add it to the content globs in
  `apps/native/tailwind.config.js`.

## 6. i18n (`@workspace/i18n`)

No hardcoded user-facing strings: add keys to every locale JSON in `packages/i18n` and use the
type-safe `useTranslation`.

## 7. Navigation entry

Menus are backend-driven (`getMyMenus` → `MenuProvider`): to surface the screen in the
sidebar/top bar/tabs, add the menu entry in the `springboot-core` backend data — do **not**
hardcode a nav item in the frontend (AGENTS.md §2).

## 8. Verify

Run `pnpm check:all` (or minimally `typecheck` + `lint` for touched workspaces) and report real
results. If available, run the `architecture-reviewer` (and `ui-sync-reviewer` if step 2 applied)
before declaring done. Update any `AGENTS.md` this change made stale (AGENTS.md §8.8).
