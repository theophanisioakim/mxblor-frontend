# SCR-105/106 — Role create and edit

**Document ID:** RMC-SDD-SCR-105-106
**Contract version:** 1.0.0
**Routes:** `/admin/role/new`, `/admin/role/{id}`
**Platforms:** Web and native
**Status:** Current implementation

## Details contract

| Field | Type | Required | Validation/default |
| --- | --- | --- | --- |
| `description` | text | yes | maximum 255 |
| `managementLevel` | number | yes | 0–999 inclusive; default 0; no client decimal-place rule |

Create page requires/saves with `POST /sbf-role`. Edit page requires
`GET /sbf-role/{id}`, loads by ID or SSR seed, and saves with `PUT /sbf-role/{id}` when the update
grant exists. Successful create replaces the route with the new edit URL; successful update resets
the form to returned values.

## Permissions tab (edit only)

- Load: `GET /sbf-role-permission/assign-permissions/{roleid}` returns assigned and unassigned
  permissions.
- Columns: Permission (`permissionAlias`), Description (`permissionDescription`), Created At
  (`createdAt`), Created By (`createdBy`).
- Client filters: `permissionAlias` and `permissionDescription`, case-insensitive contains.
- Existing assignments start selected; selection is the complete desired state.
- Save requires `POST /sbf-role-permission/bulk` and sends create/delete deltas.
- Save is disabled until dirty. Reset or switching tabs asks before discarding dirty changes.

## Restrictions and related processing

Permissions are unavailable until a role ID exists. Viewing the role does not grant assignment
save. Assignment changes can update effective authorization for users of the role and trigger
permission cache coherence; database audit triggers can record changes. There is no polling.

## Acceptance criteria

1. Invalid required/range values cannot submit.
2. Create mode has no Permissions tab.
3. Edit mode uses desired-state permission selection and warns before discard.
4. Page and Save controls enforce their separate grants.
