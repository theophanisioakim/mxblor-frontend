# Screen SDD — Distribution Tables List

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Distribution Table](./create-distribution-table.md) and
> [Edit Distribution Table](./edit-distribution-table.md).

---

## 1. Screen

- **Name:** Distribution Tables
- **Location:** Buildings → *(a building)* → Distribution Tables
- **Purpose:** List the building's distribution tables — the percentage splits that decide how each expense is shared across units — in a searchable, paged grid.
- **Scope:** Grid, filters, and actions, scoped to the parent building.

---

## 2. Entry points & navigation

- **Reached from:** the **Distribution Tables** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Distribution Tables.
- **Back:** returns to the parent building.
- **Add:** opens [Create Distribution Table](./create-distribution-table.md).
- **Open a row (Edit):** opens [Edit Distribution Table](./edit-distribution-table.md).

---

## 3. Grid columns

Default sort: by name.

| Column | Content | Notes |
|---|---|---|
| Name | Table name | e.g. "By area", "Equal shares". |
| Default | Yes/No | Whether it's the building's default table. At most one per building. |
| Hidden | Yes/No | Whether it's hidden from selection lists elsewhere. |

Grid supports sorting and paging (10 / 25 / 50 per page).

> Hidden tables (see the Edit screen's *Hidden* flag) are excluded from selection lists elsewhere but
> **still appear here**, so they can be managed.

---

## 4. Filters

| Filter | Control |
|---|---|
| Name | Text |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens Create Distribution Table. |
| **Edit** | Row action | All roles | Opens Edit Distribution Table. |
| **Delete** | Row action (destructive) | Non-`user` roles | Deletes after confirmation. **Refused** while a budget month is billed through the table. |
| **Search** / **Clear** | Filters panel | All roles | Apply / reset filters. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 6. States

Loading / Loaded / Empty / Deleting / success / failure — as standard.

---

## 7. Out of scope

- Create/Edit internals (including the percentage grid) — see their SDDs.

---

## 8. Resolved

- **Hidden tables are shown here**, so they remain manageable; they are only hidden from selection
  lists elsewhere.
- **Delete is blocked** while a monthly budget is billed through the table.
- **No "totals 100%" column.** A table can no longer be saved unless it totals 100, so the column
  would report the same value on every row.
