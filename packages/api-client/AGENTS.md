# `@workspace/api-client` — generated API client (Orval + TanStack Query)

> Layer rules for this package. The root **`AGENTS.md`** (§5) is authoritative; this adds detail.

## What this is

TanStack Query hooks + Axios client for the **`springboot-core` (`sbf`)** backend. It is split into
**generated** and **hand-written** code.

| Path                                                                                        | Source of truth               | Hand-edit?                                          |
| ------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------- |
| `src/generated/**` (per-tag hooks, `springBootFrameworkAPI.schemas.ts`)                     | **Orval** from `openapi.json` | ❌ Never — `pnpm generate` wipes it (`clean: true`) |
| `src/axios-instance.ts` (`customInstance`, `setOnOtpRequired`, `setOnUnauthorized`)         | hand-written                  | ✅                                                  |
| `src/query-client-provider.tsx`, `src/channel.ts` / `src/channel.native.ts`, `src/index.ts` | hand-written                  | ✅                                                  |
| `orval.config.ts`, `openapi.json`                                                           | config / input                | ✅ (regenerate after)                               |

## ⚠️ Don't hand-edit `src/generated/**`

To change generated hooks/schemas, update the **OpenAPI input** (refresh `openapi.json` from the
backend) and/or `orval.config.ts`, then run `pnpm generate`. Orval runs with `clean: true`, so any
manual edit under `src/generated/` is deleted on the next run.

## Conventions

- Import everything from the package root (`@workspace/api-client`) — `index.ts` re-exports the axios
  utilities, the query provider, and `export *` of all generated hooks/schemas.
- The Axios mutator is `customInstance` (`override.mutator` in `orval.config.ts`); auth/OTP/401
  behavior lives in `axios-instance.ts` — extend it there, not in generated code.
- `channel.ts`/`channel.native.ts` is the cross-platform split (web → `CHANNEL_WEB`; native →
  mobile/tablet by screen size). Follow the `.native.ts` pattern (root `AGENTS.md` §6). `react-native`
  (imported only by `channel.native.ts`) is declared as an **optional peer**, not a hard dependency,
  so the web app doesn't pull React Native into its install graph.
- Depends only on `@workspace/storage` (+ axios/tanstack) — don't add upward deps.
