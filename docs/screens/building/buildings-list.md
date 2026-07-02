# Screen SDD — Buildings List

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.
> This is the entry point to [Create New Building](./create-building.md) and
> [Edit Building](./edit-building.md).

---

## 1. Screen

- **Name:** Buildings
- **Location:** Buildings *(top-level)*
- **Purpose:** List all buildings the user can access in a searchable, sortable, paged grid, and act as the launch point for creating, opening (edit/detail), and deleting a building.
- **Scope:** The grid, its search filters, and its row/toolbar actions. The create and edit screens are documented separately.

---

## 2. Entry points & navigation

- **Reached from:** the main navigation (**Buildings**).
- **Breadcrumb:** Home › Buildings.
- **Add:** opens the [Create New Building](./create-building.md) screen.
- **Open a row (Edit):** opens the [Edit Building](./edit-building.md) screen for that building.
- **Returning:** after a successful create/edit/delete, the user lands back on this list, refreshed.

---

## 3. Layout

Top to bottom: title with an **Add** action, a collapsible **filters/search** panel, then the **grid** with per-row actions and pagination.

```
┌────────────────────────────────────────────────────────────────────┐
│ Home › Buildings                                                     │
│ 🏢 Buildings                                            [ + Add ]     │
├────────────────────────────────────────────────────────────────────┤
│ ▸ Filters                                                            │
│   [ Code ] [ Name .......................... ]                       │
│   [ No. ] [ Street ................. ] [ Post code ] [ Area ...... ] │
│   [ City ...... ] [ Country ▾ (multi) ]                              │
│   [ Email ...... ] [ Manager ▾ ] [ Acquired 📅 ] [ Active: any ▾ ]   │
│                                        [ Search ]  [ Clear ]         │
├────────────────────────────────────────────────────────────────────┤
│ Code │ Name        │ Units │ Address            │ Manager │ Email │…│ ⋯ │
│ A01  │ Sunrise Ct. │   8   │ 51 Makarios, Nic.  │ M. P.   │ …     │…│ ✎ 🗑│
│ A02  │ …           │       │                    │         │       │  │    │
│                                        ◄  1 2 3  ►   [10 ▾] per page │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Grid columns

Default sort: **Code**, ascending.

| Column | Content | Notes |
|---|---|---|
| Code | Building code | Primary identifier; default sort column. |
| Name | Building name | |
| Units | Count of building units | Numeric. |
| Address | Composed address | Joins number, street, area/region, post code, city, country into one readable line (parts that are empty are skipped). |
| Manager | Building manager (user) | Resolved to the user's name, not an id. |
| Email | Building email address | |
| Published | Published date/time | Blank if not yet published. |
| Active | Active status | Yes/No (or a status indicator). |

Grid supports sorting and paging. **Page size:** 10 by default; selectable 10 / 25 / 50.

---

## 5. Filters (search panel)

All filters are optional; combining them narrows the list. Applying runs the search; Clear resets them.

| Filter | Control | Notes |
|---|---|---|
| Code | Text | |
| Name | Text | |
| Number | Text | Address number. |
| Street | Text | |
| Post code | Text | |
| Area / region | Text | |
| City | Text | |
| Country | Dropdown, **multi-select** | Filter by one or more countries. |
| Email | Text | |
| Manager | Dropdown (users) | |
| Acquired date | Date picker | |
| Active | Tri-state (Any / Yes / No) | Nullable — "Any" applies no active filter. |

---

## 6. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens [Create New Building](./create-building.md). |
| **Edit** | Row action | All roles | Opens [Edit Building](./edit-building.md) for that row. |
| **Delete** | Row action | Hidden for the **user** role | Deletes the building after confirmation (see §7); on success the row is removed and the list refreshes. |
| **Search** | Filters panel | All roles | Applies the current filters. |
| **Clear** | Filters panel | All roles | Resets all filters and reloads the full list. |

---

## 7. Behaviour & interactions

- **Role-based Delete:** the Delete row action is not shown to users with the **user** role; other roles see it.
- **Delete confirmation:** Delete asks for confirmation before removing the building; on confirm it deletes and refreshes the list, on cancel nothing changes.
- **Sorting & paging** operate on the current filtered result set.
- **Empty result:** when no buildings match, the grid shows an empty state rather than rows.

---

## 8. States

- **Loading:** grid shows a loading indicator while fetching.
- **Loaded:** rows displayed with paging/sorting.
- **Empty:** no buildings (or none match the filters) — an empty-state message is shown.
- **Deleting:** the affected row/action shows a busy state until the delete resolves.
- **Action success:** confirmation message; list refreshes.
- **Action failure (server/network):** error message; list unchanged.

---

## 9. Out of scope

- **Create** and **Edit** screen internals — see their own SDDs.
- Bulk actions, export, and column customisation (not present in the reference; revisit if needed — see open questions).

---

## 10. Open questions

- Should the list support **bulk delete / bulk actions** or **export**, or stay single-row only?
- Should columns be **user-customisable** (show/hide, reorder)?
- Confirm the **Active** column presentation — plain Yes/No text or a status chip/indicator.
- Should filters be **collapsed by default** or expanded on first load?
