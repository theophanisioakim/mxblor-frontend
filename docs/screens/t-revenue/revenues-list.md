# Screen SDD — Revenues List (by year)

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the **Revenues** tile on the
> [Edit Building](../building/edit-building.md) hub. Entry point to
> [Create Revenue](./create-revenue.md) and (via drill-down) [Edit Revenue](./edit-revenue.md).

---

## 1. Screen

- **Name:** Revenues
- **Location:** Buildings → *(a building)* → Revenues
- **Purpose:** Show the building's revenues (income) **summarised per year**, and launch adding a revenue / drilling into a year.
- **Scope:** Year-summary grid + Add. Per-month/detail views are related screens (out of scope — §7).

---

## 2. Entry points & navigation

- **Reached from:** the **Revenues** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Revenues.
- **Back:** returns to the parent building.
- **Add:** opens [Create Revenue](./create-revenue.md).
- **Open a row (year):** drills into that year's detail, from where a revenue can be opened and edited.

---

## 3. Grid columns

Rows are **years**. Default sort: most recent first.

| Column | Content |
|---|---|
| Year | Reference year. |
| Total capital | Sum of capital-type revenues. |
| Total monthly | Sum of monthly-type revenues. |
| Bank deposit / withdrawal | Net bank movements. |

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
| **Add** | Toolbar (primary) | All roles | Opens [Create Revenue](./create-revenue.md). |
| **Open year** | Row action | All roles | Drills into the year's detail. |
| **Back** | Above grid | All roles | Returns to the parent building. |

> Year-summary rows are not directly editable/deletable; individual revenues are edited/deleted from the year drill-down.

---

## 6. States

Loading / Loaded / Empty / failure — as standard.

---

## 7. Related screens (out of scope for now)

- **Revenues by month / by year** drill-down views.
- **Revenue view** (a single revenue with its payments).

---

## 8. Open questions

- Confirm the exact **category columns** (from v2: capital / monthly / bank).
- Grand-total row across years?
