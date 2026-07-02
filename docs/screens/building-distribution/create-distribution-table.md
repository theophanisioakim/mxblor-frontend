# Screen SDD — Create Distribution Table

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with
> [Edit Distribution Table](./edit-distribution-table.md); reached from the
> [Distribution Tables list](./distribution-tables-list.md).

---

## 1. Screen

- **Name:** Create Distribution Table
- **Location:** Buildings → *(a building)* → Distribution Tables → New
- **Purpose:** Define a named percentage split across the building's units, used to share out expenses. Percentages can be auto-calculated from a chosen method and then fine-tuned.
- **Scope:** Name + flags + a per-unit percentage grid with a calculation method. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Distribution Tables list](./distribution-tables-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Distribution Tables › New.
- **On Save:** returns to the Distribution Tables list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [ Name * ....................................................... ] │
│ [ ] Default            [ ] Hidden                                  │
│                                                                    │
│ ── PERCENTAGES ─────────────────────────────────────────────────  │
│  Calculation method: [ ▾ Equal / By all areas / … / DT-… ]         │
│  Unit          │ Percentage (%)                                    │
│  101           │ 12.5000                                           │
│  102           │ 12.5000                                           │
│  …             │ …                                    Total: 100%  │
│                                                                    │
│                                     [ Save ]   [ Cancel ]          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Fields

| Field | Control | Required | Default | Notes |
|---|---|---|---|---|
| **Name** | Text | Yes | — | Table name. |
| Default | Checkbox | — | Off | Marks this as the building's default table. |
| Hidden | Checkbox | — | Off | Hides the table from selection lists elsewhere. |

---

## 5. Percentages grid

One row **per building unit** (rows are fixed — you cannot add or remove rows; they mirror the building's units).

| Column | Editable | Notes |
|---|---|---|
| Unit | No | The building unit (label). |
| Percentage | Yes | Unit's share, 0–100, up to high precision; edited inline. |

**Calculation method** (selector above the grid) auto-fills every percentage:

| Method | Meaning |
|---|---|
| Equal distribution | Splits 100% evenly across all units. |
| All areas | Weighted by each unit's total area (confined + covered + uncovered terraces + store + roof gardens). |
| Confined area | Weighted by confined space only. |
| Confined + covered area | Weighted by confined space + covered terraces. |
| Another distribution table | Copies percentages from an existing table of this building. |

---

## 6. Behaviour & interactions

- **Choosing a method** recalculates all percentages from unit areas (or the referenced table) so they total 100%.
- **Manual edit:** editing one unit's percentage redistributes the remainder across the other (untouched) units so the total stays balanced.
- **A method must be chosen** to auto-calculate; if none is selected when expected, the user is warned.
- **Rows are fixed** to the building's units — units are managed on the [Building Units](../building-unit/building-units-list.md) screens.

---

## 7. Validation & messages

| Rule | Message |
|---|---|
| Name required | "Name is required." |
| Percentage ≤ 100 | "Percentage cannot exceed 100." |
| Percentage not negative | "Percentage cannot be negative." |
| (Recommended) percentages total 100% | "Percentages should total 100%." — see open questions. |

> Wording indicative; finalised against translations (EN/EL).

---

## 8. States

Initial (units listed, percentages 0 or from a chosen method) / Submitting / Success / Validation error / Save failure — as standard.

---

## 9. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the table with its percentages, returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 10. Out of scope

- **Audit fields** — shown on [Edit Distribution Table](./edit-distribution-table.md) only.
- Editing the building's units — see the Building Units screens.

---

## 11. Open questions

- Should Save be **blocked unless percentages total exactly 100%**, or just warn?
- If a building has **no units yet**, should creating a distribution table be prevented?
- Can more than one table be **Default**, or is Default exclusive (assume exclusive)?
