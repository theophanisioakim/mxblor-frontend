# Screen SDD — Edit / View Revenue Category

> Screen design document — behaviour only, no implementation/API/data detail.
> Shares its form with [Create Revenue Category](./create-revenue-category.md); reached from the
> [Revenue Categories list](./revenue-categories-list.md).

> **The revenue catalog ships empty.** Unlike expenses, no revenue categories or revenues are
> seeded, so **today every row is editable** and the locked / view-only path below never triggers in
> practice. The rule and the mechanism are in place for when system defaults are introduced — the
> revenue screens deliberately do not diverge from the expense ones in the meantime.

---

## 1. Screen

- **Name:** Edit Revenue Category (also serves as **View** — see §5)
- **Location:** Revenues → Revenue Categories → *(a category)*
- **Purpose:** Change a user-created category, or view a system-default one; and manage the
  **revenues filed under it**.
- **Scope:** The category's own fields **plus** its revenues grid.

---

## 2. Entry points & navigation

- **Reached from:** the **Edit** row action (user-created categories) or the **View** row action
  (system defaults) on the [Revenue Categories list](./revenue-categories-list.md). Both open this
  same screen — see §5.
- **Breadcrumb:** Home › Revenues › Revenue Categories › *(category)*.
- **On Save:** returns to the Revenue Categories list.
- **Cancel / Back:** returns to the list without saving.

---

## 3. Fields

Identical to [Create Revenue Category](./create-revenue-category.md) §3 — Code, Name, Description —
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

## 6. The revenues grid

Below the form, the screen lists **the revenues in this category** (Code, Name, Description,
Editable), paged 10 / 25 / 50.

| Action | Availability | Outcome |
|---|---|---|
| **Add Revenue** | **Only when the category is editable** | Opens Create Revenue with **this category pre-selected and pinned** (it cannot be changed). Cancelling or saving returns here. |
| **View** (row) | Rows that are system-default revenues | Opens the revenue read-only. |
| **Edit** (row) | Rows that are user-created revenues | Opens the revenue for editing. |
| **Delete** (row) | Rows that are user-created revenues | Deletes after confirmation. |

**Why Add is hidden on a system-default category:** an revenue may never be filed under a locked
category — the server refuses it — so the button would be one that always fails. The row actions,
by contrast, follow each **revenue's own** editable flag, not the category's.

The grid appears only on an existing category; there is none on
[Create](./create-revenue-category.md).

---

## 7. States

Loading / Loaded (editable) / Loaded (view-only) / Not found / Load failure / Saving / Save failure —
as standard. A save rejected for a stale version, a duplicate code, or a locked category surfaces the
server's message above the form, with the entered values preserved.
