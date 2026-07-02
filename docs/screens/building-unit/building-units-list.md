# Screen SDD — Building Units List

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Building Unit](./create-building-unit.md) and
> [Edit Building Unit](./edit-building-unit.md).

---

## 1. Screen

- **Name:** Building Units
- **Location:** Buildings → *(a building)* → Units
- **Purpose:** List all units (apartments/shops/etc.) of one building in a searchable, sortable, paged grid, and launch creating, opening, or deleting a unit.
- **Scope:** The grid, its filters, and its actions — all scoped to the parent building. Create/Edit are documented separately.

---

## 2. Entry points & navigation

- **Reached from:** the **Units** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Units.
- **Back:** a Back action returns to the parent building's edit/detail screen.
- **Add:** opens [Create Building Unit](./create-building-unit.md) for this building.
- **Open a row (Edit):** opens [Edit Building Unit](./edit-building-unit.md).
- Every action stays within the parent building's context.

---

## 3. Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Home › Buildings › (building name) › Units                             │
│ [ ‹ Back ]                                                             │
│ 🏠 Units                                                    [ + Add ]   │
├──────────────────────────────────────────────────────────────────────┤
│ ▸ Filters                                                              │
│   [ Code ] [ Confined ] [ Covered ] [ Uncovered ] [ Store ] [ Roof ]   │
│   [ Floor ]                                    [ Search ] [ Clear ]     │
├──────────────────────────────────────────────────────────────────────┤
│ Code │ Confined │ Cov. │ Uncov. │ Store │ Roof │ Floor │ Owner │ Tenant │ ⋯ │
│ 101  │  85.00   │ 10.0 │  5.0   │  4.0  │  0.0 │   1   │ A. P. │ K. M.  │✎🗑│
│                                              ◄ 1 2 ►  [10 ▾] per page  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Grid columns

Default sort: **Floor**, ascending.

| Column | Content | Notes |
|---|---|---|
| Code | Unit code | e.g. "101", "Shop A". |
| Confined space | Area (m²) | Enclosed/main area. |
| Covered terraces | Area (m²) | |
| Uncovered terraces | Area (m²) | |
| Store room | Area (m²) | |
| Roof gardens | Area (m²) | |
| Floor | Floor number | May be negative for basement levels. |
| Owner(s) | Names | Derived from the unit's contacts of type **Owner** (comma-joined; blank if none). |
| Tenant(s) | Names | Derived from the unit's contacts of type **Tenant** (comma-joined; blank if none). |

Grid supports sorting and paging. **Page size:** 10 by default; selectable 10 / 25 / 50.

---

## 5. Filters (search panel)

All optional; combining narrows the list. Search applies; Clear resets.

| Filter | Control |
|---|---|
| Code | Text |
| Confined space | Number |
| Covered terraces | Number |
| Uncovered terraces | Number |
| Store room | Number |
| Roof gardens | Number |
| Floor | Number |

> The building context is applied automatically — the list only ever shows units of the current building.

---

## 6. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens [Create Building Unit](./create-building-unit.md) for this building. |
| **Edit** | Row action | All roles | Opens [Edit Building Unit](./edit-building-unit.md). |
| **Delete** | Row action (destructive) | Non-`user` roles (mirrors Buildings list) | Deletes the unit after confirmation; on success the row is removed and the list refreshes. |
| **Search** | Filters panel | All roles | Applies the current filters. |
| **Clear** | Filters panel | All roles | Resets filters and reloads. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 7. Behaviour & interactions

- **Building-scoped:** the list, Add, Edit, and Delete all operate only on units of the current building.
- **Delete confirmation:** Delete prompts for confirmation before removing the unit.
- **Owner/Tenant columns** are read-only summaries built from the unit's contacts; they are managed on the unit's own screen, not edited here.
- **Sorting & paging** operate on the current filtered result set.

---

## 8. States

- **Loading:** grid shows a loading indicator.
- **Loaded:** rows with paging/sorting.
- **Empty:** building has no units (or none match) — empty-state message.
- **Deleting:** affected row shows a busy state.
- **Action success:** confirmation; list refreshes.
- **Action failure (server/network):** error message; list unchanged.

---

## 9. Out of scope

- **Create** / **Edit** unit internals — see their own SDDs.
- Managing the actual **contact records** (people) — units only link to existing contacts.

---

## 10. Open questions

- Should a **total row / summary** of areas (e.g. total m² per column) be shown at the bottom?
- Confirm the exact **role rule for Delete** (assume same as Buildings list — hidden for `user`).
- Should the list indicate units **missing an owner** (data-quality hint)?
