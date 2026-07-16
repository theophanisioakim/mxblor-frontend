import type {
  OtpRequiredException,
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
import { decodeBinaryResponseData } from "./binary-response"
import { getChannelId } from "./channel"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.68.68:21003"

export const axiosInstance = Axios.create({
  baseURL: BASE_URL,
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
    if (error.response?.status === 401) {
      const errorData = error.response?.data as UnauthorizedException
      if (errorData.errorCode === "UNAUTHORIZED") {
        onUnauthorized?.()
        throw error
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
    ) => Promise<{ error: AxiosError | null; response: AxiosResponse | null }>)
  | null = null
export const setOnOtpRequired = (
  callback:
    | ((
        axiosInstance: AxiosInstance,
        otpRequiredException: OtpRequiredException,
        originalConfig: InternalAxiosRequestConfig | undefined
      ) => Promise<{
        error: AxiosError | null
        response: AxiosResponse | null
      }>)
    | null
): void => {
  onOtpRequired = callback
}

export const prepareRequestConfig = (
  config: AxiosRequestConfig
): AxiosRequestConfig => {
  const requestConfig: AxiosRequestConfig = {
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
  const schema = myLocalStorage.getItem(StorageKeys.SELECTED_SCHEMA)
  if (token) {
    requestConfig.headers = {
      ...requestConfig.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  if (schema) {
    requestConfig.headers = {
      ...requestConfig.headers,
      "x-schema-id": schema,
    }
  }
  requestConfig.headers = {
    ...requestConfig.headers,
    "x-channel-id": getChannelId(),
  }

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
