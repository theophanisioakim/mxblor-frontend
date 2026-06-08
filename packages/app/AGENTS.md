# `@workspace/app` - shared cross-platform screens

> Layer rules for this package. The root **`AGENTS.md`** (section 2) is authoritative.

## What this is

The **write-once screens** consumed by **both** `apps/web` and `apps/native`. A screen lives here
once and renders on both platforms because it builds on `@workspace/ui` primitives and
`@workspace/router`, which resolve to the right platform implementations at build time.

This package also owns the **app shell / navigation chrome** — `Sidebar`/`MobileSidebar`, `TopBar`
(with `MegaMenu`/`NavMenuPopover`/`TopBarUserActions`), `BottomTabBar`, `Breadcrumbs`,
`FloatingActionButton`, `LanguageSwitcher`, `SwitchThemeButton`, the `OtpDialog`, and the composed
`AppShell` (wired into each app's root layout). The chrome reads navigation/auth/theme state from
`@workspace/providers` (`useMenu`, `useSidebar`, `useMyPathname`, `useAuth`, `useOtp`,
`useAppTheme`), so — unlike plain screens — `app` depends on `@workspace/providers`. It lives here
rather than in `@workspace/ui` because `ui → providers → router → ui` would be a cycle (root
`AGENTS.md` §2).

Layout:

- `src/screens/<name>-screen.tsx` — shared screens, re-exported via `./screens/*`. See
  `home-screen.tsx`.
- `src/navigation/` — the navigation chrome + the `menu-tree` helpers and the `NavLink` wrapper.
- `src/overlays/` — provider-bound overlays (`otp-dialog.tsx`, built on `ui`'s `RncDialog`).
- `src/layout/app-shell.tsx` — composes the chrome around `children`.
- everything re-exported from `src/index.ts`.

## Rules

- **Build screens from `@workspace/ui` and `@workspace/router` only.** Never import
  `@workspace/web-ui` or `@workspace/native-ui` here (root `AGENTS.md` section 2 rule 1); that would
  bind a shared screen to one platform. If a primitive you need is not in `ui` yet, add it there
  (synchronized pair) first.
- **The navigation chrome (not plain screens) may use `@workspace/providers`.** That's the one
  package-level dependency screens themselves don't need. Keep provider hooks in the chrome/overlays;
  plain screens should stay provider-free where possible.
- **No platform branching in screen code.** Push platform differences down into `ui` primitives (the
  `.tsx` / `.native.tsx` split), `@workspace/router`, or into `storage`/`api-client`/`i18n`. A screen
  file should read the same regardless of target.
- **Route through `@workspace/router`.** Shared screens may use `Link`, `LinkButton`, `useRouter`,
  `usePathname`, and `useSearchParams` from `@workspace/router`. Never import `next/*`,
  `expo-router`, or Solito here.
- May use `@workspace/api-client` (data) and `@workspace/i18n` (text); both are cross-platform.
- Keep the public surface typed; consumers import from `@workspace/app`.
