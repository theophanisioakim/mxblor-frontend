# Screen SDD — Edit Note

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Create Note](./create-note.md);
> this doc covers what edit adds.

---

## 1. Screen

- **Name:** Edit Note
- **Location:** Buildings → *(a building)* → Notes → *(a note)*
- **Purpose:** Update or delete a building note.
- **Scope:** Create field (pre-filled) + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Notes list](./notes-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Notes › *(note)*.
- **On Save / Delete:** returns to the list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable (same as Create)
Detail* (multi-line) — pre-filled and editable.

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list. Destructive, separated from Save. Also a row action on the list.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves changes, returns to the list. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation, returns to the list. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Open questions

- Should edits be **restricted to the author** or allowed for any manager (assume any manager)?
