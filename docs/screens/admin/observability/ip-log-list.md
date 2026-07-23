# SCR-405/406 — IP-log list

**Document ID:** RMC-SDD-SCR-405-406
**Contract version:** 1.0.0
**Routes:** `/admin/ip-logs`, compatibility alias `/admin/log-ip`
**Platforms:** Web and native
**Status:** Current implementation

Both routes render the same component and require `POST /sbf-log-ip/search`. The screen is
read-only.

| Columns (sortable) |
| --- |
| IP; Query; Status; Country; City; Region; ISP; Organization; Mobile; Proxy; Hosting; Lookup Date; Timezone; Country Code; Created At; Created By |

| Filter (request key) | Match |
| --- | --- |
| `ip`, `query`, `status`, `country`, `city`, `isp`, `org` | contains |
| `mobile`, `proxy`, `hosting` | exact true/false/all |

Initial sort is Created At descending; pagination is 20/50/100. Toolbar contains Refresh and Reset.
There is no detail navigation from this list, edit, delete, lookup-now, or export.

`IpLookupTimer` is the primary producer: it examines up to 44 unprocessed request logs, skips/marks
local addresses, reuses a lookup newer than one day, or calls the configured IP integration and
stores enrichment before linking it to the request. Integration failures can stop that timer run.
`LogRotateTimer` can remove old IP rows. Neither route starts a lookup and the grid does not poll.

IP/location/provider/classification fields are personal/operational data. Acceptance: alias behavior,
filters/order, read-only restrictions, and background refresh expectations match this contract.
