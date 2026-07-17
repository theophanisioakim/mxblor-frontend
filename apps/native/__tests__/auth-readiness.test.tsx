import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { act, render, waitFor } from "@testing-library/react-native"
import { AuthProvider, useAuth } from "@workspace/providers"
import { Text, View } from "@workspace/ui"

jest.mock("@workspace/api-client", () => {
  const getAuthenticatedUser = jest.fn()
  return {
    __mockGetAuthenticatedUser: getAuthenticatedUser,
    getAuthenticatedUser,
    getTwitchAuthenticationRedirectUrl: jest.fn(),
    setOnUnauthorized: jest.fn(),
    twitchLogin: jest.fn(),
    useLogin: () => ({ mutateAsync: jest.fn() }),
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
  const getItem = jest.fn((key: string) => storage.get(key) ?? null)
  return {
    __mockGetItem: getItem,
    __mockStorage: storage,
    StorageKeys: {
      JWT_TOKEN: "JWT_TOKEN",
      SELECTED_SCHEMA: "SELECTED_SCHEMA",
    },
    myLocalStorage: {
      clear: () => storage.clear(),
      getItem,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  }
})

const mockStorage = (
  jest.requireMock("@workspace/storage") as {
    __mockStorage: Map<string, string>
  }
).__mockStorage
const mockGetItem = (
  jest.requireMock("@workspace/storage") as {
    __mockGetItem: jest.Mock<(key: string) => string | null>
  }
).__mockGetItem
const mockGetAuthenticatedUser = (
  jest.requireMock("@workspace/api-client") as {
    __mockGetAuthenticatedUser: jest.Mock<
      () => Promise<{ availableSchemas?: string[] }>
    >
  }
).__mockGetAuthenticatedUser
const mockReplace = (
  jest.requireMock("@workspace/router") as {
    __mockReplace: jest.Mock
  }
).__mockReplace

function AuthProbe() {
  const { isAuthenticated, isAuthReady, selectedSchema } = useAuth()

  return (
    <View>
      <Text>{`ready:${isAuthReady}`}</Text>
      <Text>{`authenticated:${isAuthenticated}`}</Text>
      <Text>{`schema:${selectedSchema ?? "none"}`}</Text>
    </View>
  )
}

describe("AuthProvider readiness", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorage.clear()
  })

  it("is immediately ready when no stored session exists", async () => {
    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    expect(getByText("ready:true")).toBeTruthy()
    expect(getByText("authenticated:false")).toBeTruthy()
    expect(mockGetAuthenticatedUser).not.toHaveBeenCalled()
  })

  it("stays unready until a stored session is restored", async () => {
    mockStorage.set("JWT_TOKEN", "stored-token")
    mockStorage.set("SELECTED_SCHEMA", "tenant-a")
    expect(mockStorage.get("JWT_TOKEN")).toBe("stored-token")

    let resolveUser: ((user: { availableSchemas: string[] }) => void) | null =
      null
    mockGetAuthenticatedUser.mockReturnValue(
      new Promise((resolve) => {
        resolveUser = resolve
      })
    )

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    expect(mockGetItem).toHaveBeenCalledWith("JWT_TOKEN")
    expect(mockGetItem).toHaveReturnedWith("stored-token")
    expect(getByText("ready:false")).toBeTruthy()

    await act(async () => {
      resolveUser?.({ availableSchemas: ["tenant-a"] })
    })

    await waitFor(() => expect(getByText("ready:true")).toBeTruthy())
    expect(getByText("authenticated:true")).toBeTruthy()
    expect(getByText("schema:tenant-a")).toBeTruthy()
  })

  it("becomes ready and redirects when a stored session is rejected", async () => {
    mockStorage.set("JWT_TOKEN", "expired-token")
    mockStorage.set("SELECTED_SCHEMA", "tenant-a")
    mockGetAuthenticatedUser.mockRejectedValue(new Error("Expired"))

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(getByText("ready:true")).toBeTruthy())
    expect(getByText("authenticated:false")).toBeTruthy()
    expect(getByText("schema:none")).toBeTruthy()
    expect(mockReplace).toHaveBeenCalledWith("/login")
  })
})
