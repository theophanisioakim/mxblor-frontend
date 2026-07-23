# React Mono Core documentation

**Snapshot date:** 2026-07-23
**Applies to:** `react-mono-core`
**Status:** Current implementation

This directory is the documentation entry point for the cross-platform client. It describes the
implemented Next.js web app, Expo native app, shared screens, UI abstraction, API integration, and
client-visible behavior.

## Start here

| Audience | Document | Purpose |
| --- | --- | --- |
| Client and product owners | [Functional specification](client/functional-specification.md) | Scope, capabilities, roles, rules, limitations, and acceptance basis |
| Client and product owners | [User flows](client/user-flows.md) | Credential, Twitch, schema-selection, navigation, and administration flows |
| Client, design, and QA | [Screen catalog](client/screen-catalog.md) | Every implemented route and its behavior |
| Client, QA, and delivery | [Screen Design Document contracts](screens/README.md) | Field-, filter-, permission-, API-, state-, and background-process contract for every screen |
| Client and design | [Mockups](mockups/README.md) | Code-derived desktop and mobile wireframes |
| Developers and architects | [Architecture](technical/architecture.md) | Runtime structure, package boundaries, and data flow |
| Developers and security reviewers | [API and security](technical/api-and-security.md) | API generation, authentication, session storage, permissions, and failure handling |
| Developers and release owners | [Testing and release](technical/testing-and-release.md) | Validation commands and release-facing checks |
| QA and delivery | [Traceability matrix](traceability.md) | Features to flows, screens, APIs, and tests |
| Agents and contributors | [Documentation strategy](DOCUMENTATION_STRATEGY.md) | Required structure and update workflow |

## Document status terminology

- **Current implementation** means the behavior is supported by checked-in source.
- **Available but disabled** means UI exists but the backing capability is unavailable.
- **Showcase** means a demonstration route, not a client business workflow.
- **Concept mockup** means a code-derived wireframe; it is not evidence of a verified runtime
  render.

## Sources of truth

When documents and implementation disagree, verify and reconcile them in this order:

1. User-approved requirements and architecture decisions.
2. Executable tests.
3. Current non-generated source.
4. Checked-in `packages/api-client/openapi.json`.
5. Generated API client code.
6. This documentation.

The mismatch must be fixed in the same task. Do not silently preserve contradictory documentation.
