# Screen SDD — Revenue Categories List

> Screen design document — behaviour only, no implementation/API/data detail.
> Tenant-wide catalog screen reached from the side navigation. Sibling of the
> [Revenues List](../revenue/revenues-list.md); together they are the housekeeping
> revenue catalog.

> **The revenue catalog ships empty.** Unlike expenses, no revenue categories or revenues are
> seeded, so **today every row is editable** and the locked / view-only path below never triggers in
> practice. The rule and the mechanism are in place for when system defaults are introduced — the
> revenue screens deliberately do not diverge from the expense ones in the meantime.

---

## 1. Screen

- **Name:** Revenue Categories
- **Location:** Revenues → Revenue Categories
- **Purpose:** Browse the tenant's housekeeping **revenue categories** (e.g. Management,
  Cleaning, Water Board) in a searchable, paged grid. Categories group the individual
  [revenues](../revenue/revenues-list.md).
- **Scope:** The catalog grid, its filters, and its actions. The category form itself lives on
  [Create Revenue Category](./create-revenue-category.md) and
  [Edit / View Revenue Category](./edit-revenue-category.md).

---

## 2. Entry points & navigation

- **Reached from:** the **Revenues → Revenue Categories** item in the side menu
  (backend-driven menu; route `/revenues/categories`).
- **Breadcrumb:** Home › Revenues › Revenue Categories.
- This screen has no drill-down; rows are not clickable to a detail page.

---

## 3. Grid columns

Rows are revenue categories. Default sort: **Code ascending**.

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
| **Add** | Toolbar (primary) | All roles | Opens [Create Revenue Category](./create-revenue-category.md). |
| **Refresh** | Toolbar | All roles | Re-fetches the current page. |
| **View** | Row action | **Only for non-editable (system-default) categories** | Opens the category **read-only** on [Edit / View Revenue Category](./edit-revenue-category.md). |
| **Edit** | Row action | **Only for editable (user-created) categories** | Opens the category for editing on the same screen. |
| **Delete** | Row action (destructive) | **Only for editable (user-created) categories** | Deletes the category after confirmation. |

### The editable rule (system defaults are view-only)

- **Seeded / system-default categories carry `editable = false`.** They are **view-only**: they show
  a **View** action instead of Edit, and **no Delete**.
- **User-created categories carry `editable = true`** and show **Edit** + **Delete**.
- **View and Edit lead to the same screen.** It reads the category's own locked/unlocked state and
  renders itself read-only or editable — there is no separate "view screen", only a different icon
  on the row. Revenues cannot be assigned to a locked category either, so its revenues grid offers
  no Add (see [Edit / View](./edit-revenue-category.md) §6).
- `editable` is **never** set by the client — it is assigned and enforced by the server (new
  categories are always editable; seeded categories are locked). A direct API attempt to modify
  or delete a locked category is rejected by the server.
- **No revenue categories are seeded**, so a fresh tenant's list is simply empty and every category
  a user adds is editable. Nothing is locked unless system defaults are introduced later.

---

## 6. States

Loading / Loaded / Empty (no categories match) / Deleting / delete success / delete failure —
as standard. A rejected delete (e.g. a locked category hit via the API) surfaces the standard
error state.

---

## 7. Out of scope

- [Create Revenue Category](./create-revenue-category.md) and
  [Edit / View Revenue Category](./edit-revenue-category.md) — their own screens (the latter also
  owns the per-category revenues grid).
- The [Revenues List](../revenue/revenues-list.md) — its own screen.
