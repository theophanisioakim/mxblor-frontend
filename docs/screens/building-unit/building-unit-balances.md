# Screen SDD — Building Unit Balances

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to one building and shared by web, phone, and tablet/native layouts.

---

## 1. Screen

- **Name:** Building Unit Balances
- **Location:** Buildings → *(a building)* → Unit balances
- **Purpose:** Review each unit's live Capital, Monthly, and combined balance and set every unit's
  Capital and Monthly opening balance together.
- **Scope:** One building-wide form. Opening balances are not edited from the generic Collections
  screens.

---

## 2. Entry points & navigation

- **Reached from:** the **Unit balances** tile on [Building Details](../building/edit-building.md), or
  the **Unit balances** shortcut in the [Building Units](./building-units-list.md) toolbar.
- **Breadcrumb:** Home › Buildings › *(building name)* › Unit balances.
- **Back:** returns to the parent building, preserving the building context.

---

## 3. Layout and fields

The screen is one full-width form. Desktop and tablet use a table; a phone uses stacked cards with
the same fields and actions.

| Field / column | Behaviour |
|---|---|
| Reference date | Required and shared by every opening-balance row. It initially defaults to one calendar day before building management starts. |
| Unit | Read-only unit code. Units stay in stable code order. |
| Opening Capital | Editable signed amount, to two decimal places. |
| Opening Monthly | Editable signed amount, to two decimal places. |
| Live Capital | Read-only current Capital balance, previewed immediately as the opening value changes. |
| Live Monthly | Read-only current Monthly balance, previewed immediately as the opening value changes. |
| Total | Read-only previewed Capital + Monthly balance. |

A positive amount means the unit owes money. A negative amount means the unit is in credit; negative
values are valid and are never blocked merely for being negative.

---

## 4. Behaviour and actions

- **Preview:** each live ledger is shown as `saved live balance + edited opening − saved opening`.
- **Save all:** submits the reference date and exactly one Capital/Monthly pair for every unit. There
  is no row-level save.
- **Atomic result:** either every unit is updated or none is. After success, the screen reloads the
  live balances and replaces the form with the saved values.
- **Failure:** entered values remain in place and the user can retry.

| Action | Outcome |
|---|---|
| **Save all** | Validates and saves the complete building-wide form. |
| **Back to building** | Returns without saving. |
| **Retry** | Reloads after a load failure. |

---

## 5. States

- **Loading:** progress indicator while all unit pages load.
- **Loaded:** complete editable form, in stable unit-code order.
- **Empty:** explains that the building has no units yet; no save action is shown.
- **Validation error:** invalid or missing reference date/amount is flagged and no save occurs.
- **Saving:** Save all is busy and disabled.
- **Success:** confirmation appears and server balances are reloaded.
- **Load/save failure:** retryable message; save failures preserve all entered values.

---

## 6. Out of scope

- Editing other collection entries, collecting payments, or issuing receipts.
- A separate save per unit.
- Currency conversion or multiple currencies.
