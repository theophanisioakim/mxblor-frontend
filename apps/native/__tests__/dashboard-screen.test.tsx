import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { DashboardScreen, fetchDashboardMetrics } from "@workspace/app"

jest.mock("@workspace/api-client", () => ({
  searchBuildings: jest.fn(),
  searchBuildingUnits: jest.fn(),
  searchContacts: jest.fn(),
  searchExpenses: jest.fn(),
}))

let mockAuth = {
  isAuthenticated: true,
  isAuthReady: true,
  selectedSchema: "tenant-a" as string | null,
}

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock("@workspace/providers", () => ({
  useAuth: () => mockAuth,
}))

jest.mock("@workspace/router", () => ({
  LinkButton: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require("react-native")
    return <Text>{children}</Text>
  },
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

jest.mock("@workspace/i18n", () => {
  const translations: Record<string, string> = {
    "dashboard.description": "Current portfolio overview.",
    "dashboard.error.description": "Could not load totals.",
    "dashboard.error.retry": "Try again",
    "dashboard.error.title": "Dashboard metrics are unavailable",
    "dashboard.forbidden.back": "Return to the landing page",
    "dashboard.forbidden.description": "You do not have permission.",
    "dashboard.forbidden.title": "Dashboard unavailable",
    "dashboard.loading": "Loading dashboard metrics…",
    "dashboard.metrics.buildings": "Buildings",
    "dashboard.metrics.buildingUnits": "Building units",
    "dashboard.metrics.contacts": "Contacts",
    "dashboard.metrics.expenses": "Expense types",
    "dashboard.title": "Dashboard",
  }
  const t = (key: string, options?: { name?: string }) => {
    if (key === "dashboard.metrics.open") {
      return `View ${options?.name ?? ""}`
    }
    return translations[key] ?? key
  }
  return { useTranslation: () => ({ t }) }
})

type SearchResult = { totalElements?: number }
type SearchMock = (
  request: { page: number; size: number },
  signal?: AbortSignal
) => Promise<SearchResult>

const mockedApi = jest.requireMock("@workspace/api-client") as {
  searchBuildings: jest.MockedFunction<SearchMock>
  searchBuildingUnits: jest.MockedFunction<SearchMock>
  searchContacts: jest.MockedFunction<SearchMock>
  searchExpenses: jest.MockedFunction<SearchMock>
}

function resolveMetrics() {
  mockedApi.searchBuildings.mockResolvedValue({ totalElements: 12 })
  mockedApi.searchBuildingUnits.mockResolvedValue({ totalElements: 86 })
  mockedApi.searchContacts.mockResolvedValue({ totalElements: 241 })
  mockedApi.searchExpenses.mockResolvedValue({ totalElements: 37 })
}

describe("DashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth = {
      isAuthenticated: true,
      isAuthReady: true,
      selectedSchema: "tenant-a",
    }
    resolveMetrics()
  })

  it("requests only one row from each committed search API", async () => {
    const controller = new AbortController()

    await expect(fetchDashboardMetrics(controller.signal)).resolves.toEqual({
      buildings: 12,
      buildingUnits: 86,
      contacts: 241,
      expenses: 37,
    })

    for (const search of Object.values(mockedApi)) {
      expect(search).toHaveBeenCalledWith(
        { page: 0, size: 1 },
        controller.signal
      )
    }
  })

  it("renders current totals and navigates from each metric card", async () => {
    const { getByLabelText, getByText } = await render(<DashboardScreen />)

    expect(await waitFor(() => getByText("12"))).toBeTruthy()
    expect(getByText("86")).toBeTruthy()
    expect(getByText("241")).toBeTruthy()
    expect(getByText("37")).toBeTruthy()

    await fireEvent.press(getByLabelText("View Buildings"))
    await fireEvent.press(getByLabelText("View Contacts"))
    await fireEvent.press(getByLabelText("View Expense types"))

    expect(mockPush).toHaveBeenNthCalledWith(1, "/buildings")
    expect(mockPush).toHaveBeenNthCalledWith(2, "/contacts")
    expect(mockPush).toHaveBeenNthCalledWith(3, "/expenses")
  })

  it("does not request metrics before authentication is ready", async () => {
    mockAuth = {
      isAuthenticated: false,
      isAuthReady: false,
      selectedSchema: null,
    }

    const { getByText } = await render(<DashboardScreen />)

    expect(getByText("Loading dashboard metrics…")).toBeTruthy()
    expect(mockedApi.searchBuildings).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it("redirects an anonymous visitor after authentication resolves", async () => {
    mockAuth = {
      isAuthenticated: false,
      isAuthReady: true,
      selectedSchema: null,
    }

    await render(<DashboardScreen />)

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"))
    expect(mockedApi.searchBuildings).not.toHaveBeenCalled()
  })

  it("offers a fresh retry after a transient failure", async () => {
    mockedApi.searchBuildings
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValue({ totalElements: 12 })

    const { getByText } = await render(<DashboardScreen />)

    expect(
      await waitFor(() => getByText("Dashboard metrics are unavailable"))
    ).toBeTruthy()
    await fireEvent.press(getByText("Try again"))

    expect(await waitFor(() => getByText("12"))).toBeTruthy()
    expect(mockedApi.searchBuildings).toHaveBeenCalledTimes(2)
  })

  it("shows a permission-specific state for a forbidden response", async () => {
    mockedApi.searchBuildings.mockRejectedValue({ response: { status: 403 } })

    const { getByText } = await render(<DashboardScreen />)

    expect(await waitFor(() => getByText("Dashboard unavailable"))).toBeTruthy()
    expect(getByText("You do not have permission.")).toBeTruthy()
  })

  it("does not retain metrics after the screen unmounts", async () => {
    const first = await render(<DashboardScreen />)
    await waitFor(() => first.getByText("12"))
    await first.unmount()

    const second = await render(<DashboardScreen />)
    await waitFor(() => second.getByText("12"))

    expect(mockedApi.searchBuildings).toHaveBeenCalledTimes(2)
    expect(mockedApi.searchBuildingUnits).toHaveBeenCalledTimes(2)
    expect(mockedApi.searchContacts).toHaveBeenCalledTimes(2)
    expect(mockedApi.searchExpenses).toHaveBeenCalledTimes(2)
  })

  it("requests fresh totals when the selected schema changes", async () => {
    const screen = await render(<DashboardScreen />)
    await waitFor(() => screen.getByText("12"))

    mockAuth = { ...mockAuth, selectedSchema: "tenant-b" }
    await screen.rerender(<DashboardScreen />)

    await waitFor(() =>
      expect(mockedApi.searchBuildings).toHaveBeenCalledTimes(2)
    )
  })

  it("aborts in-flight requests when the screen unmounts", async () => {
    mockedApi.searchBuildings.mockReturnValue(new Promise(() => undefined))
    mockedApi.searchBuildingUnits.mockReturnValue(new Promise(() => undefined))
    mockedApi.searchContacts.mockReturnValue(new Promise(() => undefined))
    mockedApi.searchExpenses.mockReturnValue(new Promise(() => undefined))

    const screen = await render(<DashboardScreen />)
    await waitFor(() => expect(mockedApi.searchBuildings).toHaveBeenCalled())
    const signal = mockedApi.searchBuildings.mock.calls[0]?.[1]

    await screen.unmount()

    expect(signal?.aborted).toBe(true)
  })
})
