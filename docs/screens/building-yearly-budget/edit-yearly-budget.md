# Screen SDD — Edit Yearly Budget

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Create Yearly Budget](./create-yearly-budget.md); this doc covers what edit adds.

---

## 1. Screen

- **Name:** Edit Yearly Budget
- **Location:** Buildings → *(a building)* → Yearly Budget → *(a year)*
- **Purpose:** Update a year's monthly amounts and distribution tables, or delete the budget.
- **Scope:** Create fields + 12-month grid + bulk helpers (pre-filled) + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Yearly Budget list](./yearly-budget-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Yearly Budget › *(year)*.
- **On Save / Delete:** returns to the list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable (same as Create)
Reference year*, the **12-month grid** (Amount + Distribution table per month), and the **Set amount / Set distribution from month** bulk helpers — pre-filled with the budget's current values. Behaviour identical to [Create](./create-yearly-budget.md) §5–§6.

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open with the year's 12 months.
- **Bulk helpers** work the same as on create (apply from a starting month onward).
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list. Destructive, separated from Save. Also a row action on the list.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves changes, returns to the list. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation, returns to the list. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Resolved

- **The reference year stays editable.** Moving a budget to a year that already has one is refused by
  the server with a readable message, so there is no need to lock the field.
- **Delete is not blocked.** Deleting a budget takes its twelve months with it. Guarding it against
  posted expenses/collections is deferred to the feature that introduces them — nothing points at a
  budget month today.
