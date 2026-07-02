# Screen SDD — Create Revenue

> Screen design document — behaviour only, no implementation/API/data detail.
> Scoped to a parent building. Shares its form with [Edit Revenue](./edit-revenue.md);
> reached from the [Revenues list](./revenues-list.md).

---

## 1. Screen

- **Name:** Create Revenue
- **Location:** Buildings → *(a building)* → Revenues → New
- **Purpose:** Record income for the building — its category, collection type, amount, period, and a description.
- **Scope:** One revenue. Always created under the current building.

---

## 2. Entry points & navigation

- **Reached from:** the **Add** action on the [Revenues list](./revenues-list.md).
- **Breadcrumb:** Home › Buildings › *(building name)* › Revenues › New.
- **On Save:** returns to the Revenues list with a confirmation.
- **On Cancel:** returns to the list; nothing saved.

---

## 3. Fields

| Field | Control | Required | Notes |
|---|---|---|---|
| **Revenue** | Dropdown | Yes | The revenue category. |
| **Collection type** | Dropdown | Yes | Monthly, Capital (etc.) — drives the month range below. |
| Reference date | Date | Yes | Defaults to today. |
| **Amount** | Number | Yes | Not negative, 2 decimals, thousands separator. |
| Start (month) | Month picker | Conditional | Shown/required for **Monthly / Capital** — first month covered. |
| End (month) | Month picker | Conditional | Shown/required for **Monthly / Capital** (create only) — last month covered; spread across Start→End. |
| Description | Text (multi-line) | No | Free description (editable). |

**Parent building** is set from context.

---

## 4. Behaviour & interactions

- **Collection type drives the form:** Monthly/Capital reveal the Start/End month range.
- **Spreading:** for range types, the amount is applied across the Start→End months.
- Description is free-text (unlike expenses, where it is auto-generated).

---

## 5. Validation & messages

| Field | Rule | Message |
|---|---|---|
| Revenue | Required | "Revenue is required." |
| Collection type | Required | "Collection type is required." |
| Reference date | Required | "Reference date is required." |
| Amount | Required, ≥ 0 | "Amount is required." |
| Start / End | Required for Monthly/Capital; End ≥ Start | "Select the period covered." |

> Wording indicative; finalised against translations (EN/EL).

---

## 6. States

Initial / Submitting / Success / Validation error / Save failure — as standard.

---

## 7. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save** | Footer (primary) | Creates the revenue (spread across the period if applicable), returns to the list. |
| **Cancel** | Footer (secondary) | Discards, returns to the list. |

---

## 8. Out of scope

- **Payments/receipts** against this revenue — see the Payments screens.
- **Audit fields** — shown on [Edit Revenue](./edit-revenue.md) only.

---

## 9. Open questions

- Confirm the full list of **revenue collection types** and which show the month range.
- Can the covered **period cross year boundaries**?
