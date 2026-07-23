# SCR-006-E — Error boundary

**Document ID:** RMC-SDD-SCR-006-E
**Contract version:** 1.0.0
**Parent screen ID:** SCR-006
**Trigger:** framework error boundary
**Platforms:** Shared component; currently wired by web framework boundaries
**Status:** Current implementation

The screen shall show “Something Went Wrong,” the supplied error message or “An unexpected error
occurred,” an optional `Try Again` action when a reset callback exists, and `Go Home` to `/`.
`Try Again` invokes the framework reset callback; it does not guarantee that a mutation is replayed.
The screen has no fields, filters, direct API contract, permission gate, or independent background
process.

Acceptance: error text has a safe fallback, retry is hidden without a reset callback, and Home is
always available.
