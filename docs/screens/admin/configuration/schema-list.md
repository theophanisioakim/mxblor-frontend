# SCR-201 — Schema list

**Document ID:** RMC-SDD-SCR-201
**Contract version:** 1.0.0
**Route:** `/admin/schema`
**Platforms:** Web and native
**Status:** Current implementation

Page access/search requires `POST /sbf-schema/search`.

| Contract area | Definition |
| --- | --- |
| Columns | Name; Description; Active; Created At; Created By; Updated At; Updated By (sortable/read-only) |
| Filters | `name` contains; `description` contains; `active` true/false/all |
| Initial order | Created At descending |
| Pagination | 20/50/100 |
| Add | `/admin/schema/new`; requires `POST /sbf-schema` |
| Edit | `/admin/schema/{id}`; enabled with `PUT /sbf-schema/{id}` |
| Delete | confirmed single row; requires `DELETE /sbf-schema/{id}` |
| Toolbar | Add, Refresh, Reset |

The screen has no row-selection/bulk-delete control. The resource operation manages the schema
registry record exposed by `/sbf-schema`; this SDD does not promise that a physical tenant database
schema is provisioned or dropped by the list action. Tenant provisioning/drop is a separate backend
contract.

## Background processing

Schema status/assignment can affect authentication and authorization context after backend
cache/session rules. Audit triggers may record changes; the grid does not poll.

Acceptance: list/filter/order/actions match this definition, delete is confirmed, and no physical
tenant lifecycle behavior is inferred from the registry UI.
