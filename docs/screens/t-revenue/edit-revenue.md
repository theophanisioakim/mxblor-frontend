# Screen SDD — Edit Revenue

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Create Revenue](./create-revenue.md);
> this doc covers what edit adds/restricts. Reached by drilling into a year on the
> [Revenues list](./revenues-list.md) and opening a specific revenue.

---

## 1. Screen

- **Name:** Edit Revenue
- **Location:** Buildings → *(a building)* → Revenues → *(year)* → *(a revenue)*
- **Purpose:** Update the editable parts of a revenue, or delete it.
- **Scope:** Create fields (pre-filled) with identity fields locked + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** the year drill-down of the [Revenues list](./revenues-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Revenues › *(year)* › *(revenue)*.
- **On Save / Delete:** returns to the year detail / Revenues list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable / locked (from Create)

| Field | On edit |
|---|---|
| Revenue | Locked. |
| Collection type | Locked. |
| Reference date | Locked. |
| Start month | Locked. |
| End month | Hidden. |
| Amount | Editable. |
| Description | Editable. |

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Identity/period fields locked** to stay consistent with any payments recorded against the revenue.
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list. Destructive, separated from Save.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves editable changes, returns to the list. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation, returns to the list. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Open questions

- Should **Delete** be blocked when the revenue has **payments** recorded?
- Confirm which fields are **locked** on edit (from v2's `disabled` flags).
