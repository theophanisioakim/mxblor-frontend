# Screen SDD — Communication List

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Communication](./create-communication.md) and
> [Edit Communication](./edit-communication.md).

---

## 1. Screen

- **Name:** Communication
- **Location:** Buildings → *(a building)* → Communication
- **Purpose:** Log and review communications with a building's units/contacts (calls, emails, letters, meetings) in a searchable, paged grid.
- **Scope:** Grid, filters, and actions, scoped to the parent building.

---

## 2. Entry points & navigation

- **Reached from:** the **Communication** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Communication.
- **Back:** returns to the parent building.
- **Add:** opens [Create Communication](./create-communication.md).
- **Open a row (Edit):** opens [Edit Communication](./edit-communication.md).

---

## 3. Grid columns

Default sort: most recent contact first.

| Column | Content | Notes |
|---|---|---|
| Unit | Building unit | Which unit the communication concerns. |
| Contact | Person | The contacted person. |
| Phone(s) | Contact phone numbers | Read from the contact. |
| Email | Contact email | Read from the contact. |
| Description | Communication text | May be truncated in the grid. |
| Contacted at | Date | When contact happened. |
| Attachments | Count / indicator | Files attached to the log entry. |

Grid supports sorting and paging (10 / 25 / 50 per page).

---

## 4. Filters

| Filter | Control |
|---|---|
| Unit | Dropdown (units of this building) |
| Contacted at | Date |
| Contact | Dropdown (contacts) |
| Description | Text |

> The building context is applied automatically.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens Create Communication. |
| **Edit** | Row action | All roles | Opens Edit Communication. |
| **Delete** | Row action (destructive) | Non-`user` roles | Deletes after confirmation. |
| **Search** / **Clear** | Filters panel | All roles | Apply / reset filters. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 6. States

Loading / Loaded / Empty / Deleting / success / failure — as standard.

---

## 7. Out of scope

- Create/Edit internals — see their SDDs.
- Managing contact (person) records.

---

## 8. Open questions

- Confirm **Delete** role rule (hidden for `user`).
- Should the phone/email columns be **read-only reflections** of the contact (assumed yes)?
