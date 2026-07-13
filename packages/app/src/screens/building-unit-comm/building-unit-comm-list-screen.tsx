"use client"

import {
  type BuildingUnitCommResponseDto,
  type BuildingUnitCommSearchRequestDto,
  BuildingUnitCommSortOrderField,
  searchBuildingUnitComms,
  useDeleteBuildingUnitComm,
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

type CommFilters = Omit<
  BuildingUnitCommSearchRequestDto,
  "page" | "size" | "sort"
>

export function BuildingUnitCommListScreen({
  buildingId,
}: Readonly<{ buildingId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const deleteMutation = useDeleteBuildingUnitComm()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false
  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("communication.list.title") },
    ])
  }, [setItems, t, building, buildingId])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingUnitCommSortOrderField,
        CommFilters
      >
    ): Promise<RncGridData<BuildingUnitCommResponseDto>> => {
      const payload: BuildingUnitCommSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        buildingId,
      }

      const apiResponse = await searchBuildingUnitComms(payload, params.signal)
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
    BuildingUnitCommResponseDto,
    BuildingUnitCommSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "buildingUnitCode",
        header: t("communication.list.columns.unit"),
        minWidth: 110,
        sortable: false,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "contactName",
        header: t("communication.list.columns.contact"),
        minWidth: 180,
        sortable: false,
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "contactedAt",
        header: t("communication.list.columns.contactedAt"),
        minWidth: 160,
        sortable: true,
        sortKey: BuildingUnitCommSortOrderField.CONTACTEDAT,
        type: "datetime",
        editable: false,
        priority: 3,
      },
      {
        key: "description",
        header: t("communication.list.columns.description"),
        minWidth: 260,
        sortable: true,
        sortKey: BuildingUnitCommSortOrderField.DESCRIPTION,
        type: "string",
        editable: false,
        priority: 4,
      },
    ],
    [t]
  )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
          <View className="md:min-w-[220px] md:flex-1">
            <RncInput
              id="description"
              label={t("communication.list.filters.description")}
              placeholder={t(
                "communication.list.filters.descriptionPlaceholder"
              )}
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingUnitCommResponseDto> = useMemo(() => {
    const base: RncGridActions<BuildingUnitCommResponseDto> = {
      edit: {
        route: (row) => `/buildings/${buildingId}/communication/${row.id}`,
      },
    }
    if (isUserRole) return base

    return {
      ...base,
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("communication.list.delete.title"),
          description: t("communication.list.delete.description"),
        },
      },
    }
  }, [buildingId, deleteMutation, isUserRole, t])

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("communication.list.title")}
        </Text>
        <Button
          variant="ghost"
          onPress={() => router.push(`/buildings/${buildingId}`)}
        >
          <Text>{t("communication.list.back")}</Text>
        </Button>
      </View>

      <RncGrid<
        BuildingUnitCommResponseDto,
        BuildingUnitCommSortOrderField,
        CommFilters
      >
        id={`building-unit-comm-list-${buildingId}`}
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          {
            field: BuildingUnitCommSortOrderField.CONTACTEDAT,
            direction: "DESC",
          },
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
          add: { route: `/buildings/${buildingId}/communication/new` },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
