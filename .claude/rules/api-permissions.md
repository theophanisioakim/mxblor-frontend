---
paths:
  - "packages/app/src/screens/**"
  - "packages/providers/src/permission-provider.tsx"
---

# API permissions are backend-driven — gate every API-calling control

Permissions come from the backend, like the navigation menus: `GET
/sbf-permission/my-permissions` returns the current context's grant list
(public permissions plus the authenticated user's effective role grants after
user blocks and channel restrictions). `PermissionProvider`
(`@workspace/providers`) fetches it and exposes `usePermission()` /
`useCrudPermissions()`. **Never hardcode role or permission logic in the
frontend** — a grant is the `(endpoint, method)` route pair, matched against
the backend route template exactly as the generated client declares it.

## The rule

**Every UI control that triggers an API call must be disabled when the current
user lacks the permission for that call's `(endpoint, method)`.** This applies
to every screen and every API call in the system:

- **Every admin page screen wraps its content in `PermissionGuard`**
  (`packages/app/src/screens/permission-guard.tsx`) keyed on the page's
  primary read route (`viewPermissions` / `formPermissions`); without the
  grant the whole page renders access-denied — on SSR too.
- Grid row actions: `edit`/`delete` take `disabled: () => !can…`.
- Grid toolbar `add` and `bulkActions` take `disabled: !can…`.
- Form save buttons: `<RncSubmitButton disabled={!canSubmit} />` where
  `canSubmit` is `canCreate` or `canUpdate` per mode.
- Inline-edit grids: render read-only (`addEditMode="default"`, no
  `inlineEdit`) when the PUT + bulk POST grants are missing.

**Hydration safety:** while the SSR seed is active, `PermissionProvider` reads
the `initialPermissions` prop directly (not through React Query — the
server-side query client is a shared singleton with `gcTime: 0`, so cache
reads during SSR are not deterministic). Server render and client hydration
therefore evaluate the identical grant list; don't reroute the seed through
the query cache.

## How

Permission keys are **generated from `openapi.json`** into
`packages/api-client/src/generated/api-permissions.ts` (`ApiPermissionKey` =
`"<METHOD> <endpoint template>"`, `CrudBasePath`) by
`scripts/generate-api-permissions.mjs` (part of `pnpm generate`). Screens read
them from the **central config** `packages/app/src/screens/screen-permissions.ts`
(`crudPermissions` / `bulkSavePermissions` / `inlineEditPermissions`) — never
inline a permission string in a screen:

```tsx
import { useCrudPermissions, usePermission } from "@workspace/providers"
import { bulkSavePermissions, crudPermissions } from "../../screen-permissions"

// CRUD family of one resource: POST /x, PUT /x/{id}, DELETE /x/{id}
const { canCreate, canUpdate, canDelete } = useCrudPermissions(
  crudPermissions.user
)

// Any other route: a generated ApiPermissionKey from the central config
const { hasPermission } = usePermission()
const canSave = hasPermission(bulkSavePermissions.userRole)
```

Reference implementations: `user-list-screen.tsx` (grid actions + toolbar +
bulk), `user-form-screen.tsx` (form submit), `user-roles-tab.tsx` (bulk save),
`user-configuration-tab.tsx` (inline edit).

The audit test `apps/native/__tests__/api-permission-gating.test.ts` fails the
suite when a screen calls a mutation hook without the gates or inlines a
permission string instead of using the central config.

The check is UX only — the backend's `RouteAuthorizationManager` remains the
enforcement point. Do not skip the client gate because the server also checks,
and do not treat the client gate as security.
