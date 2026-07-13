# Screen SDD — Contacts List

> Screen design document — behaviour only, no implementation/API/data detail.
> Tenant-wide screen reached from the side navigation. Entry point to
> [Create Contact](./create-contact.md) and [Edit Contact](./edit-contact.md).

---

## 1. Screen

- **Name:** Contacts
- **Location:** Contacts
- **Purpose:** Browse the tenant's **people** — the owners, tenants, committee members, caretakers
  and anyone else a building deals with — in a searchable, paged grid.
- **Scope:** Contacts are **tenant-wide, not per-building.** The same person can own a unit in one
  building and be on the committee of another; they exist once and are referenced from both.

---

## 2. Entry points & navigation

- **Reached from:** the **Contacts** item in the side menu (backend-driven menu; route `/contacts`).
- **Breadcrumb:** Home › Contacts.
- **Add:** opens [Create Contact](./create-contact.md).
- **Open a row (Edit):** opens [Edit Contact](./edit-contact.md).

---

## 3. Grid columns

Default sort: **Last name ascending**.

| Column | Content | Sortable |
|---|---|---|
| Name | The contact's full composed name (prefix, first, middle, last, suffix). | Yes (by last name) |
| First name | | Yes |
| Last name | | Yes |

The composed **Name** is assembled by the server, so it reads identically here, in every contact
dropdown, and on any screen that references a person.

Grid supports paging (10 / 25 / 50 per page).

---

## 4. Filters

| Filter | Control | Behaviour |
|---|---|---|
| First name | Text | Partial, case-insensitive match. |
| Last name | Text | Partial, case-insensitive match. |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Search** / **Clear** | Filters panel | All roles | Apply / reset the filters. |
| **Add** | Toolbar (primary) | All roles | Opens Create Contact. |
| **Refresh** | Toolbar | All roles | Re-fetches the current page. |
| **Edit** | Row action | All roles | Opens Edit Contact. |
| **Delete** | Row action (destructive) | Hidden for the **user** role | Deletes the contact after confirmation. |

### Deleting a contact that is still in use

A contact **cannot be deleted while a building unit still points at it** (as an owner, tenant, or
other unit contact). The attempt is refused with a message saying how many units are involved, and
nothing is changed. Unlink the person from those units first.

This is deliberate: deletion is permanent, and silently removing someone from every unit they own
would be impossible to undo. The contact's **own** emails, phone numbers and addresses are not an
obstacle — they belong to the contact and go with it.

---

## 6. States

Loading / Loaded / Empty / Deleting / delete success / delete failure — as standard. A refused delete
(contact still linked to units) surfaces the server's message.

---

## 7. Out of scope

- The contact form itself — [Create](./create-contact.md) / [Edit](./edit-contact.md).
- Linking a person to a **unit** — done on the building unit screens.
- Linking a person to a **building** (committee, caretaker, …) — done on the related-people screens.
