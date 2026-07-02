# Screen SDD — Bank Accounts List

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Bank Account](./create-bank-account.md) and
> [Edit Bank Account](./edit-bank-account.md).

---

## 1. Screen

- **Name:** Bank Accounts
- **Location:** Buildings → *(a building)* → Bank Accounts
- **Purpose:** List the building's bank/fund accounts (operating, savings, etc.) with balances, in a searchable, paged grid.
- **Scope:** Grid, filters, and actions, scoped to the parent building.

---

## 2. Entry points & navigation

- **Reached from:** the **Bank Accounts** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Bank Accounts.
- **Back:** returns to the parent building.
- **Add:** opens [Create Bank Account](./create-bank-account.md).
- **Open a row (Edit):** opens [Edit Bank Account](./edit-bank-account.md).

---

## 3. Grid columns

Default sort: by account number.

| Column | Content | Notes |
|---|---|---|
| Account no | Account number | |
| Bank name | Bank | |
| Account type | Type | e.g. operating, savings, fund. |
| IBAN | IBAN number | |
| Balance | Current balance | Running balance (starts from the initial balance set on creation). |

Grid supports sorting and paging (10 / 25 / 50 per page).

---

## 4. Filters

| Filter | Control |
|---|---|
| Account no | Text |
| Bank name | Text |
| Account type | Dropdown |
| IBAN | Text |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens Create Bank Account. |
| **Edit** | Row action | All roles | Opens Edit Bank Account. |
| **Delete** | Row action (destructive) | Non-`user` roles | Deletes after confirmation (see open questions re: accounts with transactions). |
| **Search** / **Clear** | Filters panel | All roles | Apply / reset filters. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 6. States

Loading / Loaded / Empty / Deleting / success / failure — as standard.

---

## 7. Out of scope

- Create/Edit internals (incl. the transactions grid) — see their SDDs.

---

## 8. Open questions

- Should **Delete** be blocked when an account has transactions?
- Confirm **Delete** role rule (hidden for `user`).
