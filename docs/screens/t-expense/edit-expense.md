# Screen SDD — Edit Expense

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Create Expense](./create-expense.md);
> reached from the flat [Expenses list](./expenses-list.md).

---

## 1. Screen

- **Name:** Edit Expense
- **Location:** Buildings → *(a building)* → Current Expenses → *(an expense)*
- **Purpose:** Update the editable parts of a single expense row (amount, distribution table), or delete it.
- **Scope:** One expense row. Identity fields locked. Read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** **Edit** on a row in the [Expenses list](./expenses-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Current Expenses › *(expense)*.
- **On Save / Delete:** returns to the Expenses list with a confirmation.
- **Cancel:** returns without saving.

---

## 3. Fields

| Field | On edit |
|---|---|
| Expense | Locked (read-only). |
| Collection type | Locked. |
| Reference month | Locked (read-only). |
| Amount | Editable. Cannot be less than total already paid. |
| Distribution table | Editable unless Non-distributed. |
| Description | Auto/read-only. |

### Audit (edit only)

Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Amount change** recalculates correlated unpaid payment/collection rows (matched by building + catalog expense + reference month + description, not by FK).
- **Delete:** blocked when correlated payment or collection rows already have posted bank transactions.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves editable fields, returns to the list. |
| **Cancel** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation if no posted transactions. |

---

## 6. States

Loading / Loaded / Submitting / Success / Validation error / failure — as standard.
