# Screen catalog

**Document ID:** RMC-SCR-001
**Snapshot date:** 2026-07-23
**Status:** Current implementation

Unless noted otherwise, every route below exists in both the Next.js web router and Expo native
router and renders the same screen from `@workspace/app`. Admin pages fail closed through
`PermissionGuard`.

## Public and showcase screens

| ID | Route | Screen | Purpose and behavior |
| --- | --- | --- | --- |
| SCR-001 | `/` | [Home](../screens/general/home.md) | Shared landing screen with localized copy and links to form/grid showcases. Web also completes a pending Twitch callback from this route. |
| SCR-002 | `/login` | [Login](../screens/auth/login.md) | Credential sign-in, Twitch sign-in, rate-limit countdown, error/notice states, and multi-schema selection. |
| SCR-003 | `/forms` | [Form showcase](../screens/general/form-showcase.md) | Demonstrates name, age, password, country, interests, birthday, notifications, terms, validation, and submitted JSON. |
| SCR-004 | `/grid` | [Grid showcase](../screens/general/grid-showcase.md) | Demonstrates local filtering, sorting, pagination, selection, bulk delete, row actions, modal editing, responsive expansion, and inline editing. |
| SCR-005 | unmatched route | [Not found](../screens/general/not-found.md) | Explains that the page was not found and provides a home action. Next.js uses a catch-all route; Expo uses `+not-found`. |
| SCR-006 | framework boundary | [Loading](../screens/general/loading.md) / [error](../screens/general/error.md) | Shared loading indicator and recoverable error screen with retry and home actions. |

## Identity and access administration

| ID | Route | View grant | Screen behavior |
| --- | --- | --- | --- |
| SCR-101 | `/admin/user` | `POST /sbf-user/search` | [User-list SDD](../screens/admin/identity/user-list.md) |
| SCR-102 | `/admin/user/new` | `POST /sbf-user` | [User create/edit SDD](../screens/admin/identity/user-form.md) |
| SCR-103 | `/admin/user/{id}` | `GET /sbf-user/{id}` | [User create/edit SDD](../screens/admin/identity/user-form.md) |
| SCR-104 | `/admin/role` | `POST /sbf-role/search` | [Role-list SDD](../screens/admin/identity/role-list.md) |
| SCR-105 | `/admin/role/new` | `POST /sbf-role` | [Role create/edit SDD](../screens/admin/identity/role-form.md) |
| SCR-106 | `/admin/role/{id}` | `GET /sbf-role/{id}` | [Role create/edit SDD](../screens/admin/identity/role-form.md) |
| SCR-107 | `/admin/permission` | `POST /sbf-permission/search` | [Permission-list SDD](../screens/admin/identity/permission-list.md) |
| SCR-108 | `/admin/otp` | `POST /sbf-otp/search` | [OTP-list SDD](../screens/admin/identity/otp-list.md) |

## Tenant and configuration administration

| ID | Route | View grant | Screen behavior |
| --- | --- | --- | --- |
| SCR-201 | `/admin/schema` | `POST /sbf-schema/search` | [Schema-list SDD](../screens/admin/configuration/schema-list.md) |
| SCR-202 | `/admin/schema/new` | `POST /sbf-schema` | [Schema create/edit SDD](../screens/admin/configuration/schema-form.md) |
| SCR-203 | `/admin/schema/{id}` | `GET /sbf-schema/{id}` | [Schema create/edit SDD](../screens/admin/configuration/schema-form.md) |
| SCR-204 | `/admin/schema-properties` | `POST /sbf-schema-properties/search` | [Schema-properties SDD](../screens/admin/configuration/schema-properties.md) |
| SCR-205 | `/admin/system-properties` | `POST /sbf-system-properties/search` | [System-properties SDD](../screens/admin/configuration/system-properties.md) |

## Integration and scheduling administration

| ID | Route | View grant | Screen behavior |
| --- | --- | --- | --- |
| SCR-301 | `/admin/integration` | `POST /sbf-integration/search` | [Integration-list SDD](../screens/admin/integrations/integration-list.md) |
| SCR-302 | `/admin/integration/new` | `POST /sbf-integration` | [Integration create/edit SDD](../screens/admin/integrations/integration-form.md) |
| SCR-303 | `/admin/integration/{id}` | `GET /sbf-integration/{id}` | [Integration create/edit SDD](../screens/admin/integrations/integration-form.md) |
| SCR-304 | `/admin/timer` | `POST /sbf-timer/search` | [Timer-list SDD](../screens/admin/timers/timer-list.md) |
| SCR-305 | `/admin/timer/new` | `POST /sbf-timer` | [Timer create/edit SDD](../screens/admin/timers/timer-form.md) |
| SCR-306 | `/admin/timer/{id}` | `GET /sbf-timer/{id}` | [Timer create/edit SDD](../screens/admin/timers/timer-form.md) |
| SCR-307 | `/admin/timer-info` | `POST /sbf-timer-info/search` | [Timer-info SDD](../screens/admin/timers/timer-info-list.md) |

## Observability and outboxes

| ID | Route | View grant | Screen behavior |
| --- | --- | --- | --- |
| SCR-401 | `/admin/request-logs` | `POST /sbf-log-request/search` | [Request-log list SDD](../screens/admin/observability/request-log-list.md) |
| SCR-402 | `/admin/request-logs/{id}` | `GET /sbf-log-request/{id}` | [Request-log detail SDD](../screens/admin/observability/request-log-detail.md) |
| SCR-403 | `/admin/server-logs` | `POST /sbf-log-server/search` | [Server-log SDD](../screens/admin/observability/server-log-list.md) |
| SCR-404 | `/admin/integration-logs` | `POST /sbf-log-integration/search` | [Integration-log SDD](../screens/admin/integrations/integration-log-list.md) |
| SCR-405 | `/admin/ip-logs` | `POST /sbf-log-ip/search` | [IP-log SDD](../screens/admin/observability/ip-log-list.md) |
| SCR-406 | `/admin/log-ip` | `POST /sbf-log-ip/search` | [IP-log alias SDD](../screens/admin/observability/ip-log-list.md) |
| SCR-407 | `/admin/audit-logs` | `POST /sbf-audit/search` | [Audit-log SDD](../screens/admin/observability/audit-log-list.md) |
| SCR-408 | `/admin/email-outbox` | `POST /sbf-email-outbox/search` | [Email-outbox SDD](../screens/admin/observability/email-outbox-list.md) |
| SCR-409 | `/admin/sms-outbox` | `POST /sbf-sms-outbox/search` | [SMS-outbox SDD](../screens/admin/observability/sms-outbox-list.md) |

## Mxblor business routes

The range rows below link to the route-by-route contracts in the
[SDD index](../screens/README.md). List/create/edit pages respectively require the search, create,
and read-by-id grants documented in
[Mxblor business-screen grants](../screens/contract-conventions.md#mxblor-business-screen-grants).

| IDs | Route family | Primary resource/special grant | Screen behavior |
| --- | --- | --- | --- |
| SCR-501 | `/dashboard` | Four search grants: building, unit, contact, expense | [Portfolio dashboard](../screens/dashboard/dashboard.md) |
| SCR-510–512 | `/buildings*` | `building` | Building list, create, edit, and management hub |
| SCR-520–523 | `/buildings/{id}/units*` | `building-unit` | Unit list/forms and opening-balance management |
| SCR-530–532 | `/buildings/{id}/related-people*` | `building-related-person` | Related-person list/forms |
| SCR-540–542 | `/buildings/{id}/communication*` | `building-unit-comm` | Communication history and forms |
| SCR-550–552 | `/buildings/{id}/notes*` | `building-note` | Note list/forms |
| SCR-560–562 | `/buildings/{id}/distributions*` | `building-distribution` | Distribution list/forms |
| SCR-570–572 | `/buildings/{id}/budgets*` | `building-yearly-budget` | Yearly-budget list/forms |
| SCR-580–582 | `/buildings/{id}/bank-accounts*` | `tbank-account` | Bank-account list/forms |
| SCR-590–592 | `/buildings/{id}/current-expenses*` | `texpense`; create uses `POST /texpense/spread` | Building-expense list/spread/create/edit |
| SCR-600–602 | `/buildings/{id}/collections*` | `tcollection` | Unit-ledger list/forms |
| SCR-610–612 | `/buildings/{id}/payments*` | `tpayment` | Supplier-ledger list/forms |
| SCR-620–622 | `/contacts*` | `contact` | Tenant-wide contact list/forms |
| SCR-630–632 | `/expenses/categories*` | `expense-category` | Expense-category list/forms |
| SCR-640–642 | `/expenses*` | `expense` | Expense-catalog list/forms |
| SCR-650–652 | `/revenues/categories*` | `revenue-category` | Revenue-category list/forms |
| SCR-660–662 | `/revenues*` | `revenue` | Revenue-catalog list/forms |
| SCR-700–705 | `/reports*` | Exact `/reports/*` operation | Report centre and five report forms |

## Shared form specifications

| Form | Editable fields | Important behavior |
| --- | --- | --- |
| User | Username, new password, active, should update password | Password required only on create; mutation actions permission-gated |
| Role | Description, management level | Management level range is 0–999 |
| Schema | Name, description, active | Name and description required |
| Timer | Key, cron, description, failed count, last execution, active | Key and execution fields become read-only in edit mode |
| Integration | Base URL, endpoint, method, timeout, class, method name, description, failures, active | Core connection/implementation fields required |

## Shared list behavior

Administration list screens use the shared `RncGrid` abstraction. Depending on the resource and
grants, the grid supports:

- server-backed search, sorting, and pagination;
- responsive column priorities and expandable detail rows;
- refresh and reset;
- row navigation;
- add, edit, delete, and confirmed destructive actions;
- selection and bulk actions;
- inline edit and bulk save for property-style resources.

## Mockup mapping

| Screen family | Mockup |
| --- | --- |
| Login | [Desktop login](../mockups/login-desktop.svg) |
| Administration lists | [Desktop admin list](../mockups/admin-list-desktop.svg) |
| Administration forms and tabs | [Desktop admin form](../mockups/admin-form-desktop.svg) |
| Native shell and responsive grid | [Mobile shell](../mockups/mobile-shell.svg) |
