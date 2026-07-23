# SCR-401 — Request-log list

**Document ID:** RMC-SDD-SCR-401
**Contract version:** 1.0.0
**Route:** `/admin/request-logs`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-log-request/search`. The grid is read-only.

| Columns (sortable) |
| --- |
| Request Timestamp; Method; Status Code; URL; IP; Hostname; Duration; Succeeded; Token Supplied; Public URL; User Authenticated |

| Filter (request key) | Match |
| --- | --- |
| `url`, `ip`, `hostname`, `traceId` | case-insensitive contains |
| `requestSucceeded`, `isTokenSupplied`, `isUrlPublic`, `isUserAuthenticated` | exact true/false/all |
| `requestTimestampFrom`, `requestTimestampTo` | inclusive date-time range |

Initial sort is Request Timestamp descending; pagination is 20/50/100. Selecting the row detail
action navigates to `/admin/request-logs/{id}`. Toolbar contains Refresh and Reset. The screen
exposes no create/edit/delete/replay/export.

## Background and privacy contract

The backend request `LoggingFilter` produces request rows asynchronously around HTTP traffic and can
capture headers, bodies, error information, authentication flags, trace ID, IP, and timing.
`IpLookupTimer` processes up to 44 pending request IPs per execution, marks local addresses complete,
reuses lookup data newer than one day, and associates new enrichment records. `LogRotateTimer` can
remove old request rows. Opening the screen starts none of these processes; there is no polling.

Request data can contain personal data, credentials, tokens, headers, and payload content. Runtime
redaction/grant/retention controls are required; the list’s Token Supplied flag does not reveal the
token itself.

Acceptance: page is grant-protected/read-only, filters/order/page match this contract, detail
navigation carries the selected ID, and enrichment/retention changes appear only after refresh.
