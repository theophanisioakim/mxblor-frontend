# `@workspace/api-client` — generated API client (Orval + TanStack Query)

> Layer rules for this package. The root **`AGENTS.md`** (§5) is authoritative; this adds detail.

## What this is

TanStack Query hooks + Axios client for the **`springboot-core` (`sbf`)** backend. It is split into
**generated** and **hand-written** code.

| Path                                                                                        | Source of truth               | Hand-edit?                                          |
| ------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------- |
| `src/generated/**` (per-tag hooks, `springBootFrameworkAPI.schemas.ts`)                     | **Orval** from `openapi.json` | ❌ Never — `pnpm generate` wipes it (`clean: true`) |
| `src/axios-instance.ts` (`customInstance`, `setOnOtpRequired`, `setOnUnauthorized`)         | hand-written                  | ✅                                                  |
| `src/query-client-provider.tsx`, `src/language-config-provider.tsx`, `src/channel.ts` / `src/channel.native.ts`, `src/index.ts` | hand-written                  | ✅                                                  |
| `orval.config.ts`, `openapi.json`                                                           | config / input                | ✅ (regenerate after)                               |

## ⚠️ Don't hand-edit `src/generated/**`

To change generated hooks/schemas, update the **OpenAPI input** (refresh `openapi.json` from the
backend) and/or `orval.config.ts`, then run `pnpm generate`. Orval runs with `clean: true`, so any
manual edit under `src/generated/` is deleted on the next run.

## Conventions

- Import everything from the package root (`@workspace/api-client`) — `index.ts` re-exports the axios
  utilities, the query provider, and `export *` of all generated hooks/schemas.
- The Axios mutator is `customInstance` (`override.mutator` in `orval.config.ts`); auth/OTP/401
  behavior lives in `axios-instance.ts` — extend it there, not in generated code. Generated binary
  responses declared as `blob` are normalized to `arraybuffer` for browser/React Native parity;
  JSON error buffers are decoded before the shared OTP and authorization handlers inspect them.
- `channel.ts`/`channel.native.ts` is the cross-platform split (web → `CHANNEL_WEB`; native →
  mobile/tablet by screen size). Follow the `.native.ts` pattern (root `AGENTS.md` §6). `react-native`
  (imported only by `channel.native.ts`) is declared as an **optional peer**, not a hard dependency,
  so the web app doesn't pull React Native into its install graph.
- Depends only on `@workspace/storage` (+ axios/tanstack) — don't add upward deps.

## `LanguageConfigProvider` — why an app-level provider lives here

`language-config-provider.tsx` fetches the tenant's languages (`GET /sbf-translation/language-config`)
**once for the whole app** and hands them out via `useLanguageConfig()`. It lives in this package —
not in `@workspace/providers`, where the other providers live — because its main consumer is
`RncTranslationLabel` in **`@workspace/ui`**, and `ui` may not import `providers`
(`ui → providers → router → ui` is a cycle, machine-enforced). `api-client` is the lowest package
that both `ui` and `providers` depend on *and* that can fetch. It already hosts a React provider
(`ApiQueryClientProvider`), so this follows an established shape.

Two consequences worth keeping straight:

- **The session is injected, never imported.** This package sits below `@workspace/providers`, so it
  cannot call `useAuth()`. `isAuthenticated` / `selectedSchema` arrive as **props** from
  `providers`' thin `LanguageProvider` adapter, which mounts this one inside `AuthProvider`. Don't
  "simplify" that away.
- **No `staleTime` / `gcTime` override, on purpose.** The provider is the query's *only* observer and
  stays mounted for the app's lifetime, so nothing ever re-triggers the fetch and the global
  `staleTime: 0` defaults are irrelevant. **Context is the distribution mechanism; the query cache is
  not being used as a cache.** The session is in the query key, so login/logout/tenant-switch refetch
  — that is the intended (and only) refresh path.
