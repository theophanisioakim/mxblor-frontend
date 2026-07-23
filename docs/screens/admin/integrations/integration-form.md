# SCR-302/303 — Integration create and edit

**Document ID:** RMC-SDD-SCR-302-303
**Contract version:** 1.0.0
**Routes:** `/admin/integration/new`, `/admin/integration/{id}`
**Platforms:** Web and native
**Status:** Current implementation

## Details contract

| Field | Type | Required | Client rule/default |
| --- | --- | --- | --- |
| `baseUrl` | text | yes | maximum 255 |
| `endpoint` | text | yes | maximum 255 |
| `method` | text | yes | maximum 255; free text, not a fixed HTTP-method select |
| `timeoutSecs` | number | yes | no additional client min/max |
| `className` | text | yes | maximum 255 |
| `methodName` | text | yes | maximum 255 |
| `description` | text | no | no explicit client max |
| `failedCount` | number | no | no explicit client min/max/default |
| `active` | checkbox | no | no explicit create default in this form |

Create page requires/saves through `POST /sbf-integration`. Edit page requires
`GET /sbf-integration/{id}`, loads by ID or SSR seed, and saves through
`PUT /sbf-integration/{id}` when update is granted. Successful create replaces the route with the
new edit URL; update resets from the returned record.

## Integration Logs tab (edit only)

The tab is available after the integration data has loaded and fixes every search to the current
record’s `className` and `methodName`.

| Columns | Filters |
| --- | --- |
| Status Code; Duration; Succeeded; Request Time; Error Message; Base URL; Endpoint; Method | Endpoint contains; Method contains; Status Code exact numeric; Succeeded true/false/all |

Initial sort is Request Time descending; pagination is 20/50/100. The tab is read-only with Refresh
and Reset. It calls `POST /sbf-log-integration/search`; no log mutation is exposed.

## Restrictions and related processing

- The screen does not validate that a Java class/method exists and does not provide Test/Execute.
- Method remains free text; timeout/failure values rely on backend validation beyond the listed
  client constraints.
- Runtime integration clients—not this form—produce log rows, measure duration/status, and update
  failures/circuit-breaker state.
- `LogRotateTimer` may remove old integration logs. No automatic polling exists.

Acceptance: required/max-length behavior and separate create/read/update grants work as documented;
the log tab is scoped by both implementation identifiers and remains read-only.
