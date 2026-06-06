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
export {
  ApiQueryClientProvider,
  createQueryClient,
  queryClient,
  queryClientOptions,
} from "./query-client-provider"
