# Screen SDD — Edit Payment

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building and its expense/revenue. Shares its form with
> [Create Payment](./create-payment.md); this doc covers what edit adds/restricts.
> Reached by drilling into the [Payments list](./payments-list.md) (or an item's view)
> and opening a specific payment.

---

## 1. Screen

- **Name:** Edit Payment
- **Location:** Buildings → *(a building)* → Payments → *(year)* → *(a payment)*
- **Purpose:** Update the editable parts of a payment, or delete it.
- **Scope:** Create fields (pre-filled) with the linked item locked + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** the year drill-down of the [Payments list](./payments-list.md), or an expense/revenue view.
- **Breadcrumb:** Home › Buildings › *(building name)* › Payments › *(year)* › *(payment)*.
- **On Save / Delete:** returns to the originating view with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable / locked (from Create)

| Field | On edit |
|---|---|
| Linked expense / revenue | Locked. |
| Reference date, Due date | Locked/auto. |
| Amount | Editable (still capped at the outstanding amount). |
| Transaction date | Editable. |
| Bank account | Editable. |
| Invoice no, Description, Attachment | Editable. |

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open, including any attachment (downloadable).
- **Amount cap** still applies (outstanding + this payment's current amount).
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the originating view; reverses the associated bank movement. Destructive, separated from Save.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves editable changes, returns to the originating view. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation (reversing the bank movement), returns to the originating view. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Open questions

- On delete, confirm the **bank balance is reversed** (assumed yes).
- Can the **bank account** of an existing payment be changed after posting, or only amount/dates/notes?
