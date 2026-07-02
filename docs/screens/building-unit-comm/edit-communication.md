# Screen SDD — Edit Communication

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Create Communication](./create-communication.md); this doc covers what edit adds.

---

## 1. Screen

- **Name:** Edit Communication
- **Location:** Buildings → *(a building)* → Communication → *(an entry)*
- **Purpose:** Update or delete a logged communication and manage its attachments.
- **Scope:** Create fields (pre-filled) + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Communication list](./communication-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Communication › *(entry)*.
- **On Save / Delete:** returns to the list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable (same as Create)
Unit*, Contact, Contacted at, Description, Attachments — pre-filled and editable; attachments can be added/removed.

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open, including existing attachments (each downloadable).
- **Delete:** non-`user` roles; confirm-first; deletes and returns to the list. Destructive, separated from Save. Also a row action on the list.

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Footer (primary) | Always | Saves changes (incl. attachments), returns to the list. |
| **Back** | Footer | Always | Returns without saving. |
| **Delete** | Footer (destructive) | Non-`user` roles | Deletes after confirmation, returns to the list. |

---

## 6. States

Loading / Loaded / Submitting / Confirming delete / Success / Validation error / failure — as standard.

---

## 7. Open questions

- Should deleting a communication also remove its **attachments** (assume yes)?
