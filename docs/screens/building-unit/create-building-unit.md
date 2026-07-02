# Screen SDD — Create Building Unit

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.
> Scoped to a parent building. Shares its form with
> [Edit Building Unit](./edit-building-unit.md); reached from the
> [Building Units list](./building-units-list.md).

---

## 1. Screen

- **Name:** Create Building Unit
- **Location:** Buildings → *(a building)* → Units → New Unit
- **Purpose:** Add a unit (apartment, shop, storage, etc.) to a building — its identity, areas, floor, and the people linked to it.
- **Scope:** Unit identity + area measurements + floor + the linked-contacts sub-grid. The unit is always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Building Units list](./building-units-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Units › New Unit.
- **Parent building** is fixed by context (the user does not pick it here).
- **On Save (success):** the unit is created and the user returns to the Units list with a success confirmation.
- **On Cancel / Back:** returns to the Units list; nothing is saved.

---

## 3. Layout

A single form: identity + measurements on top, then the **Contacts** sub-grid.

```
┌────────────────────────────────────────────────────────────────────┐
│ Home › Buildings › (building name) › Units › New Unit                │
├────────────────────────────────────────────────────────────────────┤
│  [ Code * .................... ]   [ Floor ......... ]               │
│  [ Confined* ] [ Covered ] [ Uncovered ] [ Store ] [ Roof gardens ] │
│                                                                      │
│  ── CONTACTS ──────────────────────────────────────────────────────│
│   [ + add contact ]                                                  │
│   Type          │ Name (contact)      │ Send email? │ ⋯             │
│   Owner         │ A. Papadopoulos     │    [x]      │ ✎ 🗑          │
│   Tenant        │ K. Michael          │    [ ]      │ ✎ 🗑          │
│                                                                      │
│                                        [ Save ]   [ Cancel ]        │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Fields

Required fields are marked with an asterisk in the UI.

| Field | Control | Required | Default | Constraints / notes |
|---|---|---|---|---|
| **Code** | Text | Yes | — | Unit identifier within the building. Max 255 chars. |
| Floor | Number (integer) | No | — | Floor level. May be negative (basement). |
| **Confined space** | Number | Yes | — | Enclosed area in m². Two decimals, not negative. |
| Covered terraces | Number | No | — | Area in m². Two decimals, not negative. |
| Uncovered terraces | Number | No | — | Area in m². Two decimals, not negative. |
| Store room | Number | No | — | Area in m². Two decimals, not negative. |
| Roof gardens | Number | No | — | Area in m². Two decimals, not negative. |

**Parent building** is set from context and not shown as an editable field.

---

## 5. Contacts sub-grid

Links people (existing contacts) to this unit, with their role. Rows can be added, edited (inline or via a small form), and removed before saving the unit.

| Column | Control | Required | Notes |
|---|---|---|---|
| Type | Dropdown | Yes | Owner, Tenant, Other, Contact person, Ex-tenant, Ex-owner, Contact person (owner), Contact person (tenant). |
| Name | Dropdown (existing contacts) | Yes | The person; chosen from existing contacts. |
| Send email? | Checkbox | — | Whether this contact receives the unit's email communications. Default off. |

- **At least one contact is not enforced here** (a unit can be created with no contacts and have people added later) — see open questions.
- Contacts reference **existing** contact records; creating a brand-new person is done elsewhere.

---

## 6. Behaviour & interactions

- **Building fixed:** the unit is always attached to the building the user came from.
- **Numeric entry:** area fields accept up to two decimals and no negatives; Floor accepts whole numbers (including negatives).
- **Contacts editing:** adding/removing contact rows updates the sub-grid immediately; changes persist when the unit is saved.
- **Save enablement:** Save is accepted only when required fields (Code, Confined space) and any partially-entered contact rows are valid.

---

## 7. Validation & messages

| Field | Rule | Message shown |
|---|---|---|
| Code | Required | "Code is required." |
| Confined space | Required | "Confined space is required." |
| Area fields | Not negative, up to 2 decimals | "Enter a valid area (0 or more, up to 2 decimals)." |
| Contact row · Type | Required when a row exists | "Contact type is required." |
| Contact row · Name | Required when a row exists | "Contact is required." |

> Exact wording is indicative and finalised against the translation files (app is bilingual EN/EL).

---

## 8. States

- **Initial:** empty form; Code focused; empty contacts sub-grid.
- **Submitting:** Save shows a busy/disabled state.
- **Success:** confirmation; returns to the Units list with the new unit present.
- **Validation error:** invalid fields/rows highlighted; focus moves to the first error; no save.
- **Save failure (server/network):** error message; entered data preserved for retry.

---

## 9. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Form footer (primary) | Validates, creates the unit (with its contacts), returns to the Units list. |
| **Cancel** | Form footer (secondary) | Discards input, returns to the Units list. |

---

## 10. Out of scope

- **Audit fields** (created/updated) — shown on [Edit Building Unit](./edit-building-unit.md) only.
- Creating/managing the underlying **contact (person) records** — done on the contacts screens.

---

## 11. Open questions

- Should a unit **require at least one contact** (e.g. an owner) before it can be saved?
- Should **Code** be unique within the building, and enforced with a message?
- Any **max floor / area** limits to enforce?
- Do we want a computed **total area** shown live as the user types?
