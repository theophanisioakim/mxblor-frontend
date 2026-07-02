# Screen SDD — Create Bank Account

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Edit Bank Account](./edit-bank-account.md); reached from the
> [Bank Accounts list](./bank-accounts-list.md).

---

## 1. Screen

- **Name:** Create Bank Account
- **Location:** Buildings → *(a building)* → Bank Accounts → New
- **Purpose:** Register a bank/fund account for the building, with its details and an opening (initial) balance.
- **Scope:** Account details + initial balance + description. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Bank Accounts list](./bank-accounts-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Bank Accounts › New.
- **On Save:** returns to the Bank Accounts list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Bank name** | Text | Yes | Max 255 chars. |
| Account name | Text | No | Max 255 chars. |
| **Account no** | Text | Yes | Account number. |
| IBAN no | Text | No | Max 255 chars. |
| SWIFT / BIC | Text | No | Max 255 chars. |
| Account type | Dropdown | No | e.g. operating, savings, fund. |
| **Initial balance** | Number | Yes | Opening balance. On this screen the field is labelled **Initial balance**; on edit it becomes the (read-only) running **Balance**. |
| Description | Multi-line text (4 rows) | No | Free notes. |

**Parent building** is set from context.

---

## 4. Behaviour & interactions

- **Initial balance** is editable only at creation; after the account exists the balance is driven by transactions and shown read-only (see [Edit Bank Account](./edit-bank-account.md)).
- Bank name, Account no, and Initial balance are required.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Bank name | Required | "Bank name is required." |
| Account no | Required | "Account number is required." |
| Initial balance | Required, numeric | "Initial balance is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

Initial / Submitting / Success / Validation error / Save failure — as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the account, returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 8. Out of scope

- **Transactions**, audit fields — shown on [Edit Bank Account](./edit-bank-account.md) only.

---

## 9. Open questions

- Should **IBAN / account no** be validated for format, and unique within the building?
- Can Initial balance be **negative** (overdraft)?
