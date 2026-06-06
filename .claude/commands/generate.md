---
description: Regenerate the API client from OpenAPI with Orval (pnpm generate).
allowed-tools: Bash(pnpm generate:*), PowerShell(pnpm:*), Bash(git status:*)
---

Run `pnpm generate` (Turbo runs Orval in `@workspace/api-client`).

- This **wipes and regenerates** `packages/api-client/src/generated/**` (`clean: true`) from
  `packages/api-client/openapi.json` per `orval.config.ts`. Never hand-edit generated files —
  change the OpenAPI input or the Orval config instead (root `AGENTS.md` §5).
- If hooks/schemas changed, the OpenAPI spec changed: confirm `openapi.json` is the intended version
  (it tracks the `springboot-core` backend).
- Report what changed under `src/generated/` and run `pnpm --filter @workspace/api-client typecheck`
  after.
