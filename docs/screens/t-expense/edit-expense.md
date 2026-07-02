# Screen SDD — Edit Expense

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Create Expense](./create-expense.md);
> this doc covers what edit adds/restricts. Reached by drilling into a year on the
> [Expenses list](./expenses-list.md) and opening a specific expense.

---

## 1. Screen

- **Name:** Edit Expense
- **Location:** Buildings → *(a building)* → Current Expenses → *(year)* → *(an expense)*
- **Purpose:** Update the editable parts of an expense (mainly amount/description context), or delete it.
- **Scope:** Create fields (pre-filled) with several locked + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** the year drill-down of the [Expenses list](./expenses-list.md), opening a single expense.
- **Breadcrumb:** Home › Buildings › *(building name)* › Current Expenses › *(year)* › *(expense)*.
- **On Save / Delete:** returns to the year detail / Expenses list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable / locked (from Create)
Same fields as [Create Expense](./create-expense.md), pre-filled, but several are **locked on edit** because they define the expense's identity and spread:

| Field | On edit |
|---|---|
| Expense | Locked (read-only). |
| Collection type | Locked. |
| Start month | Locked. |
| End month | Hidden (spread already applied). |
| Reference date | Locked/auto. |
| Amount | Editable. |
| Distribution table | Editable (unless Non-distributed). |
| Description | Auto/read-only. |

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Identity/period fields are locked** to keep the expense consistent with any collections/payments already made against it.
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list. Destructive, separated from Save. See open questions re: expenses with collections/payments.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves the editable changes, returns to the list. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation, returns to the list. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Open questions

- Should **Delete** be blocked when the expense already has **collections or payments**?
- Confirm exactly which fields are **locked** on edit (list in §3.1 inferred from v2's `disabled` flags).
