# Screen SDD — Create Contact

> Screen design document — behaviour only, no implementation/API/data detail.
> Shares its form with [Edit Contact](./edit-contact.md); reached from the
> [Contacts list](./contacts-list.md).

---

## 1. Screen

- **Name:** Create Contact
- **Location:** Contacts → New
- **Purpose:** Add a person, together with the ways to reach them.
- **Scope:** One contact **and** its emails, phone numbers and addresses — all saved together.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Contacts list](./contacts-list.md).
- **Breadcrumb:** Home › Contacts › New.
- **On Save:** returns to the Contacts list.
- **On Cancel:** returns to the list; nothing is saved.

---

## 3. Fields

### 3.1 Name

| Field | Control | Required | Notes |
|---|---|---|---|
| Prefix | Text | No | e.g. Dr., Mr. |
| First name | Text | No | |
| Middle name | Text | No | |
| Last name | Text | No | |
| Suffix | Text | No | |

Each part is optional on its own, but a contact with **no name at all** is not useful — the composed
display name would be empty. The parts are joined server-side into the single **Name** shown on
every other screen.

### 3.2 Emails · Phone numbers · Addresses (repeatable)

Three sections, each a list of rows the user can **add** and **remove** freely. All three are
optional — a contact may be saved with none — but a contact nobody can reach is rarely what is
wanted.

**Emails** — each row:

| Field | Control | Required |
|---|---|---|
| Email address | Text (valid email) | Yes |
| Type | Dropdown (Home, Work, Personal, Other) | Yes |
| Primary | Checkbox | No |

**Phone numbers** — each row:

| Field | Control | Required |
|---|---|---|
| Phone number | Text | Yes |
| Type | Dropdown (Home, Work, Mobile, Fax, Other) | Yes |
| Primary | Checkbox | No |

**Addresses** — each row:

| Field | Control | Required |
|---|---|---|
| Number | Text | No |
| Street | Text | Yes |
| Post code | Text | No |
| City | Text | Yes |
| Area / region | Text | No |
| Country | Dropdown | Yes (defaults to Cyprus) |
| Type | Dropdown (Home, Work, Business) | Yes |

The **type** dropdowns are the tenant's configured reference lists, shown in the user's language.

An empty section says so ("No email addresses yet") rather than showing an empty table.

---

## 4. Behaviour

- **Everything saves together.** The contact and all three lists are written in one go — there is no
  "save the contact, then add its emails" step, and a failure anywhere means nothing is saved.
- Adding a row shows an empty row inline; removing one takes it away immediately. Nothing is
  persisted until Save.

---

## 5. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Create Contact** | Form footer (primary) | Validates and saves the contact with all its rows; returns to the list. |
| **Cancel** | Form footer | Returns to the list without saving. |

---

## 6. Validation & states

- A row's required fields are flagged inline on submit — including rows the user added and left
  half-filled.
- Email addresses must be well-formed.
- Editing / Submitting / Save failure — as standard. A failed save keeps everything the user typed,
  rows included.
