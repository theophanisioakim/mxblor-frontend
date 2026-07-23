# SCR-403 — Server-log list

**Document ID:** RMC-SDD-SCR-403
**Contract version:** 1.0.0
**Route:** `/admin/server-logs`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-log-server/search`. The screen is read-only.

| Columns (sortable) |
| --- |
| Timestamp; Level; Logger; Instance ID; Message; Exception |

Filters `level`, `logger`, `instanceId`, `message`, and `exception` are contains matches.
`timestampFrom`/`timestampTo` are inclusive date-time bounds. Initial sort is Timestamp descending;
pagination is 20/50/100. Toolbar contains Refresh and Reset. There is no detail, edit, delete,
stack download, or export.

The configured asynchronous database log appender produces rows from runtime logs, including timer
and integration failures. Initialization controls whether that appender is attached; timer
framework execution currently skips when it is absent. `LogRotateTimer` can remove old server logs.
Opening the screen starts neither logging nor rotation and the grid does not poll.

Server messages/exceptions can contain operational or personal data. Access and retention must be
restricted. Acceptance: the page is grant-protected/read-only and its filters/order/page behavior
matches this contract.
