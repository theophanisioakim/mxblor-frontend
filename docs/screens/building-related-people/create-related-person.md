# Screen SDD — Create Related Person

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Edit Related Person](./edit-related-person.md); reached from the
> [Related People list](./related-people-list.md).

---

## 1. Screen

- **Name:** Create Related Person
- **Location:** Buildings → *(a building)* → Related People → New
- **Purpose:** Link a person (existing contact) to the building with a relationship type and a short relation description.
- **Scope:** Type + Relation + Contact. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Related People list](./related-people-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Related People › New.
- **Parent building** fixed by context.
- **On Save:** returns to the Related People list with a success confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Type** | Dropdown | Yes | Relationship type from a predefined list. |
| **Relation** | Text | Yes | Short free-text description. Max 255 chars. |
| **Contact** | Dropdown (existing contacts) | Yes | The person being related. |

**Parent building** is set from context and not shown as an editable field.

---

## 4. Behaviour & interactions

- All three fields are required; Save is accepted only when they are valid.
- Contact references an **existing** contact; creating a new person is done elsewhere.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Type | Required | "Type is required." |
| Relation | Required | "Relation is required." |
| Contact | Required | "Contact is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

- **Initial:** empty form.
- **Submitting / Success / Validation error / Save failure** as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Validates, creates the link, returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 8. Out of scope

- **Audit fields** — shown on [Edit Related Person](./edit-related-person.md) only.
- Managing contact (person) records.

---

## 9. Open questions

- Can the same contact be linked more than once (different types), or should duplicates be blocked?
