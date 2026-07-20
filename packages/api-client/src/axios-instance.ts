import type {
  LoginResponseDto,
  OtpRequiredException,
  RefreshRequestDto,
  UnauthorizedException,
} from "@workspace/api-client/generated"
import { myLocalStorage, StorageKeys } from "@workspace/storage"
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import Axios from "axios"
import { BASE_URL } from "./base-url"
import { decodeBinaryResponseData } from "./binary-response"
import { coordinateRefresh } from "./refresh-coordinator"
import { applySessionResponse, clearStoredSession } from "./session-state"

const NO_REFRESH_PATHS = new Set([
  "/authentication/login",
  "/authentication/refresh",
  "/authentication/select-schema",
  "/twitch/authentication/login",
])

type AuthRequestMetadata = {
  _accessToken?: string | null
  _authRetry?: boolean
}

type AuthAxiosRequestConfig = AxiosRequestConfig & AuthRequestMetadata
type AuthInternalRequestConfig = InternalAxiosRequestConfig &
  AuthRequestMetadata

type OtpResolution =
  | { error: AxiosError; response: null }
  | { error: null; response: AxiosResponse }

export const axiosInstance = Axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
})

const sessionAxiosInstance = Axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    if (error.response) {
      error.response.data = decodeBinaryResponseData(
        error.response.data,
        error.response.headers["content-type"]
      )
    }
    if (
      (error.response?.data as OtpRequiredException)?.errorCode ===
      "OTP_REQUIRED"
    ) {
      if (!onOtpRequired) {
        throw error
      }
      const otpData = error.response?.data as OtpRequiredException
      const res = await onOtpRequired(axiosInstance, otpData, error.config)
      if (res.error) {
        throw res.error
      }
      return res.response
    }
    if (error.response?.status === 401 && shouldRefresh(error.config)) {
      const originalConfig = error.config as AuthInternalRequestConfig
      const previousAccessToken =
        originalConfig._accessToken ??
        myLocalStorage.getItem(StorageKeys.JWT_TOKEN)

      try {
        const currentAccessToken = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
        const nextAccessToken =
          currentAccessToken && currentAccessToken !== previousAccessToken
            ? currentAccessToken
            : await refreshStoredSession(previousAccessToken)
        return retryWithAccessToken(originalConfig, nextAccessToken)
      } catch (refreshError: unknown) {
        if (isTerminalRefreshError(refreshError)) {
          clearStoredSession()
          onUnauthorized?.()
        }
        throw refreshError
      }
    }
    if (
      error.response?.status === 401 &&
      (error.config as AuthRequestMetadata | undefined)?._authRetry
    ) {
      const errorData = error.response?.data as UnauthorizedException
      if (errorData.errorCode === "UNAUTHORIZED") {
        clearStoredSession()
        onUnauthorized?.()
      }
    }
    throw error
  }
)

let onUnauthorized: (() => void) | null = null
export const setOnUnauthorized = (callback: (() => void) | null): void => {
  onUnauthorized = callback
}

let onOtpRequired:
  | ((
      axiosInstance: AxiosInstance,
      otpRequiredException: OtpRequiredException,
      originalConfig: InternalAxiosRequestConfig | undefined
    ) => Promise<OtpResolution>)
  | null = null
export const setOnOtpRequired = (
  callback:
    | ((
        axiosInstance: AxiosInstance,
        otpRequiredException: OtpRequiredException,
        originalConfig: InternalAxiosRequestConfig | undefined
      ) => Promise<OtpResolution>)
    | null
): void => {
  onOtpRequired = callback
}

export const prepareRequestConfig = (
  config: AxiosRequestConfig
): AuthAxiosRequestConfig => {
  const requestConfig: AuthAxiosRequestConfig = {
    ...config,
    headers: { ...config.headers },
  }

  if (requestConfig.responseType === "blob") {
    requestConfig.responseType = "arraybuffer"
  }

  return requestConfig
}

// Custom instance function (Orval mutator)
// Every generated hook calls this instead of raw axios
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const requestConfig = prepareRequestConfig(config)
  const token = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
  if (token) {
    requestConfig.headers = {
      ...requestConfig.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  requestConfig._accessToken = token

  const source = Axios.CancelToken.source()

  const promise = axiosInstance({
    ...requestConfig,
    cancelToken: source.token,
  }).then((response: AxiosResponse<T>) => response.data)

  // @ts-expect-error -- attach cancel for React Query
  promise.cancel = () => {
    source.cancel("Query was cancelled")
  }

  return promise
}

// Types required by Orval generated code
export type ErrorType<Error> = AxiosError<Error>
export type BodyType<Body> = Body

export async function refreshStoredSession(
  previousAccessToken = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
): Promise<string> {
  await coordinateRefresh({
    previousAccessToken,
    readAccessToken: () => myLocalStorage.getItem(StorageKeys.JWT_TOKEN),
    refresh: async () => {
      const refreshToken = myLocalStorage.getItem(StorageKeys.REFRESH_TOKEN)
      const body: RefreshRequestDto = refreshToken ? { refreshToken } : {}
      const response = await sessionAxiosInstance.post<LoginResponseDto>(
        "/authentication/refresh",
        body
      )
      applySessionResponse(response.data)
    },
  })

  const accessToken = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
  if (!accessToken) {
    throw new Error("Session refresh did not return an access token")
  }
  return accessToken
}

function shouldRefresh(
  config: InternalAxiosRequestConfig | undefined
): config is AuthInternalRequestConfig {
  if (!config) return false
  const authConfig = config as AuthInternalRequestConfig
  if (authConfig._authRetry) return false
  return !NO_REFRESH_PATHS.has(getPathname(config.url))
}

function getPathname(url: string | undefined): string {
  if (!url) return ""
  try {
    return new URL(url, BASE_URL).pathname
  } catch {
    return url
  }
}

function retryWithAccessToken(
  config: AuthInternalRequestConfig,
  accessToken: string
): Promise<AxiosResponse> {
  return axiosInstance({
    ...config,
    _accessToken: accessToken,
    _authRetry: true,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  } as AuthAxiosRequestConfig)
}

function isTerminalRefreshError(error: unknown): boolean {
  return (
    Axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  )
}
