# Client functional specification

**Document ID:** RMC-FS-001
**Version:** 1.0
**Snapshot date:** 2026-07-23
**Status:** Current implementation
**Audience:** Client stakeholders, product owners, QA, delivery teams

## 1. Executive summary

React Mono Core is a shared application client that delivers the same screen implementation to:

- a browser application built with Next.js;
- a native application built with Expo and React Native.

The current product is an administration-focused framework client for the sibling SBF Core backend.
It includes multi-schema authentication, backend-controlled menus, endpoint-level permissions,
administration screens, operational logs, timers, integrations, localization, theming, responsive
data grids, and reusable form components.

## 2. Scope

### 2.1 Included

- Credential authentication using username or email and password.
- Twitch authentication on web and native.
- Selection of a schema when a user belongs to more than one active schema.
- Restoration and refresh of an existing session.
- Backend-controlled top, side, tab, and floating-action navigation.
- Endpoint-level page and action authorization.
- User, role, schema, integration, and timer administration.
- Operational views for permissions, properties, request logs, server logs, integration logs, IP
  enrichment, audit records, OTP records, email outbox, SMS outbox, and timer executions.
- Web server-side seeding of menus, permissions, and language configuration.
- Shared web/native screen implementations with responsive platform adapters.
- English and Greek localization infrastructure.
- Light, dark, and system theme support.
- Demonstration screens for the shared form and grid component libraries.

### 2.2 Available but not complete

- Google, Apple, and GitHub sign-in controls are displayed as “coming soon”; only Twitch is wired
  to the backend.
- “Forgot password” is presented on the login screen but the current screen does not implement a
  recovery workflow.
- `/forms` and `/grid` are component showcases, not production business features.
- Navigation contents depend on backend menu data; this repository intentionally does not define a
  fixed client menu.
- Email outbox is a read-only operational view. Resend delivery is synchronous in the backend;
  SMTP completion and scheduled retry processing are not implemented in the current core snapshot.
- SMS outbox is a read-only persistence view; the current core backend has no concrete SMS sender
  or scheduled retry worker.

### 2.3 Excluded

- Backend business processing and database behavior, documented in `springboot-core`.
- Production hosting topology and client-specific branding.
- Store distribution, signing, and publishing procedures for native apps.
- A finalized visual design system or client-approved high-fidelity design.

## 3. Actors and access

| Actor | Description | Access behavior |
| --- | --- | --- |
| Anonymous user | Has no active session | Receives public menus and public endpoint grants |
| Authenticated user | Has a valid session and selected schema | Receives grants and menus for the current user/schema/channel |
| Administrator | Authenticated user with administration endpoint grants | Can access and mutate only the resources allowed by returned grants |
| Operations viewer | Authenticated user with read grants | Can inspect logs, outboxes, audits, timers, and integrations without mutation rights |

Roles are not hardcoded in the client. The backend returns effective endpoint grants; the UI
enables pages and controls from those grants.

## 4. Functional capability catalog

### FTR-001 — Cross-platform application shell

The application wraps all routes in a shared shell containing responsive navigation, breadcrumbs,
user actions, theme and language controls, an optional floating action, and a mobile bottom bar.
Web and native render the same screen package while platform adapters handle routing, primitives,
storage, and safe-area behavior.

### FTR-002 — Authentication and session continuity

Users can sign in with credentials or Twitch. The client restores a stored session on startup,
refreshes an access token when appropriate, clears invalid terminal sessions, and redirects
unauthorized users to `/login`. Rate-limit responses disable sign-in actions for the server-defined
retry window.

### FTR-003 — Schema selection and switching

When authentication succeeds for a user assigned to multiple schemas, the login screen replaces
credential entry with a schema selector. Choosing a schema completes the session. An authenticated
schema switch rotates the current session context through the backend.

### FTR-004 — Dynamic navigation

The client fetches `GET /sbf-menu/my-menus`. Anonymous users receive public navigation;
authenticated users receive navigation for the active schema, roles, menu assignments, channel,
and user-level blocks. Login, logout, and schema changes cause navigation to be recalculated.

### FTR-005 — Permission-aware interface

The client fetches `GET /sbf-permission/my-permissions`. Page guards deny unresolved or missing
view grants, and mutation controls remain disabled unless their exact endpoint/method grant is
present. Client gating improves user experience; the backend remains the enforcement authority.

### FTR-006 — User administration

Administrators can search, add, inspect, update, and delete users subject to grants. An existing
user has tabs for:

- core details and password update;
- email addresses;
- phone numbers;
- role assignments;
- schema assignments;
- configuration values;
- explicitly blocked permissions.

Assignment tabs use desired-state bulk saves. Switching away from a dirty assignment tab requires
confirmation.

### FTR-007 — Role and permission administration

Administrators can manage roles and management levels. Existing roles expose a permission
assignment tab. The permission catalog itself supports search and authorized inline edits for
alias, description, and OTP requirements. Endpoint, method, and public availability are read-only
in the current screen.

### FTR-008 — Schema and property administration

Administrators can manage schema name, description, and active state. Schema-scoped properties and
system properties appear in inline-edit grids with key, type, value, description, and audit
metadata.

### FTR-009 — Integration administration

Administrators can configure integration base URL, endpoint, HTTP method, timeout, implementation
class/method, description, active state, and failure count. Existing integrations include a filtered
integration-log tab.

### FTR-010 — Timer administration

Administrators can search and edit timer definitions, including key, cron expression, description,
active state, last execution, and failure count. The timer key is immutable after creation. Timer
execution history can be viewed globally or from a timer’s detail tab. In edit mode, key, last
execution, and failure count are read-only; the list has no Run Now, Add, or Delete control.

### FTR-011 — Operational observability

Read-oriented grids expose:

- request logs, including request detail and associated IP enrichment;
- server logs;
- outbound integration logs;
- audit events;
- IP lookup results;
- timer executions;
- email and SMS outboxes;
- OTP attempts and expiry information.

### FTR-012 — Shared form and grid capabilities

The form showcase demonstrates text, numeric, password, select, multi-select, date, switch, and
checkbox fields with validation. The grid showcase demonstrates filtering, sorting, pagination,
selection, bulk actions, row actions, responsive column collapse, expandable rows, modal editing,
and inline editing.

## 5. Global behavior rules

| Rule ID | Rule |
| --- | --- |
| BR-UI-001 | Screens outside `packages/ui` consume UI components only through `@workspace/ui`. |
| BR-UI-002 | A business screen is implemented once in `@workspace/app` and routed by both apps where supported. |
| BR-UI-003 | Navigation items are returned by the backend and are not hardcoded in screens. |
| BR-UI-004 | Page and action access is based on exact backend endpoint/method grants. |
| BR-UI-005 | Missing or unresolved mutation grants fail closed; the related control remains disabled. |
| BR-UI-006 | A terminal authentication failure clears local session state and redirects to login. |
| BR-UI-007 | Unsaved assignment changes require confirmation before changing tabs. |
| BR-UI-008 | Native safe-area padding is applied once around the complete shell. |
| BR-UI-009 | Web may server-render initial menus, permissions, and language configuration; native fetches them client-side. |
| BR-UI-010 | Generated API client files are regenerated from the checked-in OpenAPI document, not edited manually. |

## 6. Common UI states

Every data-backed screen is expected to account for:

- loading;
- populated results;
- empty results;
- filter returning no matches;
- request or validation error;
- insufficient permission;
- stale or expired authentication;
- mutation in progress;
- destructive-action confirmation;
- success followed by refresh or navigation.

## 7. Non-functional requirements represented in the implementation

| Area | Current approach |
| --- | --- |
| Cross-platform | Shared React screens with build-time `.native` platform resolution |
| Responsiveness | Utility classes, responsive grid column priorities, desktop shell, mobile bottom navigation |
| Accessibility | Labeled form fields, keyboard-oriented web primitives, visible validation and error messaging |
| Security | Short-lived access session handling, refresh recovery, fail-closed UI grants, PKCE for Twitch |
| Localization | i18next with English/Greek locale resources and tenant language configuration |
| Maintainability | Monorepo package boundaries, generated API hooks, typed endpoint grants, centralized screen permissions |
| Testability | Unit audits, type checking, strict linting, production build, web and native E2E harnesses |

## 8. Client acceptance basis

Client acceptance should use the
[versioned Screen Design Document contracts](../screens/README.md), [screen catalog](screen-catalog.md),
[user flows](user-flows.md), [mockups](../mockups/README.md), and
[traceability matrix](../traceability.md). The SDD field/filter/permission/action/state/background
rules take precedence over illustrative mockup sample values. A capability is accepted when:

1. its normal flow succeeds for an authorized user;
2. its permission-denied state fails closed;
3. its validation and API error states preserve usable context;
4. web and native behavior are equivalent where both routes exist;
5. the corresponding automated checks pass;
6. any intentional differences or limitations are recorded.
