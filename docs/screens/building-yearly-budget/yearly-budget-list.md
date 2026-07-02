# Screen SDD — Yearly Budget List

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Yearly Budget](./create-yearly-budget.md) and
> [Edit Yearly Budget](./edit-yearly-budget.md).

---

## 1. Screen

- **Name:** Yearly Budget
- **Location:** Buildings → *(a building)* → Yearly Budget
- **Purpose:** List the building's yearly budgets (one per reference year), showing the total for each, in a searchable, paged grid.
- **Scope:** Grid, filters, and actions, scoped to the parent building.

---

## 2. Entry points & navigation

- **Reached from:** the **Yearly Budget** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Yearly Budget.
- **Back:** returns to the parent building.
- **Add:** opens [Create Yearly Budget](./create-yearly-budget.md).
- **Open a row (Edit):** opens [Edit Yearly Budget](./edit-yearly-budget.md).

---

## 3. Grid columns

Default sort: by year (most recent first).

| Column | Content | Notes |
|---|---|---|
| Year | Reference year | e.g. 2026. |
| Total | Sum of monthly amounts | Computed across the 12 months. |
| Created at / by, Updated at / by | Date/time / user | Audit info. |

Grid supports sorting and paging (10 / 25 / 50 per page).

---

## 4. Filters

| Filter | Control |
|---|---|
| Year | Year picker |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens Create Yearly Budget. |
| **Edit** | Row action | All roles | Opens Edit Yearly Budget. |
| **Delete** | Row action (destructive) | Non-`user` roles | Deletes after confirmation. |
| **Search** / **Clear** | Filters panel | All roles | Apply / reset filters. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 6. States

Loading / Loaded / Empty / Deleting / success / failure — as standard.

---

## 7. Out of scope

- Create/Edit internals (the monthly grid) — see their SDDs.

---

## 8. Open questions

- Should the list prevent **two budgets for the same year** (assume one budget per year)?
- Confirm **Delete** role rule (hidden for `user`).
