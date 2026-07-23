# SCR-305/306 — Timer create and edit

**Document ID:** RMC-SDD-SCR-305-306
**Contract version:** 1.0.0
**Routes:** `/admin/timer/new`, `/admin/timer/{id}`
**Platforms:** Web and native
**Status:** Current implementation

## Details field contract

| Field | Required | Create mode | Edit mode | Client rule |
| --- | --- | --- | --- | --- |
| `key` | yes | editable | read-only | maximum 255; must correspond to a backend timer class to execute |
| `cron` | yes | editable | editable | maximum 255; free text; no client cron parser |
| `description` | no | editable | editable | maximum 255 |
| `failedCount` | no | editable | read-only | number; no client min/max/default |
| `lastExecution` | no | editable | read-only | plain input; no client date parser on this field |
| `active` | no | editable | editable | default true on create |

Create page requires/saves through `POST /sbf-timer`; it is reachable directly even though the
Timer list has no Add control. Edit page requires `GET /sbf-timer/{id}`, loads by ID or SSR seed,
and saves through `PUT /sbf-timer/{id}` when update is granted. Successful create replaces the
route with the edit URL; update resets from the returned record.

## Timer Info tab (edit only)

The embedded grid is the [SCR-307](timer-info-list.md) contract with a persistent `timerId` filter
and without the Timer Key column. It remains read-only.

## Runtime/background contract

`AbstractTimer` checks each concrete timer once per minute per tenant. A row runs only if present,
active, and due under the backend cron parser. At execution start/end the backend updates Last
Execution; success resets Failed Count, failure increments it. Each attempted run creates a
Timer Info row with instance, cron, execution time, and failure details when present.

An invalid cron value can save if backend DTO validation permits it but will be rejected by the
runtime cron evaluator and skipped/logged. Saving does not execute, restart, or dynamically create
a timer class. There is no Run Now action or automatic form refresh.

## Acceptance criteria

1. Create/edit read-only differences and client validation match the table.
2. Create/read/update grants remain separate.
3. Timer Info is hidden until an ID exists and always scoped to that ID.
4. Save is never represented as immediate execution.
