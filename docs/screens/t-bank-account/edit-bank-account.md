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
The **Balance** field shows the running balance and cannot be edited directly — it is driven by the account's transactions (the initial balance was set at creation).

### 3.3 Transactions grid (edit only, non-`user` roles)
A read-only list of the account's transactions, newest first:

| Column | Content |
|---|---|
| Unit | The building unit involved (if the transaction relates to a collection). |
| Transaction date | Date of the transaction. |
| Type | Transaction type (balance b/f, administrative, transfers, other, collection-related, …). |
| Related | Reference (e.g. receipt no) where applicable. |
| Credit | Amount in, when positive. |
| Debit | Amount out, when negative. |

- Only **manual** transaction types (balance b/f, administrative, transfers to/from savings/fund, other) can be **edited/deleted** here; system-generated ones (e.g. from collections) are read-only.
- Adding a manual transaction captures amount, date, type, and description.

### 3.4 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Balance is read-only** on edit; it reflects transactions.
- **Transactions grid** and audit are visible only on edit and only to non-`user` roles.
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list. Destructive, separated from Save. Also a row action on the list.

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

## 7. Open questions

- Should **Delete account** be blocked when transactions exist (assume yes / soft-guard)?
- Should the transactions grid be **paged/filterable** by date range or type?
- Confirm which transaction types are **manually editable** (list in §3.3 taken from v2).
