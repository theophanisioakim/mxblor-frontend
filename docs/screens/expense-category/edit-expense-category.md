# Screen SDD — Edit / View Expense Category

> Screen design document — behaviour only, no implementation/API/data detail.
> Shares its form with [Create Expense Category](./create-expense-category.md); reached from the
> [Expense Categories list](./expense-categories-list.md).

---

## 1. Screen

- **Name:** Edit Expense Category (also serves as **View** — see §5)
- **Location:** Expenses → Expense Categories → *(a category)*
- **Purpose:** Change a user-created category, or view a system-default one; and manage the
  **expenses filed under it**.
- **Scope:** The category's own fields **plus** its expenses grid.

---

## 2. Entry points & navigation

- **Reached from:** the **Edit** row action (user-created categories) or the **View** row action
  (system defaults) on the [Expense Categories list](./expense-categories-list.md). Both open this
  same screen — see §5.
- **Breadcrumb:** Home › Expenses › Expense Categories › *(category)*.
- **On Save:** returns to the Expense Categories list.
- **Cancel / Back:** returns to the list without saving.

---

## 3. Fields

Identical to [Create Expense Category](./create-expense-category.md) §3 — Code, Name, Description —
**pre-filled** with the category's current values.

---

## 4. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save Changes** | Form footer (primary) | **Editable categories only** | Validates and saves; returns to the list. |
| **Cancel** | Form footer | Editable categories | Returns to the list without saving. |
| **Back** | Form footer | **System defaults** — replaces Save + Cancel | Returns to the list. |

---

## 5. The editable rule (system defaults are view-only)

A category is either **user-created** (editable) or a **system default** (locked). One screen serves
both:

- **User-created:** every field is editable; Save and Cancel are shown.
- **System default:** a notice explains the category is view-only, **every field is disabled**, there
  is **no Save**, and Cancel becomes **Back**.

This is why the list's **View** and **Edit** row actions lead to the same place — the screen reads
the category's own locked/unlocked state and presents itself accordingly, so no separate "view
screen" exists. A locked category cannot be changed even via the API; the server rejects it.

---

## 6. The expenses grid

Below the form, the screen lists **the expenses in this category** (Code, Name, Description,
Editable), paged 10 / 25 / 50.

| Action | Availability | Outcome |
|---|---|---|
| **Add Expense** | **Only when the category is editable** | Opens Create Expense with **this category pre-selected and pinned** (it cannot be changed). Cancelling or saving returns here. |
| **View** (row) | Rows that are system-default expenses | Opens the expense read-only. |
| **Edit** (row) | Rows that are user-created expenses | Opens the expense for editing. |
| **Delete** (row) | Rows that are user-created expenses | Deletes after confirmation. |

**Why Add is hidden on a system-default category:** an expense may never be filed under a locked
category — the server refuses it — so the button would be one that always fails. The row actions,
by contrast, follow each **expense's own** editable flag, not the category's.

The grid appears only on an existing category; there is none on
[Create](./create-expense-category.md).

---

## 7. States

Loading / Loaded (editable) / Loaded (view-only) / Not found / Load failure / Saving / Save failure —
as standard. A save rejected for a stale version, a duplicate code, or a locked category surfaces the
server's message above the form, with the entered values preserved.
