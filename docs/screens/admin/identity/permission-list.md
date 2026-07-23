# SCR-107 — Permission list

**Document ID:** RMC-SDD-SCR-107
**Contract version:** 1.0.0
**Route:** `/admin/permission`
**Platforms:** Web and native
**Status:** Current implementation

Page access/search requires `POST /sbf-permission/search`.

## Columns and editability

| Column (response key) | Editable |
| --- | --- |
| Alias (`alias`) | yes |
| Description (`description`) | yes |
| Endpoint (`endpoint`) | no |
| Method (`method`) | no |
| Public (`isPublic`) | no |
| OTP Enabled (`otpEnabled`) | yes; non-null boolean |
| Created At (`createdAt`), Updated At (`updatedAt`), Created By (`createdBy`) | no |

All columns are sortable. Initial sort is Created At descending; pagination is 20/50/100.

## Filters

`alias`, `description`, `endpoint`, and `method` are contains filters. `isPublic` and `otpEnabled`
are nullable exact booleans. Filters combine with AND.

## Actions and restrictions

The grid is inline-editable only when the user has both `PUT /sbf-permission/{id}` and
`POST /sbf-permission/bulk`; otherwise all rows render read-only. Per-row and save-all payloads
preserve endpoint, method, public flag, ID, and version while applying Alias, Description, and OTP
Enabled changes. The UI exposes no permission create/delete action and cannot change route identity
or public exposure.

Permission records are synchronized/discovered by backend startup/catalog logic and updates can
invalidate effective-permission caches. OTP Enabled affects future protected requests, not requests
already completed. Audit triggers may record edits; there is no polling.

## Background processing

Permission catalog startup/synchronization and authorization cache coherence can add/reconcile or
activate changed permission data independently of this list. Opening the screen runs neither.

## Acceptance criteria

1. Endpoint, Method, and Public never enter edit mode.
2. Missing either edit grant makes the entire grid read-only.
3. Save-all sends only changed rows and preserves versioned immutable values.
4. Filters and initial ordering match this contract.
