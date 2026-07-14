# Screen SDD — Edit Bank Account

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Create Bank Account](./create-bank-account.md); this doc covers what edit adds.

---

## 1. Screen

- **Name:** Edit Bank Account
- **Location:** Buildings → *(a building)* → Bank Accounts → *(an account)*
- **Purpose:** Update an account's details, review its transactions, and delete it.
- **Scope:** Create fields (pre-filled) + read-only running balance + a transactions grid + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Bank Accounts list](./bank-accounts-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Bank Accounts › *(account)*.
- **On Save / Delete:** returns to the list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable (same as Create)
Bank name*, Account name, Account no*, IBAN, SWIFT/BIC, Account type, Description — pre-filled and editable.

### 3.2 Balance (read-only on edit)
The **Balance** field shows the running balance and cannot be edited directly — it *is* the sum of the
account's transactions. The server recomputes it on every save and ignores any balance a client sends,
so the only way to move it is to add, change or remove a transaction below.

### 3.3 Transactions (edit only, non-`user` roles)
The account's transactions, editable in place. A row captures **date**, **type**, **amount** and
**description**; rows can be added and removed, and the balance follows.

- **Amount is one signed number:** positive is money in, negative is money out. (The record keeps a
  single signed amount rather than a credit/debit pair — v1 kept two columns and then wrote negative
  amounts into the debit one anyway.)
- Only the **manual** types are offered and accepted: *balance b/f, administrative, transfer from the
  building savings account, transfer from the building fund, other*. **Payment** and **collection**
  rows are written by the system to record the bank side of a receipt; the type dropdown does not
  offer them and the server refuses them, so a receipt's bank movement can never be edited out from
  under the receipt.
- The running total under the grid is what the account's **Balance** becomes on save.

> **Not yet shown:** the *Unit* and *Related (receipt no)* columns. Both describe a transaction
> created by a collection, and collections do not exist yet. They arrive with that feature.

### 3.4 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Balance is read-only** on edit; it reflects transactions.
- **Transactions grid** and audit are visible only on edit and only to non-`user` roles.
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list, **taking the account's transactions with it**. Destructive, separated from Save. Also a row action on the list.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves account detail changes, returns to the list. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation, returns to the list. |
| **Add / Edit / Delete transaction** | Transactions grid | Non-`user` roles, manual types only | Manage manual transactions on the account. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Resolved

- **Delete is not blocked by transactions.** Every account has at least the opening Balance B/F row,
  so such a guard would make every account undeletable — which is exactly the bug v1 shipped (it
  guarded with `is_null($account->transactions)`, never true for a `hasMany`). Deleting an account
  removes its transactions with it.
- **Manually editable types** are: balance b/f, administrative, transfer from the building savings
  account, transfer from the building fund, other. Payment and collection are system-generated and
  refused.

## 8. Open questions

- Should the transactions list be **paged/filterable** by date range or type? It is a plain list
  today; worth revisiting once collections start writing rows into it.
