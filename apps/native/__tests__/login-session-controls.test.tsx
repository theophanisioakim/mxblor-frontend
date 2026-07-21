import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { render, waitFor } from "@testing-library/react-native"
import { LoginScreen } from "@workspace/app"

const mockReplace = jest.fn()
const baseAction = { errorMessage: null, isLoading: false }
const createAuthValue = (twitchRedirectUrl: string | null = null) => ({
  actionState: {
    login: baseAction,
    logout: baseAction,
    logoutAll: baseAction,
    logoutAllUsers: baseAction,
    refresh: baseAction,
    selectSchema: baseAction,
    switchSchema: baseAction,
  },
  cancelSchemaSelection: jest.fn(),
  cancelTwitchLogin: jest.fn(),
  getTwitchRedirectUrl: jest.fn(async () => twitchRedirectUrl),
  isAuthenticated: false,
  login: jest.fn(),
  loginWithTwitch: jest.fn(),
  pendingSchemaSelection: null as null | {
    availableSchemas: string[]
    expiresAt: string
  },
  selectSchema: jest.fn(),
})
const mockUseAuth = jest.fn(createAuthValue)

jest.mock("@workspace/providers", () => ({
  useAuth: () => mockUseAuth(),
}))
jest.mock("@workspace/router", () => ({
  useRouter: () => ({ replace: (...args: unknown[]) => mockReplace(...args) }),
}))

describe("LoginScreen signed-session states", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue(createAuthValue())
  })

  it("renders credentials without the removed remember-me control", async () => {
    const authValue = createAuthValue()
    mockUseAuth.mockReturnValue(authValue)
    const screen = await render(<LoginScreen initialTwitchUrl={null} />)

    expect(screen.getByLabelText("Username or email")).toBeTruthy()
    expect(screen.getByLabelText("Password")).toBeTruthy()
    expect(screen.queryByText("Remember me")).toBeNull()
    expect(screen.queryByLabelText("Continue with Twitch")).toBeNull()
    expect(authValue.getTwitchRedirectUrl).not.toHaveBeenCalled()
  })

  it("shows Twitch only when the backend supplies a redirect URL", async () => {
    const authValue = createAuthValue("https://id.twitch.tv/oauth2/authorize")
    mockUseAuth.mockReturnValue(authValue)

    const screen = await render(<LoginScreen />)

    await waitFor(() => {
      expect(screen.getByLabelText("Continue with Twitch")).toBeTruthy()
    })
    expect(authValue.getTwitchRedirectUrl).toHaveBeenCalledTimes(1)
  })

  it("registers the Twitch flow supplied by web SSR", async () => {
    const authValue = createAuthValue("https://id.twitch.tv/oauth2/authorize")
    mockUseAuth.mockReturnValue(authValue)

    const screen = await render(
      <LoginScreen
        initialTwitchCodeVerifier="client-verifier"
        initialTwitchState="expected-state"
        initialTwitchUrl="https://id.twitch.tv/oauth2/authorize"
      />
    )

    expect(screen.getByLabelText("Continue with Twitch")).toBeTruthy()
    await waitFor(() => {
      expect(authValue.getTwitchRedirectUrl).toHaveBeenCalledWith({
        codeVerifier: "client-verifier",
        redirectUrl: "https://id.twitch.tv/oauth2/authorize",
        state: "expected-state",
      })
    })
  })

  it("renders the schema-selection step for a pending challenge", async () => {
    mockUseAuth.mockReturnValue({
      ...createAuthValue(),
      pendingSchemaSelection: {
        availableSchemas: ["tenant-a", "tenant-b"],
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    })

    const screen = await render(<LoginScreen initialTwitchUrl={null} />)

    expect(screen.getByText("Select a schema")).toBeTruthy()
    expect(screen.getByText("Continue")).toBeTruthy()
    expect(screen.getByText("Back to sign in")).toBeTruthy()
    expect(screen.queryByLabelText("Username or email")).toBeNull()
  })
})
