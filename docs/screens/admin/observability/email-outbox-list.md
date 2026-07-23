# SCR-408 — Email-outbox list

**Document ID:** RMC-SDD-SCR-408
**Contract version:** 1.0.0
**Route:** `/admin/email-outbox`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-email-outbox/search`. The screen is read-only.

| Columns (sortable) |
| --- |
| Created At; From; Recipients; Subject; Provider; Scheduled At; Sent At; Retries; Error; Trace ID |

Text filters `fromEmail`, `recipients`, `subject`, `emailProvider`, `errorMessage`, and `traceId`
use contains. `scheduledAtFrom`/`scheduledAtTo` and `sentAtFrom`/`sentAtTo` are inclusive date-time
ranges. Initial sort is Created At descending; pagination is 20/50/100. Toolbar contains Refresh
and Reset. No view-body, resend, cancel, create, edit, delete, or export action exists.

## Delivery/background contract

- `MailerService` first applies communication-enabled, whitelist, and blacklist checks. A rejected
  recipient can result in no outbox row.
- For an allowed request it creates a Pending row, then the Resend provider is invoked synchronously
  and the row is marked Sent or Failed. Unsupported providers are marked Failed.
- The current SMTP branch only reads configuration and does not send or mark completion; SMTP rows
  can remain pending.
- No scheduled email dispatcher/retry worker is implemented in this repository snapshot. Displayed
  Scheduled At and Retries fields do not promise automatic delivery/retry.
- `LogRotateTimer` can remove old email rows. Opening this screen triggers no delivery.

Recipients, subject, trace, error, and stored body/metadata are sensitive even when not all are
columns. Acceptance: the page is read-only, filters/order match, and the client does not infer
resend/scheduling/retry capability from informational fields.
