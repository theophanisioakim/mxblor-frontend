# Frontend mockups

**Snapshot date:** 2026-07-23
**Type:** Low-fidelity, code-derived wireframes

These SVGs communicate current layout families and interaction regions. They were derived from
screen source and are suitable for requirements discussion and client review. They are not
pixel-verified screenshots and do not replace a runtime visual QA pass. Every screen is mapped to
one of these layout references, or to its field-level contract where no dedicated wireframe is
useful, in the [SDD index](../screens/README.md).

| Mockup | Covers |
| --- | --- |
| [Desktop login](login-desktop.svg) | Brand panel, credential form, providers, schema/error region |
| [Desktop admin list](admin-list-desktop.svg) | Shell, filters, toolbar, grid, pagination |
| [Desktop admin form](admin-form-desktop.svg) | Shell, details tab, assignment tabs, save/error region |
| [Mobile shell](mobile-shell.svg) | Compact top bar, responsive cards/grid, bottom navigation |

## Annotation convention

- Solid controls represent implemented interaction areas.
- Dashed areas represent content that changes by backend data or permission.
- Mutating actions remain subject to endpoint grants.
- The individual SDD controls exact fields, filters, validation, restrictions, states, and
  background processes; illustrative values or generic controls in a layout-family mockup do not
  add a capability.
- Actual colors, copy, spacing, and visible navigation depend on theme, translations, and backend
  menu data.
