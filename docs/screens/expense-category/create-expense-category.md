# Screen SDD — Create Expense Category

> Screen design document — behaviour only, no implementation/API/data detail.
> Shares its form with [Edit Expense Category](./edit-expense-category.md); reached from the
> [Expense Categories list](./expense-categories-list.md).

---

## 1. Screen

- **Name:** Create Expense Category
- **Location:** Expenses → Expense Categories → New
- **Purpose:** Add a housekeeping **expense category** — the bucket that groups
  [expenses](../expense/expenses-list.md).
- **Scope:** One category. A newly created category is **always editable** (see §5).

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Expense Categories list](./expense-categories-list.md).
- **Breadcrumb:** Home › Expenses › Expense Categories › New.
- **On Save:** returns to the Expense Categories list.
- **On Cancel:** returns to the list; nothing is saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Code** | Text | Yes | Max 10 characters. Unique across all categories. |
| **Name** | [Translation Label](../shared/translation-label-field.md) | Yes | Only the default language is mandatory. Shows the default-language text when closed. |
| **Description** | [Translation Label](../shared/translation-label-field.md) | Yes | Shows **every** language at once when closed. May opt into the global namespace to share the text with other entities. |

Name and Description are **not free text** — they are shared labels. Picking an existing text reuses
it; editing one changes it **everywhere it is used**. See the Translation Label field SDD.

---

## 4. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Create Category** | Form footer (primary) | Validates, saves, returns to the list. |
| **Cancel** | Form footer | Returns to the list without saving. |

---

## 5. The editable rule

**Editable is never set on this screen** — it is not a field. The server assigns it: a category
created here is always **editable**, and only the seeded system-default categories are locked. A
client that tries to send it is ignored.

There is **no expenses grid on this screen.** The category does not exist yet, so there is nothing to
hang expenses off; the grid appears once the category is saved and reopened (see
[Edit Expense Category](./edit-expense-category.md) §6).

---

## 6. Validation & messages

- Required fields are flagged inline on submit.
- Code longer than 10 characters is rejected.
- A duplicate code is rejected by the server; the error is shown above the form and the entered
  values are kept for correction.

---

## 7. States

Editing / Submitting / Save failure — as standard. A failed save keeps everything the user typed.
