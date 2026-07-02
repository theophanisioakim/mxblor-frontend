# Screen SDD — Edit Building (Building Details)

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.
> Shares its editable form with [Create New Building](./create-building.md); this doc
> focuses on what edit adds on top of create.

---

## 1. Screen

- **Name:** Building Details (Edit Building)
- **Location:** Buildings → *(a building)*
- **Purpose:** View and update an existing building's details, manage its lifecycle (publish, activate, provide external-user access), and act as the **hub** for navigating to everything that belongs to the building (units, people, budgets, transactions, etc.).
- **Scope:** Everything on the create screen (now pre-filled and editable) **plus** the edit-only lifecycle actions, read-only history, summary figures, and the sub-entity navigation hub.

---

## 2. Entry points & navigation

- **Reached from:** the **Buildings** list, by opening a building row.
- **Breadcrumb:** Home › Buildings › *(building name)*. The building's name is shown in the breadcrumb once loaded.
- **On Save (success):** changes are saved; the user is returned to the **Buildings** list with a success confirmation.
- **Back:** returns to the **Buildings** list without saving.
- **Sub-entity tiles:** each tile navigates to that sub-entity's own screen, scoped to this building (see §6).

---

## 3. Layout

A single scrollable screen. Top to bottom: lifecycle actions, the editable building form (identical to create), read-only history/audit, summary figures, then the sub-entity navigation hub.

```
┌────────────────────────────────────────────────────────────────┐
│ Home › Buildings › (building name)                               │
│                                          [ Publish ] [ + Ext. ]  │
├────────────────────────────────────────────────────────────────┤
│  ── EDITABLE FORM (same fields as Create, pre-filled) ──         │
│   Photos · Code* · Name* · Active · Manager · Email · toggles ·  │
│   Auto-comm. day · Acquired · Address(No/Street*/Post/Area/      │
│   City*/Country) · Attached files                                │
│                                                                  │
│  ── READ-ONLY HISTORY ──                                         │
│   Published at · Ended at · Last activated · Last deactivated ·  │
│   Created at / by · Updated at / by                              │
│                                                                  │
│  ── SUMMARY ──                                                   │
│   Months active: N            Total area: N sqm                  │
│                                                                  │
│  ── MANAGE (navigation tiles, each shows a count) ──             │
│   [🏠 Units n] [👥 People n] [✉ Communication n] [🗒 Notes n]     │
│   [▦ Distribution tables n] [💰 Yearly budget n] [🏦 Bank acc. n]│
│   [＄ Current expenses n] [＄ Revenues n] [⧉ Payments n] [🧾 Coll.]│
│                                                                  │
│                   [ Save ]   [ Back ]        [ 🗑 Delete ]        │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Fields

### 4.1 Editable fields (same as Create)

Identical to the [Create New Building](./create-building.md) field set — Photos, Code*, Name*, Active, Manager, Email address, Email/SMS transmission, Auto-communication day, Acquired date, Address (Number, Street*, Post code, Area/region, City*, Country), Attached files — **pre-filled with the building's current values** and editable. Required rules and validation behave exactly as on create. (Asterisk = required.)

### 4.2 Read-only history / audit (edit only)

Displayed for information; the user cannot change these directly.

| Field | Shown as | Notes |
|---|---|---|
| Published at | Date/time | Present only if the building has been published. |
| Ended at | Date | Present only if the building has an end date. |
| Last activated | Date/time | Most recent activation. |
| Last deactivated | Date/time | Most recent deactivation. |
| Created at | Date/time | When the record was created. |
| Created by | Text (user) | Who created it. |
| Updated at | Date/time | When last changed. |
| Updated by | Text (user) | Who last changed it. |

### 4.3 Summary figures (edit only)

| Figure | Shown as | Meaning |
|---|---|---|
| Months active | Number | How long the building has been active. |
| Total area | Number + "sqm" | Sum of the building's unit areas. |

---

## 5. Behaviour & interactions

- **Pre-fill:** on open, the form loads with the building's current values; the breadcrumb updates to the building name.
- **Editable form:** all create-screen behaviours apply — notably, Auto-communication day becomes required when Email or SMS transmission is on.
- **Read-only fields** appear only when they have a value (e.g. *Published at* and *Ended at* are hidden until they apply).
- **Summary and hub** reflect the building's current related data and load once the building is open.
- **Save enablement:** same as create — Save is accepted only when required fields are valid.
- **Delete:** available to non-`user` roles. Choosing Delete asks for confirmation before removing the building; on confirm it deletes and returns to the Buildings list, on cancel nothing changes. It is placed apart from Save and styled destructively to prevent accidental deletion.

---

## 6. Sub-entity navigation hub

A grid of tiles; each tile shows an icon, a label, and a **count** of items, and navigates to that sub-entity's list for this building.

| Group | Tile | Count shown | Goes to |
|---|---|---|---|
| Occupancy | Building units | # of units | Units list for this building |
| Occupancy | Related people | # of related people | Related-people list |
| Occupancy | Communication | # of communications | Communication list |
| Occupancy | Notes | # of notes | Notes list |
| Finance setup | Distribution tables | # of tables | Distribution-tables list |
| Finance setup | Yearly budget | # of budgets | Yearly-budget list |
| Finance setup | Bank accounts | # of accounts | Bank-accounts list |
| Transactions | Current expenses | value/count | Expenses list |
| Transactions | Revenues | value/count | Revenues list |
| Transactions | Payments | value/count | Payments list |
| Transactions | Collections | value/count | Collections list |

> These tiles are the primary way to reach building sub-screens; each of those screens will get its own SDD.

---

## 7. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Form footer (primary) | Always | Validates and saves changes; returns to Buildings list with success message. |
| **Back** | Form footer / header | Always | Returns to Buildings list without saving. |
| **Delete** | Form footer / header (destructive) | Hidden for the **user** role | Deletes this building after confirmation (see §5); on success shows a confirmation and returns to the Buildings list; on failure shows an error. Also available as a row action on the [Buildings list](./buildings-list.md). |
| **Publish** | Header (primary) | Edit only | Publishes the building; on success shows a confirmation and returns to the Buildings list; on failure shows an error. |
| **Create external users** | Header (secondary) | Edit only | Provisions external-user (portal) access for the building's people; shows success or error. |

**Delete**, **Publish**, and **Create external users** each show a busy state while running and are disabled until they complete. Delete is styled as a destructive action and is kept visually separate from Save to avoid accidental clicks.

---

## 8. Validation & messages

- Editable-field validation is identical to [Create New Building](./create-building.md) §6.
- **Publish** and **Create external users** each surface a success message on completion and an error message on failure (exact wording finalised against translation files; the app is bilingual EN/EL).

---

## 9. States

- **Loading:** the form and hub show a loading indicator until the building's data arrives.
- **Loaded (view/edit):** fields pre-filled; history, summary, and hub populated.
- **Submitting:** Save (or Delete / Publish / Create external users) shows a busy/disabled state.
- **Confirming delete:** a confirmation prompt is shown before the building is deleted.
- **Success:** confirmation message; for Save / Delete / Publish, returns to the Buildings list.
- **Validation error:** invalid fields highlighted with messages; focus moves to the first error; no save occurs.
- **Save/action failure (server/network):** error message shown; entered data preserved for retry.
- **Read-only mode:** when the screen is opened for viewing only, Save/Clear are hidden and all fields are non-editable (used by preview/lookup contexts).

---

## 10. Out of scope

- Detailed behaviour of each **sub-entity screen** — covered by its own SDD.

---

## 11. Open questions

- **Delete** — should it be blocked (or warn more strongly) when the building has units/transactions, rather than a plain confirmation?
- **Publish** — what exactly changes for the user after publishing (visibility, portal access)? Confirm the pre-conditions and whether it can be undone.
- **Create external users** — is it re-runnable safely (idempotent) if some users already exist?
- Should the **read-only history** fields be collapsed by default (e.g. under an "Advanced/Audit" expander) to keep the screen focused?
- Are the transaction tiles meant to show a **count** or a **monetary total**? (v2 mixes both.)
