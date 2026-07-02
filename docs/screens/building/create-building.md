# Screen SDD — Create New Building

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.

---

## 1. Screen

- **Name:** Create New Building
- **Location:** Buildings → New Building
- **Purpose:** Let a manager register a new building with its identity, address, management, communication preferences, and supporting documents, then save it to the buildings list.
- **Scope:** Curated v3 — carries the useful upgrades from v2 (photos, active flag, manager, communication settings, attachments) while leaving edit-only concepts (publish, external users, audit/activation history) to the building detail/edit screen.

---

## 2. Entry points & navigation

- **Reached from:** the **Buildings** list, via a **New Building** action.
- **On Save (success):** the building is created and the user is returned to the **Buildings** list (the new building appears there). A success confirmation is shown.
- **On Cancel:** the user returns to the **Buildings** list; nothing is saved.
- **Breadcrumb:** Buildings › New Building.

---

## 3. Layout

A single scrollable form, grouped into labelled sections from top to bottom. On wide screens fields sit side-by-side (e.g. Code beside Name, address fields in a row); on narrow/mobile screens they stack to full width.

```
┌───────────────────────────────────────────────────────────┐
│ Buildings › New Building                                    │
├───────────────────────────────────────────────────────────┤
│ PHOTOS                                                      │
│   [ + add photos ]   ( carousel of added photos )          │
│                                                             │
│ IDENTITY                                                    │
│   [ Code * ........ ]  [ Name * .......................... ]│
│                                                             │
│ MANAGEMENT                                                  │
│   (x) Active                                                │
│   [ Manager  ▾ ...................... ]                     │
│                                                             │
│ COMMUNICATION                                               │
│   [ Email address ................... ]                     │
│   [ ] Email transmission   [ ] SMS transmission            │
│   [ Auto-communication day (1–31) ]                        │
│                                                             │
│ OWNERSHIP                                                   │
│   [ Acquired date  📅 today ]                               │
│                                                             │
│ ADDRESS                                                     │
│   [ No. ] [ Street * ....................... ]              │
│   [ Post code ] [ Area / region ........... ]              │
│   [ City * ............ ]  [ Country ▾ ..... ]             │
│                                                             │
│ DOCUMENTS                                                   │
│   [ + attach files ]   ( list: name · description · ⭳ )    │
│                                                             │
│                       [ Save ]   [ Cancel ]                 │
└───────────────────────────────────────────────────────────┘
```

---

## 4. Fields

Required fields are marked with an asterisk in the UI.

| Section | Field | Control | Required | Default | Constraints / notes |
|---|---|---|---|---|---|
| Photos | Building photos | Image upload + carousel | No | empty | Accepts image files (jpg, jpeg, png, gif, bmp, svg). Multiple allowed. |
| Identity | **Code** | Text | Yes | — | Building's short code. Must be unique across buildings. Max 255 chars. |
| Identity | **Name** | Text | Yes | — | Display name of the building. Max 255 chars. Receives focus on load. |
| Management | Active | Toggle | — | On | Whether the building is active. New buildings default to active. |
| Management | Manager | Dropdown (list of users) | No | Current user | The user responsible for the building. Defaults to the person creating it. |
| Communication | Email address | Text | No | — | Contact email for the building. Must be a valid email format if provided. Max 255 chars. |
| Communication | Email transmission | Toggle | — | Off | Enables sending communications to this building by email. |
| Communication | SMS transmission | Toggle | — | Off | Enables sending communications to this building by SMS. |
| Communication | Auto-communication day | Number | Conditional | — | Day of month (1–31) automatic communications are sent. **Required when Email or SMS transmission is on**, otherwise optional. Whole number, no negatives, max 31. |
| Ownership | Acquired date | Date picker | No | Today | Date the building was taken on. Defaults to today; can be changed. |
| Address | Number | Text | No | — | Street number. Max 255 chars. |
| Address | **Street** | Text | Yes | — | Street name. Max 255 chars. |
| Address | Post code | Text | No | — | Max 255 chars. |
| Address | Area / region | Text | No | — | Neighbourhood or region. Max 255 chars. |
| Address | **City** | Text | Yes | — | Max 255 chars. |
| Address | Country | Dropdown (country list) | No | — | Selected from a predefined list of countries. |
| Documents | Attached files | File list | No | empty | Supporting documents. Each row shows file name, description, and a download action. Multiple allowed. |

---

## 5. Behaviour & interactions

- **Conditional requirement:** turning on **Email transmission** or **SMS transmission** makes **Auto-communication day** required. Turning both off again removes that requirement.
- **Manager default:** the field is pre-filled with the current user but can be changed to another user.
- **Active default:** on for new buildings.
- **Acquired date default:** today; opens a date picker for changes.
- **Photos & attached files:** can be added before the building is saved; both accept multiple items and can be removed before saving.
- **Save enablement:** Save is only accepted once all required fields are valid; otherwise the invalid fields are highlighted with their messages and the screen scrolls/focuses to the first error.

---

## 6. Validation & messages

Validation runs on submit (and inline as the user leaves a field where practical).

| Field | Rule | Message shown |
|---|---|---|
| Code | Must be provided | "Code is required." |
| Code | Must be unique | "This code is already in use." |
| Name | Must be provided | "Name is required." |
| Street | Must be provided | "Street is required." |
| City | Must be provided | "City is required." |
| Email address | Valid email format (if provided) | "Enter a valid email address." |
| Auto-communication day | Required when email/SMS transmission is on | "Auto-communication day is required when a transmission method is enabled." |
| Auto-communication day | Between 1 and 31 | "Enter a day between 1 and 31." |

> Exact wording is indicative and will be finalised against the translation files (the app is bilingual — English / Greek).

---

## 7. States

- **Initial:** empty form with defaults applied (Active on, Manager = current user, Acquired = today). Name is focused.
- **Submitting:** Save shows a busy/disabled state; the form is not editable while the save is in progress.
- **Success:** confirmation message; user is returned to the Buildings list with the new building present.
- **Validation error:** invalid fields highlighted with messages; focus moves to the first error; no save occurs.
- **Save failure (server/network):** an error message is shown and entered data is preserved so the user can retry.

---

## 8. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Form footer (primary) | Validates, creates the building, returns to Buildings list with a success message. |
| **Cancel** | Form footer (secondary) | Discards input and returns to the Buildings list. |

---

## 9. Out of scope (belongs on the building detail / edit screen)

These v2 concepts are intentionally **not** on the create screen and are listed only so nothing is lost:

- **Publish** action and Published-at date.
- **Create external users** action.
- **Audit fields:** created by/at, updated by/at.
- **Activation history:** last activated, last deactivated, activated total.
- **Ended date.**
- Building sub-entities (units, contacts, committee, distributions, budgets, bank accounts, notes, transactions) — managed after the building exists.

---

## 10. Open questions

- Should **Code** be auto-suggested/generated, or always entered manually?
- Is **Manager** limited to users with a specific role, or any user?
- Are **photos/attachments** expected at creation time, or is deferring them to the detail screen acceptable for the common case?
- Confirm whether **Country** should default (e.g. to Cyprus) rather than start empty.
