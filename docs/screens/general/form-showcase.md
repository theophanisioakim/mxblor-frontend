# SCR-003 — Form showcase

**Document ID:** RMC-SDD-SCR-003
**Contract version:** 1.0.0
**Route:** `/forms`
**Platforms:** Web and native
**Status:** Current implementation

## Field contract

| Field | Control | Required/default | Validation and choices |
| --- | --- | --- | --- |
| `name` | text | required | minimum 2 characters |
| `age` | number | optional | integer only; 0–120 inclusive |
| `password` | password | required | minimum 8 characters; masked |
| `country` | single select | optional | Greece (`gr`), United States (`us`), Germany (`de`), Japan (`jp`) |
| `interests` | searchable multi-select | optional | Coding, Music, Sports, Travel, Food |
| `birthday` | date | optional | future dates disabled |
| `notifications` | switch | optional | boolean |
| `terms` | checkbox | required | must be accepted |

## Submission, restrictions, and states

Submit runs client-side validation. On success, the screen shall render the submitted values as
formatted JSON below the form. It sends no API request, creates no account, stores no value across
reloads, and performs no background work. Invalid fields remain in the form with component
validation feedback.

## Acceptance criteria

1. Submission is blocked until all required and range/length rules pass.
2. The birthday picker prevents future dates.
3. Interests supports multiple selected values and option search.
4. Successful submission displays exactly the current form payload locally.
