# SCR-006-L — Loading boundary

**Document ID:** RMC-SDD-SCR-006-L
**Contract version:** 1.0.0
**Parent screen ID:** SCR-006
**Trigger:** framework loading boundary
**Platforms:** Shared component; currently wired by web framework boundaries
**Status:** Current implementation

The screen shall occupy the available content area and show a large centered spinner. It exposes no
text, progress percentage, cancel action, field, filter, API operation, or independent background
process. The pending route/provider operation owns completion and replacement of the boundary.

Acceptance: the boundary remains non-interactive and disappears when the owning operation resolves.
