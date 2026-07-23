# SCR-104 — Role list

**Document ID:** RMC-SDD-SCR-104
**Contract version:** 1.0.0
**Route:** `/admin/role`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-role/search`.

| Contract area | Definition |
| --- | --- |
| Columns | Description; Created At; Created By; Updated At; Updated By (sortable/read-only) |
| Filters | Description (`description`) — case-insensitive contains |
| Initial order | Created At descending |
| Pagination | 20/50/100 |
| Add | `/admin/role/new`; requires `POST /sbf-role` |
| Edit | `/admin/role/{id}`; requires `PUT /sbf-role/{id}` for enabled control |
| Delete | single confirmed or persistent selected rows; requires `DELETE /sbf-role/{id}` |
| Toolbar | Add, Refresh, Reset |

Deletion can affect effective permissions/menu visibility for assigned users; referential rules and
backend authorization are authoritative. Permission cache coherence and audit triggers are related
backend processing. The grid does not poll.

Acceptance: page and each mutation fail closed by grant, search honors the documented filter/order,
and delete requires confirmation.
