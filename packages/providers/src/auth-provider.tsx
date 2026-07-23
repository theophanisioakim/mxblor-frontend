"use client"

import {
  type AuthenticationOutcomeDto,
  applyAuthenticationOutcome,
  applySessionResponse,
  clearPendingSchemaSelection,
  clearStoredSession,
  getTwitchAuthenticationRedirectUrl,
  isExpired,
  type LoginRequestDto,
  type PendingSchemaSelection,
  queryClient,
  readPendingSchemaSelection,
  readStoredSession,
  refreshStoredSession,
  login as requestLogin,
  logout as requestLogout,
  logoutAll as requestLogoutAll,
  logoutAllUsers as requestLogoutAllUsers,
  selectSchema as requestSelectSchema,
  switchSchema as requestSwitchSchema,
  type StoredSession,
  setOnSessionChanged,
  setOnUnauthorized,
  twitchLogin,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import {
  myLocalStorage,
  mySessionStorage,
  StorageKeys,
} from "@workspace/storage"
import { AxiosError } from "axios"
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
import { createTwitchOAuthProof } from "./twitch-oauth-proof"

const AUTH_ACTIONS = [
  "login",
  "refresh",
  "selectSchema",
  "switchSchema",
  "logout",
  "logoutAll",
  "logoutAllUsers",
] as const

export type AuthAction = (typeof AUTH_ACTIONS)[number]

export interface AuthActionStatus {
  errorMessage: string | null
  isLoading: boolean
}

export type AuthActionState = Record<AuthAction, AuthActionStatus>

export type AuthenticationResult =
  | { status: "authenticated" }
  | { status: "schema-selection-required" }
  | { status: "error"; errorMessage: string; retryAfterSeconds?: number }

export type SessionControlResult =
  | { success: true }
  | { success: false; errorMessage: string }

export interface AuthContextValue {
  user: StoredSession | undefined
  isAuthenticated: boolean
  /** True once any stored session has either been restored or rejected. */
  isAuthReady: boolean
  selectedSchema: string | null
  pendingSchemaSelection: PendingSchemaSelection | null
  actionState: AuthActionState
  login: (data: LoginRequestDto) => Promise<AuthenticationResult>
  /** Exchange a Twitch OAuth `code`/`state` (from the callback) for a session. */
  loginWithTwitch: (
    code: string,
    state: string
  ) => Promise<AuthenticationResult>
  /** Fetch or register the Twitch OAuth authorize URL to send the user to. */
  getTwitchRedirectUrl: (
    initialFlow?: TwitchOAuthRedirectFlow
  ) => Promise<string | null>
  /** Discard the client-held proof for an abandoned Twitch OAuth flow. */
  cancelTwitchLogin: () => void
  selectSchema: (schema: string) => Promise<AuthenticationResult>
  switchSchema: (schema: string) => Promise<SessionControlResult>
  cancelSchemaSelection: () => void
  logout: () => Promise<void>
  logoutAll: () => Promise<SessionControlResult>
  logoutAllUsers: () => Promise<SessionControlResult>
}

type TwitchOAuthRedirectFlow = {
  codeVerifier: string
  redirectUrl: string
  state: string
}

type TwitchOAuthProof = Omit<TwitchOAuthRedirectFlow, "redirectUrl">

const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
}

function createInitialActionState(): AuthActionState {
  return Object.fromEntries(
    AUTH_ACTIONS.map((action) => [
      action,
      { errorMessage: null, isLoading: false },
    ])
  ) as AuthActionState
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const router = useRouter()
  const [user, setUser] = useState<StoredSession | undefined>()
  const [selectedSchema, setSelectedSchema] = useState<string | null>(() =>
    myLocalStorage.getItem(StorageKeys.SELECTED_SCHEMA)
  )
  const [pendingSchemaSelection, setPendingSchemaSelection] =
    useState<PendingSchemaSelection | null>(() => readPendingSchemaSelection())
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [actionState, setActionState] = useState(createInitialActionState)
  const userRef = useRef<StoredSession | undefined>(undefined)
  const twitchFlowRequestIdRef = useRef(0)

  const updateAction = useCallback(
    (action: AuthAction, isLoading: boolean, errorMessage: string | null) => {
      setActionState((current) => ({
        ...current,
        [action]: { isLoading, errorMessage },
      }))
    },
    []
  )

  const syncStoredState = useCallback(() => {
    const token = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)
    const nextUser = token ? (readStoredSession() ?? undefined) : undefined
    const previousUser = userRef.current
    const identityChanged =
      previousUser?.username !== nextUser?.username ||
      previousUser?.schema !== nextUser?.schema

    if (identityChanged) {
      queryClient.clear()
    }

    userRef.current = nextUser
    setUser(nextUser)
    setSelectedSchema(nextUser?.schema ?? null)
    setPendingSchemaSelection(readPendingSchemaSelection())
    setIsAuthReady(true)
  }, [])

  const clearLocalAuth = useCallback(() => {
    clearStoredSession()
    queryClient.clear()
    userRef.current = undefined
    setUser(undefined)
    setSelectedSchema(null)
    setPendingSchemaSelection(null)
    setIsAuthReady(true)
  }, [])

  const onUnauthorized = useCallback((): void => {
    clearLocalAuth()
    router.replace("/login")
  }, [clearLocalAuth, router])

  useEffect(() => {
    setOnUnauthorized(onUnauthorized)
    setOnSessionChanged(syncStoredState)
    return () => {
      setOnUnauthorized(null)
      setOnSessionChanged(null)
    }
  }, [onUnauthorized, syncStoredState])

  useEffect(() => {
    let active = true

    async function restoreSession() {
      const storedSession = readStoredSession()
      const token = myLocalStorage.getItem(StorageKeys.JWT_TOKEN)

      if (!storedSession) {
        if (token) {
          clearStoredSession()
        }
        if (active) syncStoredState()
        return
      }

      if (isExpired(storedSession.refreshTokenExpiresAt)) {
        clearStoredSession()
        if (active) syncStoredState()
        return
      }

      if (token && !isExpired(storedSession.accessTokenExpiresAt, 30_000)) {
        if (active) syncStoredState()
        return
      }

      updateAction("refresh", true, null)
      try {
        await refreshStoredSession(token)
        if (active) {
          syncStoredState()
          updateAction("refresh", false, null)
        }
      } catch (error: unknown) {
        if (!active) return
        // Terminal refresh failures are cleared by the transport. For transient
        // failures retain metadata so the next API request can retry recovery.
        const retainedSession = readStoredSession() ?? undefined
        userRef.current = retainedSession
        setUser(retainedSession)
        setSelectedSchema(retainedSession?.schema ?? null)
        setIsAuthReady(true)
        updateAction("refresh", false, getErrorMessage(error))
      }
    }

    void restoreSession()
    return () => {
      active = false
    }
  }, [syncStoredState, updateAction])

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.addEventListener !== "function"
    ) {
      return
    }

    const authKeys = new Set<string>([
      StorageKeys.JWT_TOKEN,
      StorageKeys.USER,
      StorageKeys.SELECTED_SCHEMA,
      StorageKeys.SCHEMA_SELECTION,
    ])
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || authKeys.has(event.key)) {
        syncStoredState()
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [syncStoredState])

  useEffect(() => {
    if (!pendingSchemaSelection) return
    const remaining = Date.parse(pendingSchemaSelection.expiresAt) - Date.now()
    if (remaining <= 0) {
      clearPendingSchemaSelection()
      updateAction("selectSchema", false, "Schema selection has expired.")
      return
    }
    const timeout = setTimeout(() => {
      clearPendingSchemaSelection()
      updateAction("selectSchema", false, "Schema selection has expired.")
    }, remaining)
    return () => clearTimeout(timeout)
  }, [pendingSchemaSelection, updateAction])

  const applyOutcome = useCallback(
    (outcome: AuthenticationOutcomeDto): AuthenticationResult => {
      const applied = applyAuthenticationOutcome(outcome)
      queryClient.clear()
      if (applied.status === "authenticated") {
        userRef.current = applied.session
        setUser(applied.session)
        setSelectedSchema(applied.session.schema)
        setPendingSchemaSelection(null)
        setIsAuthReady(true)
        return { status: "authenticated" }
      }

      userRef.current = undefined
      setUser(undefined)
      setSelectedSchema(null)
      setPendingSchemaSelection(applied.challenge)
      setIsAuthReady(true)
      return { status: "schema-selection-required" }
    },
    []
  )

  const executeAuthentication = useCallback(
    async (
      action: "login" | "selectSchema",
      request: () => Promise<AuthenticationOutcomeDto>
    ): Promise<AuthenticationResult> => {
      updateAction(action, true, null)
      try {
        const result = applyOutcome(await request())
        updateAction(action, false, null)
        return result
      } catch (error: unknown) {
        const result = authenticationError(error)
        updateAction(action, false, result.errorMessage)
        return result
      }
    },
    [applyOutcome, updateAction]
  )

  const login = useCallback(
    (data: LoginRequestDto) => {
      updateAction("selectSchema", false, null)
      return executeAuthentication("login", () =>
        requestLogin({ username: data.username, password: data.password })
      )
    },
    [executeAuthentication, updateAction]
  )

  const loginWithTwitch = useCallback(
    async (code: string, state: string) => {
      updateAction("selectSchema", false, null)
      updateAction("login", true, null)
      const flow = mySessionStorage.getJSON<TwitchOAuthProof>(
        StorageKeys.TWITCH_OAUTH_FLOW
      )
      if (!flow || flow.state !== state) {
        const errorMessage =
          "This Twitch sign-in was not started in this browser or app."
        updateAction("login", false, errorMessage)
        return { status: "error" as const, errorMessage }
      }

      // Claim the proof before the network call. Completion is deliberately
      // single-use; a failed exchange starts a fresh Twitch flow.
      twitchFlowRequestIdRef.current += 1
      mySessionStorage.removeItem(StorageKeys.TWITCH_OAUTH_FLOW)
      try {
        const result = applyOutcome(
          await twitchLogin({ code, codeVerifier: flow.codeVerifier, state })
        )
        updateAction("login", false, null)
        return result
      } catch (error: unknown) {
        const result = authenticationError(error)
        updateAction("login", false, result.errorMessage)
        return result
      }
    },
    [applyOutcome, updateAction]
  )

  const getTwitchRedirectUrl = useCallback(
    async (initialFlow?: TwitchOAuthRedirectFlow) => {
      const requestId = twitchFlowRequestIdRef.current + 1
      twitchFlowRequestIdRef.current = requestId
      mySessionStorage.removeItem(StorageKeys.TWITCH_OAUTH_FLOW)
      let flow = initialFlow
      if (!flow) {
        const proof = await createTwitchOAuthProof()
        const response = await getTwitchAuthenticationRedirectUrl({
          codeChallenge: proof.codeChallenge,
        })
        if (!(response.redirectUrl && response.state)) {
          return null
        }
        flow = {
          codeVerifier: proof.codeVerifier,
          redirectUrl: response.redirectUrl,
          state: response.state,
        }
      }
      if (twitchFlowRequestIdRef.current !== requestId) {
        return null
      }
      mySessionStorage.setJSON<TwitchOAuthProof>(
        StorageKeys.TWITCH_OAUTH_FLOW,
        {
          codeVerifier: flow.codeVerifier,
          state: flow.state,
        }
      )
      return flow.redirectUrl
    },
    []
  )

  const cancelTwitchLogin = useCallback(() => {
    twitchFlowRequestIdRef.current += 1
    mySessionStorage.removeItem(StorageKeys.TWITCH_OAUTH_FLOW)
  }, [])

  const selectSchema = useCallback(
    async (schema: string): Promise<AuthenticationResult> => {
      updateAction("selectSchema", true, null)
      try {
        const schemaSelectionToken = myLocalStorage.getItem(
          StorageKeys.SCHEMA_SELECTION_TOKEN
        )
        const response = await requestSelectSchema({
          schema,
          ...(schemaSelectionToken ? { schemaSelectionToken } : {}),
        })
        const session = applySessionResponse(response)
        queryClient.clear()
        userRef.current = session
        setUser(session)
        setSelectedSchema(session.schema)
        setPendingSchemaSelection(null)
        setIsAuthReady(true)
        updateAction("selectSchema", false, null)
        return { status: "authenticated" }
      } catch (error: unknown) {
        const result = authenticationError(error)
        updateAction("selectSchema", false, result.errorMessage)
        return result
      }
    },
    [updateAction]
  )

  const switchSchema = useCallback(
    async (schema: string): Promise<SessionControlResult> => {
      if (schema === userRef.current?.schema) {
        return { success: true }
      }
      updateAction("switchSchema", true, null)
      try {
        const refreshToken = myLocalStorage.getItem(StorageKeys.REFRESH_TOKEN)
        const response = await requestSwitchSchema({
          schema,
          ...(refreshToken ? { refreshToken } : {}),
        })
        const session = applySessionResponse(response)
        queryClient.clear()
        userRef.current = session
        setUser(session)
        setSelectedSchema(session.schema)
        setPendingSchemaSelection(null)
        updateAction("switchSchema", false, null)
        router.replace("/dashboard")
        return { success: true }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)
        updateAction("switchSchema", false, errorMessage)
        return { success: false, errorMessage }
      }
    },
    [router, updateAction]
  )

  const cancelSchemaSelection = useCallback(() => {
    clearPendingSchemaSelection()
    setPendingSchemaSelection(null)
    updateAction("selectSchema", false, null)
  }, [updateAction])

  const logout = useCallback(async () => {
    updateAction("logout", true, null)
    try {
      await requestLogout()
    } catch {
      // Current-device logout is deliberately best effort.
    } finally {
      clearLocalAuth()
      setActionState(createInitialActionState())
      router.replace("/login")
    }
  }, [clearLocalAuth, router, updateAction])

  const executeBroadLogout = useCallback(
    async (
      action: "logoutAll" | "logoutAllUsers",
      request: () => Promise<unknown>
    ): Promise<SessionControlResult> => {
      updateAction(action, true, null)
      try {
        await request()
        clearLocalAuth()
        setActionState(createInitialActionState())
        router.replace("/login")
        return { success: true }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)
        if (getHttpStatus(error) === 401) {
          clearLocalAuth()
          router.replace("/login")
        } else {
          updateAction(action, false, errorMessage)
        }
        return { success: false, errorMessage }
      }
    },
    [clearLocalAuth, router, updateAction]
  )

  const logoutAll = useCallback(
    () => executeBroadLogout("logoutAll", requestLogoutAll),
    [executeBroadLogout]
  )

  const logoutAllUsers = useCallback(
    () => executeBroadLogout("logoutAllUsers", requestLogoutAllUsers),
    [executeBroadLogout]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== undefined,
      isAuthReady,
      selectedSchema,
      pendingSchemaSelection,
      actionState,
      login,
      loginWithTwitch,
      getTwitchRedirectUrl,
      cancelTwitchLogin,
      selectSchema,
      switchSchema,
      cancelSchemaSelection,
      logout,
      logoutAll,
      logoutAllUsers,
    }),
    [
      user,
      isAuthReady,
      selectedSchema,
      pendingSchemaSelection,
      actionState,
      login,
      loginWithTwitch,
      getTwitchRedirectUrl,
      cancelTwitchLogin,
      selectSchema,
      switchSchema,
      cancelSchemaSelection,
      logout,
      logoutAll,
      logoutAllUsers,
    ]
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

function getErrorMessage(error: unknown): string {
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

function authenticationError(
  error: unknown
): Extract<AuthenticationResult, { status: "error" }> {
  const errorMessage = getErrorMessage(error)
  const retryAfterSeconds = getRetryAfterSeconds(error)
  return {
    status: "error",
    errorMessage,
    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
  }
}

function getRetryAfterSeconds(error: unknown): number | undefined {
  if (!(error instanceof AxiosError) || error.response?.status !== 429) {
    return undefined
  }

  const headerValue = error.response.headers?.["retry-after"]
  if (headerValue === undefined || headerValue === null) {
    return undefined
  }
  const value = Array.isArray(headerValue)
    ? String(headerValue[0])
    : String(headerValue)
  const deltaSeconds = Number(value)
  if (Number.isFinite(deltaSeconds) && deltaSeconds > 0) {
    return Math.ceil(deltaSeconds)
  }

  const retryAt = Date.parse(value)
  if (!Number.isFinite(retryAt)) {
    return undefined
  }
  const remainingSeconds = Math.ceil((retryAt - Date.now()) / 1000)
  return remainingSeconds > 0 ? remainingSeconds : undefined
}

function getHttpStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined
}

function isMessageError(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  )
}
