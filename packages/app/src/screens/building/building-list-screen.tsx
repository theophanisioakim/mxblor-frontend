"use client"

import {
  type BuildingResponseDto,
  type BuildingSearchRequestDto,
  BuildingSortOrderField,
  SbfUserSortOrderField,
  searchBuildings,
  searchSbfUsers,
  useDeleteBuilding,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  RncCheckbox,
  RncDateTimeField,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncInput,
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"

const COUNTRY_OPTIONS = [
  { id: "CY", label: "Cyprus" },
  { id: "GR", label: "Greece" },
  { id: "GB", label: "United Kingdom" },
  { id: "DE", label: "Germany" },
  { id: "FR", label: "France" },
  { id: "IT", label: "Italy" },
  { id: "US", label: "United States" },
] as const

type BuildingListFilters = Omit<
  BuildingSearchRequestDto,
  "page" | "size" | "sort" | "startedAtFrom" | "startedAtTo"
> & {
  acquiredDate?: Date
}

function toAcquiredDayRange(date: Date | string | undefined) {
  if (!date) {
    return {}
  }

  const value = typeof date === "string" ? new Date(date) : date
  const start = new Date(value)
  start.setHours(0, 0, 0, 0)
  const end = new Date(value)
  end.setHours(23, 59, 59, 999)

  return {
    startedAtFrom: start.toISOString(),
    startedAtTo: end.toISOString(),
  }
}

export function BuildingListScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const deleteMutation = useDeleteBuilding()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingSortOrderField,
        BuildingListFilters
      >
    ): Promise<RncGridData<BuildingResponseDto>> => {
      const { acquiredDate, ...filterFields } = params.filters ?? {}
      const acquiredRange = toAcquiredDayRange(acquiredDate)

      const payload: BuildingSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...filterFields,
        ...acquiredRange,
      }

      const apiResponse = await searchBuildings(payload, params.signal)
      return {
        data: apiResponse.content ?? [],
        pagination: {
          isEmpty: apiResponse.empty ?? true,
          isFirst: apiResponse.first ?? true,
          isLast: apiResponse.last ?? true,
          currentPageNumber: apiResponse.number ?? 0,
          currentPageElementsSize: apiResponse.numberOfElements ?? 0,
          currentPageSize: apiResponse.size ?? 0,
          totalElements: apiResponse.totalElements ?? 0,
          totalPages: apiResponse.totalPages ?? 0,
        },
      }
    },
    []
  )

  const columns: RncGridColumn<BuildingResponseDto, BuildingSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "code",
          header: t("building.list.columns.code"),
          minWidth: 80,
          sortable: true,
          sortKey: BuildingSortOrderField.CODE,
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "name",
          header: t("building.list.columns.name"),
          minWidth: 140,
          sortable: true,
          sortKey: BuildingSortOrderField.NAME,
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "unitCount",
          header: t("building.list.columns.units"),
          minWidth: 70,
          sortable: false,
          type: "number",
          editable: false,
          priority: 3,
        },
        {
          key: "addressDisplay",
          header: t("building.list.columns.address"),
          minWidth: 180,
          sortable: false,
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "ownerUserName",
          header: t("building.list.columns.manager"),
          minWidth: 120,
          sortable: false,
          type: "string",
          editable: false,
          priority: 5,
        },
        {
          key: "emailAddress",
          header: t("building.list.columns.email"),
          minWidth: 140,
          sortable: true,
          sortKey: BuildingSortOrderField.EMAILADDRESS,
          type: "string",
          editable: false,
          priority: 6,
        },
        {
          key: "publishedAt",
          header: t("building.list.columns.published"),
          minWidth: 120,
          sortable: true,
          sortKey: BuildingSortOrderField.PUBLISHEDAT,
          type: "datetime",
          editable: false,
          priority: 7,
        },
        {
          key: "isActive",
          header: t("building.list.columns.active"),
          minWidth: 80,
          sortable: true,
          sortKey: BuildingSortOrderField.ISACTIVE,
          type: "boolean",
          editable: false,
          priority: 8,
        },
      ],
      [t]
    )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="code"
              label={t("building.list.filters.code")}
              placeholder={t("building.list.filters.codePlaceholder")}
            />
          </View>
          <View className="md:min-w-[200px] md:flex-[2]">
            <RncInput
              id="name"
              label={t("building.list.filters.name")}
              placeholder={t("building.list.filters.namePlaceholder")}
            />
          </View>
          <View className="md:min-w-[200px] md:flex-[2]">
            <RncInput
              id="emailAddress"
              label={t("building.list.filters.email")}
              placeholder={t("building.list.filters.emailPlaceholder")}
            />
          </View>
        </View>

        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[100px] md:flex-1">
            <RncInput
              id="addressNum"
              label={t("building.list.filters.number")}
              placeholder={t("building.list.filters.numberPlaceholder")}
            />
          </View>
          <View className="md:min-w-[180px] md:flex-[2]">
            <RncInput
              id="addressStreet"
              label={t("building.list.filters.street")}
              placeholder={t("building.list.filters.streetPlaceholder")}
            />
          </View>
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="addressPostcode"
              label={t("building.list.filters.postCode")}
              placeholder={t("building.list.filters.postCodePlaceholder")}
            />
          </View>
        </View>

        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[140px] md:flex-1">
            <RncInput
              id="addressRegion"
              label={t("building.list.filters.area")}
              placeholder={t("building.list.filters.areaPlaceholder")}
            />
          </View>
          <View className="md:min-w-[140px] md:flex-1">
            <RncInput
              id="addressCity"
              label={t("building.list.filters.city")}
              placeholder={t("building.list.filters.cityPlaceholder")}
            />
          </View>
          <View className="md:min-w-[180px] md:flex-1">
            <RncSelect
              id="countryCodes"
              label={t("building.list.filters.country")}
              placeholder={t("building.list.filters.countryPlaceholder")}
              multiple
              options={[...COUNTRY_OPTIONS]}
            />
          </View>
        </View>

        <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
          <View className="md:min-w-[180px] md:flex-1">
            <RncSelect
              id="ownerUserId"
              label={t("building.list.filters.manager")}
              placeholder={t("building.list.filters.managerPlaceholder")}
              searchable
              optionsLoader={async () => {
                const response = await searchSbfUsers({
                  page: 0,
                  size: 100,
                  sort: [
                    {
                      field: SbfUserSortOrderField.USERNAME,
                      direction: "ASC",
                    },
                  ],
                })
                return (response.content ?? [])
                  .filter((entry) => entry.id != null)
                  .map((entry) => ({
                    id: entry.id as string,
                    label: entry.username ?? String(entry.id),
                  }))
              }}
            />
          </View>
          <View className="md:min-w-[180px] md:flex-1">
            <RncDateTimeField
              id="acquiredDate"
              label={t("building.list.filters.acquiredDate")}
              type="date"
            />
          </View>
          <View className="md:min-w-[140px]">
            <RncCheckbox
              id="isActive"
              label={t("building.list.filters.active")}
              nullable
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingResponseDto> = useMemo(() => {
    const baseActions: RncGridActions<BuildingResponseDto> = {
      edit: {
        route: (row) => `/buildings/${row.id}`,
      },
    }

    if (isUserRole) {
      return baseActions
    }

    return {
      ...baseActions,
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("building.list.delete.title"),
          description: (row) =>
            t("building.list.delete.description", {
              name: row.name ?? row.code ?? row.id,
            }),
        },
      },
    }
  }, [deleteMutation, isUserRole, t])

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("building.list.title")}
      </Text>

      <RncGrid<BuildingResponseDto, BuildingSortOrderField, BuildingListFilters>
        id="building-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[{ field: BuildingSortOrderField.CODE, direction: "ASC" }]}
        initialPagination={{
          type: "default",
          pageSize: 10,
          pageNumber: 0,
          pageSizeOptions: [10, 25, 50],
        }}
        actions={actions}
        filters={{ render: filters }}
        toolbar={{
          add: {
            route: "/buildings/new",
            label: t("building.list.add"),
          },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
