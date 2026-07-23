# SCR-409 — SMS-outbox list

**Document ID:** RMC-SDD-SCR-409
**Contract version:** 1.0.0
**Route:** `/admin/sms-outbox`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-sms-outbox/search`. The screen is read-only.

| Columns (sortable) |
| --- |
| Created At; Recipient; Message; Scheduled At; Sent At; Retries; Error; Trace ID |

Text filters `recipient`, `messageContent`, `errorMessage`, and `traceId` use contains.
`scheduledAtFrom`/`scheduledAtTo` and `sentAtFrom`/`sentAtTo` are inclusive date-time ranges.
Initial sort is Created At descending; pagination is 20/50/100. Toolbar contains Refresh and Reset.
No send/resend/cancel/create/edit/delete/detail or export action exists.

The backend exposes generated SMS-outbox persistence/search APIs, but this repository snapshot has
no concrete SMS delivery or scheduled retry processor. Rows can be written by API consumers or
child applications; Scheduled At, Sent At, and Retries are informational data and do not promise a
core worker. `LogRotateTimer` can remove old rows. Opening the screen triggers no message.

## Background processing

Core retention is provided by `LogRotateTimer`. A producer/sender must be supplied by an API
consumer or child application; no core delivery consumer is present.

Recipients and message content are personal data. Acceptance: page is grant-protected/read-only,
filters/order match, and the UI never represents an SMS as delivered without stored backend state.
