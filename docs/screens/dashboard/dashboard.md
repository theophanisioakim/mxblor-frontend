# Dashboard

## Purpose

Give an authenticated user a current, high-level view of the selected building-management portfolio and a direct route into its core records.

## Layout and actions

- The page title and description identify the currently selected portfolio context.
- Four responsive metric cards show totals for buildings, building units, contacts, and expense types.
- Selecting Buildings or Building units opens the buildings list.
- Selecting Contacts opens the contacts list.
- Selecting Expense types opens the expenses list.

## States and behavior

- A loading state remains visible while a stored session is restored and while current totals are requested.
- Anonymous visitors are redirected to sign-in only after session restoration completes.
- Metrics are requested fresh whenever the screen mounts, the selected tenant schema changes, or the user explicitly retries. They are not retained after the screen unmounts.
- Missing totals display as zero.
- A forbidden state explains that the user lacks permission and links back to the landing page.
- A transient failure state explains that current totals could not be loaded and offers a retry action.
- Content follows the active English or Greek application language and remains full-width on large displays.
