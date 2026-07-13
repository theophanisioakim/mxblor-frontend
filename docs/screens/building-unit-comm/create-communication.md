# Screen SDD — Create Communication

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Edit Communication](./edit-communication.md); reached from the
> [Communication list](./communication-list.md).

> **Attachments are deferred.** The original design put file attachments on a communication. The app
> has no file-upload surface yet, so this screen has none — no empty attachment panel, no dead
> button. It joins when uploads exist.

---

## 1. Screen

- **Name:** Create Communication
- **Location:** Buildings → *(a building)* → Communication → New
- **Purpose:** Log a communication with a unit/contact, with an optional date, description, and file attachments.
- **Scope:** Unit + Contact + Contacted date + Description + Attachments. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Communication list](./communication-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Communication › New.
- **On Save:** returns to the Communication list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Unit** | Dropdown (units of this building) | Yes | The unit the communication concerns. |
| Contact | Dropdown (existing contacts) | No | The person contacted. |
| Contacted at | Date picker | No | When the communication happened. |
| Description | Multi-line text (3–6 rows) | No | What was communicated. |
| Attachments | File list | No | Supporting files; each row shows file name, description, and download. Multiple allowed. |

**Parent building** is set from context.

---

## 4. Behaviour & interactions

- **Unit** is required; other fields optional.
- **Attachments** can be added before saving; multiple allowed, each downloadable after save.
- Contact references an **existing** contact.

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Unit | Required | "Unit is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

Initial / Submitting / Success / Validation error / Save failure — as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the communication (with attachments), returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 8. Out of scope

- **Audit fields** — shown on [Edit Communication](./edit-communication.md) only.
- The building-level email/SMS **transmission settings** — see [Edit Building](../building/edit-building.md).

---

## 9. Open questions

- Should **Contacted at** default to today?
- Should a communication be linkable to a **specific contact within the chosen unit** only, or any contact?
