# Screen SDD — Translation Label field (shared form field)

> Screen design document — behaviour only, no implementation/API/data detail.
> This is not a screen but a **reusable form field** used by any screen whose entity stores a
> *translation label* instead of raw text (e.g. an expense's name and description). It is
> documented here because it owns a modal with its own behaviour, states and validation.

---

## 1. What it is

- **Name:** Translation Label field
- **Purpose:** Let the user set a piece of text that exists **in every language the tenant
  supports**, and either **reuse** a text that already exists elsewhere or **add a new one**.
- **What the form holds:** the **label** the user chose — never the typed text itself. Two entities
  that point at the same label always show the same text and change together.
- **Where the labels come from:** every field is scoped to one **key namespace** (its "bucket" of
  labels, e.g. all expense names). The field only ever reads and writes labels of that bucket, so an
  expense name can never be offered as an expense description.

---

## 2. The closed field (trigger)

- Shows the current label's text; when the field is empty it shows its placeholder.
- Which text is shown is a per-field choice:
  - **Default language** — the text in the tenant's default language.
  - **Current language** — the text in the language the user is currently using, falling back to the
    default language when that language has no text yet.
  - **All languages** — every language's text at once (e.g. `en: Cleaner · el: Καθαρίστρια`).
- Tapping/clicking it opens the editor modal. A **disabled** or **read-only** field does not open.
- A required field is marked with `*` and shows the standard validation error when the form is
  submitted while it is empty.

---

## 3. The editor modal

### 3.1 Language inputs

- **One text input per language** the tenant supports.
- The **default language comes first** and is visibly marked as the default. The set of languages and
  which one is the default are tenant configuration — the field never assumes a fixed pair.

### 3.2 Mandatory languages

Only when the field is **required**:

| Mode | Which inputs are mandatory |
|---|---|
| **Default** (the usual case) | Only the default-language input. |
| **All** | Every configured language. |

- Mandatory inputs are marked with `*`, and **Save stays disabled** until they all have text.
- When the field is **not** required it can always be saved empty. **Saving with the default-language
  text empty clears the field** — it goes back to having no label.

### 3.3 Reusing an existing text (autocomplete)

- Typing in any language input searches the **labels of that field's bucket** for a matching text in
  any language, as the user types.
- Searching starts only once **at least 3 characters** have been typed. Below that the field shows
  no list and asks the server for nothing — one or two characters match nearly everything in a
  bucket, so the results would be noise.
- Typing is **debounced**, and a search that a later keystroke supersedes is dropped, so a burst of
  typing costs one request rather than one per character.
- Up to **8 matches** are offered. They appear in a list that **floats over** the neighbouring
  language inputs rather than pushing them down, so the form does not jump around while the user
  types. The list floats **above the dialog itself**, and on the last language it opens upward.
- The list shows about **4 matches at a time and scrolls within itself** for the rest, under a
  heading that stays pinned. **The dialog itself never scrolls** — the only scrolling is inside the
  list of matches.
- **Picking one fills every language input at once** with that label's texts, so the user
  immediately sees what they are about to reuse.
- The list closes when the input loses focus (moving to another language input opens that one's
  list instead), so it can never sit on top of a field the user is trying to reach.
- Only labels of the active bucket are ever offered.

### 3.4 The global-namespace toggle (optional per field)

- Fields that opt in show a toggle meaning **"use the global bucket instead of this field's own"** —
  for texts meant to be shared across different kinds of entity.
- The toggle decides which bucket is searched **and** which bucket the text is saved into. Flipping
  it re-runs the search against the other bucket; a label picked from the previous bucket is no
  longer treated as picked.
- Fields that do not opt in never show the toggle.

### 3.5 Saving

- The modal carries a quiet **disclaimer** telling the user that their edits are only written when
  they press Save — nothing they type is persisted as they go.
- **Picked an existing text and changed nothing** → the field simply points at that existing label.
  Nothing is written.
- **Anything else** (new text, or any edit to a picked one) → the text is submitted. If the
  default-language text already exists in the bucket, the existing label is reused (and its other
  languages are brought up to date); otherwise a new label is created. The field then points at the
  resulting label.
- While the save is in flight the modal shows a busy state and **cannot be dismissed**; the inputs
  and the toggle are locked.
- A failed save is **shown inside the modal** — the modal stays open with the user's text intact.

### 3.6 Cancel / dismiss

- **Cancel**, the close button, or dismissing the modal closes it and **leaves the field unchanged**.
- Dismissal is blocked while a save is in flight (see above).

---

## 4. States

| State | Behaviour |
|---|---|
| Empty | Trigger shows the placeholder. |
| Filled | Trigger shows the label's text per the field's display mode. |
| Searching | The suggestion list under the focused input shows a busy indicator. |
| No matches | The suggestion list says so; the user can just keep typing to create a new text. |
| Saving | Modal is busy, locked and non-dismissable. |
| Save failed | Error message inside the modal; nothing is changed. |
| Disabled / read-only | The modal cannot be opened. |

---

## 5. Screens using it

- [Create Expense](../expense/create-expense.md) — expense name and description.
- [Edit Expense](../expense/edit-expense.md) — same two fields.
