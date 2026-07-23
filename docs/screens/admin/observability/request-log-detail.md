# SCR-402 — Request-log detail

**Document ID:** RMC-SDD-SCR-402
**Contract version:** 1.0.0
**Route:** `/admin/request-logs/{id}`
**Platforms:** Web and native
**Status:** Current implementation

Page access/load requires `GET /sbf-log-request/{id}`. Web can supply an SSR-loaded record; otherwise
the shared screen loads it client-side. The page is entirely read-only.

## Details tab field contract

| Section | Fields |
| --- | --- |
| Request Info | ID; URL; Method; Hostname; IP; User Agent; Query Parameters; Trace ID |
| Response Info | Status Code; Duration (ms); Succeeded; Error Message; Error Stack |
| Auth / Access | Token Supplied; URL Public; User Authenticated; User ID; Log IP ID; Lookup Completed |
| Headers / Body | Request Headers; Request Body; Response Headers; Response Body |
| Metadata | Request Timestamp; Created At; Created By; Updated At; Updated By; Version |

Missing/null values display through the shared detail-field representation. Loading shows a spinner;
load failure shows an error banner. There is no refresh button, edit, delete, retry-request, body
download, copy, masking toggle, or export.

## Log IP tab

If `logIpId` is absent, the tab shall state that no Log IP is associated. If present, it calls
`GET /sbf-log-ip/{id}` and displays:

| Section | Fields |
| --- | --- |
| Network | ID; IP; Status; Message |
| Location | Country/Code; Continent/Code; Region/Name; City; District; Zip; Latitude; Longitude; Timezone; Currency |
| Provider | ISP; Org; AS Name; AS Number; Reverse |
| Flags | Mobile; Proxy; Hosting |
| Metadata | Lookup Date; Created At/By; Updated At/By |

The nested backend call also requires its own `GET /sbf-log-ip/{id}` authorization even though the
outer UI guard is keyed to the request-log GET. A forbidden/missing IP lookup renders the tab error.

## Background and restrictions

`IpLookupTimer` may associate `logIpId` after this request detail has loaded; the screen does not
poll or auto-reload, so navigation/reload is required to observe it. `LogRotateTimer` can remove the
request or related IP record. Headers, bodies, errors, network location, and identifiers may be
sensitive and are shown as stored; this page does not perform redaction.

Acceptance: every listed field is read-only, absent association has an explicit empty state,
nested-load errors are contained in the tab, and no action replays the recorded request.
