# Testing and release reference

**Document ID:** RMC-TECH-QA-001
**Snapshot date:** 2026-07-23

## Runtime policy

Agents must not manually start the web dev server, Metro, emulator, simulator, or device build.
Automated E2E harnesses may manage their own test server. Read-only browser inspection is allowed
only when the user confirms that the target app is already running.

## Validation commands

| Scope | Command |
| --- | --- |
| Full CI-equivalent gate | `pnpm check:all` |
| Generate API client and typed grants | `pnpm generate` |
| Formatting check | `pnpm format:check` |
| Strict lint | `pnpm lint:strict` |
| Dependency hygiene | `pnpm lint:deps` |
| Type check | `pnpm typecheck` |
| Unit tests | `pnpm test` |
| Production builds | `pnpm build` |
| All E2E | `pnpm test:e2e` |
| Web E2E | `pnpm --filter web test:e2e` |
| Native tests | `pnpm --filter native test` |

## Important automated contracts

- Package boundary and restricted-import rules.
- Synchronized web/native UI abstraction exports.
- API permission gating audit for admin pages and controls.
- Generated OpenAPI client consistency.
- Unit behavior for providers, storage, forms, grids, and screens.
- Next.js production compilation and Expo/native type safety.

## Change impact matrix

| Change | Minimum documentation and validation |
| --- | --- |
| New/changed screen or route | Screen catalog, relevant flow, mockup if layout changed; typecheck and affected tests |
| New API operation or changed DTO | API/security reference, screen/API mapping, regenerate; generation diff and typecheck |
| Auth/session behavior | Functional spec, auth flow, API/security; auth tests and full typecheck |
| Permission/menu behavior | Functional spec, permission flow, traceability; gating audit |
| New shared UI component | Architecture if contract changes, relevant screen/mockup; paired web/native validation |
| Package/dependency boundary | Architecture and package table; dependency lint and typecheck |
| Release/runtime requirement | This file and README; applicable build/gate |

## Client acceptance testing

Client-facing UAT should be derived from stable IDs in the functional specification:

```text
Feature → Flow → Screen → API grant → Test scenario
```

For each applicable screen, test an authorized normal flow, missing-grant flow, empty state,
validation/API failure, and narrow-screen behavior. Cross-platform screens should be checked on web
and native unless the route is explicitly platform-specific.

