"use client"

import {
  type ExpenseResponseDto,
  type ExpenseSearchRequestDto,
  ExpenseSortOrderField,
  searchExpenses,
  useDeleteExpense,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCrudPermissions } from "@workspace/providers"
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
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"
import { useExpenseCategoryOptions } from "./use-expense-category-options"

type ExpenseListFilters = Omit<
  ExpenseSearchRequestDto,
  "page" | "size" | "sort"
>

export function ExpenseListScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.expense
  )
  const deleteMutation = useDeleteExpense()
  const { options: categoryOptions, byId: categoriesById } =
    useExpenseCategoryOptions()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<ExpenseSortOrderField, ExpenseListFilters>
    ): Promise<RncGridData<ExpenseResponseDto>> => {
      const payload: ExpenseSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
      }

      const apiResponse = await searchExpenses(payload, params.signal)
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

  const columns: RncGridColumn<ExpenseResponseDto, ExpenseSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "code",
          header: t("expense.list.columns.code"),
          minWidth: 90,
          sortable: true,
          sortKey: ExpenseSortOrderField.CODE,
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "name",
          header: t("expense.list.columns.name"),
          minWidth: 200,
          sortable: false,
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "category",
          header: t("expense.list.columns.category"),
          minWidth: 180,
          sortable: false,
          type: "string",
          editable: false,
          priority: 3,
          renderCell: (row) => (
            <Text className="text-foreground text-sm">
              {row.expenseCategoryId
                ? (categoriesById.get(row.expenseCategoryId) ?? "")
                : ""}
            </Text>
          ),
        },
        {
          key: "description",
          header: t("expense.list.columns.description"),
          minWidth: 200,
          sortable: false,
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "editable",
          header: t("expense.list.columns.editable"),
          minWidth: 90,
          sortable: true,
          sortKey: ExpenseSortOrderField.EDITABLE,
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
              label={t("expense.list.filters.code")}
              placeholder={t("expense.list.filters.codePlaceholder")}
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncSelect
              id="expenseCategoryId"
              label={t("expense.list.filters.category")}
              placeholder={t("expense.list.filters.categoryPlaceholder")}
              searchable
              options={categoryOptions}
            />
          </View>
          <View className="md:min-w-[160px]">
            <RncCheckbox
              id="editable"
              label={t("expense.list.filters.editable")}
              nullable
            />
          </View>
        </View>
      </View>
    ),
    [t, categoryOptions]
  )

  const actions: RncGridActions<ExpenseResponseDto> = useMemo(
    () => ({
      // Seeded (editable=false) expenses are system defaults: view-only, no
      // edit and no delete. Only user-created (editable=true) expenses can be
      // changed or removed.
      //
      // View and Edit deliberately point at the same route: the form reads the
      // expense's own `editable` flag and renders itself read-only when it is
      // false, so a locked row needs no separate screen — only a different icon.
      view: {
        hidden: (row) => row.editable !== false,
        route: (row) => `/expenses/${row.id}`,
      },
      edit: {
        disabled: () => !canUpdate,
        hidden: (row) => !row.editable,
        route: (row) => `/expenses/${row.id}`,
      },
      delete: {
        disabled: () => !canDelete,
        hidden: (row) => !row.editable,
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("expense.list.delete.title"),
          description: (row) =>
            t("expense.list.delete.description", {
              name: row.name ?? row.code ?? row.id,
            }),
        },
      },
    }),
    [deleteMutation, t, canUpdate, canDelete]
  )

  return (
    <PermissionGuard permission={viewPermissions.expense}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("expense.list.title")}
        </Text>

        <RncGrid<ExpenseResponseDto, ExpenseSortOrderField, ExpenseListFilters>
          id="expense-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            { field: ExpenseSortOrderField.CODE, direction: "ASC" },
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
              route: "/expenses/new",
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
