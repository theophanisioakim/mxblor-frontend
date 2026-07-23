# SCR-204 — Schema properties

**Document ID:** RMC-SDD-SCR-204
**Contract version:** 1.0.0
**Route:** `/admin/schema-properties` and Schema form Properties tab
**Platforms:** Web and native
**Status:** Current implementation

Page route access/search requires `POST /sbf-schema-properties/search`. The embedded tab uses the
same search operation.

| Column (response key) | Sortable | Editable |
| --- | --- | --- |
| Key (`key`) | yes | no |
| Type (`type`) | yes | no |
| Value (`value`) | yes | yes when fully granted |
| Description (`description`) | yes | no |
| `createdAt`, `updatedAt`, `createdBy`, `updatedBy` | yes | no |

Filters are `key`, `type`, `value`, and `description`; each is a case-insensitive contains match.
Initial sort is Key ascending; pagination is 20/50/100.

Inline edit is enabled only when both `PUT /sbf-schema-properties/{id}` and
`POST /sbf-schema-properties/bulk` are granted. Per-row/save-all updates preserve ID, Key, Type,
Description, and Version and change Value only. Otherwise the grid is read-only. Toolbar contains
Refresh and Reset; there is no create/delete action.

Properties are resolved in the current authenticated schema context. Runtime services may cache
property values and react to update/cache invalidation independently; opening the screen does not
run a background job. Values can be security-sensitive and shall not be copied into documentation.

Acceptance: only Value is editable, both grants are necessary, filters/order match this contract,
and every request stays in the selected tenant context.
