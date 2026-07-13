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

- **Reached from:** either
  - the **Add** action in the toolbar of the [Expenses List](./expenses-list.md)
    (route `/expenses/new`), where the user picks the category; or
  - the **Add Expense** action on a category's own screen
    ([Edit / View Expense Category](../expense-category/edit-expense-category.md) §6), which
    arrives with **that category already selected and pinned** — it is shown but cannot be
    changed.
- **Breadcrumb:** Home › Expenses › Create Expense.
- **On success:** returns wherever the user came from — the Expenses List, or the category screen
  when the category was pinned. The new row appears as an **editable** expense (see the editable
  rule on the list screen).
- **On cancel:** returns to the same place; nothing is created.

---

## 3. Fields

| Field | Control | Required | Behaviour |
|---|---|---|---|
| Code | Text (max 10 characters) | Yes | The expense's code, e.g. `101`. |
| Category | Single-select (searchable) | Yes | The parent expense category. **Only user-created (editable) categories are offered** — see §5. Pinned (shown, not changeable) when the screen was opened from a category. |
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

### An expense cannot be filed under a system-default category

The **Category** dropdown offers **only editable (user-created) categories**. System-default
categories are closed buckets: their contents are the seeded catalog, and no new expense may join
them. The server enforces this too — an attempt made directly against the API is rejected — so
hiding them from the dropdown simply keeps the user from choosing an option that could never work.

In a fresh tenant every category is a system default, so the dropdown is **empty until the user
creates a category** on [Create Expense Category](../expense-category/create-expense-category.md).

(The Expenses **list** filter is the opposite case: it offers *all* categories, because seeded
expenses live in seeded categories and must remain filterable.)

---

## 6. Out of scope

- Changing an existing expense — [Edit Expense](./edit-expense.md).
- Maintaining the categories themselves —
  [Expense Categories List](../expense-category/expense-categories-list.md).
