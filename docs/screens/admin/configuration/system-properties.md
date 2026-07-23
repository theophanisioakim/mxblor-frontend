# SCR-205 — System properties

**Document ID:** RMC-SDD-SCR-205
**Contract version:** 1.0.0
**Route:** `/admin/system-properties`
**Platforms:** Web and native
**Status:** Current implementation

Page access/search requires `POST /sbf-system-properties/search`.

| Column (response key) | Sortable | Editable |
| --- | --- | --- |
| Key (`key`) | yes | no |
| Type (`type`) | yes | no |
| Value (`value`) | yes | yes when fully granted |
| Description (`description`) | yes | no |
| `createdAt`, `updatedAt`, `createdBy`, `updatedBy` | yes | no |

Filters are `key`, `type`, `value`, and `description`; each is a case-insensitive contains match.
Initial sort is Key ascending; pagination is 20/50/100.

Inline edit is enabled only with both `PUT /sbf-system-properties/{id}` and
`POST /sbf-system-properties/bulk`. Updates preserve ID, Key, Type, Description, and Version and
change Value only. Without either grant the grid is read-only. There is no create/delete control.

System properties are global/main-schema configuration. Runtime services may consume/cache changed
values for authentication, integrations, communication, retention, and other behavior; activation
timing is owned by each backend consumer. This screen does not restart services or trigger timers.
Secret-bearing values must be masked/restricted operationally and must never be copied to client
documentation.

Acceptance: page/edit access fails closed, only Value can change, filters/order match this
contract, and a successful save is not represented as an application restart.
