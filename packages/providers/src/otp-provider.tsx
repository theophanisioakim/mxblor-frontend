"use client"

import {
  type OtpRequiredException,
  setOnOtpRequired,
} from "@workspace/api-client"
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import type { ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

interface OtpState {
  otpException: OtpRequiredException
  axiosInstance: AxiosInstance
  originalConfig: InternalAxiosRequestConfig | undefined
  remainingSeconds: number
  errorMessage: string | null
  expired: boolean
  submitting: boolean
}

export interface OtpContextValue {
  isOtpDialogVisible: boolean
  otpValue: string
  onOtpValueChange: (value: string) => void
  onSubmit: () => Promise<void>
  onCancel: () => void
  remainingSeconds: number
  errorMessage: string | null
  expired: boolean
  submitting: boolean
}

type OtpResolution = {
  error: AxiosError | null
  response: AxiosResponse | null
}

export const OtpContext = createContext<OtpContextValue | null>(null)

export interface OtpProviderProps {
  children: ReactNode
}

export function OtpProvider({ children }: Readonly<OtpProviderProps>) {
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [otpValue, setOtpValue] = useState("")
  const resolveRef = useRef<((value: OtpResolution) => void) | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const dismiss = useCallback(
    (result: OtpResolution) => {
      clearTimer()
      resolveRef.current?.(result)
      resolveRef.current = null
      setOtpState(null)
      setOtpValue("")
    },
    [clearTimer]
  )

  const startTimer = useCallback(
    (_expirySeconds: number) => {
      clearTimer()
      timerRef.current = setInterval(() => {
        setOtpState((current) => {
          if (!current) {
            return null
          }

          const next = current.remainingSeconds - 1
          if (next <= 0) {
            clearTimer()
            return {
              ...current,
              remainingSeconds: 0,
              errorMessage: "OTP has expired.",
              expired: true,
            }
          }

          return { ...current, remainingSeconds: next }
        })
      }, 1000)
    },
    [clearTimer]
  )

  const handleOtpRequired = useCallback(
    (
      instance: AxiosInstance,
      otpException: OtpRequiredException,
      originalConfig: InternalAxiosRequestConfig | undefined
    ): Promise<OtpResolution> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve
        const expirySeconds = otpException.expiryTimeInSeconds ?? 60

        setOtpState({
          otpException,
          axiosInstance: instance,
          originalConfig,
          remainingSeconds: expirySeconds,
          errorMessage: null,
          expired: false,
          submitting: false,
        })
        setOtpValue("")
        startTimer(expirySeconds)
      })
    },
    [startTimer]
  )

  useEffect(() => {
    setOnOtpRequired(handleOtpRequired)
    return () => {
      setOnOtpRequired(null)
      clearTimer()
    }
  }, [handleOtpRequired, clearTimer])

  const handleSubmit = useCallback(async () => {
    if (
      !otpValue.trim() ||
      !otpState ||
      otpState.expired ||
      otpState.submitting
    ) {
      return
    }

    setOtpState((current) =>
      current ? { ...current, submitting: true, errorMessage: null } : null
    )

    try {
      const response = await otpState.axiosInstance({
        ...otpState.originalConfig,
        headers: {
          ...otpState.originalConfig?.headers,
          "x-otp-value": otpValue.trim(),
          "x-otp-id": otpState.otpException.otpId,
        },
      })
      dismiss({ error: null, response })
    } catch (error) {
      const axiosError = error as AxiosError
      if (isOtpRequired(axiosError.response?.data)) {
        const nextOtpData = axiosError.response.data
        const expirySeconds = nextOtpData.expiryTimeInSeconds ?? 60

        setOtpState((current) =>
          current
            ? {
                ...current,
                otpException: nextOtpData,
                remainingSeconds: expirySeconds,
                errorMessage: "Invalid OTP code. Please try again.",
                expired: false,
                submitting: false,
              }
            : null
        )
        setOtpValue("")
        startTimer(expirySeconds)
        return
      }

      dismiss({ error: axiosError, response: null })
    }
  }, [otpValue, otpState, dismiss, startTimer])

  const handleCancel = useCallback(() => {
    dismiss({ error: null, response: null })
  }, [dismiss])

  const value = useMemo<OtpContextValue>(
    () => ({
      isOtpDialogVisible: otpState !== null,
      otpValue,
      onOtpValueChange: setOtpValue,
      onSubmit: handleSubmit,
      onCancel: handleCancel,
      remainingSeconds: otpState?.remainingSeconds ?? 0,
      errorMessage: otpState?.errorMessage ?? null,
      expired: otpState?.expired ?? false,
      submitting: otpState?.submitting ?? false,
    }),
    [otpState, otpValue, handleSubmit, handleCancel]
  )

  return <OtpContext.Provider value={value}>{children}</OtpContext.Provider>
}

export function useOtp() {
  const context = useContext(OtpContext)
  if (!context) {
    throw new Error("useOtp must be used within OtpProvider")
  }
  return context
}

function isOtpRequired(value: unknown): value is OtpRequiredException {
  return (
    typeof value === "object" &&
    value !== null &&
    "errorCode" in value &&
    value.errorCode === "OTP_REQUIRED"
  )
}
