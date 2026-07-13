# Screen SDD — Edit Building Unit

> Screen design document. Describes what the user sees and does on this screen.
> No implementation, API, or data-model detail — those live elsewhere.
> Scoped to a parent building. Shares its form with
> [Create Building Unit](./create-building-unit.md); this doc focuses on what edit adds.

---

## 1. Screen

- **Name:** Edit Building Unit
- **Location:** Buildings → *(a building)* → Units → *(a unit)*
- **Purpose:** View and update an existing unit — its identity, areas, floor, and linked contacts — and delete it.
- **Scope:** Everything on the create screen (pre-filled and editable) **plus** read-only audit fields and a Delete action.

---

## 2. Entry points & navigation

- **Reached from:** opening a row on the [Building Units list](./building-units-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Units › *(unit code)*.
- **On Save (success):** changes saved; returns to the Units list with a success confirmation.
- **Back:** returns to the Units list without saving.

---

## 3. Layout

Same form as create (pre-filled), with a read-only audit block added and a Delete action in the footer.

```
┌────────────────────────────────────────────────────────────────────┐
│ Home › Buildings › (building name) › Units › (unit code)             │
├────────────────────────────────────────────────────────────────────┤
│  [ Code* ] [ Floor ]                                                 │
│  [ Confined* ] [ Covered ] [ Uncovered ] [ Store ] [ Roof gardens ] │
│                                                                      │
│  ── CONTACTS ── (add / edit / remove; same as create) ──────────────│
│   Type │ Name │ Send email? │ ✎ 🗑                                   │
│                                                                      │
│  ── RECORD INFO (read-only) ──                                       │
│   Created at / by · Updated at / by                                  │
│                                                                      │
│                 [ Save ]   [ Back ]        [ 🗑 Delete ]             │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Fields

### 4.1 Editable fields (same as Create)

Identical to [Create Building Unit](./create-building-unit.md) — Code*, Floor, Confined space*, Covered terraces, Uncovered terraces, Store room, Roof gardens, and the **Contacts** sub-grid — **pre-filled** with the unit's current values and editable. Required rules and validation behave exactly as on create.

### What the Contacts sub-grid means on save

The contacts list is submitted as **the complete desired state**:

- a row the user **changed** is updated,
- a row the user **added** links that person to the unit,
- a row the user **removed** **unlinks** that person — because it is no longer in what was sent.

There is no separate delete step and no per-row confirmation, and nothing is persisted until
**Save**, so removing a row and then cancelling leaves the unit untouched.

Unlinking a person here does **not** delete the person: contacts are tenant-wide and are maintained
on the [contacts screens](../contact/contacts-list.md). A row always names an **existing** contact;
this screen never creates one.

### 4.2 Read-only audit (edit only)

| Field | Shown as | Notes |
|---|---|---|
| Created at | Date/time | When the unit was created. |
| Created by | Text (user) | Who created it. |
| Updated at | Date/time | When last changed. |
| Updated by | Text (user) | Who last changed it. |

---

## 5. Behaviour & interactions

- **Pre-fill:** on open, the form loads with the unit's current values, including its contacts.
- **Editable form & contacts:** all create-screen behaviours apply (numeric rules, contact add/edit/remove).
- **Delete:** available to non-`user` roles (mirrors the [Buildings](../building/edit-building.md) decision). Choosing Delete asks for confirmation before removing the unit; on confirm it deletes and returns to the Units list, on cancel nothing changes. It is placed apart from Save and styled destructively.
- **Save enablement:** same as create.

---

## 6. Validation & messages

- Editable-field and contact-row validation are identical to [Create Building Unit](./create-building-unit.md) §7.

---

## 7. States

- **Loading:** form shows a loading indicator until the unit's data (and contacts) arrive.
- **Loaded (edit):** fields and contacts pre-filled; audit block populated.
- **Submitting:** Save (or Delete) shows a busy/disabled state.
- **Confirming delete:** a confirmation prompt is shown before the unit is deleted.
- **Success:** confirmation message; for Save / Delete, returns to the Units list.
- **Validation error:** invalid fields/rows highlighted; focus moves to the first error; no save.
- **Save/delete failure (server/network):** error message; entered data preserved for retry.

---

## 8. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Save** | Form footer (primary) | Always | Validates and saves changes (including contacts); returns to the Units list. |
| **Back** | Form footer | Always | Returns to the Units list without saving. |
| **Delete** | Form footer (destructive) | Non-`user` roles | Deletes the unit after confirmation; returns to the Units list. Also available as a row action on the [Units list](./building-units-list.md). |

---

## 9. Out of scope

- Creating/managing the underlying **contact (person) records** — done on the contacts screens.
- Building-level concerns — see [Edit Building](../building/edit-building.md).

---

## 10. Open questions

- **Delete** — should it be blocked or warn more strongly when the unit has financial history (transactions/collections) rather than a plain confirmation?
- Should the **audit block** be collapsed by default behind an "Advanced/Record info" expander?
- Should changing a unit's **contacts** here be reflected immediately in the Units list Owner/Tenant columns on return (assume yes)?
