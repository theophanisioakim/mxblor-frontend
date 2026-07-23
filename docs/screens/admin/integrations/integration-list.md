# SCR-301 — Integration list

**Document ID:** RMC-SDD-SCR-301
**Contract version:** 1.0.0
**Route:** `/admin/integration`
**Platforms:** Web and native
**Status:** Current implementation

Page access/search requires `POST /sbf-integration/search`.

| Columns (sortable/read-only) |
| --- |
| Class Name; Method Name; Base URL; Endpoint; Method; Timeout (s); Active; Failed Count; Created At; Updated At |

| Filter (request key) | Match |
| --- | --- |
| Class Name (`className`) | contains |
| Method Name (`methodName`) | contains |
| Base URL (`baseUrl`) | contains |
| Endpoint (`endpoint`) | contains |
| Method (`method`) | contains |
| Active (`active`) | exact true/false/all |

Initial sort is Created At descending; pagination is 20/50/100.

Add navigates to `/admin/integration/new` and requires `POST /sbf-integration`. Edit navigates to
`/admin/integration/{id}` and is enabled with `PUT /sbf-integration/{id}`. Single delete is
confirmed; persistent cross-page selection supports delete-selected. Delete requires
`DELETE /sbf-integration/{id}` and bulk UI deletion sends one request per selected record.
Refresh and Reset are available.

## Related processing

Integration records are runtime configuration consumed by integration clients. Calls made elsewhere
can update Failed Count/Active and create integration-log rows; therefore list values may change
without this screen initiating the call. `LogRotateTimer` affects log rows, not integration
configuration. The list does not poll or execute/test an integration.

Acceptance: filters/order/actions/grants match this contract, deleting is confirmed, and opening or
refreshing the list never performs the configured external request.
