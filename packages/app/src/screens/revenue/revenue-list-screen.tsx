"use client"

import {
  type RevenueResponseDto,
  type RevenueSearchRequestDto,
  RevenueSortOrderField,
  searchRevenues,
  useDeleteRevenue,
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
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { useRevenueCategoryOptions } from "./use-revenue-category-options"

type RevenueListFilters = Omit<
  RevenueSearchRequestDto,
  "page" | "size" | "sort"
>

export function RevenueListScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const deleteMutation = useDeleteRevenue()
  const { options: categoryOptions, byId: categoriesById } =
    useRevenueCategoryOptions()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<RevenueSortOrderField, RevenueListFilters>
    ): Promise<RncGridData<RevenueResponseDto>> => {
      const payload: RevenueSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
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
    []
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
          key: "category",
          header: t("revenue.list.columns.category"),
          minWidth: 180,
          sortable: false,
          type: "string",
          editable: false,
          priority: 3,
          renderCell: (row) => (
            <Text className="text-foreground text-sm">
              {row.revenueCategoryId
                ? (categoriesById.get(row.revenueCategoryId) ?? "")
                : ""}
            </Text>
          ),
        },
        {
          key: "description",
          header: t("revenue.list.columns.description"),
          minWidth: 200,
          sortable: false,
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "editable",
          header: t("revenue.list.columns.editable"),
          minWidth: 90,
          sortable: true,
          sortKey: RevenueSortOrderField.EDITABLE,
          type: "boolean",
          editable: false,
          priority: 5,
        },
      ],
      [t, categoriesById]
    )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
          <View className="md:min-w-[160px] md:flex-1">
            <RncInput
              id="code"
              label={t("revenue.list.filters.code")}
              placeholder={t("revenue.list.filters.codePlaceholder")}
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncSelect
              id="revenueCategoryId"
              label={t("revenue.list.filters.category")}
              placeholder={t("revenue.list.filters.categoryPlaceholder")}
              searchable
              options={categoryOptions}
            />
          </View>
          <View className="md:min-w-[160px]">
            <RncCheckbox
              id="editable"
              label={t("revenue.list.filters.editable")}
              nullable
            />
          </View>
        </View>
      </View>
    ),
    [t, categoryOptions]
  )

  const actions: RncGridActions<RevenueResponseDto> = useMemo(
    () => ({
      // Seeded (editable=false) revenues are system defaults: view-only, no
      // edit and no delete. Only user-created (editable=true) revenues can be
      // changed or removed.
      //
      // View and Edit deliberately point at the same route: the form reads the
      // revenue's own `editable` flag and renders itself read-only when it is
      // false, so a locked row needs no separate screen — only a different icon.
      view: {
        hidden: (row) => row.editable !== false,
        route: (row) => `/revenues/${row.id}`,
      },
      edit: {
        hidden: (row) => !row.editable,
        route: (row) => `/revenues/${row.id}`,
      },
      delete: {
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
    [deleteMutation, t]
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("revenue.list.title")}
      </Text>

      <RncGrid<RevenueResponseDto, RevenueSortOrderField, RevenueListFilters>
        id="revenue-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[{ field: RevenueSortOrderField.CODE, direction: "ASC" }]}
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
            route: "/revenues/new",
          },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
