# Screen SDD — Create Expense (Housekeeping Catalog)

> Screen design document — behaviour only, no implementation/API/data detail.
> Adds a new **expense type** to the tenant's housekeeping catalog. Sibling of
> [Edit Expense](./edit-expense.md); reached from the [Expenses List](./expenses-list.md).
>
> **Not to be confused with** recording a building's actual expense
> ([t-expense/create-expense](../t-expense/create-expense.md)). This screen creates a reusable
> **expense type**, not a booked expense.

---

## 1. Screen

- **Name:** Create Expense
- **Location:** Expenses › Create Expense
- **Purpose:** Define a new expense type (code, category, name, description) that can then be used
  when budgeting and recording a building's expenses.
- **Who:** Any user allowed to maintain the expense catalog.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action in the toolbar of the [Expenses List](./expenses-list.md)
  (route `/expenses/new`).
- **Breadcrumb:** Home › Expenses › Create Expense.
- **On success:** returns to the Expenses List, where the new row appears (always as an
  **editable** expense — see the editable rule on the list screen).
- **On cancel:** returns to the Expenses List; nothing is created.

---

## 3. Fields

| Field | Control | Required | Behaviour |
|---|---|---|---|
| Code | Text (max 10 characters) | Yes | The expense's code, e.g. `101`. |
| Category | Single-select (searchable) | Yes | The parent expense category. Options are the tenant's expense categories. |
| Name | [Translation Label](../shared/translation-label-field.md) | Yes | The expense name in every language the tenant supports. Shows the **default-language** text when closed. Only the default language is mandatory. Existing expense names can be searched and reused. |
| Description | [Translation Label](../shared/translation-label-field.md) | Yes | The expense description. Shows **all languages** when closed. Only the default language is mandatory. Offers the **global namespace** toggle, so a description can be shared beyond the expense catalog. |

### Name and Description are shared texts, not free text

Both are **translation labels** (see the [field's SDD](../shared/translation-label-field.md)): the
user either picks an existing text — which is then shared with every entity already using it — or
adds a new one, in each of the tenant's languages. The names offered while typing are only ever
other **expense names**, and the descriptions only ever other **expense descriptions** (unless the
global namespace is switched on for the description).

---

## 4. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Create Expense** | Bottom of the form | Validates, creates the expense, returns to the list. Disabled while the submission is in flight. |
| **Cancel** | Bottom of the form | Returns to the list without creating anything. |

---

## 5. Validation & states

- Every required field must be filled; a missing one is flagged inline on submit.
- Code is capped at 10 characters.
- A failed creation (e.g. a duplicate code rejected by the server) shows an error banner at the top
  of the screen; the entered values are kept so the user can fix and retry.
- Editable is **never** set here — the server always creates user-made expenses as editable.

---

## 6. Out of scope

- Changing an existing expense — [Edit Expense](./edit-expense.md).
- Maintaining the categories themselves —
  [Expense Categories List](../expense-category/expense-categories-list.md).
