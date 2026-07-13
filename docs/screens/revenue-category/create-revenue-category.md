# Screen SDD — Create Revenue Category

> Screen design document — behaviour only, no implementation/API/data detail.
> Shares its form with [Edit Revenue Category](./edit-revenue-category.md); reached from the
> [Revenue Categories list](./revenue-categories-list.md).

> **The revenue catalog ships empty.** Unlike expenses, no revenue categories or revenues are
> seeded, so **today every row is editable** and the locked / view-only path below never triggers in
> practice. The rule and the mechanism are in place for when system defaults are introduced — the
> revenue screens deliberately do not diverge from the expense ones in the meantime.

---

## 1. Screen

- **Name:** Create Revenue Category
- **Location:** Revenues → Revenue Categories → New
- **Purpose:** Add a housekeeping **revenue category** — the bucket that groups
  [revenues](../revenue/revenues-list.md).
- **Scope:** One category. A newly created category is **always editable** (see §5).

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Revenue Categories list](./revenue-categories-list.md).
- **Breadcrumb:** Home › Revenues › Revenue Categories › New.
- **On Save:** returns to the Revenue Categories list.
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
created here is always **editable**. A client that tries to send it is ignored. (No revenue
categories are seeded, so nothing is locked today.)

There is **no revenues grid on this screen.** The category does not exist yet, so there is nothing to
hang revenues off; the grid appears once the category is saved and reopened (see
[Edit Revenue Category](./edit-revenue-category.md) §6).

---

## 6. Validation & messages

- Required fields are flagged inline on submit.
- Code longer than 10 characters is rejected.
- A duplicate code is rejected by the server; the error is shown above the form and the entered
  values are kept for correction.

---

## 7. States

Editing / Submitting / Save failure — as standard. A failed save keeps everything the user typed.
