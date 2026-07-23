# SCR-101 — User list

**Document ID:** RMC-SDD-SCR-101
**Contract version:** 1.0.0
**Route:** `/admin/user`
**Platforms:** Web and native
**Status:** Current implementation

## Access and API contract

Page access requires `POST /sbf-user/search`. Search uses that operation. Add, edit, and delete
controls require `POST /sbf-user`, `PUT /sbf-user/{id}`, and `DELETE /sbf-user/{id}` respectively.

## Data, filters, and ordering

| Columns (all sortable/read-only) |
| --- |
| Username; Active; Should Update Password; Created At; Created By; Updated At; Updated By |

| Filter | Type | Match |
| --- | --- | --- |
| `username` | text | case-insensitive contains |
| `active` | nullable checkbox | exact true/false/all |

Initial sort is Created At descending. Pagination is 20/50/100.

## Actions and restrictions

- Add navigates to `/admin/user/new`.
- Edit navigates to `/admin/user/{id}`.
- Single delete requires confirmation and states the username; bulk delete operates on persistent
  cross-page selection. Both issue one delete request per record and are disabled without delete.
- Refresh reruns search; Reset restores initial grid controls.
- Password values are never displayed. The list does not expose role/schema/permission details.

## Related background processing

User records are updated by explicit administration/authentication workflows. Session refresh and
authorization caches may observe active/password/schema changes after backend cache/session rules;
the grid itself does not poll. Database audit triggers may record mutations. No timer is started by
opening this screen.

## Acceptance criteria

1. A user without the search grant cannot render the page.
2. Filter/sort/page values are sent to server search as specified.
3. Mutation controls reflect their individual grants and successful mutations refresh the data.
4. Destructive actions require confirmation and never expose a stored password.
