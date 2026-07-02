# Screen SDD — Edit Distribution Table

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Create Distribution Table](./create-distribution-table.md); this doc covers what edit adds.

---

## 1. Screen

- **Name:** Edit Distribution Table
- **Location:** Buildings → *(a building)* → Distribution Tables → *(a table)*
- **Purpose:** Update a distribution table's name, flags, and per-unit percentages, or delete it.
- **Scope:** Create fields + percentages grid (pre-filled) + read-only audit + Delete.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Distribution Tables list](./distribution-tables-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Distribution Tables › *(table)*.
- **On Save / Delete:** returns to the list with a confirmation.
- **Back:** returns without saving.

---

## 3. Fields

### 3.1 Editable (same as Create)
Name*, Default, Hidden, and the **per-unit percentages grid** with its calculation method — pre-filled with the table's current values. Recalculation and manual-redistribution behaviour are identical to [Create](./create-distribution-table.md) §5–§6.

### 3.2 Read-only audit (edit only)
Created at / by, Updated at / by.

---

## 4. Behaviour & interactions

- **Pre-fill** on open, including current percentages and the units.
- **Re-running a calculation method** overwrites current percentages — confirm whether a warning is shown (open question).
- **New units:** if units were added to the building after this table was created, confirm how they appear here (open question).
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

- Warn before a chosen calculation method **overwrites** manually-tuned percentages?
- How are **units added after creation** reflected — auto-added at 0% or requiring a recalculation?
- Block **Delete** when the table is referenced by a monthly budget/expense?
