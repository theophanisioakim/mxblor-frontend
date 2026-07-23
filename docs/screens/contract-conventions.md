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

### Mxblor business-screen grants

The Mxblor business SDDs predate the shared permission provider and inherit the exact grant mapping
below. “All roles” or “Always” in an action table means all users whose effective grant set contains
the corresponding operation; it never bypasses the backend grant. Missing or unresolved grants fail
closed.

| Screen resource | List page | Create page/action | Edit page | Update action | Delete action |
| --- | --- | --- | --- | --- | --- |
| Building | `POST /building/search` | `POST /building` | `GET /building/{id}` | `PUT /building/{id}` | `DELETE /building/{id}` |
| Building distribution | `POST /building-distribution/search` | `POST /building-distribution` | `GET /building-distribution/{id}` | `PUT /building-distribution/{id}` | `DELETE /building-distribution/{id}` |
| Building note | `POST /building-note/search` | `POST /building-note` | `GET /building-note/{id}` | `PUT /building-note/{id}` | `DELETE /building-note/{id}` |
| Building related person | `POST /building-related-person/search` | `POST /building-related-person` | `GET /building-related-person/{id}` | `PUT /building-related-person/{id}` | `DELETE /building-related-person/{id}` |
| Building unit | `POST /building-unit/search` | `POST /building-unit` | `GET /building-unit/{id}` | `PUT /building-unit/{id}` | `DELETE /building-unit/{id}` |
| Building communication | `POST /building-unit-comm/search` | `POST /building-unit-comm` | `GET /building-unit-comm/{id}` | `PUT /building-unit-comm/{id}` | `DELETE /building-unit-comm/{id}` |
| Building yearly budget | `POST /building-yearly-budget/search` | `POST /building-yearly-budget` | `GET /building-yearly-budget/{id}` | `PUT /building-yearly-budget/{id}` | `DELETE /building-yearly-budget/{id}` |
| Contact | `POST /contact/search` | `POST /contact` | `GET /contact/{id}` | `PUT /contact/{id}` | `DELETE /contact/{id}` |
| Expense catalog | `POST /expense/search` | `POST /expense` | `GET /expense/{id}` | `PUT /expense/{id}` | `DELETE /expense/{id}` |
| Expense category | `POST /expense-category/search` | `POST /expense-category` | `GET /expense-category/{id}` | `PUT /expense-category/{id}` | `DELETE /expense-category/{id}` |
| Revenue catalog | `POST /revenue/search` | `POST /revenue` | `GET /revenue/{id}` | `PUT /revenue/{id}` | `DELETE /revenue/{id}` |
| Revenue category | `POST /revenue-category/search` | `POST /revenue-category` | `GET /revenue-category/{id}` | `PUT /revenue-category/{id}` | `DELETE /revenue-category/{id}` |
| Bank account | `POST /tbank-account/search` | `POST /tbank-account` | `GET /tbank-account/{id}` | `PUT /tbank-account/{id}` | `DELETE /tbank-account/{id}` |
| Collection | `POST /tcollection/search` | `POST /tcollection` | `GET /tcollection/{id}` | `PUT /tcollection/{id}` | `DELETE /tcollection/{id}` |
| Building expense | `POST /texpense/search` | `POST /texpense/spread` | `GET /texpense/{id}` | `PUT /texpense/{id}` | `DELETE /texpense/{id}` |
| Payment | `POST /tpayment/search` | `POST /tpayment` | `GET /tpayment/{id}` | `PUT /tpayment/{id}` | `DELETE /tpayment/{id}` |

List screens require the list-page grant for their entire rendered content. Create and edit screens
require their respective page grant. Add, edit, save, and delete controls independently use the
operation shown above; existing role-based or immutable-row restrictions are additional
constraints. The building-expense create screen deliberately uses the spread operation rather than
the generic create route.

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
