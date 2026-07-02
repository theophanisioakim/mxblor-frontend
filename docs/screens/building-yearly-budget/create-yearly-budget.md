# Screen SDD — Create Yearly Budget

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Edit Yearly Budget](./edit-yearly-budget.md); reached from the
> [Yearly Budget list](./yearly-budget-list.md).

---

## 1. Screen

- **Name:** Create Yearly Budget
- **Location:** Buildings → *(a building)* → Yearly Budget → New
- **Purpose:** Define a budget for one reference year: a per-month amount and the distribution table used to share each month's cost across units. Includes bulk helpers to fill many months at once.
- **Scope:** Reference year + a 12-month grid (amount + distribution table per month) + bulk-set helpers. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Yearly Budget list](./yearly-budget-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Yearly Budget › New.
- **On Save:** returns to the Yearly Budget list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [ Reference year * ▾ ]                                             │
│ [ Set amount from month… ]   [ Set distribution from month… ]      │
│                                                                    │
│ ── MONTHLY BUDGET (12 rows) ────────────────────────────────────   │
│  Month     │ Amount        │ Distribution table                    │
│  January   │ 500.00        │ By area ▾                             │
│  February  │ 500.00        │ By area ▾                             │
│  …         │ …             │ …                                     │
│                                                                    │
│                                     [ Save ]   [ Cancel ]          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Reference year** | Year picker | Yes | The budget's year. |

---

## 5. Monthly budget grid

Twelve fixed rows (one per month; rows cannot be added or removed).

| Column | Editable | Required | Notes |
|---|---|---|---|
| Month | No | — | January … December. |
| Amount | Yes | Yes | Month's budgeted amount. Not negative, 2 decimals. |
| Distribution table | Yes (dropdown) | Yes | Which distribution table shares that month's cost across units. Chosen from this building's [distribution tables](../building-distribution/distribution-tables-list.md). |

### Bulk helpers
- **Set amount from month:** enter an amount + a starting month → applies that amount to that month and every later month.
- **Set distribution from month:** pick a distribution table + a starting month → applies it to that month and every later month.

Both open a small modal and update the grid in place; changes persist when the budget is saved.

---

## 6. Behaviour & interactions

- **Fixed 12 months:** you set values per month; you don't add/remove months.
- **Bulk helpers** are the fast path for buildings with the same amount/table most of the year; individual months can still be tuned afterwards.
- **Distribution tables** must already exist for this building; if none exist, see open questions.
- **Save enablement:** requires a year and valid amounts/tables on all months.

---

## 7. Validation & messages

| Rule | Message |
|---|---|
| Reference year required | "Reference year is required." |
| Amount required per month | "Amount is required." |
| Amount not negative | "Amount cannot be negative." |
| Distribution table required per month | "Distribution table is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 8. States

Initial (12 months, empty amounts) / Submitting / Success / Validation error / Save failure — as standard.

---

## 9. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the yearly budget with its 12 months, returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 10. Out of scope

- **Audit fields** — shown on [Edit Yearly Budget](./edit-yearly-budget.md) only.
- Creating **distribution tables** — see the Distribution Tables screens.

---

## 11. Open questions

- If the building has **no distribution tables**, should creating a budget be blocked or should the user be prompted to create one first?
- Should the year default to the **next/current year**?
- One budget **per year** enforced here?
