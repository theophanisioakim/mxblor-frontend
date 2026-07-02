# Screen SDD — Payments List (by year)

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a single building; reached from the **Payments** tile on the
> [Edit Building](../building/edit-building.md) hub. Related to
> [Create Payment](./create-payment.md) and [Edit Payment](./edit-payment.md).

---

## 1. Screen

- **Name:** Payments
- **Location:** Buildings → *(a building)* → Payments
- **Purpose:** Show the building's payments (money paid out against expenses / received against revenues) **summarised per year**, and drill into a year's detail.
- **Scope:** Year-summary grid. Payments are **not created from this list** (see §5). Per-month / by-expense / by-revenue detail views are related screens (out of scope — §7).

---

## 2. Entry points & navigation

- **Reached from:** the **Payments** tile on the [Edit Building](../building/edit-building.md) hub.
- **Breadcrumb:** Home › Buildings › *(building name)* › Payments.
- **Back:** returns to the parent building.
- **Open a row (year):** drills into that year's detail, from where an individual payment can be opened and edited.

---

## 3. Grid columns

Rows are **years**. Default sort: most recent first.

| Column | Content |
|---|---|
| Year | Reference year. |
| Total debit | Total paid out that year. |
| Total credit | Total received that year. |

Paging 10 / 25 / 50 per page.

---

## 4. Filters

| Filter | Control |
|---|---|
| Year | Year picker |

---

## 5. Actions

| Action | Placement | Availability | Outcome |
|---|---|---|---|
| **Open year** | Row action | All roles | Drills into the year's detail. |
| **Back** | Above grid | All roles | Returns to the parent building. |

> **Add is disabled here.** A payment is created **in the context of a specific expense or revenue** (from that item's view), not from this summary — see [Create Payment](./create-payment.md). Year-summary rows are not directly editable/deletable.

---

## 6. States

Loading / Loaded / Empty / failure — as standard.

---

## 7. Related screens (out of scope for now)

- **Payments by month / by year** drill-down views.
- **Payments by expense** and **by revenue** views (where payments are actually initiated).

---

## 8. Open questions

- Confirm debit/credit column meaning (from v2: total_debit / total_credit).
- Should this list expose a **filter by expense/revenue** as well as year?
