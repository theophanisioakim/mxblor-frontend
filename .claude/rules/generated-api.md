---
paths:
  - "packages/api-client/src/generated/**"
---

# Generated API client — do not hand-edit

You are editing **Orval-generated** code (root `AGENTS.md` §5, `packages/api-client/AGENTS.md`).

- `pnpm generate` runs Orval with `clean: true` — it **deletes and regenerates everything** under
  `packages/api-client/src/generated/`. Manual edits here are lost on the next run.
- To change generated hooks/schemas, change the **OpenAPI input** (`openapi.json`, which tracks the
  `springboot-core` backend) and/or `orval.config.ts`, then run `pnpm generate`.
- To change request behavior (auth, OTP, 401 handling, base URL), edit the **hand-written**
  `packages/api-client/src/axios-instance.ts` (`customInstance`) — not generated files.
- Import generated hooks/schemas from `@workspace/api-client` (re-exported via `index.ts`), not deep
  paths.

The PreToolUse guard **denies** edits in this directory.
