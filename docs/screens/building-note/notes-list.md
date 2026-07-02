# Screen SDD — Building Notes List

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Note](./create-note.md) and [Edit Note](./edit-note.md).

---

## 1. Screen

- **Name:** Notes
- **Location:** Buildings → *(a building)* → Notes
- **Purpose:** List free-text notes recorded against a building, in a searchable, paged grid.
- **Scope:** Grid, filters, and actions, scoped to the parent building.

---

## 2. Entry points & navigation

- **Reached from:** the **Notes** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Notes.
- **Back:** returns to the parent building.
- **Add:** opens [Create Note](./create-note.md).
- **Open a row (Edit):** opens [Edit Note](./edit-note.md).

---

## 3. Grid columns

Default sort: newest first (by created date).

| Column | Content | Notes |
|---|---|---|
| Detail | Note text | The note body (may be truncated in the grid). |
| Created at | Date/time | When the note was added. |
| Created by | User | Who added it. |
| Updated at / by | Date/time / user | Last change. |

Grid supports sorting and paging (10 / 25 / 50 per page).

---

## 4. Filters

| Filter | Control |
|---|---|
| Detail | Text |
| Created by | Text |
| Updated by | Text |

> The building context is applied automatically.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens Create Note. |
| **Edit** | Row action | All roles | Opens Edit Note. |
| **Delete** | Row action (destructive) | Non-`user` roles | Deletes after confirmation. |
| **Search** / **Clear** | Filters panel | All roles | Apply / reset filters. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 6. States

Loading / Loaded / Empty / Deleting / success / failure — as standard.

---

## 7. Out of scope

- Create/Edit internals — see their SDDs.

---

## 8. Open questions

- Confirm **Delete** role rule (hidden for `user`).
- Should long note detail be shown fully in the grid or truncated with a tooltip/expander?
