"use client"

import {
  type BuildingYearlyBudgetResponseDto,
  type BuildingYearlyBudgetSearchRequestDto,
  BuildingYearlyBudgetSortOrderField,
  searchBuildingYearlyBudgets,
  useDeleteBuildingYearlyBudget,
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
  RncDateTimeField,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo } from "react"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"

export interface BuildingYearlyBudgetListScreenProps {
  buildingId: string
}

/**
 * The Year filter is a single year, but the API filters `refYear` — a DATE — by
 * range. So one picked year becomes the range Jan 1 … Dec 31 of that year.
 */
type BuildingYearlyBudgetListFilters = {
  refYear?: Date | string
}

function yearOf(value: Date | string): number {
  return new Date(value).getFullYear()
}

export function BuildingYearlyBudgetListScreen({
  buildingId,
}: Readonly<BuildingYearlyBudgetListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.buildingYearlyBudget
  )
  const deleteMutation = useDeleteBuildingYearlyBudget()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("yearlyBudget.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingYearlyBudgetSortOrderField,
        BuildingYearlyBudgetListFilters
      >
    ): Promise<RncGridData<BuildingYearlyBudgetResponseDto>> => {
      const { refYear } = params.filters ?? {}

      const payload: BuildingYearlyBudgetSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        buildingId,
      }

      if (refYear) {
        const year = yearOf(refYear)
        payload.refYearFrom = `${year}-01-01`
        payload.refYearTo = `${year}-12-31`
      }

      const apiResponse = await searchBuildingYearlyBudgets(
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
    BuildingYearlyBudgetResponseDto,
    BuildingYearlyBudgetSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "refYear",
        header: t("yearlyBudget.list.columns.year"),
        minWidth: 120,
        sortable: true,
        sortKey: BuildingYearlyBudgetSortOrderField.REFYEAR,
        type: "string",
        editable: false,
        priority: 1,
        // The record stores Jan 1 of the year; only the year is meaningful.
        renderCell: (row) => (row.refYear ? String(yearOf(row.refYear)) : ""),
      },
      {
        key: "totalAmount",
        header: t("yearlyBudget.list.columns.total"),
        minWidth: 140,
        // Computed from the twelve months, so there is no column to sort on.
        sortable: false,
        type: "number",
        editable: false,
        priority: 2,
      },
    ],
    [t]
  )

  const filters = useMemo(
    () => (
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncDateTimeField
            id="refYear"
            type="year"
            label={t("yearlyBudget.list.filters.year")}
          />
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingYearlyBudgetResponseDto> =
    useMemo(() => {
      const baseActions: RncGridActions<BuildingYearlyBudgetResponseDto> = {
        edit: {
          disabled: () => !canUpdate,
          route: (row) => `/buildings/${buildingId}/budgets/${row.id}`,
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
            title: t("yearlyBudget.list.delete.title"),
            description: (row) =>
              t("yearlyBudget.list.delete.description", {
                year: row.refYear ? yearOf(row.refYear) : "",
              }),
          },
        },
      }
    }, [buildingId, deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.buildingYearlyBudget}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <View className="flex-row items-center gap-3">
          <Button
            variant="ghost"
            onPress={() => router.push(`/buildings/${buildingId}`)}
          >
            {t("yearlyBudget.list.back")}
          </Button>
        </View>

        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("yearlyBudget.list.title")}
        </Text>

        <RncGrid<
          BuildingYearlyBudgetResponseDto,
          BuildingYearlyBudgetSortOrderField,
          BuildingYearlyBudgetListFilters
        >
          id="building-yearly-budget-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: BuildingYearlyBudgetSortOrderField.REFYEAR,
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
            add: {
              disabled: !canCreate,
              route: `/buildings/${buildingId}/budgets/new`,
              label: t("yearlyBudget.list.add"),
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
