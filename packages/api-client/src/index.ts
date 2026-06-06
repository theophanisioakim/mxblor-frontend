// Hand-written utilities
export {
  axiosInstance,
  customInstance,
  setOnOtpRequired,
  setOnUnauthorized,
} from "./axios-instance"
export type { BodyType, ErrorType } from "./axios-instance"
export {
  ApiQueryClientProvider,
  createQueryClient,
  queryClient,
  queryClientOptions,
} from "./query-client-provider"

// All generated hooks + schemas — auto-maintained by Orval
export * from "./generated"
