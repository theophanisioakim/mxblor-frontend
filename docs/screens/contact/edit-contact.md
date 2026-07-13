# Screen SDD — Edit Contact

> Screen design document — behaviour only, no implementation/API/data detail.
> Shares its form with [Create Contact](./create-contact.md); reached from the
> [Contacts list](./contacts-list.md).

---

## 1. Screen

- **Name:** Edit Contact
- **Location:** Contacts → *(a contact)*
- **Purpose:** Change a person's details and the ways to reach them.
- **Scope:** Everything on the create screen, pre-filled.

---

## 2. Entry points & navigation

- **Reached from:** the **Edit** row action on the [Contacts list](./contacts-list.md).
- **Breadcrumb:** Home › Contacts › *(contact name)*.
- **On Save:** returns to the Contacts list.
- **On Cancel:** returns to the list without saving.

---

## 3. Fields

Identical to [Create Contact](./create-contact.md) §3 — the name parts plus the three repeatable
sections — **pre-filled** with the contact's current rows.

---

## 4. Behaviour — what the lists mean on save

The three lists are submitted as **the complete desired state**, and the server reconciles them:

- A row the user **changed** is updated in place.
- A row the user **added** is inserted.
- A row the user **removed** is **deleted** — because it is no longer in what was sent.

So removing an email here removes it from the contact; there is no separate delete step and no
confirmation per row. Nothing is persisted until **Save**, so removing a row and then cancelling
leaves the contact untouched.

---

## 5. Actions

| Action | Placement | Outcome |
|---|---|---|
| **Save Changes** | Form footer (primary) | Validates and saves the contact and its rows; returns to the list. |
| **Cancel** | Form footer | Returns to the list; nothing is changed. |

**Delete** lives on the [Contacts list](./contacts-list.md) row action, not here — including the rule
that a contact still linked to a building unit cannot be deleted.

---

## 6. States

Loading / Loaded / Not found / Load failure / Saving / Save failure — as standard. A save rejected
for a stale version (someone else changed the contact meanwhile) surfaces the server's message with
the entered values preserved.
