# Screen SDD — Create Revenue (Housekeeping Catalog)

> Screen design document — behaviour only, no implementation/API/data detail.
> Adds a new **revenue type** to the tenant's housekeeping catalog. Sibling of
> [Edit Revenue](./edit-revenue.md); reached from the [Revenues List](./revenues-list.md).
>
> **Not to be confused with** recording a building's actual revenue
> ([t-revenue/create-revenue](../t-revenue/create-revenue.md)). This screen creates a reusable
> **revenue type**, not a booked revenue.

> **The revenue catalog ships empty.** Unlike expenses, no revenue categories or revenues are
> seeded, so **today every row is editable** and the locked / view-only path below never triggers in
> practice. The rule and the mechanism are in place for when system defaults are introduced — the
> revenue screens deliberately do not diverge from the expense ones in the meantime.

---

## 1. Screen

- **Name:** Create Revenue
- **Location:** Revenues › Create Revenue
- **Purpose:** Define a new revenue type (code, category, name, description) that can then be used
  when budgeting and recording a building's revenues.
- **Who:** Any user allowed to maintain the revenue catalog.

---

## 2. Entry points & navigation

- **Reached from:** either
  - the **Add** action in the toolbar of the [Revenues List](./revenues-list.md)
    (route `/revenues/new`), where the user picks the category; or
  - the **Add Revenue** action on a category's own screen
    ([Edit / View Revenue Category](../revenue-category/edit-revenue-category.md) §6), which
    arrives with **that category already selected and pinned** — it is shown but cannot be
    changed.
- **Breadcrumb:** Home › Revenues › Create Revenue.
- **On success:** returns wherever the user came from — the Revenues List, or the category screen
  when the category was pinned. The new row appears as an **editable** revenue (see the editable
  rule on the list screen).
- **On cancel:** returns to the same place; nothing is created.

---

## 3. Fields

| Field | Control | Required | Behaviour |
|---|---|---|---|
| Code | Text (max 10 characters) | Yes | The revenue's code, e.g. `101`. |
| Category | Single-select (searchable) | Yes | The parent revenue category. **Only user-created (editable) categories are offered** — see §5. Pinned (shown, not changeable) when the screen was opened from a category. |
| Name | [Translation Label](../shared/translation-label-field.md) | Yes | The revenue name in every language the tenant supports. Shows the **default-language** text when closed. Only the default language is mandatory. Existing revenue names can be searched and reused. |
| Description | [Translation Label](../shared/translation-label-field.md) | Yes | The revenue description. Shows **all languages** when closed. Only the default language is mandatory. Offers the **global namespace** toggle, so a description can be shared beyond the revenue catalog. |

### Name and Description are shared texts, not free text

Both are **translation labels** (see the [field's SDD](../shared/translation-label-field.md)): the
user either picks an existing text — which is then shared with every entity already using it — or
adds a new one, in each of the tenant's languages. The names offered while typing are only ever
other **revenue names**, and the descriptions only ever other **revenue descriptions** (unless the
global namespace is switched on for the description).

---

## 4. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Create Revenue** | Bottom of the form | Validates, creates the revenue, returns to the list. Disabled while the submission is in flight. |
| **Cancel** | Bottom of the form | Returns to the list without creating anything. |

---

## 5. Validation & states

- Every required field must be filled; a missing one is flagged inline on submit.
- Code is capped at 10 characters.
- A failed creation (e.g. a duplicate code rejected by the server) shows an error banner at the top
  of the screen; the entered values are kept so the user can fix and retry.
- Editable is **never** set here — the server always creates user-made revenues as editable.

### An revenue cannot be filed under a system-default category

The **Category** dropdown offers **only editable (user-created) categories**. System-default
categories are closed buckets that no new revenue may join. The server enforces this too — an
attempt made directly against the API is rejected — so hiding them from the dropdown simply keeps
the user from choosing an option that could never work.

Since **no revenue categories are seeded**, in a fresh tenant the dropdown is empty simply because
no categories exist yet — the user creates one first on
[Create Revenue Category](../revenue-category/create-revenue-category.md).

(The Revenues **list** filter is the opposite case: it offers *all* categories, so a locked
category's revenues remain filterable.)

---

## 6. Out of scope

- Changing an existing revenue — [Edit Revenue](./edit-revenue.md).
- Maintaining the categories themselves —
  [Revenue Categories List](../revenue-category/revenue-categories-list.md).
