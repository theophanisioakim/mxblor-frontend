# Screen SDD — Create Expense

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Edit Expense](./edit-expense.md);
> reached from the [Expenses list](./expenses-list.md).

---

## 1. Screen

- **Name:** Create Expense
- **Location:** Buildings → *(a building)* → Current Expenses → New
- **Purpose:** Record an expense for the building — its category, how it's collected (monthly/capital/savings/non-distributed), the distribution table used to share it, the amount, and the period it covers.
- **Scope:** One expense. Always created under the current building.

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
| **Expense** | Dropdown | Yes | The expense category (bank categories excluded). |
| **Collection type** | Dropdown | Yes | How it's collected: Monthly, Capital, Savings, Non-distributed (etc.). Drives which fields below appear. |
| Distribution table | Dropdown | Conditional | Which [distribution table](../building-distribution/distribution-tables-list.md) shares the cost across units. Hidden and not required when Collection type is **Non-distributed**; required otherwise. |
| Reference date | Date | Yes (auto) | Defaults to the start of the current month; shown read-only/auto. |
| **Amount** | Number | Yes | Expense amount. Not negative, 2 decimals, thousands separator. |
| Start (month) | Month picker | Conditional | Shown/required for **Monthly / Capital / Savings** — the first month covered. |
| End (month) | Month picker | Conditional | Shown/required for **Monthly / Capital / Savings** (create only) — the last month covered; the expense is spread across the Start→End range. |
| Description | Text (multi-line) | Auto | Auto-generated from the expense name + period; shown read-only. |

**Parent building** is set from context.

---

## 4. Behaviour & interactions

- **Collection type drives the form:** choosing Monthly/Capital/Savings reveals the Start/End month range; Non-distributed hides the distribution table.
- **Description auto-fills** from the chosen expense and date and is not manually edited.
- **Reference date** is derived (start of month) and not directly edited.
- **Spreading:** for range types, the amount is applied across the Start→End months.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Expense | Required | "Expense is required." |
| Collection type | Required | "Collection type is required." |
| Distribution table | Required unless Non-distributed | "Distribution table is required." |
| Amount | Required, ≥ 0 | "Amount is required." |
| Start / End | Required for Monthly/Capital/Savings; End ≥ Start | "Select the period covered." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

Initial / Submitting / Success / Validation error / Save failure — as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the expense (spread across the period if applicable), returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 8. Out of scope

- **Collections** against this expense and **payments** of it — see the Collections / Payments screens.
- **Audit fields** — shown on [Edit Expense](./edit-expense.md) only.

---

## 9. Open questions

- Confirm the full list of **collection types** and which show the month range / hide the distribution table.
- If a building has **no distribution tables**, should distributed expenses be blocked until one exists?
- Can the covered **period cross year boundaries**?
