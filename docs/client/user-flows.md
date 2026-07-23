# Client user flows

**Document ID:** RMC-FLOW-001
**Snapshot date:** 2026-07-23
**Status:** Current implementation

## FLOW-001 — Credential sign-in

```mermaid
flowchart TD
    A["Open /login"] --> B["Enter username or email and password"]
    B --> C["POST /authentication/login"]
    C -->|Authenticated in one schema| D["Store session and open /dashboard"]
    C -->|Multiple schemas| E["Show schema selector"]
    E --> F["POST /authentication/select-schema"]
    F -->|Success| D
    F -->|Failure| G["Keep selector and show error"]
    C -->|Rate limited| H["Show Retry-After countdown and disable sign-in"]
    C -->|Other failure| I["Keep form and show error"]
```

The form does not clear entered values after an authentication error. A server-provided retry
window disables both credential and external-provider actions until the countdown ends.

## FLOW-002 — Twitch sign-in

```mermaid
flowchart TD
    A["Create PKCE proof"] --> B["GET /twitch/authentication/redirect-url"]
    B --> C{"Platform"}
    C -->|Web| D["Full-page redirect to Twitch"]
    D --> E["Web callback receives code and state"]
    C -->|Native| F["Open in-app auth session"]
    F --> G["HTTPS native callback redirects to app deep link"]
    E --> H["POST /twitch/authentication/login"]
    G --> H
    H -->|One schema| I["Store session and open /dashboard"]
    H -->|Multiple schemas| J["Show schema selector"]
    H -->|Failure| K["Show error or retry countdown"]
```

The PKCE verifier remains client-held and is paired with the state returned by the backend.
Cancelling the native flow discards the pending proof.

## FLOW-003 — Startup session restoration

```mermaid
flowchart TD
    A["Application starts"] --> B{"Stored session metadata?"}
    B -->|No| C["Resolve as signed out"]
    B -->|Yes| D{"Refresh session expired?"}
    D -->|Yes| E["Clear session and resolve as signed out"]
    D -->|No| F{"Access token valid beyond safety window?"}
    F -->|Yes| G["Restore authenticated user"]
    F -->|No| H["POST /authentication/refresh"]
    H -->|Success| G
    H -->|Terminal failure| E
    H -->|Transient failure| I["Retain refresh metadata for later recovery"]
```

## FLOW-004 — Permission-aware navigation

```mermaid
flowchart TD
    A["Session or schema context resolves"] --> B["Fetch my menus"]
    A --> C["Fetch my permissions"]
    B --> D["Render allowed navigation tree"]
    C --> E["Resolve exact METHOD + endpoint grants"]
    E --> F{"Page view grant present?"}
    F -->|No| G["Render access denied"]
    F -->|Yes| H["Render page"]
    H --> I["Enable only granted actions"]
```

Web attempts to seed menus and permissions during server rendering. Native performs the fetch after
startup. Both clients refetch when login, logout, or selected schema changes.

## FLOW-005 — Administration list to edit

```mermaid
flowchart TD
    A["Open authorized admin list"] --> B["Submit search/filter/sort/page request"]
    B --> C["Render grid results"]
    C --> D{"User action"}
    D -->|Add| E["Open /new form"]
    D -->|Edit| F["Open /{id} form"]
    D -->|Delete| G["Show confirmation"]
    G -->|Confirm| H["DELETE resource/{id}"]
    H --> I["Refresh list"]
    E --> J["POST resource"]
    F --> K["PUT resource/{id}"]
    J --> L["Navigate to saved entity"]
    K --> L
```

Add, edit, and delete controls are independently disabled when their endpoint grants are absent.

## FLOW-006 — Assignment tab save

Used for user roles, user schemas, blocked permissions, and role permissions.

1. Open an existing entity and select the assignment tab.
2. Load the complete assignable catalog with current selections.
3. Filter or change selections locally.
4. Select **Save** to submit the desired state through the resource bulk endpoint.
5. If the user changes tabs while dirty, require confirmation before discarding changes.

## FLOW-007 — Inline property editing

Used for permissions, schema properties, system properties, and user configuration.

1. Load rows through the search endpoint.
2. If both update and bulk grants exist, render editable cells.
3. Allow a per-row update or a save-all bulk request.
4. Keep audit columns read-only.
5. Refresh or reconcile the grid after a successful mutation.

## FLOW-008 — Request investigation

1. Search request logs using status, method, URL, authentication, and other grid filters.
2. Open a request row to view request, response, access, body/header, and audit metadata.
3. If an IP lookup is associated, open the **Log IP** tab.
4. Review location, provider, network classification, lookup date, and audit metadata.
