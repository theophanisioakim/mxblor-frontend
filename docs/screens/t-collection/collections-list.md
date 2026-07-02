# Screen SDD — Collections List (by year)

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the **Collections** tile on the
> [Edit Building](../building/edit-building.md) hub. Related to
> [Create Collection](./create-collection.md) and [Edit Collection](./edit-collection.md).

---

## 1. Screen

- **Name:** Collections
- **Location:** Buildings → *(a building)* → Collections
- **Purpose:** Show what the building has collected from its units against expenses, **summarised per year** (collected vs. uncollected), and drill into a year's detail.
- **Scope:** Year-summary grid + Add. Detailed list, batch collection, bulk payment, and by-expense views are related screens (out of scope — §7).

---

## 2. Entry points & navigation

- **Reached from:** the **Collections** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Collections.
- **Back:** returns to the parent building.
- **Add:** opens [Create Collection](./create-collection.md).
- **Open a row (year):** drills into that year's detail (the detailed/by-expense views), from where a collection can be opened and edited.

---

## 3. Grid columns

Rows are **years**. Default sort: most recent first.

| Column | Content |
|---|---|
| Year | Reference year. |
| Uncollected | Amount still owed by units. |
| Collected | Amount collected. |
| Total | Total due (collected + uncollected). |
| Action | Quick action(s) for the year (e.g. open detailed view / batch collect). |

Paging 10 / 25 / 50 per page.

---

## 4. Filters

| Filter | Control |
|---|---|
| Year | Year picker |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens [Create Collection](./create-collection.md). |
| **Open year / Action** | Row action | All roles | Drills into the year's detail (detailed list / by-expense). |
| **Back** | Above grid | All roles | Returns to the parent building. |

> Year-summary rows are not directly editable/deletable; individual collections are edited/deleted from the year drill-down.

---

## 6. States

Loading / Loaded / Empty / failure — as standard.

---

## 7. Related screens (out of scope for now)

- **Collections detailed list** and **by month / by year** views.
- **Collections by expense** view.
- **Batch collection** (collect from many units at once) and **bulk payment**.

---

## 8. Open questions

- Confirm what the **Action** column offers on each year row (detailed view? batch collect?).
- Should the summary show an **overall collected/uncollected %**?
