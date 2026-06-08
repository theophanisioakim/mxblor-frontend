"use client"

import {
  type AuthenticatedUserResponseDto,
  getAuthenticatedUser,
  getTwitchAuthenticationRedirectUrl,
  type LoginRequestDto,
  type LoginResponseDto,
  setOnUnauthorized,
  twitchLogin,
  useLogin,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import { myLocalStorage, StorageKeys } from "@workspace/storage"
import { AxiosError } from "axios"
import type { ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export interface AuthContextValue {
  user: AuthenticatedUserResponseDto | undefined
  isAuthenticated: boolean
  selectedSchema: string | null
  login: (
    data: LoginRequestDto
  ) => Promise<{ errorMessage: string; success: boolean }>
  /** Exchange a Twitch OAuth `code`/`state` (from the callback) for a session. */
  loginWithTwitch: (
    code: string,
    state: string
  ) => Promise<{ errorMessage: string; success: boolean }>
  /** Fetch the Twitch OAuth authorize URL to send the user to, or `null`. */
  getTwitchRedirectUrl: () => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const loginMutation = useLogin()
  const router = useRouter()

  const [user, setUser] = useState<AuthenticatedUserResponseDto>()
  const [jwtToken, setJwtToken] = useState<string | null>(() =>
    myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
  )
  const [selectedSchema, setSelectedSchema] = useState<string | null>(() =>
    myLocalStorage.getItem(StorageKeys.SELECTED_SCHEMA)
  )

  const clearAuthState = useCallback(() => {
    myLocalStorage.removeItem(StorageKeys.JWT_TOKEN)
    myLocalStorage.removeItem(StorageKeys.SELECTED_SCHEMA)
    setUser(undefined)
    setSelectedSchema(null)
  }, [])

  const onUnauthorized = useCallback((): void => {
    clearAuthState()
    setJwtToken(null)
    router.replace("/login")
  }, [clearAuthState, router])

  useEffect(() => {
    setOnUnauthorized(onUnauthorized)
    return () => {
      setOnUnauthorized(null)
    }
  }, [onUnauthorized])

  const syncSchemaSelection = useCallback((availableSchemas?: string[]) => {
    const firstSchema = availableSchemas?.[0]
    if (!firstSchema) {
      throw new Error("No available schemas found for the user")
    }

    const storedSchema = myLocalStorage.getItem(StorageKeys.SELECTED_SCHEMA)
    const schema =
      storedSchema && availableSchemas.includes(storedSchema)
        ? storedSchema
        : firstSchema

    myLocalStorage.setItem(StorageKeys.SELECTED_SCHEMA, schema)
    setSelectedSchema(schema)
  }, [])

  useEffect(() => {
    let active = true

    async function syncAuthenticatedUser() {
      if (!jwtToken) {
        clearAuthState()
        return
      }

      const previousTokenValue = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
      myLocalStorage.setItem(StorageKeys.JWT_TOKEN, jwtToken)

      const shouldFetchUser = previousTokenValue !== jwtToken || !user
      if (!shouldFetchUser) {
        return
      }

      try {
        const authenticatedUser = await getAuthenticatedUser()
        if (!active) {
          return
        }
        setUser(authenticatedUser)
        syncSchemaSelection(authenticatedUser.availableSchemas)
      } catch {
        if (!active) {
          return
        }
        setJwtToken(null)
        clearAuthState()
        router.replace("/login")
      }
    }

    void syncAuthenticatedUser()

    return () => {
      active = false
    }
  }, [jwtToken, user, router, clearAuthState, syncSchemaSelection])

  const applyLoginResponse = useCallback((response: LoginResponseDto) => {
    const schema = response.availableSchemas?.[0]
    if (!schema) {
      return {
        errorMessage: "No available schemas found for the user",
        success: false,
      }
    }

    const token = response.token
    if (!token) {
      return {
        errorMessage: "No token received from the server",
        success: false,
      }
    }

    myLocalStorage.setItem(StorageKeys.SELECTED_SCHEMA, schema)
    setSelectedSchema(schema)
    setJwtToken(token)

    return { success: true, errorMessage: "" }
  }, [])

  const login = useCallback(
    async (data: LoginRequestDto) => {
      try {
        const response = await loginMutation.mutateAsync({
          data: {
            username: data.username,
            password: data.password,
            rememberMe: data.rememberMe ?? true,
          },
        })

        return applyLoginResponse(response)
      } catch (error: unknown) {
        return {
          errorMessage: getLoginErrorMessage(error),
          success: false,
        }
      }
    },
    [loginMutation, applyLoginResponse]
  )

  const loginWithTwitch = useCallback(
    async (code: string, state: string) => {
      try {
        const response = await twitchLogin({ code, state })
        return applyLoginResponse(response)
      } catch (error: unknown) {
        return {
          errorMessage: getLoginErrorMessage(error),
          success: false,
        }
      }
    },
    [applyLoginResponse]
  )

  const getTwitchRedirectUrl = useCallback(async () => {
    const response = await getTwitchAuthenticationRedirectUrl()
    return response.redirectUrl ?? null
  }, [])

  const logout = useCallback(() => {
    setJwtToken(null)
    clearAuthState()
    router.replace("/login")
  }, [router, clearAuthState])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== undefined,
      selectedSchema,
      login,
      loginWithTwitch,
      getTwitchRedirectUrl,
      logout,
    }),
    [user, selectedSchema, login, loginWithTwitch, getTwitchRedirectUrl, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data
    if (isMessageError(responseData)) {
      return responseData.message
    }
    if (typeof responseData === "string") {
      return responseData
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred. Please try again."
}

function isMessageError(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  )
}
