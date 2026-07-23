"use client"

import {
  type RevenueResponseDto,
  type RevenueSearchRequestDto,
  RevenueSortOrderField,
  searchRevenues,
  useDeleteRevenue,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"

type CategoryRevenueFilters = Omit<
  RevenueSearchRequestDto,
  "page" | "size" | "sort"
>

/**
 * The revenues belonging to one category, embedded in the category's own screen.
 *
 * `categoryEditable` gates the **Add** button only: you cannot file a new
 * revenue under a system-default category (the server rejects it — see
 * `RevenueService.assertCategoryAssignable`), so offering Add there would be a
 * button that always fails.
 *
 * The per-row actions deliberately key off each **revenue's** own `editable`
 * flag rather than the category's. That is the correct source of truth in every
 * case, and it keeps this grid consistent with the main revenues list.
 */
export function CategoryRevenuesGrid({
  categoryId,
  categoryEditable,
}: Readonly<{ categoryId: string; categoryEditable: boolean }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.revenue
  )
  const deleteMutation = useDeleteRevenue()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        RevenueSortOrderField,
        CategoryRevenueFilters
      >
    ): Promise<RncGridData<RevenueResponseDto>> => {
      const payload: RevenueSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        // Scoped to this category, always — never overridable by a filter.
        revenueCategoryId: categoryId,
      }

      const apiResponse = await searchRevenues(payload, params.signal)
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
    [categoryId]
  )

  const columns: RncGridColumn<RevenueResponseDto, RevenueSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "code",
          header: t("revenue.list.columns.code"),
          minWidth: 90,
          sortable: true,
          sortKey: RevenueSortOrderField.CODE,
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "name",
          header: t("revenue.list.columns.name"),
          minWidth: 200,
          sortable: false,
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "description",
          header: t("revenue.list.columns.description"),
          minWidth: 200,
          sortable: false,
          type: "string",
          editable: false,
          priority: 3,
        },
        {
          key: "editable",
          header: t("revenue.list.columns.editable"),
          minWidth: 90,
          sortable: true,
          sortKey: RevenueSortOrderField.EDITABLE,
          type: "boolean",
          editable: false,
          priority: 4,
        },
      ],
      [t]
    )

  const actions: RncGridActions<RevenueResponseDto> = useMemo(
    () => ({
      view: {
        hidden: (row) => row.editable !== false,
        route: (row) => `/revenues/${row.id}`,
      },
      edit: {
        disabled: () => !canUpdate,
        hidden: (row) => !row.editable,
        route: (row) => `/revenues/${row.id}`,
      },
      delete: {
        disabled: () => !canDelete,
        hidden: (row) => !row.editable,
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("revenue.list.delete.title"),
          description: (row) =>
            t("revenue.list.delete.description", {
              name: row.name ?? row.code ?? row.id,
            }),
        },
      },
    }),
    [deleteMutation, t, canUpdate, canDelete]
  )

  return (
    <PermissionGuard permission={viewPermissions.revenue}>
      <View className="w-full gap-3">
        <Text className="font-semibold text-foreground text-xl">
          {t("revenueCategory.revenues.title")}
        </Text>

        <RncGrid<
          RevenueResponseDto,
          RevenueSortOrderField,
          CategoryRevenueFilters
        >
          id={`revenue-category-revenues-${categoryId}`}
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            { field: RevenueSortOrderField.CODE, direction: "ASC" },
          ]}
          initialPagination={{
            type: "default",
            pageSize: 10,
            pageNumber: 0,
            pageSizeOptions: [10, 25, 50],
          }}
          actions={actions}
          toolbar={{
            // Adding is only possible in a user-created category.
            ...(categoryEditable
              ? {
                  add: {
                    disabled: !canCreate,
                    route: `/revenues/new?categoryId=${categoryId}`,
                    label: t("revenueCategory.revenues.add"),
                  },
                }
              : {}),
            refresh: {},
          }}
          onNavigate={router.push}
        />
      </View>
    </PermissionGuard>
  )
}
