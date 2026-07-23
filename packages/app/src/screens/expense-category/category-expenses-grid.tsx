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

type CategoryExpenseFilters = Omit<
  ExpenseSearchRequestDto,
  "page" | "size" | "sort"
>

/**
 * The expenses belonging to one category, embedded in the category's own screen.
 *
 * `categoryEditable` gates the **Add** button only: you cannot file a new
 * expense under a system-default category (the server rejects it — see
 * `ExpenseService.assertCategoryAssignable`), so offering Add there would be a
 * button that always fails.
 *
 * The per-row actions deliberately key off each **expense's** own `editable`
 * flag rather than the category's. That is the correct source of truth in every
 * case, and it keeps this grid consistent with the main expenses list.
 */
export function CategoryExpensesGrid({
  categoryId,
  categoryEditable,
}: Readonly<{ categoryId: string; categoryEditable: boolean }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.expense
  )
  const deleteMutation = useDeleteExpense()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        ExpenseSortOrderField,
        CategoryExpenseFilters
      >
    ): Promise<RncGridData<ExpenseResponseDto>> => {
      const payload: ExpenseSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        // Scoped to this category, always — never overridable by a filter.
        expenseCategoryId: categoryId,
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
    [categoryId]
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
          key: "description",
          header: t("expense.list.columns.description"),
          minWidth: 200,
          sortable: false,
          type: "string",
          editable: false,
          priority: 3,
        },
        {
          key: "editable",
          header: t("expense.list.columns.editable"),
          minWidth: 90,
          sortable: true,
          sortKey: ExpenseSortOrderField.EDITABLE,
          type: "boolean",
          editable: false,
          priority: 4,
        },
      ],
      [t]
    )

  const actions: RncGridActions<ExpenseResponseDto> = useMemo(
    () => ({
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
      <View className="w-full gap-3">
        <Text className="font-semibold text-foreground text-xl">
          {t("expenseCategory.expenses.title")}
        </Text>

        <RncGrid<
          ExpenseResponseDto,
          ExpenseSortOrderField,
          CategoryExpenseFilters
        >
          id={`expense-category-expenses-${categoryId}`}
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
          toolbar={{
            // Adding is only possible in a user-created category.
            ...(categoryEditable
              ? {
                  add: {
                    disabled: !canCreate,
                    route: `/expenses/new?categoryId=${categoryId}`,
                    label: t("expenseCategory.expenses.add"),
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
