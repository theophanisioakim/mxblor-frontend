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
- **Scope:** A read-and-delete catalog grid. Creating and editing expenses are separate screens
  (see §7), not part of this screen.

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
| **Delete** | Row action (destructive) | **Only for editable (user-created) expenses** | Deletes the expense after confirmation. |

### The editable rule (system defaults are view-only)

- **Seeded / system-default expenses carry `editable = false`.** They are **view-only**: the
  **Delete** row action is **not shown** for them, and they cannot be modified.
- **User-created expenses carry `editable = true`** and expose the **Delete** action.
- `editable` is **never** set by the client — it is assigned and enforced by the server (new
  expenses are always editable; seeded expenses are locked). A direct API attempt to modify or
  delete a locked expense is rejected by the server.
- Because the seeded catalog ships with every tenant, in a fresh tenant every row is a system
  default and therefore exposes no Delete action — the screen is effectively read-only until a
  user creates their own expense.

---

## 6. States

Loading / Loaded / Empty (no expenses match) / Deleting / delete success / delete failure —
as standard. A rejected delete (e.g. a locked expense hit via the API) surfaces the standard
error state.

---

## 7. Out of scope

- **Create Expense** and **Edit Expense** screens — separate deliverables. When they exist, Add
  (toolbar) and Edit (row action, shown only for editable rows) are added to this list, following
  the same editable rule as Delete.
- The [Expense Categories List](../expense-category/expense-categories-list.md) — its own screen.
- The per-building transactional expenses ([t-expense](../t-expense/expenses-list.md)).
