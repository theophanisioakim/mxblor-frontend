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
| Default | Checkbox | — | Off | Marks this as the building's default table — the one used when an expense names none. **Exclusive:** marking a table Default clears the flag on the building's other tables. |
| Hidden | Checkbox | — | Off | Hides the table from selection lists elsewhere. |

> A *Bank* flag also exists on the record (it marks the table that splits the building-fund
> surplus/deficit). It is **deliberately not on this form** — neither v1 nor v2 ever let a user set
> it, and it only becomes meaningful once the building-fund expense engine exists. That feature will
> decide how it gets set; until then it keeps its default of off.

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
| Another distribution table | Copies percentages from an existing table of this building. A unit that table never mentioned (one added later) is copied in at **0%**, so the user has to give it a share before the total can reach 100. |

---

## 6. Behaviour & interactions

- **Choosing a method** recalculates every percentage from unit areas (or the referenced table) so they total 100%. It is a fresh start: it overwrites the whole grid, including any values typed before it.
- **Manual edit:** a percentage the user types is **theirs**. The difference it creates is absorbed by the rows they have *not* touched, so the total returns to 100 without ever writing back over a number they entered. Untouched rows keep their formula value, so an area-weighted split stays area-weighted.
- **Every row hand-typed:** there is nowhere left to absorb a difference, so the values stand as entered and the running total tells the user they are short.
- **Rows are fixed** to the building's units — units are managed on the [Building Units](../building-unit/building-units-list.md) screens.

---

## 7. Validation & messages

| Rule | Message |
|---|---|
| Name required | "Name is required." |
| Percentage ≤ 100 | "Percentage cannot exceed 100." |
| Percentage not negative | "Percentage cannot be negative." |
| **Percentages total 100%** | "Percentages must total 100%." A running total is shown under the grid and **Save is blocked** until it reads 100. The server enforces the same rule, so the form can never slip a table past it. |
| Building has units | A building with no units cannot have a distribution table — there is nothing to distribute across. |

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

## 11. Resolved

- **Save is blocked unless the percentages total exactly 100%** (a tiny tolerance absorbs rounding).
  A table that doesn't add up would silently over- or under-charge every unit, on every expense, for
  as long as it exists.
- **A building with no units cannot have a distribution table** — the form says so and the server
  refuses.
- **Default is exclusive.** Marking a table Default clears the flag on the building's other tables,
  so "which table splits an expense when none is named" always has exactly one answer.
