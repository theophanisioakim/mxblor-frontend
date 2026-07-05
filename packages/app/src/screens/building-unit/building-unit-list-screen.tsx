"use client"

import {
  type BuildingUnitResponseDto,
  type BuildingUnitSearchRequestDto,
  BuildingUnitSortOrderField,
  searchBuildingUnits,
  useDeleteBuildingUnit,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth, useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo } from "react"

export interface BuildingUnitListScreenProps {
  buildingId: string
}

type BuildingUnitListFilters = Omit<
  BuildingUnitSearchRequestDto,
  "page" | "size" | "sort" | "buildingId"
>

export function BuildingUnitListScreen({
  buildingId,
}: Readonly<BuildingUnitListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const deleteMutation = useDeleteBuildingUnit()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("buildingUnit.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingUnitSortOrderField,
        BuildingUnitListFilters
      >
    ): Promise<RncGridData<BuildingUnitResponseDto>> => {
      const payload: BuildingUnitSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        buildingId,
      }

      const apiResponse = await searchBuildingUnits(payload, params.signal)
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
    [buildingId]
  )

  const columns: RncGridColumn<
    BuildingUnitResponseDto,
    BuildingUnitSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "code",
        header: t("buildingUnit.list.columns.code"),
        minWidth: 90,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.CODE,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "confinedSpace",
        header: t("buildingUnit.list.columns.confinedSpace"),
        minWidth: 110,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.CONFINEDSPACE,
        type: "number",
        editable: false,
        priority: 2,
      },
      {
        key: "coveredTerraces",
        header: t("buildingUnit.list.columns.coveredTerraces"),
        minWidth: 110,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.COVEREDTERRACES,
        type: "number",
        editable: false,
        priority: 3,
      },
      {
        key: "uncoveredTerraces",
        header: t("buildingUnit.list.columns.uncoveredTerraces"),
        minWidth: 120,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.UNCOVEREDTERRACES,
        type: "number",
        editable: false,
        priority: 4,
      },
      {
        key: "storeRoom",
        header: t("buildingUnit.list.columns.storeRoom"),
        minWidth: 100,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.STOREROOM,
        type: "number",
        editable: false,
        priority: 5,
      },
      {
        key: "roofGardens",
        header: t("buildingUnit.list.columns.roofGardens"),
        minWidth: 100,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.ROOFGARDENS,
        type: "number",
        editable: false,
        priority: 6,
      },
      {
        key: "floor",
        header: t("buildingUnit.list.columns.floor"),
        minWidth: 80,
        sortable: true,
        sortKey: BuildingUnitSortOrderField.FLOOR,
        type: "number",
        editable: false,
        priority: 7,
      },
      {
        key: "ownerNames",
        header: t("buildingUnit.list.columns.owner"),
        minWidth: 140,
        sortable: false,
        type: "string",
        editable: false,
        priority: 8,
      },
      {
        key: "tenantNames",
        header: t("buildingUnit.list.columns.tenant"),
        minWidth: 140,
        sortable: false,
        type: "string",
        editable: false,
        priority: 9,
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
              label={t("buildingUnit.list.filters.code")}
              placeholder={t("buildingUnit.list.filters.codePlaceholder")}
            />
          </View>
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="confinedSpace"
              type="number"
              label={t("buildingUnit.list.filters.confinedSpace")}
            />
          </View>
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="coveredTerraces"
              type="number"
              label={t("buildingUnit.list.filters.coveredTerraces")}
            />
          </View>
        </View>

        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="uncoveredTerraces"
              type="number"
              label={t("buildingUnit.list.filters.uncoveredTerraces")}
            />
          </View>
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="storeRoom"
              type="number"
              label={t("buildingUnit.list.filters.storeRoom")}
            />
          </View>
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="roofGardens"
              type="number"
              label={t("buildingUnit.list.filters.roofGardens")}
            />
          </View>
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="floor"
              type="number"
              label={t("buildingUnit.list.filters.floor")}
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingUnitResponseDto> = useMemo(() => {
    const baseActions: RncGridActions<BuildingUnitResponseDto> = {
      edit: {
        route: (row) => `/buildings/${buildingId}/units/${row.id}`,
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
          title: t("buildingUnit.list.delete.title"),
          description: (row) =>
            t("buildingUnit.list.delete.description", {
              code: row.code ?? row.id,
            }),
        },
      },
    }
  }, [buildingId, deleteMutation, isUserRole, t])

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <View className="flex-row items-center gap-3">
        <Button variant="ghost" onPress={() => router.push("/buildings")}>
          {t("buildingUnit.list.back")}
        </Button>
      </View>

      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("buildingUnit.list.title")}
      </Text>

      <RncGrid<
        BuildingUnitResponseDto,
        BuildingUnitSortOrderField,
        BuildingUnitListFilters
      >
        id="building-unit-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: BuildingUnitSortOrderField.FLOOR, direction: "ASC" },
        ]}
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
            route: `/buildings/${buildingId}/units/new`,
            label: t("buildingUnit.list.add"),
          },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
