"use client"

import {
  searchTExpenses,
  summarizeTExpenses,
  type TExpenseResponseDto,
  type TExpenseSearchRequestDto,
  TExpenseSortOrderField,
  useDeleteTExpense,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import {
  useAuth,
  useBreadcrumbs,
  useCrudPermissions,
  usePermission,
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
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo, useState } from "react"
import { PermissionGuard } from "../permission-guard"
import {
  crudPermissions,
  formPermissions,
  viewPermissions,
} from "../screen-permissions"
import { useCollectionTypeOptions } from "./use-collection-type-options"
import { useExpenseCatalogOptions } from "./use-expense-catalog-options"

export interface TExpenseListScreenProps {
  buildingId: string
}

type TExpenseListFilters = {
  year?: Date | string
  month?: string
  expenseId?: string
  collectionTypeId?: string
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

const MONTH_LABEL_KEYS = [
  "tExpense.months.1",
  "tExpense.months.2",
  "tExpense.months.3",
  "tExpense.months.4",
  "tExpense.months.5",
  "tExpense.months.6",
  "tExpense.months.7",
  "tExpense.months.8",
  "tExpense.months.9",
  "tExpense.months.10",
  "tExpense.months.11",
  "tExpense.months.12",
] as const

function monthLabelKey(month: number): (typeof MONTH_LABEL_KEYS)[number] {
  return MONTH_LABEL_KEYS[month - 1] ?? MONTH_LABEL_KEYS[0]
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
 * Flat list of a building's current expenses with a year summary strip.
 *
 * No year→month drill-down: filters narrow the grid in place and the summary
 * strip shows type totals for the selected year.
 */
export function TExpenseListScreen({
  buildingId,
}: Readonly<TExpenseListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const { canUpdate, canDelete } = useCrudPermissions(crudPermissions.tExpense)
  const { hasPermission } = usePermission()
  const canCreate = hasPermission(formPermissions.tExpense.create)
  const deleteMutation = useDeleteTExpense()
  const collectionTypes = useCollectionTypeOptions()
  const expenseCatalog = useExpenseCatalogOptions()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const [summaryYear, setSummaryYear] = useState(() => new Date().getFullYear())
  const [summary, setSummary] = useState({
    capital: 0,
    monthly: 0,
    nondistributed: 0,
    savings: 0,
    bankWithdrawal: 0,
  })

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("tExpense.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  useEffect(() => {
    let cancelled = false

    summarizeTExpenses({ buildingId, year: summaryYear })
      .then((response) => {
        if (cancelled) {
          return
        }
        setSummary({
          capital: response.capital ?? 0,
          monthly: response.monthly ?? 0,
          nondistributed: response.nondistributed ?? 0,
          savings: response.savings ?? 0,
          bankWithdrawal: response.bankWithdrawal ?? 0,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setSummary({
            capital: 0,
            monthly: 0,
            nondistributed: 0,
            savings: 0,
            bankWithdrawal: 0,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [buildingId, summaryYear])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        TExpenseSortOrderField,
        TExpenseListFilters
      >
    ): Promise<RncGridData<TExpenseResponseDto>> => {
      const { year, month, expenseId, collectionTypeId } = params.filters ?? {}

      const payload: TExpenseSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        buildingId,
        expenseId: expenseId || undefined,
        collectionTypeId: collectionTypeId || undefined,
      }

      if (year) {
        payload.year = yearOf(year)
        setSummaryYear(yearOf(year))
      }

      if (month) {
        payload.month = Number(month)
      }

      const apiResponse = await searchTExpenses(payload, params.signal)
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

  const columns: RncGridColumn<TExpenseResponseDto, TExpenseSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "referenceDate",
          header: t("tExpense.list.columns.period"),
          minWidth: 110,
          sortable: true,
          sortKey: TExpenseSortOrderField.REFERENCEDATE,
          type: "string",
          editable: false,
          priority: 1,
          renderCell: (row) => formatReferenceMonth(row.referenceDate),
        },
        {
          key: "expenseName",
          header: t("tExpense.list.columns.expense"),
          minWidth: 180,
          sortable: false,
          type: "string",
          editable: false,
          priority: 2,
          renderCell: (row) =>
            row.expenseName
              ? `${row.expenseCode ?? ""} — ${row.expenseName}`.trim()
              : (row.expenseCode ?? ""),
        },
        {
          key: "collectionTypeId",
          header: t("tExpense.list.columns.collectionType"),
          minWidth: 140,
          sortable: false,
          type: "string",
          editable: false,
          priority: 3,
          renderCell: (row) =>
            row.collectionTypeId
              ? (collectionTypes.byId.get(row.collectionTypeId) ?? "")
              : "",
        },
        {
          key: "amount",
          header: t("tExpense.list.columns.amount"),
          minWidth: 120,
          sortable: true,
          sortKey: TExpenseSortOrderField.AMOUNT,
          type: "number",
          editable: false,
          priority: 4,
          renderCell: (row) => formatAmount(row.amount),
        },
        {
          key: "buildingDistributionName",
          header: t("tExpense.list.columns.distributionTable"),
          minWidth: 160,
          sortable: false,
          type: "string",
          editable: false,
          priority: 5,
        },
        {
          key: "description",
          header: t("tExpense.list.columns.description"),
          minWidth: 200,
          sortable: true,
          sortKey: TExpenseSortOrderField.DESCRIPTION,
          type: "string",
          editable: false,
          priority: 6,
        },
      ],
      [collectionTypes.byId, t]
    )

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: String(index + 1),
        label: t(monthLabelKey(index + 1)),
      })),
    [t]
  )

  const filters = useMemo(
    () => (
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncDateTimeField
            id="year"
            type="year"
            label={t("tExpense.list.filters.year")}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncSelect
            id="month"
            label={t("tExpense.list.filters.month")}
            placeholder={t("tExpense.list.filters.monthPlaceholder")}
            options={monthOptions}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncSelect
            id="expenseId"
            label={t("tExpense.list.filters.expense")}
            placeholder={t("tExpense.list.filters.expensePlaceholder")}
            options={expenseCatalog.options}
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncSelect
            id="collectionTypeId"
            label={t("tExpense.list.filters.collectionType")}
            placeholder={t("tExpense.list.filters.collectionTypePlaceholder")}
            options={collectionTypes.options}
          />
        </View>
      </View>
    ),
    [collectionTypes.options, expenseCatalog.options, monthOptions, t]
  )

  const actions: RncGridActions<TExpenseResponseDto> = useMemo(() => {
    const baseActions: RncGridActions<TExpenseResponseDto> = {
      edit: {
        disabled: () => !canUpdate,
        route: (row) => `/buildings/${buildingId}/current-expenses/${row.id}`,
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
          if (!row.id) {
            return
          }
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("tExpense.list.delete.title"),
          description: (row) =>
            t("tExpense.list.delete.description", {
              description: row.description ?? row.id,
            }),
        },
      },
    }
  }, [buildingId, deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.tExpense}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <View className="flex-row items-center gap-3">
          <Button
            variant="ghost"
            onPress={() => router.push(`/buildings/${buildingId}`)}
          >
            {t("tExpense.list.back")}
          </Button>
        </View>

        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("tExpense.list.title")}
        </Text>

        <View className="gap-3 rounded-md border border-border p-4 md:flex-row md:flex-wrap">
          <SummaryTile
            label={t("tExpense.list.summary.capital")}
            value={summary.capital}
          />
          <SummaryTile
            label={t("tExpense.list.summary.monthly")}
            value={summary.monthly}
          />
          <SummaryTile
            label={t("tExpense.list.summary.nondistributed")}
            value={summary.nondistributed}
          />
          <SummaryTile
            label={t("tExpense.list.summary.savings")}
            value={summary.savings}
          />
          <SummaryTile
            label={t("tExpense.list.summary.bank")}
            value={summary.bankWithdrawal}
          />
          <Text className="w-full text-muted-foreground text-sm">
            {t("tExpense.list.summary.yearHint", { year: summaryYear })}
          </Text>
        </View>

        <RncGrid<
          TExpenseResponseDto,
          TExpenseSortOrderField,
          TExpenseListFilters
        >
          id="t-expense-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: TExpenseSortOrderField.REFERENCEDATE,
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
              route: `/buildings/${buildingId}/current-expenses/new`,
              label: t("tExpense.list.add"),
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

function SummaryTile({
  label,
  value,
}: Readonly<{ label: string; value: number }>) {
  return (
    <View className="min-w-[140px] flex-1 gap-1">
      <Text className="text-muted-foreground text-sm">{label}</Text>
      <Text className="font-semibold text-foreground text-lg">
        {formatAmount(value)}
      </Text>
    </View>
  )
}
