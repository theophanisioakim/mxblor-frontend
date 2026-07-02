# Screen SDD — Edit Related Person

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Create Related Person](./create-related-person.md); this doc covers what edit adds.

---

## 1. Screen

- **Name:** Edit Related Person
- **Location:** Buildings → *(a building)* → Related People → *(a person)*
- **Purpose:** Update or delete a building's related-person link.
- **Scope:** Create fields (pre-filled) + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Related People list](./related-people-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Related People › *(person)*.
- **On Save / Delete:** returns to the list with a confirmation.
- **Back:** returns to the list without saving.

---

## 3. Fields

### 3.1 Editable (same as Create)
Type*, Relation*, Contact* — pre-filled and editable, same rules as [Create Related Person](./create-related-person.md).

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open.
- **Delete:** non-`user` roles; confirm-first; on confirm deletes and returns to the list. Styled destructive, separated from Save. Also available as a row action on the list.

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

- Should the **audit block** be collapsed by default behind an expander?
