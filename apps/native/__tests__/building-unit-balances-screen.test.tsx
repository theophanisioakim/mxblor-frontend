import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, waitFor } from "@testing-library/react-native"
import {
  BuildingUnitBalancesScreen,
  fetchAllBuildingUnitBalances,
} from "@workspace/app"

let mockViewportWidth = 390

jest.mock("@workspace/ui/hooks/use-is-mobile", () => ({
  useIsMobile: () => mockViewportWidth < 768,
}))

jest.mock("@workspace/api-client", () => ({
  searchTCollectionUnitBalances: jest.fn(),
  updateTCollectionOpeningBalances: jest.fn(),
  useGetBuildingById: () => ({
    data: { code: "BLD", name: "Test Building", startedAt: "2026-01-01" },
  }),
}))

jest.mock("@workspace/providers", () => ({
  useBreadcrumbs: () => ({ setItems: jest.fn() }),
}))

jest.mock("@workspace/router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock("@workspace/i18n", () => {
  const translations: Record<string, string> = {
    "buildingUnitBalances.back": "Back to building",
    "buildingUnitBalances.columns.liveCapital": "Live Capital",
    "buildingUnitBalances.columns.liveMonthly": "Live Monthly",
    "buildingUnitBalances.columns.openingCapital": "Opening Capital",
    "buildingUnitBalances.columns.openingMonthly": "Opening Monthly",
    "buildingUnitBalances.columns.total": "Total",
    "buildingUnitBalances.columns.unit": "Unit",
    "buildingUnitBalances.empty": "This building has no units yet.",
    "buildingUnitBalances.guidance": "Signed-value guidance",
    "buildingUnitBalances.loadError": "The unit balances could not be loaded.",
    "buildingUnitBalances.loading": "Loading unit balances…",
    "buildingUnitBalances.referenceDate": "Opening balance reference date",
    "buildingUnitBalances.referenceDateHelp": "Shared date help",
    "buildingUnitBalances.retry": "Retry",
    "buildingUnitBalances.saveAll": "Save all",
    "buildingUnitBalances.saveError": "Save failed",
    "buildingUnitBalances.success": "All opening balances were saved.",
    "buildingUnitBalances.title": "Unit balances",
    "buildingUnitBalances.validation.referenceDate": "Choose a reference date.",
  }
  const t = (key: string) => translations[key] ?? key
  return { useTranslation: () => ({ t }) }
})

type SearchResult = {
  content: Array<Record<string, number | string>>
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  referenceDate: string
  size: number
  totalElements: number
  totalPages: number
}

type SearchMock = (
  request: { buildingId: string; page: number; size: number },
  signal?: AbortSignal
) => Promise<SearchResult>
type UpdateMock = (request: Record<string, unknown>) => Promise<void>

const mockedApi = jest.requireMock("@workspace/api-client") as {
  searchTCollectionUnitBalances: jest.MockedFunction<SearchMock>
  updateTCollectionOpeningBalances: jest.MockedFunction<UpdateMock>
}
const searchMock = mockedApi.searchTCollectionUnitBalances
const updateMock = mockedApi.updateTCollectionOpeningBalances

const loadedPage = {
  content: [
    {
      buildingUnitId: "unit-1",
      buildingUnitCode: "A101",
      openingCapital: 10,
      openingMonthly: -5,
      capital: 25,
      monthly: -2,
      total: 23,
    },
    {
      buildingUnitId: "unit-2",
      buildingUnitCode: "A102",
      openingCapital: 0,
      openingMonthly: 0,
      capital: 0,
      monthly: 0,
      total: 0,
    },
  ],
  empty: false,
  first: true,
  last: true,
  number: 0,
  numberOfElements: 2,
  referenceDate: "2025-12-31",
  size: 100,
  totalElements: 2,
  totalPages: 1,
}

function setWidth(width: number) {
  mockViewportWidth = width
}

describe("BuildingUnitBalancesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setWidth(390)
  })

  it("loads every API page in the server's stable unit-code order", async () => {
    searchMock
      .mockResolvedValueOnce({
        ...loadedPage,
        content: [loadedPage.content[0] ?? {}],
        last: false,
        numberOfElements: 1,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        ...loadedPage,
        content: [loadedPage.content[1] ?? {}],
        first: false,
        number: 1,
        numberOfElements: 1,
        totalPages: 2,
      })

    const sheet = await fetchAllBuildingUnitBalances("building-1")

    expect(searchMock).toHaveBeenNthCalledWith(
      1,
      { buildingId: "building-1", page: 0, size: 100 },
      undefined
    )
    expect(searchMock).toHaveBeenNthCalledWith(
      2,
      { buildingId: "building-1", page: 1, size: 100 },
      undefined
    )
    expect(sheet.rows.map((row) => row.buildingUnitCode)).toEqual([
      "A101",
      "A102",
    ])
  })

  it("shows a phone card for every mocked aggregate row", async () => {
    searchMock.mockResolvedValue(loadedPage)

    const { getAllByLabelText, getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    expect(await waitFor(() => getByText("A101"))).toBeTruthy()
    expect(getByText("A102")).toBeTruthy()
    expect(getAllByLabelText("Opening Capital")).toHaveLength(2)
    expect(getByText("-2.00")).toBeTruthy()
  })

  it("renders the loading state while the aggregate request is pending", async () => {
    searchMock.mockReturnValue(new Promise(() => undefined))

    const { getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    expect(getByText("Loading unit balances…")).toBeTruthy()
  })

  it("renders the tablet table layout from the same aggregate", async () => {
    setWidth(1024)
    searchMock.mockResolvedValue(loadedPage)

    const { getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    expect(await waitFor(() => getByText("A101"))).toBeTruthy()
    expect(getByText("Unit")).toBeTruthy()
    expect(getByText("Opening Monthly")).toBeTruthy()
  })

  it("submits every unit once and refetches the aggregate", async () => {
    searchMock.mockResolvedValue(loadedPage)
    updateMock.mockResolvedValue(undefined)

    const { getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    await waitFor(() => getByText("A101"))
    fireEvent.press(getByText("Save all"))

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith({
        buildingId: "building-1",
        referenceDate: "2025-12-31",
        balances: [
          { buildingUnitId: "unit-1", capital: 10, monthly: -5 },
          { buildingUnitId: "unit-2", capital: 0, monthly: 0 },
        ],
      })
    })
    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
    expect(getByText("All opening balances were saved.")).toBeTruthy()
  })

  it("renders the empty-building state", async () => {
    searchMock.mockResolvedValue({
      ...loadedPage,
      content: [],
      empty: true,
      numberOfElements: 0,
      totalElements: 0,
      totalPages: 0,
    })

    const { getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    expect(
      await waitFor(() => getByText("This building has no units yet."))
    ).toBeTruthy()
  })

  it("renders a retryable load error", async () => {
    searchMock.mockRejectedValue(new Error("Network unavailable"))

    const { getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    expect(await waitFor(() => getByText("Network unavailable"))).toBeTruthy()
    expect(getByText("Retry")).toBeTruthy()
  })

  it("keeps the editable form after a failed save", async () => {
    searchMock.mockResolvedValue(loadedPage)
    updateMock.mockRejectedValue(new Error("Save rejected"))

    const { getByText } = await render(
      <BuildingUnitBalancesScreen buildingId="building-1" />
    )

    await waitFor(() => getByText("A101"))
    fireEvent.press(getByText("Save all"))

    expect(await waitFor(() => getByText("Save rejected"))).toBeTruthy()
    expect(getByText("A101")).toBeTruthy()
    expect(searchMock).toHaveBeenCalledTimes(1)
  })
})
