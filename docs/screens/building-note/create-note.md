# Screen SDD — Create Note

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Edit Note](./edit-note.md);
> reached from the [Notes list](./notes-list.md).

---

## 1. Screen

- **Name:** Create Note
- **Location:** Buildings → *(a building)* → Notes → New
- **Purpose:** Record a free-text note against the building.
- **Scope:** A single multi-line note field. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Notes list](./notes-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Notes › New.
- **On Save:** returns to the Notes list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Detail** | Multi-line text (3–6 rows) | Yes | The note body. |

**Parent building** is set from context.

---

## 4. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Detail | Required | "Note text is required." |

> Wording indicative; finalised against translations (EN/EL).

---

## 5. States

Initial (empty, focused) / Submitting / Success / Validation error / Save failure — as standard.

---

## 6. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the note, returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 7. Out of scope

- **Audit fields** — shown on [Edit Note](./edit-note.md) only.

---

## 8. Open questions

- Any **max length** on the note body?
