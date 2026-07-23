# Frontend documentation strategy

**Policy owner:** Repository maintainers
**Applies to:** Every task in `mxblor-frontend`
**Status:** Required

## Objective

Keep the repository’s client-facing behavior, technical implementation, mockups, and verification
references synchronized with the code. Documentation is part of the deliverable, not a later
cleanup task.

## Required agent workflow

For every task, whether or not the user explicitly mentions documentation:

1. Read `docs/README.md`, this strategy, and the documents related to the touched area.
2. Before editing, identify possible impact on screens, flows, API contracts, permissions,
   architecture, operations, tests, client scope, and mockups.
3. Make the implementation change.
4. Review the final diff and update every affected document in the same change set.
5. Validate relative links, stable IDs, Mermaid/SVG syntax, dates/status labels, and technical
   claims against current source.
6. In the final report, name the documentation updated. If none changed, state
   `Documentation impact: none` and give the reason.

Use the repository skill `.agents/skills/maintain-documentation/SKILL.md` to perform this workflow.

## Documentation map

| Location | Content | Audience |
| --- | --- | --- |
| `docs/client/functional-specification.md` | Scope, actors, features, rules, limitations, acceptance basis | Client/product/QA |
| `docs/client/user-flows.md` | End-to-end user-visible sequences | Client/product/QA |
| `docs/client/screen-catalog.md` | Route and screen inventory | Client/design/QA |
| `docs/screens/README.md` | Versioned SDD contract index for every implemented screen | Client/product/QA/delivery |
| `docs/screens/contract-conventions.md` | Normative shared grid, state, permission, version, and background-process rules | Client/engineering/QA |
| `docs/screens/` | Contract-grade behavior for individual screens or shared create/edit variants | Product/design/QA |
| `docs/mockups/` | Source-derived visual wireframes | Client/design/QA |
| `docs/technical/` | Architecture, API/security, testing/release | Engineering/security/operations |
| `docs/traceability.md` | Feature-to-flow-to-screen-to-API-to-test mapping | QA/delivery |
| `AGENTS.md` and nested `AGENTS.md` | Agent execution and package rules | Coding agents |

## Change impact rules

| Change | Required documentation review |
| --- | --- |
| Add/remove/rename a route | Screen catalog, relevant flow, traceability, mockups/navigation |
| Change fields, validation, actions, states, or layout | Screen detail, screen catalog, feature spec, mockup |
| Change authentication/session/schema behavior | Functional spec, auth flows, login spec, API/security, traceability |
| Change menus or permissions | Functional spec, permission flow, screen grant mapping, API/security, traceability |
| Change API path/method/DTO usage | API/security, affected screen/flow, traceability; regenerate client |
| Change package boundary/provider/runtime composition | Technical architecture and relevant agent guide |
| Change responsive/platform behavior | Screen spec, mockup, architecture, acceptance coverage |
| Change build/test/release commands | Testing/release, README, and agent guide |
| Fix internal logic with no observable/contract impact | Usually no docs edit; record why |

## Client-facing writing rules

- Describe behavior and outcomes before implementation.
- Distinguish **current implementation**, **available but disabled**, **showcase**, and **planned**.
- Never present a concept mockup as a verified screenshot.
- Do not expose secrets, tokens, internal credentials, private URLs, or exploitable security detail.
- Avoid code identifiers unless they help technical acceptance; put low-level detail in
  `docs/technical/`.
- State limitations plainly.

## Technical writing rules

- Link to generated/open specification sources instead of copying large volatile payload schemas.
- Document why a boundary or security behavior exists, not every line of code.
- Use exact route/method pairs for permission-sensitive behavior.
- Preserve platform distinctions: web SSR versus native client fetch, Next versus Expo routing,
  browser versus native storage.
- Do not document generated code as hand-maintained.
- Keep source paths accurate and use repository-relative paths inside documents.

## Stable identifiers

| Prefix | Meaning |
| --- | --- |
| `RMC-FS` | Functional specification document |
| `FTR-###` | Feature |
| `FLOW-###` | User flow |
| `SCR-###` | Screen |
| `BR-UI-###` | Frontend business/platform rule |
| `RMC-TECH` | Technical document |

Do not reuse an identifier for a different concept. When removing behavior, mark it removed in the
relevant change rather than silently reassigning its ID.

## Screen documentation minimum

A screen SDD is a client-reference contract, not a narrative summary. Every implemented route or
framework screen must have an indexed SDD. Create/edit variants may share one SDD only when they
share the same component, and aliases may share one SDD only when behavior is identical.

Each SDD must cover:

- stable screen/document ID, semantic contract version, snapshot/status, routes, platforms;
- purpose, actor, entry/exit navigation, and mode differences;
- page/view grant plus every action-specific grant;
- every visible field/column with type, required/default/read-only/editable state, choices, and
  exact client validation;
- every visible and persistent filter with request key, control type, matching operator, default,
  combination rule, and hidden scope;
- initial sort, page size/options, responsive collapse, selection persistence, and empty behavior;
- every action with confirmation, API method/path, success/navigation effect, and failure behavior;
- loading, empty, error, unauthorized, and success states;
- restrictions and explicit non-capabilities so fields do not imply unsupported processing;
- direct requests, data producers, scheduled consumers, retention jobs, global infrastructure,
  freshness/polling, and failure impact for that screen;
- related feature, flow, API, and mockup;
- testable acceptance criteria.

The shared rules in `docs/screens/contract-conventions.md` may remove repetition, but a screen SDD
must still enumerate its own fields, columns, filters, permissions, actions, initial ordering,
background relationships, and deviations.

## Mockup policy

- Store maintainable SVG wireframes in `docs/mockups/`.
- Map every SDD to a relevant mockup or explicitly state `Screen contract` when no dedicated
  wireframe exists.
- Update a mockup when the information architecture, major layout, navigation, form fields, or
  primary actions change.
- Include a date and label it as a concept/source-derived mockup.
- Use a runtime screenshot only when the app was already running with user authorization and the
  screenshot was actually verified.
- Keep themes and backend-driven navigation variability visible in annotations.

## Review and validation

Before completion:

- compare docs against the final code diff, not the original task description;
- search for old route, field, package, or API names;
- confirm every new relative Markdown link resolves;
- parse or visually inspect changed SVGs;
- run `git diff --check`;
- run the relevant repository tests from `AGENTS.md`;
- ensure the final report lists documentation impact.
