# Screen SDD — Create Collection

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building, a **unit**, and an **expense**. Shares its form with
> [Edit Collection](./edit-collection.md). Reached from a unit/expense context
> (e.g. the Collections detail or a unit's dues), not typically from a blank list.

---

## 1. Screen

- **Name:** Create Collection
- **Location:** Buildings → *(a building)* → Collections → New
- **Purpose:** Record money **collected from a specific unit** against a specific expense — the amount, how it was paid, and into which bank account — producing a receipt.
- **Scope:** One collection tied to a unit + expense. Building, unit, and expense come from context.

---

## 2. Entry points & navigation

- **Reached from:** the **Add / collect** action in a unit-or-expense context within [Collections](./collections-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Collections › New.
- **On Save:** returns to the Collections detail with a confirmation; a receipt number is generated.
- **On Cancel:** returns without saving.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| Unit | Dropdown | Yes | The unit paying; set from context and shown read-only. |
| Expense | Dropdown | Yes | The expense being collected against; set from context / locked once chosen. |
| Collection type | Dropdown | Yes | Derived from the expense; shown read-only. |
| **Amount** | Number | Yes | Positive, 2 decimals. **Not capped.** The unit's outstanding amount is shown for guidance, but collecting more than is owed is allowed — the balance simply goes negative, meaning the unit is in credit. |
| **Payment channel** | Dropdown | Yes | How the money was paid (cash, bank transfer, card, cheque, …). This is also the marker that the row is money **in**. |
| **Bank account** | Dropdown | Yes | Which of the building's [bank accounts](../t-bank-account/bank-accounts-list.md) receives it. |
| Receipt no | Text | Auto | Issued on save; read-only, hidden until present. |

**Parent building / unit / expense** are set from context.

---

## 4. Behaviour & interactions

- **Unit, Expense, Collection type** are context-driven and read-only/locked — the collection is always against a specific unit+expense.
- **Amount is not capped.** The screen shows the unit's balance (total debit minus total credit in that ledger) so the user can settle it in one click, but it does not prevent a larger amount: paying in advance is a real, recordable state, not an error.
- **A charge may be collected in instalments.** Each is its own credit row. There is no remainder row and no "partially paid" status — what the unit still owes is always just the difference between the two columns.
- **Bank account** selection posts the receipt to that account (affecting its balance).
- **Receipt number** is issued by the system on save — see §7 of [Collections](./collections-list.md).

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Amount | Required, > 0 | "Amount must be greater than zero." |
| Payment channel | Required | "Payment channel is required." |
| Bank account | Required | "Bank account is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

Initial / Submitting / Success (receipt issued) / Validation error / Save failure — as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Records the collection, posts the bank movement, issues a receipt, returns to the Collections detail. |
| **Cancel** | Footer (secondary) | Discards, returns without saving. |

---

## 8. Out of scope

- **Batch collection** (collecting from many units at once) and **bulk payment** — related screens, not specced here.
- **Audit fields** — shown on [Edit Collection](./edit-collection.md) only.

---

## 9. Open questions

- Should **Payment channel = bank** force a matching bank account, or are they independent?

> **Resolved:** *Can a unit overpay / pay in advance?* **Yes, and there is no cap.** This is a balance
> sheet: collecting more than was charged leaves a negative balance, meaning the unit is in credit.
> v2 capped the amount only because it rewrote the charge row in place; nothing here rewrites history,
> so nothing here needs a cap.
>
> **Resolved:** *Is the receipt number sequence per building or global?* **Per building** —
> `<building code>-<six digits>`, restarting at `000001` for each building, as in v1. An auditor reads
> one building's receipt book, so its series must be continuous on its own.
