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
  building: "/building",
  buildingDistribution: "/building-distribution",
  buildingNote: "/building-note",
  buildingRelatedPerson: "/building-related-person",
  buildingUnit: "/building-unit",
  buildingUnitComm: "/building-unit-comm",
  buildingYearlyBudget: "/building-yearly-budget",
  contact: "/contact",
  expense: "/expense",
  expenseCategory: "/expense-category",
  integration: "/sbf-integration",
  revenue: "/revenue",
  revenueCategory: "/revenue-category",
  role: "/sbf-role",
  schema: "/sbf-schema",
  tBankAccount: "/tbank-account",
  tCollection: "/tcollection",
  tExpense: "/texpense",
  tPayment: "/tpayment",
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
  building: "POST /building/search",
  buildingDistribution: "POST /building-distribution/search",
  buildingNote: "POST /building-note/search",
  buildingRelatedPerson: "POST /building-related-person/search",
  buildingUnit: "POST /building-unit/search",
  buildingUnitComm: "POST /building-unit-comm/search",
  buildingYearlyBudget: "POST /building-yearly-budget/search",
  contact: "POST /contact/search",
  emailOutbox: "POST /sbf-email-outbox/search",
  expense: "POST /expense/search",
  expenseCategory: "POST /expense-category/search",
  integration: "POST /sbf-integration/search",
  integrationLog: "POST /sbf-log-integration/search",
  ipLog: "POST /sbf-log-ip/search",
  otp: "POST /sbf-otp/search",
  permission: "POST /sbf-permission/search",
  requestLog: "POST /sbf-log-request/search",
  requestLogDetail: "GET /sbf-log-request/{id}",
  revenue: "POST /revenue/search",
  revenueCategory: "POST /revenue-category/search",
  role: "POST /sbf-role/search",
  schema: "POST /sbf-schema/search",
  schemaProperties: "POST /sbf-schema-properties/search",
  serverLog: "POST /sbf-log-server/search",
  smsOutbox: "POST /sbf-sms-outbox/search",
  systemProperties: "POST /sbf-system-properties/search",
  tBankAccount: "POST /tbank-account/search",
  tCollection: "POST /tcollection/search",
  tExpense: "POST /texpense/search",
  tPayment: "POST /tpayment/search",
  timer: "POST /sbf-timer/search",
  timerInfo: "POST /sbf-timer-info/search",
  user: "POST /sbf-user/search",
} as const satisfies Record<string, ApiPermissionKey>

/**
 * Form pages render under the create grant in create mode and the read-by-id
 * grant in edit mode.
 */
export const formPermissions = {
  building: { create: "POST /building", edit: "GET /building/{id}" },
  buildingDistribution: {
    create: "POST /building-distribution",
    edit: "GET /building-distribution/{id}",
  },
  buildingNote: {
    create: "POST /building-note",
    edit: "GET /building-note/{id}",
  },
  buildingRelatedPerson: {
    create: "POST /building-related-person",
    edit: "GET /building-related-person/{id}",
  },
  buildingUnit: {
    create: "POST /building-unit",
    edit: "GET /building-unit/{id}",
  },
  buildingUnitComm: {
    create: "POST /building-unit-comm",
    edit: "GET /building-unit-comm/{id}",
  },
  buildingYearlyBudget: {
    create: "POST /building-yearly-budget",
    edit: "GET /building-yearly-budget/{id}",
  },
  contact: { create: "POST /contact", edit: "GET /contact/{id}" },
  expense: { create: "POST /expense", edit: "GET /expense/{id}" },
  expenseCategory: {
    create: "POST /expense-category",
    edit: "GET /expense-category/{id}",
  },
  integration: {
    create: "POST /sbf-integration",
    edit: "GET /sbf-integration/{id}",
  },
  revenue: { create: "POST /revenue", edit: "GET /revenue/{id}" },
  revenueCategory: {
    create: "POST /revenue-category",
    edit: "GET /revenue-category/{id}",
  },
  role: { create: "POST /sbf-role", edit: "GET /sbf-role/{id}" },
  schema: { create: "POST /sbf-schema", edit: "GET /sbf-schema/{id}" },
  tBankAccount: {
    create: "POST /tbank-account",
    edit: "GET /tbank-account/{id}",
  },
  tCollection: {
    create: "POST /tcollection",
    edit: "GET /tcollection/{id}",
  },
  tExpense: { create: "POST /texpense/spread", edit: "GET /texpense/{id}" },
  tPayment: { create: "POST /tpayment", edit: "GET /tpayment/{id}" },
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
