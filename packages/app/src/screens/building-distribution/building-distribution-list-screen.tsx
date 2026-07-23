"use client"

import {
  type BuildingDistributionResponseDto,
  type BuildingDistributionSearchRequestDto,
  BuildingDistributionSortOrderField,
  searchBuildingDistributions,
  useDeleteBuildingDistribution,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import {
  useAuth,
  useBreadcrumbs,
  useCrudPermissions,
} from "@workspace/providers"
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
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"

export interface BuildingDistributionListScreenProps {
  buildingId: string
}

type BuildingDistributionListFilters = Omit<
  BuildingDistributionSearchRequestDto,
  "page" | "size" | "sort" | "buildingId"
>

/**
 * The building's distribution tables — the percentage splits that decide how
 * each expense is shared across its units.
 *
 * Deleting one is guarded on the server: a table a budget month is billed
 * through cannot go, because those months would lose the split that decides what
 * each unit owes. The error surfaces here as the API message.
 */
export function BuildingDistributionListScreen({
  buildingId,
}: Readonly<BuildingDistributionListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.buildingDistribution
  )
  const deleteMutation = useDeleteBuildingDistribution()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("buildingDistribution.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingDistributionSortOrderField,
        BuildingDistributionListFilters
      >
    ): Promise<RncGridData<BuildingDistributionResponseDto>> => {
      const payload: BuildingDistributionSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        buildingId,
      }

      const apiResponse = await searchBuildingDistributions(
        payload,
        params.signal
      )
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
    BuildingDistributionResponseDto,
    BuildingDistributionSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "name",
        header: t("buildingDistribution.list.columns.name"),
        minWidth: 180,
        sortable: true,
        sortKey: BuildingDistributionSortOrderField.NAME,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "isDefault",
        header: t("buildingDistribution.list.columns.isDefault"),
        minWidth: 100,
        sortable: true,
        sortKey: BuildingDistributionSortOrderField.ISDEFAULT,
        type: "boolean",
        editable: false,
        priority: 2,
      },
      {
        key: "isHidden",
        header: t("buildingDistribution.list.columns.isHidden"),
        minWidth: 100,
        sortable: true,
        sortKey: BuildingDistributionSortOrderField.ISHIDDEN,
        type: "boolean",
        editable: false,
        priority: 3,
      },
    ],
    [t]
  )

  const filters = useMemo(
    () => (
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="name"
            label={t("buildingDistribution.list.filters.name")}
            placeholder={t("buildingDistribution.list.filters.namePlaceholder")}
          />
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingDistributionResponseDto> =
    useMemo(() => {
      const baseActions: RncGridActions<BuildingDistributionResponseDto> = {
        edit: {
          disabled: () => !canUpdate,
          route: (row) => `/buildings/${buildingId}/distributions/${row.id}`,
        },
      }

      if (isUserRole) {
        return baseActions
      }

      return {
        ...baseActions,
        delete: {
          disabled: () => !canDelete,
          onPress: async (row) => {
            if (!row.id) return
            await deleteMutation.mutateAsync({ id: row.id })
          },
          confirm: {
            title: t("buildingDistribution.list.delete.title"),
            description: (row) =>
              t("buildingDistribution.list.delete.description", {
                name: row.name ?? row.id,
              }),
          },
        },
      }
    }, [buildingId, deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.buildingDistribution}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <View className="flex-row items-center gap-3">
          <Button
            variant="ghost"
            onPress={() => router.push(`/buildings/${buildingId}`)}
          >
            {t("buildingDistribution.list.back")}
          </Button>
        </View>

        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("buildingDistribution.list.title")}
        </Text>

        <RncGrid<
          BuildingDistributionResponseDto,
          BuildingDistributionSortOrderField,
          BuildingDistributionListFilters
        >
          id="building-distribution-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: BuildingDistributionSortOrderField.NAME,
              direction: "ASC",
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
            add: {
              disabled: !canCreate,
              route: `/buildings/${buildingId}/distributions/new`,
              label: t("buildingDistribution.list.add"),
            },
            refresh: {},
            reset: {},
          }}
          onNavigate={router.push}
        />
      </View>
    </PermissionGuard>
  )
}
