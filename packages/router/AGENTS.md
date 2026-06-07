# `@workspace/router` - cross-platform routing abstraction

> Layer rules for this package. The root **`AGENTS.md`** is authoritative; this adds the
> routing-specific contract.

## What This Is

The shared routing API for `@workspace/app` screens and app-local components. It wraps **Next.js App
Router** on web and **Expo Router** on native without using Solito.

Layout:

- `src/link.tsx` - web variant, wraps `next/link`.
- `src/link.native.tsx` - native variant, wraps `expo-router` `Link`.
- `src/link-button.tsx` / `src/link-button.native.tsx` - button-shaped link built from
  `@workspace/ui` primitives.
- `src/router.ts` - web imperative/navigation hooks, wraps `next/navigation`.
- `src/router.native.ts` - native imperative/navigation hooks, wraps `expo-router`.
- `src/href.ts` - shared href types and conversion helpers.
- `src/index.ts` - public exports.

## Rules

- Do not add Solito. This package is the routing abstraction.
- Keep web/native files in synchronized pairs with the same public exports and compatible props.
- Keep shared screens importing `@workspace/router`, never `next/*` or `expo-router`.
- Preserve platform file resolution. Platform-specific router imports belong only in their
  matching `*.tsx` / `*.ts` file.
- Use `RouteHref` for shared route targets. It supports strings and
  `{ pathname, params/query }` objects, then maps to Next `query` or Expo `params`.
- `useSearchParams` is a client hook. On web, Next may require a `Suspense` boundary around users of
  this hook during static prerendering.
