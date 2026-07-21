import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, render, waitFor } from "@testing-library/react-native"
import type {
  AuthContextValue,
  AuthenticationResult,
} from "@workspace/providers"
import { AuthProvider, useAuth } from "@workspace/providers"
import { Text, View } from "@workspace/ui"
import { AxiosError } from "axios"

jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  CryptoEncoding: { BASE64: "base64" },
  digestStringAsync: jest.fn(async () => "YWJjKy8="),
  getRandomBytesAsync: jest.fn(
    async () => new Uint8Array(Array.from({ length: 32 }, (_, index) => index))
  ),
}))

jest.mock("@workspace/api-client", () => {
  let storedSession: Record<string, unknown> | null = null
  let pendingSelection: Record<string, unknown> | null = null
  let sessionChanged: (() => void) | null = null
  const queryClient = { clear: jest.fn() }
  const login = jest.fn()
  const refreshStoredSession = jest.fn()
  const logout = jest.fn()
  const logoutAll = jest.fn()
  const logoutAllUsers = jest.fn()
  const selectSchema = jest.fn()
  const switchSchema = jest.fn()
  const getTwitchAuthenticationRedirectUrl = jest.fn()
  const twitchLogin = jest.fn()

  const applySessionResponse = (response: Record<string, unknown>) => {
    const session = {
      accessTokenExpiresAt: response.accessTokenExpiresAt,
      availableSchemas: response.availableSchemas,
      channel: response.channel,
      refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      roleDescriptions: response.roleDescriptions ?? [],
      schema: response.schema,
      username: response.username,
    }
    storedSession = session
    pendingSelection = null
    return session
  }

  return {
    __setPendingSelection: (value: Record<string, unknown> | null) => {
      pendingSelection = value
    },
    __setStoredSession: (value: Record<string, unknown> | null) => {
      storedSession = value
    },
    __mockLogin: login,
    __mockLogout: logout,
    __mockLogoutAll: logoutAll,
    __mockLogoutAllUsers: logoutAllUsers,
    __mockRefreshStoredSession: refreshStoredSession,
    __mockSelectSchema: selectSchema,
    __mockSwitchSchema: switchSchema,
    __mockGetTwitchAuthenticationRedirectUrl:
      getTwitchAuthenticationRedirectUrl,
    __mockTwitchLogin: twitchLogin,
    applyAuthenticationOutcome: (outcome: Record<string, unknown>) => {
      if (outcome.status === "AUTHENTICATED") {
        return {
          status: "authenticated",
          session: applySessionResponse(
            outcome.session as Record<string, unknown>
          ),
        }
      }
      const challenge = {
        availableSchemas: outcome.availableSchemas,
        channel: outcome.channel,
        expiresAt: outcome.schemaSelectionExpiresAt,
      }
      storedSession = null
      pendingSelection = challenge
      return { status: "schema-selection-required", challenge }
    },
    applySessionResponse,
    clearPendingSchemaSelection: () => {
      pendingSelection = null
      sessionChanged?.()
    },
    clearStoredSession: () => {
      storedSession = null
      pendingSelection = null
      sessionChanged?.()
    },
    getTwitchAuthenticationRedirectUrl,
    isExpired: (value: string, skew = 0) =>
      Date.parse(value) <= Date.now() + skew,
    login,
    logout,
    logoutAll,
    logoutAllUsers,
    queryClient,
    readPendingSchemaSelection: () => pendingSelection,
    readStoredSession: () => storedSession,
    refreshStoredSession,
    selectSchema,
    setOnSessionChanged: (callback: (() => void) | null) => {
      sessionChanged = callback
    },
    setOnUnauthorized: jest.fn(),
    switchSchema,
    twitchLogin,
  }
})

jest.mock("@workspace/router", () => {
  const replace = jest.fn()
  return {
    __mockReplace: replace,
    useRouter: () => ({ replace }),
  }
})

jest.mock("@workspace/storage", () => {
  const storage = new Map<string, string>()
  const sessionStorage = new Map<string, string>()
  const createStorage = (values: Map<string, string>) => ({
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    getJSON: (key: string) => {
      const value = values.get(key)
      return value ? JSON.parse(value) : null
    },
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
    setJSON: (key: string, value: unknown) =>
      values.set(key, JSON.stringify(value)),
  })
  return {
    __mockStorage: storage,
    __mockSessionStorage: sessionStorage,
    StorageKeys: {
      JWT_TOKEN: "JWT_TOKEN",
      REFRESH_TOKEN: "REFRESH_TOKEN",
      SCHEMA_SELECTION_TOKEN: "SCHEMA_SELECTION_TOKEN",
      SCHEMA_SELECTION: "SCHEMA_SELECTION",
      SELECTED_SCHEMA: "SELECTED_SCHEMA",
      USER: "USER",
      TWITCH_OAUTH_FLOW: "TWITCH_OAUTH_FLOW",
    },
    myLocalStorage: createStorage(storage),
    mySessionStorage: createStorage(sessionStorage),
  }
})

type ApiClientMock = {
  __setPendingSelection: (value: Record<string, unknown> | null) => void
  __setStoredSession: (value: Record<string, unknown> | null) => void
  __mockLogin: jest.Mock<(...args: unknown[]) => Promise<unknown>>
  __mockLogout: jest.Mock<() => Promise<unknown>>
  __mockLogoutAll: jest.Mock<() => Promise<unknown>>
  __mockLogoutAllUsers: jest.Mock<() => Promise<unknown>>
  __mockRefreshStoredSession: jest.Mock<
    (token: string | null) => Promise<string>
  >
  __mockSelectSchema: jest.Mock<(...args: unknown[]) => Promise<unknown>>
  __mockSwitchSchema: jest.Mock<(...args: unknown[]) => Promise<unknown>>
  __mockGetTwitchAuthenticationRedirectUrl: jest.Mock<
    (...args: unknown[]) => Promise<unknown>
  >
  __mockTwitchLogin: jest.Mock<(...args: unknown[]) => Promise<unknown>>
}

const apiClientMock = jest.requireMock("@workspace/api-client") as ApiClientMock
const mockStorage = (
  jest.requireMock("@workspace/storage") as {
    __mockStorage: Map<string, string>
  }
).__mockStorage
const mockSessionStorage = (
  jest.requireMock("@workspace/storage") as {
    __mockSessionStorage: Map<string, string>
  }
).__mockSessionStorage
const mockReplace = (
  jest.requireMock("@workspace/router") as { __mockReplace: jest.Mock }
).__mockReplace

let latestAuth: AuthContextValue | null = null

function AuthProbe() {
  const auth = useAuth()
  latestAuth = auth

  return (
    <View>
      <Text>{`ready:${auth.isAuthReady}`}</Text>
      <Text>{`authenticated:${auth.isAuthenticated}`}</Text>
      <Text>{`schema:${auth.selectedSchema ?? "none"}`}</Text>
      <Text>{`selection:${auth.pendingSchemaSelection ? "pending" : "none"}`}</Text>
    </View>
  )
}

function validStoredSession(schema = "tenant-a") {
  return {
    accessTokenExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    availableSchemas: ["tenant-a", "tenant-b"],
    channel: "CHANNEL_MOBILE",
    refreshTokenExpiresAt: new Date(Date.now() + 120_000).toISOString(),
    roleDescriptions: ["admin"],
    schema,
    username: "test-user",
  }
}

function loginResponse(schema = "tenant-a") {
  return {
    accessToken: "new-access-token",
    accessTokenExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    availableSchemas: ["tenant-a", "tenant-b"],
    channel: "CHANNEL_MOBILE",
    refreshToken: "new-refresh-token",
    refreshTokenExpiresAt: new Date(Date.now() + 120_000).toISOString(),
    roleDescriptions: ["admin"],
    schema,
    username: "test-user",
  }
}

describe("AuthProvider signed-session lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorage.clear()
    mockSessionStorage.clear()
    apiClientMock.__setStoredSession(null)
    apiClientMock.__setPendingSelection(null)
    latestAuth = null
  })

  it("becomes ready without calling the removed user endpoint", async () => {
    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(getByText("ready:true")).toBeTruthy())
    expect(getByText("authenticated:false")).toBeTruthy()
  })

  it("restores a valid signed session from local metadata", async () => {
    apiClientMock.__setStoredSession(validStoredSession())
    mockStorage.set("JWT_TOKEN", "stored-token")

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(getByText("ready:true")).toBeTruthy())
    expect(getByText("authenticated:true")).toBeTruthy()
    expect(getByText("schema:tenant-a")).toBeTruthy()
    expect(apiClientMock.__mockRefreshStoredSession).not.toHaveBeenCalled()
  })

  it("refreshes an expired access token while the refresh family is valid", async () => {
    apiClientMock.__setStoredSession({
      ...validStoredSession(),
      accessTokenExpiresAt: new Date(Date.now() - 1_000).toISOString(),
    })
    mockStorage.set("JWT_TOKEN", "expired-token")
    apiClientMock.__mockRefreshStoredSession.mockImplementation(async () => {
      apiClientMock.__setStoredSession(validStoredSession("tenant-b"))
      mockStorage.set("JWT_TOKEN", "rotated-token")
      return "rotated-token"
    })

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(getByText("schema:tenant-b")).toBeTruthy())
    expect(apiClientMock.__mockRefreshStoredSession).toHaveBeenCalledWith(
      "expired-token"
    )
  })

  it("exposes a schema challenge instead of auto-selecting a tenant", async () => {
    apiClientMock.__mockLogin.mockResolvedValue({
      status: "SCHEMA_SELECTION_REQUIRED",
      availableSchemas: ["tenant-a", "tenant-b"],
      channel: "CHANNEL_MOBILE",
      schemaSelectionExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      schemaSelectionToken: "selection-token",
    })
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    let result: AuthenticationResult | undefined
    await act(async () => {
      result = await latestAuth?.login({
        username: "test-user",
        password: "password123",
      })
    })

    expect(result?.status).toBe("schema-selection-required")
    expect(latestAuth?.isAuthenticated).toBe(false)
    expect(latestAuth?.pendingSchemaSelection?.availableSchemas).toEqual([
      "tenant-a",
      "tenant-b",
    ])
  })

  it("surfaces only the generic bad-credentials login error", async () => {
    const badCredentials = new AxiosError("Request failed")
    Object.assign(badCredentials, {
      response: {
        status: 422,
        data: {
          errorCode: "BAD_CREDENTIALS",
          message: "Invalid username or password",
        },
      },
    })
    apiClientMock.__mockLogin.mockRejectedValue(badCredentials)

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    let result: AuthenticationResult | undefined
    await act(async () => {
      result = await latestAuth?.login({
        username: "unknown-user",
        password: "password123",
      })
    })

    expect(result).toEqual({
      status: "error",
      errorMessage: "Invalid username or password",
    })
    expect(latestAuth?.actionState.login.errorMessage).toBe(
      "Invalid username or password"
    )
    expect(latestAuth?.isAuthenticated).toBe(false)
    expect(latestAuth?.pendingSchemaSelection).toBeNull()
  })

  it("exposes the retry window when login is rate limited", async () => {
    const rateLimited = new AxiosError("Too many requests")
    Object.assign(rateLimited, {
      response: {
        status: 429,
        data: { message: "Too many requests. Please try again later." },
        headers: { "retry-after": "12" },
      },
    })
    apiClientMock.__mockLogin.mockRejectedValue(rateLimited)

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    let result: AuthenticationResult | undefined
    await act(async () => {
      result = await latestAuth?.login({
        username: "test-user",
        password: "password123",
      })
    })

    expect(result).toEqual({
      status: "error",
      errorMessage: "Too many requests. Please try again later.",
      retryAfterSeconds: 12,
    })
  })

  it("preserves the current session when global logout is forbidden", async () => {
    apiClientMock.__setStoredSession(validStoredSession())
    mockStorage.set("JWT_TOKEN", "stored-token")
    const forbidden = new AxiosError("Forbidden")
    Object.assign(forbidden, {
      response: { status: 403, data: { message: "Forbidden" } },
    })
    apiClientMock.__mockLogoutAllUsers.mockRejectedValue(forbidden)

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthenticated).toBe(true))

    await act(async () => {
      await latestAuth?.logoutAllUsers()
    })

    expect(latestAuth?.isAuthenticated).toBe(true)
    expect(latestAuth?.actionState.logoutAllUsers.errorMessage).toBe(
      "Forbidden"
    )
  })

  it("clears local state when current-device revocation cannot reach the server", async () => {
    apiClientMock.__setStoredSession(validStoredSession())
    mockStorage.set("JWT_TOKEN", "stored-token")
    apiClientMock.__mockLogout.mockRejectedValue(new Error("Offline"))
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthenticated).toBe(true))

    await act(async () => {
      await latestAuth?.logout()
    })

    expect(latestAuth?.isAuthenticated).toBe(false)
    expect(mockReplace).toHaveBeenCalledWith("/login")
  })

  it("clears local state after all-device revocation succeeds", async () => {
    apiClientMock.__setStoredSession(validStoredSession())
    mockStorage.set("JWT_TOKEN", "stored-token")
    apiClientMock.__mockLogoutAll.mockResolvedValue(undefined)
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthenticated).toBe(true))

    await act(async () => {
      await latestAuth?.logoutAll()
    })

    expect(latestAuth?.isAuthenticated).toBe(false)
    expect(mockReplace).toHaveBeenCalledWith("/login")
  })

  it("applies an authenticated login outcome", async () => {
    apiClientMock.__mockLogin.mockResolvedValue({
      status: "AUTHENTICATED",
      session: loginResponse(),
    })
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    await act(async () => {
      await latestAuth?.login({
        username: "test-user",
        password: "password123",
      })
    })

    expect(latestAuth?.isAuthenticated).toBe(true)
    expect(latestAuth?.selectedSchema).toBe("tenant-a")
  })

  it("binds Twitch completion to the initiating native app session", async () => {
    apiClientMock.__mockGetTwitchAuthenticationRedirectUrl.mockResolvedValue({
      redirectUrl: "https://id.twitch.tv/oauth2/authorize?state=expected-state",
      state: "expected-state",
    })
    apiClientMock.__mockTwitchLogin.mockResolvedValue({
      status: "AUTHENTICATED",
      session: loginResponse(),
    })
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    let redirectUrl: string | null | undefined
    await act(async () => {
      redirectUrl = await latestAuth?.getTwitchRedirectUrl()
    })

    expect(redirectUrl).toContain("state=expected-state")
    expect(
      apiClientMock.__mockGetTwitchAuthenticationRedirectUrl
    ).toHaveBeenCalledWith({ codeChallenge: "YWJjKy8" })
    expect(mockSessionStorage.has("TWITCH_OAUTH_FLOW")).toBe(true)

    await act(async () => {
      await latestAuth?.loginWithTwitch("authorization-code", "expected-state")
    })

    expect(apiClientMock.__mockTwitchLogin).toHaveBeenCalledWith({
      code: "authorization-code",
      codeVerifier:
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
      state: "expected-state",
    })
    expect(mockSessionStorage.has("TWITCH_OAUTH_FLOW")).toBe(false)
  })

  it("registers an SSR-created Twitch flow without requesting another URL", async () => {
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    let redirectUrl: string | null | undefined
    await act(async () => {
      redirectUrl = await latestAuth?.getTwitchRedirectUrl({
        codeVerifier: "server-rendered-client-verifier",
        redirectUrl: "https://id.twitch.tv/oauth2/authorize?state=ssr-state",
        state: "ssr-state",
      })
    })

    expect(redirectUrl).toContain("state=ssr-state")
    expect(
      apiClientMock.__mockGetTwitchAuthenticationRedirectUrl
    ).not.toHaveBeenCalled()
    expect(
      JSON.parse(mockSessionStorage.get("TWITCH_OAUTH_FLOW") ?? "{}")
    ).toEqual({
      codeVerifier: "server-rendered-client-verifier",
      state: "ssr-state",
    })
  })

  it("keeps only the newest Twitch redirect flow when requests overlap", async () => {
    let resolveFirst!: (value: unknown) => void
    let resolveSecond!: (value: unknown) => void
    apiClientMock.__mockGetTwitchAuthenticationRedirectUrl
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          })
      )
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))

    const auth = latestAuth as AuthContextValue
    const firstRequest = auth.getTwitchRedirectUrl()
    const secondRequest = auth.getTwitchRedirectUrl()
    await waitFor(() =>
      expect(
        apiClientMock.__mockGetTwitchAuthenticationRedirectUrl
      ).toHaveBeenCalledTimes(2)
    )

    let secondUrl: string | null = null
    await act(async () => {
      resolveSecond({
        redirectUrl: "https://id.twitch.tv/oauth2/authorize?state=newest-state",
        state: "newest-state",
      })
      secondUrl = await secondRequest
    })
    let firstUrl: string | null = null
    await act(async () => {
      resolveFirst({
        redirectUrl: "https://id.twitch.tv/oauth2/authorize?state=stale-state",
        state: "stale-state",
      })
      firstUrl = await firstRequest
    })

    expect(secondUrl).toContain("state=newest-state")
    expect(firstUrl).toBeNull()
    expect(
      JSON.parse(mockSessionStorage.get("TWITCH_OAUTH_FLOW") ?? "{}")
    ).toMatchObject({
      state: "newest-state",
    })
  })

  it("rejects a Twitch callback from another browser or device", async () => {
    apiClientMock.__mockGetTwitchAuthenticationRedirectUrl.mockResolvedValue({
      redirectUrl: "https://id.twitch.tv/oauth2/authorize?state=expected-state",
      state: "expected-state",
    })
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthReady).toBe(true))
    await act(async () => {
      await latestAuth?.getTwitchRedirectUrl()
    })

    let result: AuthenticationResult | undefined
    await act(async () => {
      result = await latestAuth?.loginWithTwitch(
        "attacker-code",
        "attacker-state"
      )
    })

    expect(result).toEqual({
      status: "error",
      errorMessage:
        "This Twitch sign-in was not started in this browser or app.",
    })
    expect(apiClientMock.__mockTwitchLogin).not.toHaveBeenCalled()
    expect(mockSessionStorage.has("TWITCH_OAUTH_FLOW")).toBe(true)
  })

  it("switches schema with the native refresh token and applies rotation", async () => {
    apiClientMock.__setStoredSession(validStoredSession())
    mockStorage.set("JWT_TOKEN", "stored-token")
    mockStorage.set("REFRESH_TOKEN", "native-refresh-token")
    apiClientMock.__mockSwitchSchema.mockResolvedValue(
      loginResponse("tenant-b")
    )
    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )
    await waitFor(() => expect(latestAuth?.isAuthenticated).toBe(true))

    await act(async () => {
      await latestAuth?.switchSchema("tenant-b")
    })

    expect(apiClientMock.__mockSwitchSchema).toHaveBeenCalledWith({
      refreshToken: "native-refresh-token",
      schema: "tenant-b",
    })
    expect(latestAuth?.selectedSchema).toBe("tenant-b")
    expect(mockReplace).toHaveBeenCalledWith("/")
  })
})
