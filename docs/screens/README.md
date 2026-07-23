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
| [SCR-001 Mxblor landing](landing/landing-page.md) | `/` | [Mobile shell](../mockups/mobile-shell.svg) |
| [SCR-002 Login](auth/login.md) | `/login` | [Desktop login](../mockups/login-desktop.svg) |
| [SCR-003 Form showcase](general/form-showcase.md) | `/forms` | Screen contract |
| [SCR-004 Grid showcase](general/grid-showcase.md) | `/grid` | [Admin-list layout](../mockups/admin-list-desktop.svg) |
| [SCR-005 Not found](general/not-found.md) | unmatched route | Screen contract |
| [SCR-006-L Loading](general/loading.md) | framework loading boundary | Screen contract |
| [SCR-006-E Error](general/error.md) | framework error boundary | Screen contract |

## Mxblor portfolio and building management

| Contract | Routes | Screen contracts |
| --- | --- | --- |
| SCR-501 Dashboard | `/dashboard` | [Dashboard](dashboard/dashboard.md) |
| SCR-510–512 Buildings | `/buildings`, `/buildings/new`, `/buildings/{id}` | [List](building/buildings-list.md), [create](building/create-building.md), [edit/hub](building/edit-building.md) |
| SCR-520–523 Building units | `/buildings/{id}/units`, `/new`, `/{unitId}`, `/unit-balances` | [List](building-unit/building-units-list.md), [create](building-unit/create-building-unit.md), [edit](building-unit/edit-building-unit.md), [balances](building-unit/building-unit-balances.md) |
| SCR-530–532 Related people | `/buildings/{id}/related-people`, `/new`, `/{subId}` | [List](building-related-people/related-people-list.md), [create](building-related-people/create-related-person.md), [edit](building-related-people/edit-related-person.md) |
| SCR-540–542 Communications | `/buildings/{id}/communication`, `/new`, `/{subId}` | [List](building-unit-comm/communication-list.md), [create](building-unit-comm/create-communication.md), [edit](building-unit-comm/edit-communication.md) |
| SCR-550–552 Notes | `/buildings/{id}/notes`, `/new`, `/{subId}` | [List](building-note/notes-list.md), [create](building-note/create-note.md), [edit](building-note/edit-note.md) |
| SCR-560–562 Distribution tables | `/buildings/{id}/distributions`, `/new`, `/{distributionId}` | [List](building-distribution/distribution-tables-list.md), [create](building-distribution/create-distribution-table.md), [edit](building-distribution/edit-distribution-table.md) |
| SCR-570–572 Yearly budgets | `/buildings/{id}/budgets`, `/new`, `/{budgetId}` | [List](building-yearly-budget/yearly-budget-list.md), [create](building-yearly-budget/create-yearly-budget.md), [edit](building-yearly-budget/edit-yearly-budget.md) |
| SCR-580–582 Bank accounts | `/buildings/{id}/bank-accounts`, `/new`, `/{accountId}` | [List](t-bank-account/bank-accounts-list.md), [create](t-bank-account/create-bank-account.md), [edit](t-bank-account/edit-bank-account.md) |

## Mxblor catalogs and ledgers

| Contract | Routes | Screen contracts |
| --- | --- | --- |
| SCR-590–592 Building expenses | `/buildings/{id}/current-expenses`, `/new`, `/{expenseId}` | [List](t-expense/expenses-list.md), [spread create](t-expense/create-expense.md), [edit](t-expense/edit-expense.md) |
| SCR-600–602 Collections | `/buildings/{id}/collections`, `/new`, `/{collectionId}` | [List](t-collection/collections-list.md), [create](t-collection/create-collection.md), [edit](t-collection/edit-collection.md) |
| SCR-610–612 Payments | `/buildings/{id}/payments`, `/new`, `/{paymentId}` | [List](t-payment/payments-list.md), [create](t-payment/create-payment.md), [edit](t-payment/edit-payment.md) |
| SCR-620–622 Contacts | `/contacts`, `/contacts/new`, `/contacts/{id}` | [List](contact/contacts-list.md), [create](contact/create-contact.md), [edit](contact/edit-contact.md) |
| SCR-630–632 Expense categories | `/expenses/categories`, `/new`, `/{id}` | [List](expense-category/expense-categories-list.md), [create](expense-category/create-expense-category.md), [edit](expense-category/edit-expense-category.md) |
| SCR-640–642 Expense catalog | `/expenses`, `/expenses/new`, `/expenses/{id}` | [List](expense/expenses-list.md), [create](expense/create-expense.md), [edit](expense/edit-expense.md) |
| SCR-650–652 Revenue categories | `/revenues/categories`, `/new`, `/{id}` | [List](revenue-category/revenue-categories-list.md), [create](revenue-category/create-revenue-category.md), [edit](revenue-category/edit-revenue-category.md) |
| SCR-660–662 Revenue catalog | `/revenues`, `/revenues/new`, `/revenues/{id}` | [List](revenue/revenues-list.md), [create](revenue/create-revenue.md), [edit](revenue/edit-revenue.md) |

## Mxblor reports

| Contract | Routes | Screen contracts |
| --- | --- | --- |
| SCR-700 Report centre | `/reports` | [Report centre](reports/report-centre.md) |
| SCR-701–705 Report forms | `/reports/apartment-shares`, `/attendance-sheet`, `/building-financial`, `/building-shares`, `/building-unit-financial` | [Shared report-form contract](reports/report-form.md) |

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
