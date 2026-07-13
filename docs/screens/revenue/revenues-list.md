# Screen SDD — Revenues List (Housekeeping Catalog)

> Screen design document — behaviour only, no implementation/API/data detail.
> Tenant-wide catalog screen reached from the side navigation. Sibling of the
> [Revenue Categories List](../revenue-category/revenue-categories-list.md); together they are
> the housekeeping revenue catalog.
>
> **Not to be confused with** the per-building, per-year transactional revenues in
> [t-revenue/revenues-list](../t-revenue/revenues-list.md). This screen is the reusable
> **catalog of revenue types**, not a building's recorded revenues.

> **The revenue catalog ships empty.** Unlike expenses, no revenue categories or revenues are
> seeded, so **today every row is editable** and the locked / view-only path below never triggers in
> practice. The rule and the mechanism are in place for when system defaults are introduced — the
> revenue screens deliberately do not diverge from the expense ones in the meantime.

---

## 1. Screen

- **Name:** Revenues
- **Location:** Revenues
- **Purpose:** Browse the tenant's housekeeping **revenue types** (e.g. Account Management,
  Cleaner, Lift Maintenance) in a searchable, paged grid. Each revenue belongs to one
  [revenue category](../revenue-category/revenue-categories-list.md).
- **Scope:** A catalog grid. Creating and editing an revenue happen on their own screens
  ([Create Revenue](./create-revenue.md) / [Edit Revenue](./edit-revenue.md)), which this screen
  navigates to.

---

## 2. Entry points & navigation

- **Reached from:** the **Revenues** item in the side menu (backend-driven menu; route
  `/revenues`).
- **Breadcrumb:** Home › Revenues.
- This screen has no drill-down; rows are not clickable to a detail page.

---

## 3. Grid columns

Rows are revenue types. Default sort: **Code ascending**.

| Column | Content | Sortable |
|---|---|---|
| Code | The revenue's code (e.g. `101`, `111`). Unique within its category. | Yes |
| Name | The revenue name in the user's language. | No |
| Category | The name of the parent revenue category, in the user's language. | No |
| Description | The revenue description in the user's language. | No |
| Editable | Whether the revenue is user-maintained. System defaults show as **not editable**; user-created revenues show as **editable**. | Yes |

Grid supports paging (10 / 25 / 50 per page).

> Name, Category and Description are shown in the requested language, resolved by the server; they
> are not free-text sortable columns.

---

## 4. Filters

| Filter | Control | Behaviour |
|---|---|---|
| Code | Text | Partial, case-insensitive match on the code. |
| Category | Single-select (searchable) | Restrict to revenues in the chosen category. Options are **all** the tenant's revenue categories, locked ones included, so a locked category's revenues stay filterable. (The create/edit **form** offers a narrower list; see [Create Revenue](./create-revenue.md) §5.) |
| Editable only | Tri-state checkbox | Unset = all; checked = only editable (user-created); unchecked = only non-editable (system defaults). |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Search** / **Clear** | Filters panel | All roles | Apply / reset the filters. |
| **Refresh** | Toolbar | All roles | Re-fetches the current page. |
| **Add** | Toolbar | All roles | Opens [Create Revenue](./create-revenue.md). |
| **View** | Row action | **Only for non-editable (system-default) revenues** | Opens [Edit Revenue](./edit-revenue.md) **read-only** for that row. |
| **Edit** | Row action | **Only for editable (user-created) revenues** | Opens [Edit Revenue](./edit-revenue.md) for that row. |
| **Delete** | Row action (destructive) | **Only for editable (user-created) revenues** | Deletes the revenue after confirmation. |

### The editable rule (system defaults are view-only)

- **Seeded / system-default revenues carry `editable = false`.** They are **view-only**: they show a
  **View** action instead of Edit, and **no Delete**.
- **User-created revenues carry `editable = true`** and expose the **Edit** and **Delete** actions.
- **View and Edit lead to the same screen.** It reads the revenue's own locked/unlocked state and
  renders itself read-only or editable — there is no separate "view screen", only a different icon
  on the row.
- `editable` is **never** set by the client — it is assigned and enforced by the server (new
  revenues are always editable; seeded revenues are locked). A direct API attempt to modify or
  delete a locked revenue is rejected by the server.
- **No revenues are seeded**, so a fresh tenant's list is simply empty and every row a user adds is
  editable. Nothing is locked unless system defaults are introduced later.

---

## 6. States

Loading / Loaded / Empty (no revenues match) / Deleting / delete success / delete failure —
as standard. A rejected delete (e.g. a locked revenue hit via the API) surfaces the standard
error state.

---

## 7. Out of scope

- Filling in an revenue's details — [Create Revenue](./create-revenue.md) and
  [Edit Revenue](./edit-revenue.md), which this screen's Add and Edit actions open.
- The [Revenue Categories List](../revenue-category/revenue-categories-list.md) — its own screen.
- The per-building transactional revenues ([t-revenue](../t-revenue/revenues-list.md)).
