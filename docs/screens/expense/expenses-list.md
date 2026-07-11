# Screen SDD — Expenses List (Housekeeping Catalog)

> Screen design document — behaviour only, no implementation/API/data detail.
> Tenant-wide catalog screen reached from the side navigation. Sibling of the
> [Expense Categories List](../expense-category/expense-categories-list.md); together they are
> the housekeeping expense catalog.
>
> **Not to be confused with** the per-building, per-year transactional expenses in
> [t-expense/expenses-list](../t-expense/expenses-list.md). This screen is the reusable
> **catalog of expense types**, not a building's recorded expenses.

---

## 1. Screen

- **Name:** Expenses
- **Location:** Expenses
- **Purpose:** Browse the tenant's housekeeping **expense types** (e.g. Account Management,
  Cleaner, Lift Maintenance) in a searchable, paged grid. Each expense belongs to one
  [expense category](../expense-category/expense-categories-list.md).
- **Scope:** A catalog grid. Creating and editing an expense happen on their own screens
  ([Create Expense](./create-expense.md) / [Edit Expense](./edit-expense.md)), which this screen
  navigates to.

---

## 2. Entry points & navigation

- **Reached from:** the **Expenses** item in the side menu (backend-driven menu; route
  `/expenses`).
- **Breadcrumb:** Home › Expenses.
- This screen has no drill-down; rows are not clickable to a detail page.

---

## 3. Grid columns

Rows are expense types. Default sort: **Code ascending**.

| Column | Content | Sortable |
|---|---|---|
| Code | The expense's code (e.g. `101`, `111`). Unique within its category. | Yes |
| Name | The expense name in the user's language. | No |
| Category | The name of the parent expense category, in the user's language. | No |
| Description | The expense description in the user's language. | No |
| Editable | Whether the expense is user-maintained. System defaults show as **not editable**; user-created expenses show as **editable**. | Yes |

Grid supports paging (10 / 25 / 50 per page).

> Name, Category and Description are shown in the requested language, resolved by the server; they
> are not free-text sortable columns.

---

## 4. Filters

| Filter | Control | Behaviour |
|---|---|---|
| Code | Text | Partial, case-insensitive match on the code. |
| Category | Single-select (searchable) | Restrict to expenses in the chosen category. Options are the tenant's expense categories. |
| Editable only | Tri-state checkbox | Unset = all; checked = only editable (user-created); unchecked = only non-editable (system defaults). |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Search** / **Clear** | Filters panel | All roles | Apply / reset the filters. |
| **Refresh** | Toolbar | All roles | Re-fetches the current page. |
| **Add** | Toolbar | All roles | Opens [Create Expense](./create-expense.md). |
| **Edit** | Row action | **Only for editable (user-created) expenses** | Opens [Edit Expense](./edit-expense.md) for that row. |
| **Delete** | Row action (destructive) | **Only for editable (user-created) expenses** | Deletes the expense after confirmation. |

### The editable rule (system defaults are view-only)

- **Seeded / system-default expenses carry `editable = false`.** They are **view-only**: the
  **Edit** and **Delete** row actions are **not shown** for them, and they cannot be modified.
- **User-created expenses carry `editable = true`** and expose the **Edit** and **Delete** actions.
- `editable` is **never** set by the client — it is assigned and enforced by the server (new
  expenses are always editable; seeded expenses are locked). A direct API attempt to modify or
  delete a locked expense is rejected by the server.
- Because the seeded catalog ships with every tenant, in a fresh tenant every row is a system
  default and therefore exposes no Edit or Delete action — the rows are read-only until a user
  adds their own expense (via **Add**, which is always available).

---

## 6. States

Loading / Loaded / Empty (no expenses match) / Deleting / delete success / delete failure —
as standard. A rejected delete (e.g. a locked expense hit via the API) surfaces the standard
error state.

---

## 7. Out of scope

- Filling in an expense's details — [Create Expense](./create-expense.md) and
  [Edit Expense](./edit-expense.md), which this screen's Add and Edit actions open.
- The [Expense Categories List](../expense-category/expense-categories-list.md) — its own screen.
- The per-building transactional expenses ([t-expense](../t-expense/expenses-list.md)).
