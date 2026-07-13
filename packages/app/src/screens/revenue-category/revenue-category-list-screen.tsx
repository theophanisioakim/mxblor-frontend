"use client"

import {
  type RevenueCategoryResponseDto,
  type RevenueCategorySearchRequestDto,
  RevenueCategorySortOrderField,
  searchRevenueCategorys,
  useDeleteRevenueCategory,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useRouter } from "@workspace/router"
import {
  RncCheckbox,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"

type RevenueCategoryListFilters = Omit<
  RevenueCategorySearchRequestDto,
  "page" | "size" | "sort"
>

export function RevenueCategoryListScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const deleteMutation = useDeleteRevenueCategory()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        RevenueCategorySortOrderField,
        RevenueCategoryListFilters
      >
    ): Promise<RncGridData<RevenueCategoryResponseDto>> => {
      const payload: RevenueCategorySearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
      }

      const apiResponse = await searchRevenueCategorys(payload, params.signal)
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

  const columns: RncGridColumn<
    RevenueCategoryResponseDto,
    RevenueCategorySortOrderField
  >[] = useMemo(
    () => [
      {
        key: "code",
        header: t("revenueCategory.list.columns.code"),
        minWidth: 90,
        sortable: true,
        sortKey: RevenueCategorySortOrderField.CODE,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "name",
        header: t("revenueCategory.list.columns.name"),
        minWidth: 200,
        sortable: false,
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "description",
        header: t("revenueCategory.list.columns.description"),
        minWidth: 220,
        sortable: false,
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "editable",
        header: t("revenueCategory.list.columns.editable"),
        minWidth: 90,
        sortable: true,
        sortKey: RevenueCategorySortOrderField.EDITABLE,
        type: "boolean",
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
          <View className="md:min-w-[160px] md:flex-1">
            <RncInput
              id="code"
              label={t("revenueCategory.list.filters.code")}
              placeholder={t("revenueCategory.list.filters.codePlaceholder")}
            />
          </View>
          <View className="md:min-w-[160px]">
            <RncCheckbox
              id="editable"
              label={t("revenueCategory.list.filters.editable")}
              nullable
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<RevenueCategoryResponseDto> = useMemo(
    () => ({
      // Seeded (editable=false) categories are system defaults: view-only, no
      // edit and no delete. Only user-created (editable=true) categories can be
      // changed or removed.
      //
      // View and Edit share a route: the form reads the category's own
      // `editable` flag and renders itself read-only when it is false.
      view: {
        hidden: (row) => row.editable !== false,
        route: (row) => `/revenues/categories/${row.id}`,
      },
      edit: {
        hidden: (row) => !row.editable,
        route: (row) => `/revenues/categories/${row.id}`,
      },
      delete: {
        hidden: (row) => !row.editable,
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("revenueCategory.list.delete.title"),
          description: (row) =>
            t("revenueCategory.list.delete.description", {
              name: row.name ?? row.code ?? row.id,
            }),
        },
      },
    }),
    [deleteMutation, t]
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("revenueCategory.list.title")}
      </Text>

      <RncGrid<
        RevenueCategoryResponseDto,
        RevenueCategorySortOrderField,
        RevenueCategoryListFilters
      >
        id="revenue-category-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: RevenueCategorySortOrderField.CODE, direction: "ASC" },
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
            route: "/revenues/categories/new",
          },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
