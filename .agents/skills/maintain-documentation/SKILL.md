---
name: maintain-documentation
description: Keep react-mono-core client-facing and technical documentation synchronized with implementation. Use for every task that changes routes, screens, fields, validation, actions, flows, API usage, authentication, permissions, menus, providers, package architecture, platform behavior, mockups, tests, build/release behavior, or documented limitations, and for explicit documentation audits or client handoff updates.
---

# Maintain Documentation

Treat documentation impact as a required task phase. Keep client documents behavior-focused,
technical documents implementation-accurate, and mockups explicitly source-derived unless verified
against a running app.

## Workflow

1. Read repository-root `docs/README.md` and `docs/DOCUMENTATION_STRATEGY.md` completely.
2. Inspect the task and current diff. Identify changed user behavior, routes, API contracts,
   permissions, providers, packages, platform differences, tests, or limitations.
3. Read only the affected documents linked from the docs index.
4. Update documentation in the same change:
   - screen/route/interaction changes: versioned SDD, SDD index, client screen catalog, flows,
     mockup, and traceability as applicable;
   - auth/schema/menu/permission changes: functional specification, flows, login/admin spec,
     API/security, and traceability;
   - API/DTO changes: API/security, affected screens/flows, traceability, and generated client
     references;
   - package/provider/platform changes: technical architecture and testing/release;
   - client-visible scope or limitations: functional specification.
5. Preserve stable IDs. Mark planned, disabled, showcase, removed, and current behavior honestly.
6. Validate changed documentation against non-generated source and
   `packages/api-client/openapi.json`.
   For every affected SDD, reconcile every field/column, validation/default, filter/operator,
   initial sort/page, permission, action/API, state, restriction, producer, scheduled consumer,
   retention job, and polling/freshness claim. Do not infer a worker merely because an outbox or
   schedule field exists.
7. Check relative links, Mermaid/SVG structure, stale names, and `git diff --check`.
8. Report the documentation files updated. If no document changed, report
   `Documentation impact: none` with a concrete reason.

## Mockups

- Maintain low-fidelity SVGs in `docs/mockups/`.
- Update the relevant mockup for major layout, navigation, field, or primary-action changes.
- Label a source-derived SVG as a concept mockup. Do not call it a screenshot.
- Use a runtime screenshot only when the user supplied or explicitly confirmed the running app and
  the image was actually inspected.

## Contract-grade SDD checklist

- Keep `docs/screens/README.md` complete: every route, alias, and framework boundary has a contract.
- Apply `docs/screens/contract-conventions.md`; record any deviation in the individual SDD.
- Group create/edit only when the shared component is the same and document mode differences.
- Name direct requests separately from runtime producers, timers/consumers, retention, and global
  session/menu/permission work.
- Record `no automatic polling`, unsupported actions, placeholder providers, incomplete workers,
  and hidden persistent scopes when that is the current implementation.
- Increment the SDD contract version when its client obligation changes.

## Guardrails

- Do not start a dev server or device build to obtain documentation evidence.
- Do not hand-edit generated API code.
- Do not expose secrets, tokens, private URLs, or unsupported security claims.
- Do not add speculative behavior to client documents.
- Do not create documentation churn for an internal change with no contract or behavior impact;
  record the no-impact decision instead.
