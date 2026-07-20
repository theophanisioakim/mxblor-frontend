# `@workspace/providers` - cross-platform app providers

> Layer rules for this package. The root **`AGENTS.md`** is authoritative.

## What This Is

The app-shell provider composition shared by `apps/web` and `apps/native`.
It owns cross-cutting runtime context used by screens and app-local layouts:
auth/session state, OTP interception state, menus, breadcrumbs, pathname,
sidebar state, i18n provider wiring, and theme state.

### Menus (`MenuProvider` / `useMenu`)

Navigation menus are **backend-driven**. `MenuProvider` fetches the tree with the Orval-generated
`useGetMyMenus` hook (`getMyMenus` API, `SbfMenuTreeResponseDto` with `top` / `side` arrays).
Authenticated users get their role/schema-specific tree; anonymous users get public menus. Refetch on
login/logout is driven by the query key (`isAuthenticated`, `selectedSchema`).

- Web may pass `initialMenus` from SSR (`apps/web/app/layout.tsx`) to seed React Query on first
  paint; the seed is released after the first auth/schema change.
- Native leaves `initialMenus` undefined and fetches client-side.
- Consumers (`@workspace/app` navigation chrome) must not hardcode nav items — read from `useMenu()`.

### Signed sessions (`AuthProvider` / `useAuth`)

Authentication may finish immediately or pause for schema selection. The provider owns that outcome,
session bootstrap/refresh, schema switching, and current-user/global revocation controls. Schema and
channel are signed by the backend; never recreate client-controlled schema/channel headers. Web
refresh and schema challenges use credentialed HttpOnly cookies, while native token bodies are read
from `@workspace/storage`'s SecureStore-backed keys. Tenant changes clear React Query state before
navigation so cached data cannot cross schemas.

## Rules

- Keep this package cross-platform. Put platform-specific shell behavior behind
  `.tsx` / `.native.tsx` files with the same public exports.
- Use `@workspace/router` for navigation and pathname state. Do not import
  `next/*` or `expo-router` directly except in platform-specific files when
  app-shell behavior truly requires it.
- Use `@workspace/api-client` for generated hooks and axios callback
  registration. Do not edit generated API files.
- Use `@workspace/storage` for persisted session/theme values.
- Do not import `@workspace/web-ui` or `@workspace/native-ui`. UI components
  must come through `@workspace/ui`; provider-only context should avoid UI
  dependencies unless there is a clear shared shell need.
- Apps import `AppProviders` from this package in their root layout. Shared
  screens should import individual hooks from here only when they actually need
  the relevant context.
- Web SSR may pass `initialLanguage` to `AppProviders` from the request cookie
  so client hydration uses the same i18n snapshot as the server render.
