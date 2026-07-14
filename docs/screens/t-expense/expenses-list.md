# Screen SDD — Expenses List (flat)

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the **Current Expenses** tile on the
> [Edit Building](../building/edit-building.md) hub. Entry point to
> [Create Expense](./create-expense.md) and [Edit Expense](./edit-expense.md).

---

## 1. Screen

- **Name:** Current Expenses
- **Location:** Buildings → *(a building)* → Current Expenses
- **Purpose:** Show the building's expenses in one filterable grid, with a year summary strip for type totals, and act as the launch point for adding or editing an expense.
- **Scope:** Summary strip + expense grid + Add. No year→month drill-down.

---

## 2. Entry points & navigation

- **Reached from:** the **Current Expenses** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Current Expenses.
- **Back:** returns to the parent building.
- **Add:** opens [Create Expense](./create-expense.md).
- **Edit row:** opens [Edit Expense](./edit-expense.md) for that expense.

---

## 3. Year summary strip

Above the grid, show totals for the **selected filter year** (default: current calendar year):

| Tile | Content |
|---|---|
| Capital | Sum of capital-type expenses that year. |
| Monthly | Sum of monthly-type expenses. |
| Non-distributed | Sum of non-distributed expenses. |
| Savings | Sum of savings-type expenses. |
| Bank deposit / withdrawal | Net bank movements (deferred until the 191/192 engine exists — may show zero). |

The strip updates when the user filters by year.

---

## 4. Grid columns

Rows are **individual expenses** (one row per reference month). Default sort: most recent reference month first.

| Column | Content |
|---|---|
| Period | Reference month (e.g. 3/2026). |
| Expense | Catalog expense code and name. |
| Collection type | Monthly / Capital / Savings / Non-distributed. |
| Amount | Expense amount. |
| Distribution table | Table name (blank for non-distributed). |
| Description | Auto-generated description. |

Paging 10 / 25 / 50 per page.

---

## 5. Filters

| Filter | Control |
|---|---|
| Year | Year picker |
| Month | Month dropdown (optional) |
| Expense | Expense catalog dropdown |
| Collection type | Collection type dropdown |

---

## 6. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens [Create Expense](./create-expense.md). |
| **Edit** | Row action | All roles | Opens [Edit Expense](./edit-expense.md). |
| **Delete** | Row action | Non-`user` roles | Confirms, deletes unposted expense and its correlated payment/collection rows. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 7. States

Loading / Loaded / Empty (no expenses) / failure — as standard.

---

## 8. Out of scope

- Per-unit **collections** and building **payments** screens (separate balance-sheet ledgers).
- Bank-balancing synthetic expenses (191/192).

---

## 9. Open questions

- None — flat layout supersedes the earlier year drill-down design.
