# SCR-404 — Integration-log list

**Document ID:** RMC-SDD-SCR-404
**Contract version:** 1.0.0
**Route:** `/admin/integration-logs`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-log-integration/search`. The screen is read-only.

| Columns (sortable) |
| --- |
| Class Name; Method Name; Base URL; Endpoint; Method; Status Code; Duration (ms); Succeeded; Request Time; Error Message; Trace ID; Created At |

| Filter (request key) | Match |
| --- | --- |
| `className`, `methodName`, `baseUrl`, `endpoint`, `method` | contains |
| Status Code (`statusCode`) | exact numeric |
| `traceId`, `errorMessage` | contains |
| Succeeded (`requestSucceeded`) | exact true/false/all |

Initial sort is Request Time descending; pagination is 20/50/100. Toolbar contains Refresh and
Reset. No row detail, create, edit, delete, replay, or export action exists.

Shared integration clients produce these records around external requests and may associate them
with request context/trace data. They can record status, bodies/headers in backend data beyond the
columns shown and can update integration failure/circuit-breaker state. `LogRotateTimer` can remove
old rows under configured limits. Opening the screen starts no integration call or retention job,
and the grid does not poll.

## Background processing

The producer is the shared integration-client runtime; retention is `LogRotateTimer`. Neither is a
screen-triggered request.

Acceptance: page is grant-protected/read-only, filters/order/page match this contract, and no action
can replay external traffic.
