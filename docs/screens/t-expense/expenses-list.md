# Screen SDD — Expenses List (by year)

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the **Current Expenses** tile on the
> [Edit Building](../building/edit-building.md) hub. Entry point to
> [Create Expense](./create-expense.md) and (via drill-down) [Edit Expense](./edit-expense.md).

---

## 1. Screen

- **Name:** Current Expenses
- **Location:** Buildings → *(a building)* → Current Expenses
- **Purpose:** Show the building's expenses **summarised per year**, with category totals, and act as the launch point for adding an expense and drilling into a year's detail.
- **Scope:** The year-summary grid + Add. Per-month/per-expense detail views are **related screens** (out of scope here — see §7).

---

## 2. Entry points & navigation

- **Reached from:** the **Current Expenses** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Current Expenses.
- **Back:** returns to the parent building.
- **Add:** opens [Create Expense](./create-expense.md).
- **Open a row (year):** drills into that year's detail (by-month view), from where an individual expense can be opened and edited.

---

## 3. Grid columns

Rows are **years**. Default sort: most recent year first.

| Column | Content |
|---|---|
| Year | The reference year. |
| Total capital | Sum of capital-type expenses that year. |
| Total monthly | Sum of monthly-type expenses. |
| Non-distributed | Sum of non-distributed expenses. |
| Savings | Sum of savings-type expenses. |
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
| **Add** | Toolbar (primary) | All roles | Opens [Create Expense](./create-expense.md). |
| **Open year** | Row action | All roles | Drills into the year's detail (by-month). |
| **Back** | Above grid | All roles | Returns to the parent building. |

> The year-summary rows themselves are not directly editable/deletable; individual expenses are edited/deleted from the year drill-down.

---

## 6. States

Loading / Loaded / Empty (no expenses) / failure — as standard.

---

## 7. Related screens (out of scope for now)

- **Expenses by month / by year** drill-down views.
- **Expense view** (a single expense with its collections/payments).
These will get their own SDDs if/when the specialized views are specced.

---

## 8. Open questions

- Should the summary show a **grand-total row** across years?
- Confirm the exact **category columns** (taken from v2: capital / monthly / non-distributed / savings / bank).
