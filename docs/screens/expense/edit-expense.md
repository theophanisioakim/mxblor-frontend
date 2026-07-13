# Screen SDD — Edit Expense (Housekeeping Catalog)

> Screen design document — behaviour only, no implementation/API/data detail.
> Changes an existing **expense type** of the tenant's housekeeping catalog. Sibling of
> [Create Expense](./create-expense.md); reached from the [Expenses List](./expenses-list.md).

---

## 1. Screen

- **Name:** Edit Expense
- **Location:** Expenses › Edit Expense
- **Purpose:** Change the code, category, name or description of an expense type.
- **Who:** Any user allowed to maintain the expense catalog.

---

## 2. Entry points & navigation

- **Reached from:** the [Expenses List](./expenses-list.md) or a category's expenses grid
  ([Edit / View Expense Category](../expense-category/edit-expense-category.md) §6), via **either**
  row action (route `/expenses/<id>`):
  - **Edit** — offered for **editable** expenses; the screen opens editable.
  - **View** — offered for **system-default** expenses; the same screen opens **read-only** (§5).

  There is no separate view screen: this one reads the expense's own locked/unlocked state.
- **Breadcrumb:** Home › Expenses › Edit Expense.
- **On success:** returns to the Expenses List showing the updated row.
- **On cancel / back:** returns to the Expenses List; nothing is changed.

---

## 3. Fields

The same fields as [Create Expense](./create-expense.md), pre-filled with the expense's current
values:

| Field | Control | Required | Behaviour |
|---|---|---|---|
| Code | Text (max 10 characters) | Yes | The expense's code. |
| Category | Single-select (searchable) | Yes | The parent expense category. While editing, **only user-created (editable) categories are offered** — an expense may not be *moved* into a system-default category any more than it may be created in one (see [Create Expense](./create-expense.md) §5). In read-only mode the field simply shows the expense's own category, whatever it is. |
| Name | [Translation Label](../shared/translation-label-field.md) | Yes | Opens with the expense's current name in every language. Shows the **default-language** text when closed. |
| Description | [Translation Label](../shared/translation-label-field.md) | Yes | Opens with the expense's current description. Shows **all languages** when closed, and offers the **global namespace** toggle. |

### Editing a shared text

Name and description are **shared texts** (see the
[field's SDD](../shared/translation-label-field.md)). Re-opening one shows the texts it currently
holds. The user may:

- **leave them as they are** — the expense keeps pointing at the same text;
- **pick a different existing text** — the expense now points at that one;
- **change the text** — the change applies **everywhere that text is used**, not just to this
  expense. This is intentional: the catalog's texts are shared on purpose.

---

## 4. States

| State | Behaviour |
|---|---|
| Loading | The screen shows a busy indicator until the expense is loaded. |
| Not found / load failed | A message explains the expense could not be loaded; no form is shown. |
| **Locked (system default)** | An expense that is **not editable** (a seeded system default) is shown **view-only**: a notice explains it cannot be changed, all fields are disabled, and there is no Save — only **Back**. This mirrors the list, which does not offer Edit for such rows; it is the fallback for someone reaching the URL directly. |
| Saving | Save is disabled while the update is in flight. |
| Save failed | An error banner appears at the top; entered values are kept so the user can retry. A stale edit (someone else changed the expense meanwhile) is rejected by the server and surfaces here. |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save Changes** | Bottom of the form | Editable expenses only | Validates, updates the expense, returns to the list. |
| **Cancel** | Bottom of the form | Editable expenses | Returns to the list, discarding the changes. |
| **Back** | Bottom of the form | Locked expenses (replaces Cancel/Save) | Returns to the list. |

---

## 6. Out of scope

- Deleting an expense — the row action of the [Expenses List](./expenses-list.md).
- Creating one — [Create Expense](./create-expense.md).
