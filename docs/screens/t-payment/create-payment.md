# Screen SDD — Create Payment

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building and **to a specific expense or revenue**. Shares its form
> with [Edit Payment](./edit-payment.md). Reached from an expense's / revenue's detail
> view, not from the [Payments list](./payments-list.md).

---

## 1. Screen

- **Name:** Create Payment
- **Location:** Buildings → *(a building)* → Current Expenses / Revenues → *(an item)* → Pay
- **Purpose:** Record a payment **against a specific expense** (money paid out) **or revenue** (money received), settling all or part of its outstanding amount and posting it to a bank account.
- **Scope:** One payment tied to one expense or revenue. The expense/revenue and building come from context.

---

## 2. Entry points & navigation

- **Reached from:** the **Pay** action on an expense's or revenue's detail/view screen (a "by expense" / "by revenue" context).
- **Breadcrumb:** Home › Buildings › *(building name)* › Current Expenses/Revenues › *(item)* › Pay.
- **On Save:** returns to the originating expense/revenue view (or Payments) with a confirmation.
- **On Cancel:** returns without saving.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| Expense **or** Revenue | Dropdown | Yes | The item being paid; pre-selected from context and locked. Exactly one of the two applies. |
| **Amount** | Number | Yes | Not negative, 2 decimals. **Cannot exceed the item's outstanding amount** (enforced with a max). |
| Reference date | Date | Yes (auto) | Derived from the item; shown read-only. |
| **Transaction date** | Date | Yes | The date the money actually moved. |
| Due date | Month | Yes (auto) | Derived; shown read-only. |
| **Bank account** | Dropdown | Yes | Which of the building's [bank accounts](../t-bank-account/bank-accounts-list.md) the payment posts to. |
| Invoice no | Text | No | Supplier invoice reference. Max 255 chars. |
| Description | Text (multi-line) | No | Auto-suggested from the item + date; editable. |
| Attachment | File | No | e.g. a receipt or invoice scan. |

**Parent building** and the **expense/revenue** are set from context.

---

## 4. Behaviour & interactions

- **Amount is capped** at the item's remaining outstanding balance.
- **Reference date / Due date** are derived from the item and read-only; **Transaction date** is entered by the user.
- **Bank account** selection posts the movement to that account (affecting its balance).
- **Description** auto-fills from the item and date but can be overridden.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Amount | Required, ≥ 0, ≤ outstanding | "Amount cannot exceed the outstanding amount ({max})." |
| Transaction date | Required | "Transaction date is required." |
| Bank account | Required | "Bank account is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

Initial / Submitting / Success / Validation error / Save failure — as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Records the payment and posts the bank movement, returns to the originating view. |
| **Cancel** | Footer (secondary) | Discards, returns without saving. |

---

## 8. Out of scope

- Choosing which expense/revenue to pay from scratch — the payment is always initiated from an item's view.
- **Audit fields** — shown on [Edit Payment](./edit-payment.md) only.

---

## 9. Open questions

- Can a single payment be **split across multiple bank accounts** (assume no — one account)?
- Should **Transaction date** default to today?
- Are **overpayments** ever allowed, or is the outstanding cap absolute?
