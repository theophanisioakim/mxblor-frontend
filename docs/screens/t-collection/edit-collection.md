# Screen SDD — Edit Collection

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building, unit, and expense. Shares its form with
> [Create Collection](./create-collection.md); this doc covers what edit adds/restricts.
> Reached by drilling into the [Collections list](./collections-list.md) and opening a
> specific collection.

---

## 1. Screen

- **Name:** Edit Collection
- **Location:** Buildings → *(a building)* → Collections → *(year)* → *(a collection)*
- **Purpose:** Update the editable parts of a collection, or delete it (voiding the receipt).
- **Scope:** Create fields (pre-filled) with unit/expense locked + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** the year drill-down / detailed view of the [Collections list](./collections-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Collections › *(year)* › *(collection)*.
- **On Save / Delete:** returns to the Collections detail with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable / locked (from Create)

| Field | On edit |
|---|---|
| Unit | Locked (read-only). |
| Expense | Locked. |
| Collection type | Locked. |
| Amount | Editable (capped at outstanding + this collection's current amount). |
| Payment channel | Editable. |
| Bank account | Editable. |
| Receipt no | Read-only. |

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Unit/Expense locked** — a collection stays tied to the unit+expense it was made against.
- **Amount cap** applies (outstanding + this collection's current amount).
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the Collections detail; reverses the bank movement and voids the receipt. Destructive, separated from Save.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves editable changes, returns to the Collections detail. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation (reversing the bank movement / voiding the receipt), returns to the Collections detail. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Open questions

- On delete, confirm the **receipt is voided and the bank balance reversed** (assumed yes).
- Should editing a collection's **amount after a receipt is issued** be allowed, or only via void + re-collect?
