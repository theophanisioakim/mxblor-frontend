---
paths:
  - "packages/app/src/screens/**"
  - "apps/web/app/**"
  - "apps/native/src/app/**"
---

# Page layout — use large screens

You are editing a **screen** or **app route shell**. Pages should use the horizontal space available
inside `AppShell`, especially on desktop and large tablets. Do not default to narrow, centered columns.

## Default

- Root container: `w-full` + responsive padding (`p-4 md:p-6 lg:py-8`).
- No page-level `max-w-sm`, `max-w-md`, `max-w-xl`, or `max-w-2xl` unless the screen is
  intentionally narrow (login, OTP, a single auth/marketing card).

## Data-heavy screens

Grids, tables, dashboards, and admin lists must stay **full width**. Let `RncGrid` and similar
components use the viewport. Canonical pattern: `user-list-screen.tsx` (`w-full`, no root `max-w-*`).

## Forms

- Constrain **the form block or fields**, not the entire screen.
- On large breakpoints, prefer wider caps (`lg:max-w-[900px]`, `xl:max-w-[1200px]`) over leaving a
  mobile-sized column on desktop.

## Route shells

`page.tsx` / route layouts in `apps/web` and `apps/native` should render `@workspace/app` screens
directly — do not add an extra `max-w-*` or centered column wrapper around them.

## When narrow is correct

Login flows, OTP dialogs, hero copy beside illustration, or a single small widget — apply `max-w-*`
only to that element, not the page root.

See also: root `AGENTS.md` §7, `packages/app/AGENTS.md` (Page layout).
