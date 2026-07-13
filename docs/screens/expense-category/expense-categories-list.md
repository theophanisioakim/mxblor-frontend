# Screen SDD — Expense Categories List

> Screen design document — behaviour only, no implementation/API/data detail.
> Tenant-wide catalog screen reached from the side navigation. Sibling of the
> [Expenses List](../expense/expenses-list.md); together they are the housekeeping
> expense catalog.

---

## 1. Screen

- **Name:** Expense Categories
- **Location:** Expenses → Expense Categories
- **Purpose:** Browse the tenant's housekeeping **expense categories** (e.g. Management,
  Cleaning, Water Board) in a searchable, paged grid. Categories group the individual
  [expenses](../expense/expenses-list.md).
- **Scope:** The catalog grid, its filters, and its actions. The category form itself lives on
  [Create Expense Category](./create-expense-category.md) and
  [Edit / View Expense Category](./edit-expense-category.md).

---

## 2. Entry points & navigation

- **Reached from:** the **Expenses → Expense Categories** item in the side menu
  (backend-driven menu; route `/expenses/categories`).
- **Breadcrumb:** Home › Expenses › Expense Categories.
- This screen has no drill-down; rows are not clickable to a detail page.

---

## 3. Grid columns

Rows are expense categories. Default sort: **Code ascending**.

| Column | Content | Sortable |
|---|---|---|
| Code | The category's unique code (e.g. `100`, `110`). | Yes |
| Name | The category name in the user's language (e.g. "Management" / "Διαχείριση"). | No |
| Description | The category description in the user's language. | No |
| Editable | Whether the category is user-maintained. System defaults show as **not editable**; user-created categories show as **editable**. | Yes |

Grid supports paging (10 / 25 / 50 per page).

> Name and Description are shown in the requested language, resolved by the server; they are
> not free-text sortable columns.

---

## 4. Filters

| Filter | Control | Behaviour |
|---|---|---|
| Code | Text | Partial, case-insensitive match on the code. |
| Editable only | Tri-state checkbox | Unset = all; checked = only editable (user-created); unchecked = only non-editable (system defaults). |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Search** / **Clear** | Filters panel | All roles | Apply / reset the filters. |
| **Add** | Toolbar (primary) | All roles | Opens [Create Expense Category](./create-expense-category.md). |
| **Refresh** | Toolbar | All roles | Re-fetches the current page. |
| **View** | Row action | **Only for non-editable (system-default) categories** | Opens the category **read-only** on [Edit / View Expense Category](./edit-expense-category.md). |
| **Edit** | Row action | **Only for editable (user-created) categories** | Opens the category for editing on the same screen. |
| **Delete** | Row action (destructive) | **Only for editable (user-created) categories** | Deletes the category after confirmation. |

### The editable rule (system defaults are view-only)

- **Seeded / system-default categories carry `editable = false`.** They are **view-only**: they show
  a **View** action instead of Edit, and **no Delete**.
- **User-created categories carry `editable = true`** and show **Edit** + **Delete**.
- **View and Edit lead to the same screen.** It reads the category's own locked/unlocked state and
  renders itself read-only or editable — there is no separate "view screen", only a different icon
  on the row. Expenses cannot be assigned to a locked category either, so its expenses grid offers
  no Add (see [Edit / View](./edit-expense-category.md) §6).
- `editable` is **never** set by the client — it is assigned and enforced by the server (new
  categories are always editable; seeded categories are locked). A direct API attempt to modify
  or delete a locked category is rejected by the server.
- Because the seeded catalog ships with every tenant, in a fresh tenant every row is a system
  default: all rows show only View, and the only way to get an editable category is **Add**.

---

## 6. States

Loading / Loaded / Empty (no categories match) / Deleting / delete success / delete failure —
as standard. A rejected delete (e.g. a locked category hit via the API) surfaces the standard
error state.

---

## 7. Out of scope

- [Create Expense Category](./create-expense-category.md) and
  [Edit / View Expense Category](./edit-expense-category.md) — their own screens (the latter also
  owns the per-category expenses grid).
- The [Expenses List](../expense/expenses-list.md) — its own screen.
