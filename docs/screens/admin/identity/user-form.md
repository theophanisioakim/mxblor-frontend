# SCR-102/103 — User create and edit

**Document ID:** RMC-SDD-SCR-102-103
**Contract version:** 1.0.0
**Routes:** `/admin/user/new`, `/admin/user/{id}`
**Platforms:** Web and native
**Status:** Current implementation
**Mockup:** [Admin form and tabs](../../../mockups/admin-form-desktop.svg)

## Mode and access contract

| Mode | Page grant | Load | Save | Post-save |
| --- | --- | --- | --- | --- |
| Create | `POST /sbf-user` | empty defaults | `POST /sbf-user` | replace route with `/admin/user/{newId}` |
| Edit | `GET /sbf-user/{id}` | GET by ID or web SSR seed | `PUT /sbf-user/{id}` (button also requires update grant) | reset form to returned record |

Create mode contains Details only. Edit mode contains Details, Emails, Phones, Roles, Schemas,
Configuration, and Block Permissions.

## Details field contract

| Field | Type | Create/edit | Rule/default |
| --- | --- | --- | --- |
| `username` | text | editable both | required; maximum 255; no auto-capitalization; username autocomplete |
| `newPassword` | masked password | editable both | required on create, optional on edit; maximum 255; new/current-password autocomplete |
| `active` | checkbox | editable both | default `true` on create |
| `shouldUpdatePassword` | checkbox | editable both | default false/unset |

The backend DTO remains authoritative for password strength and uniqueness. Success/error banners
shall reflect the save result.

## Emails tab

Search is `POST /sbf-user-email/search`, fixed to `userId`. Columns: Email (`email`), Primary
(`primary`), Verified (`verified`), Communication (`communication`), Active (`active`), Created At
(`createdAt`). Filter: `email` contains. Initial sort: Primary descending; pagination 20/50/100.

The Add/Edit modal fields are `email` (required, maximum 500, email keyboard, no capitalization),
`primary`, `verified`, `communication`, and `active` (new default true). Operations are
`POST /sbf-user-email`, `PUT /sbf-user-email/{id}`, and `DELETE /sbf-user-email/{id}` with their
individual grants. Single delete is confirmed; persistent selection supports bulk delete by
issuing one delete per selected row. New Primary, Verified, and Communication values default to
false when unset.

## Phones tab

Search is `POST /sbf-user-phone/search`, fixed to `userId`. Columns: Phone Number (`phoneNumber`),
Primary (`primary`), Verified (`verified`), Communication (`communication`), Active (`active`),
Created At (`createdAt`). Filter: `phoneNumber` contains. Initial sort: Primary descending;
pagination 20/50/100.

The Add/Edit modal field `phoneNumber` is required, maximum 255, and uses telephone input; its
pattern permits an optional leading `+`, digits, spaces, hyphens, and parentheses. The boolean
fields use request keys `primary`, `verified`, `communication`, and `active`; new Active defaults
true and the other flags default false when unset. Operations and grants are the corresponding
`/sbf-user-phone` create/update/delete routes. Delete behavior matches Emails.

## Roles tab

- Load: `GET /sbf-user-role/assign-roles/{userid}` returns assigned and unassigned roles.
- Columns: Role (`roleDescription`), Created At (`createdAt`), Created By (`createdBy`). Client
  filter: `roleDescription` contains. The grid is client-side.
- Selected rows represent the complete desired assignment set; existing assignments are selected.
- Save requires `POST /sbf-user-role/bulk` and sends creates for newly selected roles and deletes for
  deselected existing assignments.
- Save is disabled unless dirty; Reset asks before discarding dirty selection.

## Schemas tab

- Load: `GET /sbf-user-schema/assign-schemas/{userid}`.
- Columns: Schema (`schemaName`), Description (`schemaDescription`), Created At (`createdAt`),
  Created By (`createdBy`). Client filters: `schemaName` and `schemaDescription` contain. The grid
  is client-side.
- Selection/Save/Reset semantics are the same as Roles; save requires
  `POST /sbf-user-schema/bulk`.
- Changes affect the schemas available to this user in authentication/schema switching; they do not
  switch the current administrator’s schema.

## Configuration tab

Search is `POST /sbf-user-configuration/search`, fixed to `userId`. Columns: `key`, `value`,
`description`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`. Filters: `key`, `value`, and
`description` (contains). Initial sort is Key ascending; pagination is 20/50/100. Only Value is
editable. The grid becomes inline-editable only when both `PUT /sbf-user-configuration/{id}` and
`POST /sbf-user-configuration/bulk` are granted; otherwise it is read-only. Updates carry ID, user
ID, key, value, description, and version.

## Block Permissions tab

- Load: `GET /sbf-user-block-permission/assign-block-permissions/{userid}`.
- Columns: Permission (`permissionAlias`), Description (`permissionDescription`), Created At
  (`createdAt`), Created By (`createdBy`). Client filters: `permissionAlias` and
  `permissionDescription` contain.
- Selected rows are the complete desired set of user-specific denied permissions.
- Save requires `POST /sbf-user-block-permission/bulk`; dirty reset/tab switch is confirmed.

## Cross-tab states and restrictions

- Changing away from dirty Roles, Schemas, or Block Permissions opens an “Unsaved Changes” dialog;
  Continue discards selection changes. Email/Phone modal edits and configuration inline edits own
  their grid save states.
- Tabs are unavailable until the user has a persisted ID.
- Read access to the edit page does not itself grant tab mutations. Backend permissions remain
  authoritative for every nested request.
- Assignments are desired-state bulk operations, not immediate writes on each checkbox click.

## Related background processing

User/role/schema/block mutations can invalidate or notify authorization caches; future permission
and menu loads use the new effective grants. Database audit triggers can record changes. Session
rules may reject inactive users or require password change. No screen tab automatically polls.

## Acceptance criteria

1. Create requires password and hides all relationship tabs.
2. Edit loads the requested ID and exposes tabs without exposing existing password material.
3. Every tab applies its fixed `userId` scope.
4. Dirty desired-state tabs warn before reset/tab discard and save only the computed delta.
5. Inline/action controls are read-only or disabled without every documented grant.
6. Successful create transitions to edit mode for the returned ID.
