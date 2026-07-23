# SCR-005 — Not found

**Document ID:** RMC-SDD-SCR-005
**Contract version:** 1.0.0
**Route:** unmatched route (`not-found`/`+not-found`)
**Platforms:** Web and native
**Status:** Current implementation

The screen shall display code `404`, “Page Not Found,” explanatory copy, and a `Go Home` action to
`/`. It has no fields, filters, API calls, permissions, mutation, retry, or background process.
The screen is selected by the platform router when no route matches.

Acceptance: an unmatched path renders this screen and `Go Home` returns to SCR-001.
