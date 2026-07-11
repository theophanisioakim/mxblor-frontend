// Hand-written utilities

export type { BodyType, ErrorType } from "./axios-instance"
export {
  axiosInstance,
  customInstance,
  setOnOtpRequired,
  setOnUnauthorized,
} from "./axios-instance"
// All generated hooks + schemas — auto-maintained by Orval
export * from "./generated"
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
