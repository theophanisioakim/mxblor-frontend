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
- **Scope:** A read-and-delete catalog grid. Creating and editing categories are separate
  screens (see §7), not part of this screen.

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
| **Refresh** | Toolbar | All roles | Re-fetches the current page. |
| **Delete** | Row action (destructive) | **Only for editable (user-created) categories** | Deletes the category after confirmation. |

### The editable rule (system defaults are view-only)

- **Seeded / system-default categories carry `editable = false`.** They are **view-only**: the
  **Delete** row action is **not shown** for them, and they cannot be modified.
- **User-created categories carry `editable = true`** and expose the **Delete** action.
- `editable` is **never** set by the client — it is assigned and enforced by the server (new
  categories are always editable; seeded categories are locked). A direct API attempt to modify
  or delete a locked category is rejected by the server.
- Because the seeded catalog ships with every tenant, in a fresh tenant every row is a system
  default and therefore exposes no Delete action — the screen is effectively read-only until a
  user creates their own category.

---

## 6. States

Loading / Loaded / Empty (no categories match) / Deleting / delete success / delete failure —
as standard. A rejected delete (e.g. a locked category hit via the API) surfaces the standard
error state.

---

## 7. Out of scope

- **Create Expense Category** and **Edit Expense Category** screens — separate deliverables. When
  they exist, Add (toolbar) and Edit (row action, shown only for editable rows) are added to this
  list, following the same editable rule as Delete.
- The [Expenses List](../expense/expenses-list.md) — its own screen.
