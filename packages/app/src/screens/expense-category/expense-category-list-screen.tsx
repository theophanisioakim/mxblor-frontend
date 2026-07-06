"use client"

import {
  type ExpenseCategoryResponseDto,
  type ExpenseCategorySearchRequestDto,
  ExpenseCategorySortOrderField,
  searchExpenseCategorys,
  useDeleteExpenseCategory,
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

type ExpenseCategoryListFilters = Omit<
  ExpenseCategorySearchRequestDto,
  "page" | "size" | "sort"
>

export function ExpenseCategoryListScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const deleteMutation = useDeleteExpenseCategory()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        ExpenseCategorySortOrderField,
        ExpenseCategoryListFilters
      >
    ): Promise<RncGridData<ExpenseCategoryResponseDto>> => {
      const payload: ExpenseCategorySearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
      }

      const apiResponse = await searchExpenseCategorys(payload, params.signal)
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
    ExpenseCategoryResponseDto,
    ExpenseCategorySortOrderField
  >[] = useMemo(
    () => [
      {
        key: "code",
        header: t("expenseCategory.list.columns.code"),
        minWidth: 90,
        sortable: true,
        sortKey: ExpenseCategorySortOrderField.CODE,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "name",
        header: t("expenseCategory.list.columns.name"),
        minWidth: 200,
        sortable: false,
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "description",
        header: t("expenseCategory.list.columns.description"),
        minWidth: 220,
        sortable: false,
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "editable",
        header: t("expenseCategory.list.columns.editable"),
        minWidth: 90,
        sortable: true,
        sortKey: ExpenseCategorySortOrderField.EDITABLE,
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
              label={t("expenseCategory.list.filters.code")}
              placeholder={t("expenseCategory.list.filters.codePlaceholder")}
            />
          </View>
          <View className="md:min-w-[160px]">
            <RncCheckbox
              id="editable"
              label={t("expenseCategory.list.filters.editable")}
              nullable
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<ExpenseCategoryResponseDto> = useMemo(
    () => ({
      // Seeded (editable=false) categories are system defaults: view-only, no
      // delete. Only user-created (editable=true) categories can be removed.
      delete: {
        hidden: (row) => !row.editable,
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("expenseCategory.list.delete.title"),
          description: (row) =>
            t("expenseCategory.list.delete.description", {
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
        {t("expenseCategory.list.title")}
      </Text>

      <RncGrid<
        ExpenseCategoryResponseDto,
        ExpenseCategorySortOrderField,
        ExpenseCategoryListFilters
      >
        id="expense-category-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: ExpenseCategorySortOrderField.CODE, direction: "ASC" },
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
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
