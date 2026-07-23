# SCR-004 — Grid showcase

**Document ID:** RMC-SDD-SCR-004
**Contract version:** 1.0.0
**Route:** `/grid`
**Platforms:** Web and native
**Status:** Current implementation

## Full-featured grid

The grid starts with 23 deterministic local people. Columns are ID, Name, Age, Role, Active, Joined,
and Email. ID, Name, Age, and Joined are sortable; initial sort is ID ascending. Initial page size
is 5 with choices 5, 10, and 20.

| Filter | Type | Rule |
| --- | --- | --- |
| `q` / Search name | text | case-insensitive contains against Name |
| `status` | select | Any, Active, or Inactive; exact boolean match |

| Action | Contract |
| --- | --- |
| Add person | opens modal; Name required, Age numeric, Active switch; assigns next ID, generated email, Engineer role, current joined date |
| Edit | opens the same modal and updates the selected local row |
| Delete | asks for confirmation, then removes the local row |
| Delete selected | removes all selected local rows |
| Email | writes the selected email to debug logging only; no email is sent |
| Refresh | rereads current in-memory data |
| Reset | restores grid controls, not deleted/edited seed data |
| Expand row | displays name, role, and joined year |

## Inline-edit grid

The second grid starts with four local people. ID is read-only; Name, Age, and Active are editable.
Dirty edits can be saved per row; no bulk API or persistence exists.

## Restrictions and acceptance

There is no backend, permission gate, automatic polling, durable persistence, or real message
delivery. Reloading recreates the seeded data.

## Background processing

None. All filtering, sorting, pagination, selection, mutation, and refresh behavior uses component
state in the current client process.

1. Client-side filters, sort, pagination, selection, expansion, modal edit, and inline edit work on
   web and native.
2. Confirmed delete removes only in-memory rows.
3. Reload restores the original 23/4 seeded records.
