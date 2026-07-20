import { myLocalStorage, StorageKeys } from "@workspace/storage"
import type { AuthenticationOutcomeDto, LoginResponseDto } from "./generated"

export interface StoredSession {
  accessTokenExpiresAt: string
  availableSchemas: string[]
  channel?: string
  refreshTokenExpiresAt: string
  roleDescriptions: string[]
  schema: string
  username: string
}

export interface PendingSchemaSelection {
  availableSchemas: string[]
  channel?: string
  expiresAt: string
}

export type AppliedAuthenticationOutcome =
  | { status: "authenticated"; session: StoredSession }
  | {
      status: "schema-selection-required"
      challenge: PendingSchemaSelection
    }

let onSessionChanged: (() => void) | null = null

export function setOnSessionChanged(callback: (() => void) | null): void {
  onSessionChanged = callback
}

function notifySessionChanged(): void {
  onSessionChanged?.()
}

function requireText(value: string | undefined, field: string): string {
  const normalized = value?.trim()
  if (!normalized) {
    throw new Error(`Invalid authentication response: missing ${field}`)
  }
  return normalized
}

function requireFutureDate(value: string | undefined, field: string): string {
  const normalized = requireText(value, field)
  if (Number.isNaN(Date.parse(normalized))) {
    throw new Error(`Invalid authentication response: invalid ${field}`)
  }
  return normalized
}

function normalizeSchemas(schemas: string[] | undefined): string[] {
  const normalized = [
    ...new Set(schemas?.map((schema) => schema.trim()) ?? []),
  ].filter(Boolean)
  if (normalized.length === 0) {
    throw new Error("No available schemas found for the user")
  }
  return normalized
}

export function applySessionResponse(
  response: LoginResponseDto
): StoredSession {
  const accessToken = requireText(response.accessToken, "access token")
  const schema = requireText(response.schema, "selected schema")
  const availableSchemas = normalizeSchemas(response.availableSchemas)
  if (!availableSchemas.includes(schema)) {
    throw new Error("Invalid authentication response: schema is not assigned")
  }

  const session: StoredSession = {
    accessTokenExpiresAt: requireFutureDate(
      response.accessTokenExpiresAt,
      "access token expiry"
    ),
    availableSchemas,
    channel: response.channel?.trim() || undefined,
    refreshTokenExpiresAt: requireFutureDate(
      response.refreshTokenExpiresAt,
      "refresh token expiry"
    ),
    roleDescriptions: response.roleDescriptions ?? [],
    schema,
    username: requireText(response.username, "username"),
  }

  myLocalStorage.setItem(StorageKeys.JWT_TOKEN, accessToken)
  if (response.refreshToken) {
    myLocalStorage.setItem(StorageKeys.REFRESH_TOKEN, response.refreshToken)
  } else {
    myLocalStorage.removeItem(StorageKeys.REFRESH_TOKEN)
  }
  myLocalStorage.setItem(StorageKeys.SELECTED_SCHEMA, schema)
  myLocalStorage.setJSON(StorageKeys.USER, session)
  myLocalStorage.removeItem(StorageKeys.SCHEMA_SELECTION)
  myLocalStorage.removeItem(StorageKeys.SCHEMA_SELECTION_TOKEN)
  notifySessionChanged()
  return session
}

export function applyAuthenticationOutcome(
  outcome: AuthenticationOutcomeDto
): AppliedAuthenticationOutcome {
  if (outcome.status === "AUTHENTICATED" && outcome.session) {
    return {
      status: "authenticated",
      session: applySessionResponse(outcome.session),
    }
  }

  if (outcome.status !== "SCHEMA_SELECTION_REQUIRED") {
    throw new Error("Invalid authentication response")
  }

  const challenge: PendingSchemaSelection = {
    availableSchemas: normalizeSchemas(outcome.availableSchemas),
    channel: outcome.channel?.trim() || undefined,
    expiresAt: requireFutureDate(
      outcome.schemaSelectionExpiresAt,
      "schema selection expiry"
    ),
  }

  clearStoredSession(false)
  myLocalStorage.setJSON(StorageKeys.SCHEMA_SELECTION, challenge)
  if (outcome.schemaSelectionToken) {
    myLocalStorage.setItem(
      StorageKeys.SCHEMA_SELECTION_TOKEN,
      outcome.schemaSelectionToken
    )
  }
  notifySessionChanged()
  return { status: "schema-selection-required", challenge }
}

export function readStoredSession(): StoredSession | null {
  const value = myLocalStorage.getJSON<StoredSession>(StorageKeys.USER)
  if (
    !value?.username ||
    !value.schema ||
    !Array.isArray(value.availableSchemas) ||
    !value.availableSchemas.includes(value.schema) ||
    Number.isNaN(Date.parse(value.accessTokenExpiresAt)) ||
    Number.isNaN(Date.parse(value.refreshTokenExpiresAt))
  ) {
    return null
  }
  return value
}

export function readPendingSchemaSelection(): PendingSchemaSelection | null {
  const value = myLocalStorage.getJSON<PendingSchemaSelection>(
    StorageKeys.SCHEMA_SELECTION
  )
  if (!value) {
    return null
  }
  if (
    !Array.isArray(value.availableSchemas) ||
    value.availableSchemas.length === 0 ||
    Number.isNaN(Date.parse(value.expiresAt)) ||
    isExpired(value.expiresAt)
  ) {
    clearPendingSchemaSelection()
    return null
  }
  return value
}

export function clearPendingSchemaSelection(): void {
  myLocalStorage.removeItem(StorageKeys.SCHEMA_SELECTION)
  myLocalStorage.removeItem(StorageKeys.SCHEMA_SELECTION_TOKEN)
  notifySessionChanged()
}

export function clearStoredSession(notify = true): void {
  myLocalStorage.removeItem(StorageKeys.JWT_TOKEN)
  myLocalStorage.removeItem(StorageKeys.REFRESH_TOKEN)
  myLocalStorage.removeItem(StorageKeys.SCHEMA_SELECTION_TOKEN)
  myLocalStorage.removeItem(StorageKeys.SCHEMA_SELECTION)
  myLocalStorage.removeItem(StorageKeys.SELECTED_SCHEMA)
  myLocalStorage.removeItem(StorageKeys.USER)
  if (notify) {
    notifySessionChanged()
  }
}

export function isExpired(value: string, skewMilliseconds = 0): boolean {
  return Date.parse(value) <= Date.now() + skewMilliseconds
}
