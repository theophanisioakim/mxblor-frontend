# Screen SDD — Edit Revenue (Housekeeping Catalog)

> Screen design document — behaviour only, no implementation/API/data detail.
> Changes an existing **revenue type** of the tenant's housekeeping catalog. Sibling of
> [Create Revenue](./create-revenue.md); reached from the [Revenues List](./revenues-list.md).

> **The revenue catalog ships empty.** Unlike expenses, no revenue categories or revenues are
> seeded, so **today every row is editable** and the locked / view-only path below never triggers in
> practice. The rule and the mechanism are in place for when system defaults are introduced — the
> revenue screens deliberately do not diverge from the expense ones in the meantime.

---

## 1. Screen

- **Name:** Edit Revenue
- **Location:** Revenues › Edit Revenue
- **Purpose:** Change the code, category, name or description of an revenue type.
- **Who:** Any user allowed to maintain the revenue catalog.

---

## 2. Entry points & navigation

- **Reached from:** the [Revenues List](./revenues-list.md) or a category's revenues grid
  ([Edit / View Revenue Category](../revenue-category/edit-revenue-category.md) §6), via **either**
  row action (route `/revenues/<id>`):
  - **Edit** — offered for **editable** revenues; the screen opens editable.
  - **View** — offered for **system-default** revenues; the same screen opens **read-only** (§5).

  There is no separate view screen: this one reads the revenue's own locked/unlocked state.
- **Breadcrumb:** Home › Revenues › Edit Revenue.
- **On success:** returns to the Revenues List showing the updated row.
- **On cancel / back:** returns to the Revenues List; nothing is changed.

---

## 3. Fields

The same fields as [Create Revenue](./create-revenue.md), pre-filled with the revenue's current
values:

| Field | Control | Required | Behaviour |
|---|---|---|---|
| Code | Text (max 10 characters) | Yes | The revenue's code. |
| Category | Single-select (searchable) | Yes | The parent revenue category. While editing, **only user-created (editable) categories are offered** — an revenue may not be *moved* into a system-default category any more than it may be created in one (see [Create Revenue](./create-revenue.md) §5). In read-only mode the field simply shows the revenue's own category, whatever it is. |
| Name | [Translation Label](../shared/translation-label-field.md) | Yes | Opens with the revenue's current name in every language. Shows the **default-language** text when closed. |
| Description | [Translation Label](../shared/translation-label-field.md) | Yes | Opens with the revenue's current description. Shows **all languages** when closed, and offers the **global namespace** toggle. |

### Editing a shared text

Name and description are **shared texts** (see the
[field's SDD](../shared/translation-label-field.md)). Re-opening one shows the texts it currently
holds. The user may:

- **leave them as they are** — the revenue keeps pointing at the same text;
- **pick a different existing text** — the revenue now points at that one;
- **change the text** — the change applies **everywhere that text is used**, not just to this
  revenue. This is intentional: the catalog's texts are shared on purpose.

---

## 4. States

| State | Behaviour |
|---|---|
| Loading | The screen shows a busy indicator until the revenue is loaded. |
| Not found / load failed | A message explains the revenue could not be loaded; no form is shown. |
| **Locked (system default)** | An revenue that is **not editable** (a seeded system default) is shown **view-only**: a notice explains it cannot be changed, all fields are disabled, and there is no Save — only **Back**. This mirrors the list, which does not offer Edit for such rows; it is the fallback for someone reaching the URL directly. |
| Saving | Save is disabled while the update is in flight. |
| Save failed | An error banner appears at the top; entered values are kept so the user can retry. A stale edit (someone else changed the revenue meanwhile) is rejected by the server and surfaces here. |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save Changes** | Bottom of the form | Editable revenues only | Validates, updates the revenue, returns to the list. |
| **Cancel** | Bottom of the form | Editable revenues | Returns to the list, discarding the changes. |
| **Back** | Bottom of the form | Locked revenues (replaces Cancel/Save) | Returns to the list. |

---

## 6. Out of scope

- Deleting an revenue — the row action of the [Revenues List](./revenues-list.md).
- Creating one — [Create Revenue](./create-revenue.md).
