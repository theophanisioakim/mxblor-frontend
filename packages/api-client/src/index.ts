// Hand-written utilities

export type { BodyType, ErrorType } from "./axios-instance"
export {
  axiosInstance,
  customInstance,
  refreshStoredSession,
  setOnOtpRequired,
  setOnUnauthorized,
} from "./axios-instance"
// All generated hooks + schemas — auto-maintained by Orval
export * from "./generated"
// Permission keys for every backend route — emitted from openapi.json by
// scripts/generate-api-permissions.mjs (runs with `pnpm generate`)
export * from "./generated/api-permissions"
export type {
  LanguageConfigContextValue,
  LanguageConfigProviderProps,
} from "./language-config-provider"
export {
  LanguageConfigProvider,
  useLanguageConfig,
} from "./language-config-provider"
export {
  ApiQueryClientProvider,
  createQueryClient,
  queryClient,
  queryClientOptions,
} from "./query-client-provider"
export type {
  AppliedAuthenticationOutcome,
  PendingSchemaSelection,
  StoredSession,
} from "./session-state"
export {
  applyAuthenticationOutcome,
  applySessionResponse,
  clearPendingSchemaSelection,
  clearStoredSession,
  isExpired,
  readPendingSchemaSelection,
  readStoredSession,
  setOnSessionChanged,
} from "./session-state"
