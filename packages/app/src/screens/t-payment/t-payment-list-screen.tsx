"use client"

import {
  searchTPayments,
  type TPaymentResponseDto,
  type TPaymentSearchRequestDto,
  TPaymentSortOrderField,
  useDeleteTPayment,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth, useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncDateTimeField,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo } from "react"
import { useExpenseCatalogOptions } from "../t-expense/use-expense-catalog-options"

export interface TPaymentListScreenProps {
  buildingId: string
}

type TPaymentListFilters = {
  year?: Date | string
  expenseId?: string
}

function yearOf(value: Date | string): number {
  return new Date(value).getFullYear()
}

function formatReferenceMonth(value: string | undefined): string {
  if (!value) {
    return ""
  }
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getFullYear()}`
}

function formatAmount(value: number | undefined): string {
  if (value == null) {
    return ""
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Flat list of a building's payments — standalone balance-sheet rows, not
 * linked to a t_expense picker or expense detail screen.
 */
export function TPaymentListScreen({
  buildingId,
}: Readonly<TPaymentListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const deleteMutation = useDeleteTPayment()
  const expenseCatalog = useExpenseCatalogOptions()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("tPayment.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        TPaymentSortOrderField,
        TPaymentListFilters
      >
    ): Promise<RncGridData<TPaymentResponseDto>> => {
      const { year, expenseId } = params.filters ?? {}

      const payload: TPaymentSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        buildingId,
        expenseId: expenseId || undefined,
      }

      if (year) {
        const y = yearOf(year)
        payload.referenceDateFrom = `${y}-01-01`
        payload.referenceDateTo = `${y}-12-31`
      }

      const apiResponse = await searchTPayments(payload, params.signal)
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

  const columns: RncGridColumn<TPaymentResponseDto, TPaymentSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "referenceDate",
          header: t("tPayment.list.columns.period"),
          minWidth: 110,
          sortable: true,
          sortKey: TPaymentSortOrderField.REFERENCEDATE,
          type: "string",
          editable: false,
          priority: 1,
          renderCell: (row) => formatReferenceMonth(row.referenceDate),
        },
        {
          key: "expenseId",
          header: t("tPayment.list.columns.expense"),
          minWidth: 180,
          sortable: false,
          type: "string",
          editable: false,
          priority: 2,
          renderCell: (row) =>
            row.expenseId
              ? (expenseCatalog.byId.get(row.expenseId) ?? row.expenseId)
              : "",
        },
        // The two sides of the balance sheet. A credit is what we owe the supplier (raised by an
        // expense); a debit is what we have paid out against it. What remains is the difference —
        // never a stored "outstanding" field, and it may legitimately be negative.
        {
          key: "creditAmount",
          header: t("tPayment.list.columns.creditAmount"),
          minWidth: 120,
          sortable: true,
          sortKey: TPaymentSortOrderField.CREDITAMOUNT,
          type: "number",
          editable: false,
          priority: 3,
          renderCell: (row) => formatAmount(row.creditAmount),
        },
        {
          key: "debitAmount",
          header: t("tPayment.list.columns.debitAmount"),
          minWidth: 120,
          sortable: true,
          sortKey: TPaymentSortOrderField.DEBITAMOUNT,
          type: "number",
          editable: false,
          priority: 3,
          renderCell: (row) => formatAmount(row.debitAmount),
        },
        {
          key: "dueDate",
          header: t("tPayment.list.columns.dueDate"),
          minWidth: 110,
          sortable: true,
          sortKey: TPaymentSortOrderField.DUEDATE,
          type: "string",
          editable: false,
          priority: 4,
          renderCell: (row) => formatReferenceMonth(row.dueDate),
        },
        {
          key: "invoiceNo",
          header: t("tPayment.list.columns.invoiceNo"),
          minWidth: 120,
          sortable: true,
          sortKey: TPaymentSortOrderField.INVOICENO,
          type: "string",
          editable: false,
          priority: 5,
        },
        {
          key: "description",
          header: t("tPayment.list.columns.description"),
          minWidth: 200,
          sortable: true,
          sortKey: TPaymentSortOrderField.DESCRIPTION,
          type: "string",
          editable: false,
          priority: 6,
        },
      ],
      [expenseCatalog.byId, t]
    )

  const filters = useMemo(
    () => (
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncDateTimeField
            id="year"
            type="year"
            label={t("tPayment.list.filters.year")}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncSelect
            id="expenseId"
            label={t("tPayment.list.filters.expense")}
            placeholder={t("tPayment.list.filters.expensePlaceholder")}
            options={expenseCatalog.options}
          />
        </View>
      </View>
    ),
    [expenseCatalog.options, t]
  )

  const actions: RncGridActions<TPaymentResponseDto> = useMemo(() => {
    const baseActions: RncGridActions<TPaymentResponseDto> = {
      edit: {
        route: (row) => `/buildings/${buildingId}/payments/${row.id}`,
      },
    }

    if (isUserRole) {
      return baseActions
    }

    return {
      ...baseActions,
      delete: {
        onPress: async (row) => {
          if (!row.id) {
            return
          }
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("tPayment.list.delete.title"),
          description: (row) =>
            t("tPayment.list.delete.description", {
              description: row.description ?? row.id,
            }),
        },
      },
    }
  }, [buildingId, deleteMutation, isUserRole, t])

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <View className="flex-row items-center gap-3">
        <Button
          variant="ghost"
          onPress={() => router.push(`/buildings/${buildingId}`)}
        >
          {t("tPayment.list.back")}
        </Button>
      </View>

      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("tPayment.list.title")}
      </Text>

      <RncGrid<TPaymentResponseDto, TPaymentSortOrderField, TPaymentListFilters>
        id="t-payment-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          {
            field: TPaymentSortOrderField.REFERENCEDATE,
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
            route: `/buildings/${buildingId}/payments/new`,
            label: t("tPayment.list.add"),
          },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
