import type { ApiPermissionKey, CrudBasePath } from "@workspace/api-client"

/**
 * Central map of every API permission the screens gate their controls with.
 * Values are validated against the types generated from openapi.json
 * (`ApiPermissionKey` / `CrudBasePath`), so a backend route change surfaces
 * here as a type error instead of a silently dead gate. Screens must read
 * from this module — never inline permission strings (enforced by the
 * api-permission-gating audit test).
 */
export const crudPermissions = {
  integration: "/sbf-integration",
  role: "/sbf-role",
  schema: "/sbf-schema",
  timer: "/sbf-timer",
  user: "/sbf-user",
  userEmail: "/sbf-user-email",
  userPhone: "/sbf-user-phone",
} as const satisfies Record<string, CrudBasePath>

/**
 * Page-level view grants: the primary read route each admin page calls.
 * `PermissionGuard` denies the whole page (SSR included) without it.
 */
export const viewPermissions = {
  auditLog: "POST /sbf-audit/search",
  emailOutbox: "POST /sbf-email-outbox/search",
  integration: "POST /sbf-integration/search",
  integrationLog: "POST /sbf-log-integration/search",
  ipLog: "POST /sbf-log-ip/search",
  otp: "POST /sbf-otp/search",
  permission: "POST /sbf-permission/search",
  requestLog: "POST /sbf-log-request/search",
  requestLogDetail: "GET /sbf-log-request/{id}",
  role: "POST /sbf-role/search",
  schema: "POST /sbf-schema/search",
  schemaProperties: "POST /sbf-schema-properties/search",
  serverLog: "POST /sbf-log-server/search",
  smsOutbox: "POST /sbf-sms-outbox/search",
  systemProperties: "POST /sbf-system-properties/search",
  timer: "POST /sbf-timer/search",
  timerInfo: "POST /sbf-timer-info/search",
  user: "POST /sbf-user/search",
} as const satisfies Record<string, ApiPermissionKey>

/**
 * Form pages render under the create grant in create mode and the read-by-id
 * grant in edit mode.
 */
export const formPermissions = {
  integration: {
    create: "POST /sbf-integration",
    edit: "GET /sbf-integration/{id}",
  },
  role: { create: "POST /sbf-role", edit: "GET /sbf-role/{id}" },
  schema: { create: "POST /sbf-schema", edit: "GET /sbf-schema/{id}" },
  timer: { create: "POST /sbf-timer", edit: "GET /sbf-timer/{id}" },
  user: { create: "POST /sbf-user", edit: "GET /sbf-user/{id}" },
} as const satisfies Record<
  string,
  { create: ApiPermissionKey; edit: ApiPermissionKey }
>

/** Bulk desired-state saves used by the assignment tabs. */
export const bulkSavePermissions = {
  rolePermission: "POST /sbf-role-permission/bulk",
  userBlockPermission: "POST /sbf-user-block-permission/bulk",
  userRole: "POST /sbf-user-role/bulk",
  userSchema: "POST /sbf-user-schema/bulk",
} as const satisfies Record<string, ApiPermissionKey>

/**
 * Inline-edit grids save per-row (PUT) and save-all (bulk POST); both grants
 * are required for the grid to render editable.
 */
export const inlineEditPermissions = {
  permission: {
    update: "PUT /sbf-permission/{id}",
    bulk: "POST /sbf-permission/bulk",
  },
  schemaProperties: {
    update: "PUT /sbf-schema-properties/{id}",
    bulk: "POST /sbf-schema-properties/bulk",
  },
  systemProperties: {
    update: "PUT /sbf-system-properties/{id}",
    bulk: "POST /sbf-system-properties/bulk",
  },
  userConfiguration: {
    update: "PUT /sbf-user-configuration/{id}",
    bulk: "POST /sbf-user-configuration/bulk",
  },
} as const satisfies Record<
  string,
  { update: ApiPermissionKey; bulk: ApiPermissionKey }
>
