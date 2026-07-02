# Screen SDD — Related People List

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the [Edit Building](../building/edit-building.md)
> hub. Entry point to [Create Related Person](./create-related-person.md) and
> [Edit Related Person](./edit-related-person.md).

---

## 1. Screen

- **Name:** Related People
- **Location:** Buildings → *(a building)* → Related People
- **Purpose:** List the people related to a building at building level (e.g. committee members, caretaker, lawyer) — distinct from unit owners/tenants — in a searchable, paged grid.
- **Scope:** Grid, filters, and actions, scoped to the parent building.

---

## 2. Entry points & navigation

- **Reached from:** the **Related People** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Related People.
- **Back:** returns to the parent building.
- **Add:** opens [Create Related Person](./create-related-person.md).
- **Open a row (Edit):** opens [Edit Related Person](./edit-related-person.md).

---

## 3. Grid columns

Default sort: as configured (by relation/person).

| Column | Content | Notes |
|---|---|---|
| Type | Relationship type | From a predefined list (committee role, caretaker, etc.). |
| Relation | Free-text relation | Short description of the relation. |
| Contact | Person | The linked contact's name. |

Grid supports sorting and paging (10 / 25 / 50 per page).

---

## 4. Filters

| Filter | Control |
|---|---|
| Relation | Text |
| Contact | Dropdown (contacts) |

> The building context is applied automatically.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Add** | Toolbar (primary) | All roles | Opens Create Related Person for this building. |
| **Edit** | Row action | All roles | Opens Edit Related Person. |
| **Delete** | Row action (destructive) | Non-`user` roles | Deletes after confirmation; row removed and list refreshes. |
| **Search** / **Clear** | Filters panel | All roles | Apply / reset filters. |
| **Back** | Above grid | All roles | Returns to the parent building. |

---

## 6. States

- **Loading / Loaded / Empty** as standard.
- **Deleting:** affected row shows busy state.
- **Action success:** confirmation; list refreshes.
- **Action failure:** error message; list unchanged.

---

## 7. Out of scope

- Create/Edit internals — see their SDDs.
- Managing the underlying **contact (person) records** — done on the contacts screens.

---

## 8. Open questions

- Same **role rule for Delete** as elsewhere (hidden for `user`) — confirm.
- Should Type be shown as a column in addition to Relation (assumed yes)?
