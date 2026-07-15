# Screen SDD — Create Payment

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building and **to a specific expense or revenue**. Shares its form
> with [Edit Payment](./edit-payment.md). Reached from an expense's / revenue's detail
> view, not from the [Payments list](./payments-list.md).

---

## 1. Screen

- **Name:** Create Payment
- **Location:** Buildings → *(a building)* → Current Expenses / Revenues → *(an item)* → Pay
- **Purpose:** Record money **paid out against a specific expense** and post it to a bank account. The payment is written as a **contra entry** — a new debit row on the supplier ledger — and the obligation it was paid against is left untouched.
- **Scope:** One payment tied to one expense. The expense and building come from context.

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
| **Amount** | Number | Yes | Positive, 2 decimals. **Not capped.** The outstanding amount is shown for guidance, but paying more than is owed is allowed — the balance simply goes negative, meaning the supplier owes us. |
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

- **Amount is not capped.** The screen shows what is still outstanding (total credit minus total debit for that expense and month) so the user can settle it in one click, but it does not prevent a larger amount: an overpayment is a real, recordable state, not an error.
- **An obligation can be paid any number of times.** Each payment is its own debit row. There is no "already paid" state that closes it, and no remainder row to reconcile — what remains is always just the difference between the two columns.
- **Reference date / Due date** are derived from the item and read-only; **Transaction date** is entered by the user.
- **Bank account** selection posts the movement to that account (affecting its balance).
- **Description** auto-fills from the item and date but can be overridden.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Amount | Required, > 0 | "Amount must be greater than zero." |
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

> **Resolved:** *Are overpayments allowed?* **Yes, and there is no cap.** This is a balance sheet:
> paying more than is owed leaves a negative balance, which means the supplier owes us. v2 capped the
> amount only because it rewrote the obligation row in place; nothing here rewrites history, so
> nothing here needs a cap.
