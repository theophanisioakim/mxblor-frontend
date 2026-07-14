# Screen SDD — Create Expense

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Edit Expense](./edit-expense.md);
> reached from the [Expenses list](./expenses-list.md).

---

## 1. Screen

- **Name:** Create Expense
- **Location:** Buildings → *(a building)* → Current Expenses → New
- **Purpose:** Record one or more monthly expense rows for the building via spread create — category, collection type, distribution table, amount, and covered period.
- **Scope:** Create only. Returns to the flat [Expenses list](./expenses-list.md).

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Expenses list](./expenses-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Current Expenses › New.
- **On Save:** returns to the Expenses list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Expense** | Dropdown | Yes | Catalog expense (bank categories excluded). |
| **Collection type** | Dropdown | Yes | Monthly, Capital, Savings, Non-distributed. Drives which fields appear. |
| Distribution table | Dropdown | Conditional | Required for distributed types; hidden for Non-distributed. |
| Start month | Month picker | Yes | First month covered. |
| End month | Month picker | Conditional | Required for Monthly / Capital / Savings — expense is spread across Start→End. Hidden for Non-distributed (single month). |
| **Amount** | Number | Yes | Amount **per month** in the range. Not negative. |
| Description | Text (multi-line) | Auto | Preview of the auto-generated description; read-only. |

**Parent building** is set from context.

---

## 4. Behaviour & interactions

- **Collection type drives the form:** distributed types reveal End month; Non-distributed hides the distribution table and creates a single month.
- **Spreading:** for distributed types, one expense row (plus correlated payment/collection side effects) is created for each month in the range.
- **Prerequisites:** the building must already have at least one distribution table and a yearly budget for each year touched by the period.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Expense | Required | "Expense is required." |
| Collection type | Required | "Collection type is required." |
| Distribution table | Required unless Non-distributed | "Distribution table is required." |
| Amount | Required, ≥ 0 | "Amount is required." |
| Start / End | End ≥ Start for distributed types | "Select the period covered." |

---

## 6. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Spread-creates expenses, returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 7. Out of scope

- Direct editing of **collections** and **payments** — separate balance-sheet screens.
- **Audit fields** — edit only.
