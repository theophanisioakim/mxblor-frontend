import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render } from "@testing-library/react-native"
import { EditBuildingScreen } from "@workspace/app"

const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()
const mockRefetchHubSummary = jest.fn()

const mockBuilding = {
  id: "building-1",
  version: 1,
  code: "BLD-1",
  name: "Test Building",
  isActive: true,
  emailTransmission: false,
  smsTransmission: false,
  address: {
    street: "Test Street",
    city: "Nicosia",
    countryCode: "CY",
  },
}

const mockLoadedSummary = {
  buildingUnitCount: 1,
  unitBalanceCount: 2,
  relatedPersonCount: 3,
  communicationCount: 0,
  noteCount: 5,
  distributionCount: 6,
  yearlyBudgetCount: 7,
  bankAccountCount: 8,
  bankAccountBalance: 950.25,
  currentExpenseCount: 9,
  currentExpenseTotal: 500,
  paymentCount: 10,
  paymentOutstanding: 125,
  collectionCount: 11,
  collectionOutstanding: -30,
}

let mockHubState = {
  data: mockLoadedSummary as typeof mockLoadedSummary | undefined,
  isError: false,
  isFetching: false,
  isLoading: false,
}

jest.mock("@workspace/api-client", () => ({
  SbfUserSortOrderField: { USERNAME: "USERNAME" },
  searchSbfUsers: jest.fn(() => Promise.resolve({ content: [] })),
  useDeleteBuilding: () => ({ mutateAsync: jest.fn() }),
  useGetBuildingById: () => ({
    data: mockBuilding,
    error: undefined,
    isError: false,
    isLoading: false,
  }),
  useGetBuildingHubSummary: () => ({
    ...mockHubState,
    refetch: mockRefetchHubSummary,
  }),
  useUpdateBuilding: () => ({ mutateAsync: jest.fn() }),
}))

jest.mock("@workspace/providers", () => ({
  useAuth: () => ({ user: { roleDescriptions: ["admin"] } }),
  useCrudPermissions: () => ({
    canCreate: true,
    canDelete: true,
    canUpdate: true,
  }),
  usePermission: () => ({
    hasPermission: () => true,
    isResolved: true,
  }),
}))

jest.mock("@workspace/router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
}))

jest.mock("@workspace/i18n", () => {
  const translations: Record<string, string> = {
    "building.create.sections.identity": "Identity",
    "building.edit.back": "Back",
    "building.edit.delete": "Delete Building",
    "building.edit.manage": "Manage",
    "building.edit.metrics.balance": "Balance",
    "building.edit.metrics.outstanding": "Outstanding",
    "building.edit.metrics.total": "Total",
    "building.edit.save": "Save Changes",
    "building.edit.summaryLoadError":
      "The management summary could not be loaded.",
    "building.edit.summaryLoading": "Loading management summary…",
    "building.edit.summaryRetry": "Retry",
    "building.edit.tiles.bankAccounts": "Bank accounts",
    "building.edit.tiles.budgets": "Yearly budget",
    "building.edit.tiles.collections": "Collections",
    "building.edit.tiles.communication": "Communication",
    "building.edit.tiles.currentExpenses": "Current expenses",
    "building.edit.tiles.distributions": "Distribution tables",
    "building.edit.tiles.notes": "Notes",
    "building.edit.tiles.payments": "Payments",
    "building.edit.tiles.relatedPeople": "Related people",
    "building.edit.tiles.unitBalances": "Unit balances",
    "building.edit.tiles.units": "Building units",
  }
  const t = (key: string) => translations[key] ?? key
  return {
    useTranslation: () => ({ i18n: { language: "en" }, t }),
  }
})

jest.mock("@workspace/app/screens/building/building-form-fields", () => {
  return {
    BUILDING_FORM_DEFAULTS: {},
    BuildingFormFields: () => null,
    toBuildingPayload: (values: unknown) => values,
  }
})

describe("EditBuildingScreen management hub", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHubState = {
      data: mockLoadedSummary,
      isError: false,
      isFetching: false,
      isLoading: false,
    }
  })

  it("shows every count and the four financial totals above the form", async () => {
    const { getByLabelText, getByText, toJSON } = await render(
      <EditBuildingScreen id="building-1" />
    )

    expect(getByLabelText("Building units, 1")).toBeTruthy()
    expect(getByLabelText("Unit balances, 2")).toBeTruthy()
    expect(getByLabelText("Related people, 3")).toBeTruthy()
    expect(getByLabelText("Communication, 0")).toBeTruthy()
    expect(getByLabelText("Notes, 5")).toBeTruthy()
    expect(getByLabelText("Distribution tables, 6")).toBeTruthy()
    expect(getByLabelText("Yearly budget, 7")).toBeTruthy()
    expect(getByLabelText("Bank accounts, 8, Balance: €950.25")).toBeTruthy()
    expect(getByLabelText("Current expenses, 9, Total: €500.00")).toBeTruthy()
    expect(getByLabelText("Payments, 10, Outstanding: €125.00")).toBeTruthy()
    expect(getByLabelText("Collections, 11, Outstanding: -€30.00")).toBeTruthy()

    const rendered = JSON.stringify(toJSON())
    expect(rendered.indexOf("Manage")).toBeLessThan(
      rendered.indexOf("Save Changes")
    )
    expect(getByText("Save Changes")).toBeTruthy()
  })

  it("navigates from a tile without submitting the form", async () => {
    const { getByLabelText } = await render(
      <EditBuildingScreen id="building-1" />
    )

    await fireEvent.press(getByLabelText("Building units, 1"))

    expect(mockRouterPush).toHaveBeenCalledWith("/buildings/building-1/units")
  })

  it("keeps the form and navigation available while the summary loads", async () => {
    mockHubState = {
      data: undefined,
      isError: false,
      isFetching: true,
      isLoading: true,
    }

    const { getAllByText, getByLabelText, getByText } = await render(
      <EditBuildingScreen id="building-1" />
    )

    expect(getByText("Loading management summary…")).toBeTruthy()
    expect(getAllByText("—")).toHaveLength(11)
    expect(getByText("Save Changes")).toBeTruthy()

    await fireEvent.press(getByLabelText("Building units, —"))
    expect(mockRouterPush).toHaveBeenCalledWith("/buildings/building-1/units")
  })

  it("offers retry after a summary failure without hiding the form or tiles", async () => {
    mockHubState = {
      data: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
    }

    const { getByLabelText, getByText } = await render(
      <EditBuildingScreen id="building-1" />
    )

    expect(
      getByText("The management summary could not be loaded.")
    ).toBeTruthy()
    expect(getByText("Save Changes")).toBeTruthy()

    await fireEvent.press(getByText("Retry"))
    expect(mockRefetchHubSummary).toHaveBeenCalledTimes(1)

    await fireEvent.press(getByLabelText("Building units, —"))
    expect(mockRouterPush).toHaveBeenCalledWith("/buildings/building-1/units")
  })
})
