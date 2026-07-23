# SDD contract conventions

**Document ID:** RMC-SDD-CONVENTIONS-001
**Contract version:** 1.0.0
**Snapshot date:** 2026-07-23
**Status:** Normative

These rules apply to every SDD unless that SDD explicitly overrides them.

## Contract interpretation

- “Shall” describes implemented behavior that is part of the client acceptance contract.
- “Current limitation” describes behavior the client must not assume exists.
- OpenAPI controls wire-level schemas; the SDD controls the intended user-visible workflow.
- Approved requirements supersede this snapshot. Code and SDD must be reconciled in the same task.
- Mockups are layout references, not pixel-perfect acceptance artifacts. Fields, states, and rules
  in the SDD take precedence over illustrative sample values in a mockup.
- SDDs use semantic versions. A removed/changed client obligation requires a version and changelog
  update; new backward-compatible detail increments the minor version.

## Shared authenticated shell

All admin SDDs inherit these requirements:

1. The screen shall render on web and native from the shared `@workspace/app` implementation.
2. The shell obtains the authenticated session, selected schema, permissions, menus, and language
   configuration. Web may seed shell/detail data during SSR; native obtains it client-side.
3. `PermissionGuard` shall fail closed: without the listed view/form grant, protected content is not
   rendered.
4. UI gating is not the security boundary. The backend shall enforce the same operation grant and
   selected tenant context.
5. Login, logout, token refresh, and schema changes may refresh menus and permissions globally.
6. There is no screen-specific automatic polling in current list/detail screens. Data changes made
   elsewhere become visible after navigation, a mutation refresh, or the explicit Refresh action.

## Shared server-backed grid contract

Unless overridden:

| Concern | Contract |
| --- | --- |
| Initial page | zero-based page `0` |
| Page size | `20` |
| Page-size choices | `20`, `50`, `100` |
| Text filter | case-insensitive substring (“contains”) |
| Blank text | omitted from the search request |
| Nullable checkbox | unset = all; checked = `true`; explicit unchecked = `false` |
| Date/time From | inclusive lower bound (`>=`) |
| Date/time To | inclusive upper bound (`<=`) |
| Multiple filters | combined with logical AND |
| Sort | server-side; initial sort is specified per SDD |
| Refresh | reruns the current query |
| Reset | clears user filters/sort/page state back to configured initial values |
| Responsive behavior | lower-priority columns may collapse into expandable row detail |
| Loading | in-grid loading state while the search request is pending |
| Empty | zero-result state, not an error |
| Request failure | grid error state; no stale row is represented as newly fetched |

All displayed column values are read-only unless the SDD explicitly marks a column editable.

## Mutation and concurrency rules

- A disabled action means the user lacks its operation grant or the action is otherwise unavailable.
- Confirmed delete dialogs state that deletion cannot be undone.
- Bulk selection persists across grid pages only where the screen explicitly enables persistent
  selection.
- Update payloads carry the record `version`; backend optimistic-lock failures are errors and shall
  not be represented as successful saves.
- A successful create navigates/replaces to the persisted record’s edit route where specified.
- Forms preserve server error text in an error banner and show a success banner after persistence.

## Background-process terminology

| Type | Meaning |
| --- | --- |
| Direct request | Started by a screen action and awaited by that screen |
| Producer | Runtime activity that creates/updates data visible on the screen |
| Scheduled consumer | Timer/job that processes or enriches visible records |
| Retention | Job that can remove old rows according to configured limits |
| Global infrastructure | Session refresh, permission/menu reload, cache, tenancy, or logging work |

A process listed as “related” is not necessarily launched by opening the screen.

## Sensitive-data rule

Log, OTP, outbox, configuration, and integration screens may contain personal data, credentials,
message content, request/response bodies, or operational internals. The SDD documents the fields
without reproducing real values. Clients shall restrict grants and apply retention/redaction rules
appropriate to their environment.
