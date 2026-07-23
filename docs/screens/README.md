# Screen Design Document contracts

**Document ID:** RMC-SDD-INDEX-001
**Contract version:** 1.0.0
**Snapshot date:** 2026-07-23
**Status:** Current implementation

This is the client-reference index for every implemented shared screen. An SDD is a behavioral
contract: it defines routes, actors, permissions, visible data, fields, filters, validation,
actions, restrictions, API effects, screen states, related background processing, and acceptance
criteria. Read [contract conventions](contract-conventions.md) before interpreting an SDD.

## Public, authentication, and framework screens

| Contract | Routes/boundary | Mockup |
| --- | --- | --- |
| [SCR-001 Home](general/home.md) | `/` | [Mobile shell](../mockups/mobile-shell.svg) |
| [SCR-002 Login](auth/login.md) | `/login` | [Desktop login](../mockups/login-desktop.svg) |
| [SCR-003 Form showcase](general/form-showcase.md) | `/forms` | Screen contract |
| [SCR-004 Grid showcase](general/grid-showcase.md) | `/grid` | [Admin-list layout](../mockups/admin-list-desktop.svg) |
| [SCR-005 Not found](general/not-found.md) | unmatched route | Screen contract |
| [SCR-006-L Loading](general/loading.md) | framework loading boundary | Screen contract |
| [SCR-006-E Error](general/error.md) | framework error boundary | Screen contract |

## Identity and access

| Contract | Routes | Mockup |
| --- | --- | --- |
| [SCR-101 User list](admin/identity/user-list.md) | `/admin/user` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-102/103 User form](admin/identity/user-form.md) | `/admin/user/new`, `/admin/user/{id}` | [Admin form](../mockups/admin-form-desktop.svg) |
| [SCR-104 Role list](admin/identity/role-list.md) | `/admin/role` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-105/106 Role form](admin/identity/role-form.md) | `/admin/role/new`, `/admin/role/{id}` | [Admin form](../mockups/admin-form-desktop.svg) |
| [SCR-107 Permission list](admin/identity/permission-list.md) | `/admin/permission` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-108 OTP list](admin/identity/otp-list.md) | `/admin/otp` | [Admin list](../mockups/admin-list-desktop.svg) |

## Tenant and configuration

| Contract | Routes | Mockup |
| --- | --- | --- |
| [SCR-201 Schema list](admin/configuration/schema-list.md) | `/admin/schema` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-202/203 Schema form](admin/configuration/schema-form.md) | `/admin/schema/new`, `/admin/schema/{id}` | [Admin form](../mockups/admin-form-desktop.svg) |
| [SCR-204 Schema properties](admin/configuration/schema-properties.md) | `/admin/schema-properties` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-205 System properties](admin/configuration/system-properties.md) | `/admin/system-properties` | [Admin list](../mockups/admin-list-desktop.svg) |

## Integrations and timers

| Contract | Routes | Mockup |
| --- | --- | --- |
| [SCR-301 Integration list](admin/integrations/integration-list.md) | `/admin/integration` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-302/303 Integration form](admin/integrations/integration-form.md) | `/admin/integration/new`, `/admin/integration/{id}` | [Admin form](../mockups/admin-form-desktop.svg) |
| [SCR-404 Integration-log list](admin/integrations/integration-log-list.md) | `/admin/integration-logs` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-304 Timer list](admin/timers/timer-list.md) | `/admin/timer` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-305/306 Timer form](admin/timers/timer-form.md) | `/admin/timer/new`, `/admin/timer/{id}` | [Admin form](../mockups/admin-form-desktop.svg) |
| [SCR-307 Timer-info list](admin/timers/timer-info-list.md) | `/admin/timer-info` | [Admin list](../mockups/admin-list-desktop.svg) |

## Observability and outboxes

| Contract | Routes | Mockup |
| --- | --- | --- |
| [SCR-401 Request-log list](admin/observability/request-log-list.md) | `/admin/request-logs` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-402 Request-log detail](admin/observability/request-log-detail.md) | `/admin/request-logs/{id}` | [Admin form/detail](../mockups/admin-form-desktop.svg) |
| [SCR-403 Server-log list](admin/observability/server-log-list.md) | `/admin/server-logs` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-405/406 IP-log list](admin/observability/ip-log-list.md) | `/admin/ip-logs`, `/admin/log-ip` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-407 Audit-log list](admin/observability/audit-log-list.md) | `/admin/audit-logs` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-408 Email-outbox list](admin/observability/email-outbox-list.md) | `/admin/email-outbox` | [Admin list](../mockups/admin-list-desktop.svg) |
| [SCR-409 SMS-outbox list](admin/observability/sms-outbox-list.md) | `/admin/sms-outbox` | [Admin list](../mockups/admin-list-desktop.svg) |

## Contract maintenance

Any implementation change that alters a screen must update its SDD in the same task. A route,
field, filter, permission, action, validation, state, API, producer, scheduled job, retention rule,
or limitation change is contract-impacting. Update the catalog and traceability matrix when
coverage or identifiers change.
