# API, authentication, and client security

**Document ID:** RMC-TECH-SEC-001
**Snapshot date:** 2026-07-23
**Status:** Current implementation

## API contract

- Contract file: `packages/api-client/openapi.json`.
- Generated source: `packages/api-client/src/generated/`.
- Generator: Orval plus `scripts/generate-api-permissions.mjs`.
- Transport: Axios.
- Server-state cache: TanStack Query.
- Regeneration command: `pnpm generate`.

The client contract currently represents 210 API paths. The backend OpenAPI document is the
detailed operation/schema authority; client documentation describes how those operations are used
in screens.

## Authentication sequence

Credential login uses `POST /authentication/login`. Twitch uses a PKCE-backed redirect URL followed
by `POST /twitch/authentication/login`. Both can return either:

- a complete authenticated session; or
- a pending schema-selection challenge.

Schema selection uses `POST /authentication/select-schema`. An authenticated context change uses
`POST /authentication/switch-schema`.

## Session behavior

The client stores access/session metadata through `@workspace/storage`. The transport can refresh
through `POST /authentication/refresh`; terminal refresh failures clear local authentication.
Transient refresh failures may retain refresh metadata so a later API call can recover.

Session control operations are:

| Operation | Endpoint | Effect |
| --- | --- | --- |
| Logout current device | `POST /authentication/logout` | Revoke current device session and clear local state |
| Logout all current-user devices | `POST /authentication/logout-all` | Revoke all sessions for the current user |
| Logout all users | `POST /authentication/logout-all-users` | Administrative global invalidation |
| Switch schema | `POST /authentication/switch-schema` | Rotate the current session into another assigned schema |

## Authorization

The client receives grants from `GET /sbf-permission/my-permissions`. A grant is the pair:

```text
HTTP METHOD + endpoint template
```

Examples:

```text
POST /sbf-user/search
PUT /sbf-user/{id}
POST /sbf-role-permission/bulk
```

`screen-permissions.ts` centralizes page, CRUD, assignment, and inline-edit keys. Keys are typed from
the OpenAPI document, so a removed or renamed backend route causes a type error.

### Enforcement layers

1. **Page guard:** requires the primary read grant.
2. **Action gate:** enables create/update/delete/bulk controls only when granted.
3. **Backend enforcement:** remains authoritative; client controls are not a security boundary.

## Dynamic menus

`GET /sbf-menu/my-menus` returns top and side navigation trees. The query key includes
authentication and selected schema so the tree is replaced when the context changes. Anonymous
requests receive public menus.

## Twitch PKCE handling

- A client proof contains state and code verifier.
- Only the code challenge is sent while requesting a redirect URL.
- Web performs a full-page redirect; native uses an in-app auth session and deep link.
- The returned code/state is exchanged with the original verifier.
- Cancellation discards the client-held proof.

## Client-side storage considerations

- Never add secrets, backend signing keys, or privileged integration credentials to client code.
- Stored tokens must be treated as sensitive and cleared on terminal authentication failure.
- Browser cookie behavior and native secure storage have different threat models; platform adapters
  must preserve the shared session semantics.
- Changing auth storage keys or token fields requires migration/recovery documentation and tests.

## Error behavior

| Condition | Client behavior |
| --- | --- |
| 401/terminal refresh failure | Clear authentication and redirect to `/login` |
| Missing page grant | Access-denied screen |
| Missing action grant | Control disabled or absent |
| Permission fetch failure | Resolve to no grants and fail closed |
| Login rate limit | Display countdown from `Retry-After`; disable sign-in |
| SSR seed request failure | Render without seed and retry client-side |
| CRUD validation/API failure | Preserve screen context and show normalized error |

## Security-sensitive review checklist

- Generated permission key still matches backend path and method.
- Page guard covers every new admin screen.
- Every API-triggering control is independently gated.
- No inline permission string bypasses the central map.
- Schema changes invalidate/refetch query state that is context-specific.
- SSR output does not leak one user’s cached permissions or menu data to another.
- Twitch verifier/state cannot be reused after completion or cancellation.
- No production credentials or tokens are documented or committed.

