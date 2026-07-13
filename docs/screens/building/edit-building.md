# Screen SDD — Edit Building (Building Details)

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.
> Shares its editable form with [Create New Building](./create-building.md); this doc
> focuses on what edit adds on top of create.

---

## 1. Screen

- **Name:** Building Details (Edit Building)
- **Location:** Buildings → *(a building)*
- **Purpose:** View and update an existing building's details, and act as the **hub** for navigating
  to everything that belongs to the building.
- **Scope:** Everything on the create screen (now pre-filled and editable), plus **Delete** and the
  sub-entity navigation hub. See §8 for what is deliberately **not** here.

---

## 2. Entry points & navigation

- **Reached from:** the **Buildings** list, by opening a building row.
- **Breadcrumb:** Home › Buildings › *(building name)*. The building's name is the screen heading
  once loaded.
- **On Save (success):** changes are saved; the user is returned to the **Buildings** list.
- **Back:** returns to the **Buildings** list without saving.
- **Hub tiles:** each tile navigates to that sub-entity's own screen, scoped to this building (§6).

---

## 3. Layout

A single scrollable screen: the editable building form, then the sub-entity navigation hub.

```
┌────────────────────────────────────────────────────────────────┐
│ Home › Buildings › (building name)                              │
├────────────────────────────────────────────────────────────────┤
│  ── EDITABLE FORM (same fields as Create, pre-filled) ──        │
│   Code* · Name* · Active · Manager · Email · Email/SMS          │
│   transmission · Auto-comm. day · Acquired ·                    │
│   Address(No / Street* / Post code / Area / City* / Country)    │
│                                                                 │
│         [ Save ]   [ Back ]              [ 🗑 Delete ]           │
│                                                                 │
│  ── MANAGE (navigation tiles) ──                                │
│   [🏠 Building units]                                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Fields

Identical to the [Create New Building](./create-building.md) field set — Code*, Name*, Active,
Manager, Email address, Email/SMS transmission, Auto-communication day, Acquired date, and the
Address (Number, Street*, Post code, Area/region, City*, Country) — **pre-filled with the building's
current values** and editable. Required rules and validation behave exactly as on create. (Asterisk =
required.)

**The address is edited in place.** Changing the street or city updates the building's existing
address; it does not create a second one.

---

## 5. Behaviour & interactions

- **Pre-fill:** on open, the form loads with the building's current values, address included.
- All create-screen behaviours apply — notably, **Auto-communication day becomes required** when
  Email or SMS transmission is switched on.
- **Delete:** hidden for the **user** role. It removes the building and returns to the Buildings
  list. It is styled destructively and kept apart from Save.

---

## 6. Sub-entity navigation hub

A row of tiles; each navigates to that sub-entity's list for this building.

| Tile | Goes to |
|---|---|
| Building units | [Units list](../building-unit/building-units-list.md) for this building |

**A tile appears only once the screen it opens exists** — the hub never offers a link that goes
nowhere. **Related people**, **Communication** and **Notes** join the hub when their screens are
built; the remaining sub-entities (distribution tables, yearly budget, bank accounts, and the
transaction screens) follow after that.

The tiles show **no counts** (see §8).

---

## 7. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Form footer (primary) | Always | Validates and saves changes; returns to the Buildings list. |
| **Back** | Form footer | Always | Returns to the Buildings list without saving. |
| **Delete** | Form footer (destructive) | Hidden for the **user** role | Deletes this building and returns to the list. Also available as a row action on the [Buildings list](./buildings-list.md). |

---

## 8. Deferred — deliberately not built

The original design for this screen carried considerably more. These are **not** implemented, and
the screen does not pretend otherwise (no empty panels, no zeroed counts):

- **Publish** and **Create external users** lifecycle actions.
- **Photos** and **attached files** — there is no file-upload surface in the app yet.
- **Read-only history / audit block** (published at, ended at, last activated/deactivated, created
  and updated by/at).
- **Summary figures** — months active, total area.
- **Counts on the hub tiles.**
- The finance and transaction tiles (distribution tables, yearly budget, bank accounts, expenses,
  revenues, payments, collections).

---

## 9. States

- **Loading:** a loading indicator until the building's data arrives.
- **Loaded:** fields pre-filled; hub shown.
- **Not found / load failure:** an error message instead of the form.
- **Submitting:** Save (or Delete) shows a busy/disabled state.
- **Validation error:** invalid fields flagged inline; no save occurs.
- **Save/delete failure:** error message shown; entered data preserved for retry.

---

## 10. Open questions

- Should **Delete** be blocked (or warn more strongly) when the building has units or transactions,
  rather than a plain confirmation? Today the server decides, and a referenced building simply fails
  to delete.
