"use client"

import {
  searchTCollections,
  type TCollectionResponseDto,
  type TCollectionSearchRequestDto,
  TCollectionSortOrderField,
  useDeleteTCollection,
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
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo } from "react"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"
import { useCollectionTypeOptions } from "../t-expense/use-collection-type-options"
import { useExpenseCatalogOptions } from "../t-expense/use-expense-catalog-options"
import { useBuildingUnitOptions } from "./use-building-unit-options"
import { usePaymentChannelOptions } from "./use-payment-channel-options"

export interface TCollectionListScreenProps {
  buildingId: string
}

type TCollectionListFilters = {
  year?: Date | string
  buildingUnitId?: string
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
 * Flat list of a building's collections — standalone balance-sheet rows per
 * unit, not linked to a t_expense picker or expense detail screen.
 */
export function TCollectionListScreen({
  buildingId,
}: Readonly<TCollectionListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.tCollection
  )
  const deleteMutation = useDeleteTCollection()
  const expenseCatalog = useExpenseCatalogOptions()
  const collectionTypes = useCollectionTypeOptions()
  const buildingUnits = useBuildingUnitOptions(buildingId)
  const paymentChannels = usePaymentChannelOptions()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("tCollection.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        TCollectionSortOrderField,
        TCollectionListFilters
      >
    ): Promise<RncGridData<TCollectionResponseDto>> => {
      const { year, buildingUnitId, expenseId, collectionTypeId } =
        params.filters ?? {}

      const payload: TCollectionSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        buildingId,
        buildingUnitId: buildingUnitId || undefined,
        expenseId: expenseId || undefined,
        collectionTypeId: collectionTypeId || undefined,
      }

      if (year) {
        const y = yearOf(year)
        payload.referenceDateFrom = `${y}-01-01`
        payload.referenceDateTo = `${y}-12-31`
      }

      const apiResponse = await searchTCollections(payload, params.signal)
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
    TCollectionResponseDto,
    TCollectionSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "referenceDate",
        header: t("tCollection.list.columns.period"),
        minWidth: 110,
        sortable: true,
        sortKey: TCollectionSortOrderField.REFERENCEDATE,
        type: "string",
        editable: false,
        priority: 1,
        renderCell: (row) => formatReferenceMonth(row.referenceDate),
      },
      {
        key: "buildingUnitId",
        header: t("tCollection.list.columns.unit"),
        minWidth: 120,
        sortable: false,
        type: "string",
        editable: false,
        priority: 2,
        renderCell: (row) =>
          row.buildingUnitId
            ? (buildingUnits.byId.get(row.buildingUnitId) ?? row.buildingUnitId)
            : "",
      },
      {
        key: "expenseId",
        header: t("tCollection.list.columns.expense"),
        minWidth: 180,
        sortable: false,
        type: "string",
        editable: false,
        priority: 3,
        renderCell: (row) =>
          row.expenseId
            ? (expenseCatalog.byId.get(row.expenseId) ?? row.expenseId)
            : "",
      },
      {
        key: "collectionTypeId",
        header: t("tCollection.list.columns.collectionType"),
        minWidth: 140,
        sortable: false,
        type: "string",
        editable: false,
        priority: 4,
        renderCell: (row) =>
          row.collectionTypeId
            ? (collectionTypes.byId.get(row.collectionTypeId) ?? "")
            : "",
      },
      // The two sides of the balance sheet. A debit is what the unit was charged (its share of an
      // expense); a credit is what it has actually paid. The unit's balance is the difference —
      // never a stored field, and negative simply means the unit is in credit.
      {
        key: "debitAmount",
        header: t("tCollection.list.columns.debitAmount"),
        minWidth: 120,
        sortable: true,
        sortKey: TCollectionSortOrderField.DEBITAMOUNT,
        type: "number",
        editable: false,
        priority: 5,
        renderCell: (row) => formatAmount(row.debitAmount),
      },
      {
        key: "creditAmount",
        header: t("tCollection.list.columns.creditAmount"),
        minWidth: 120,
        sortable: true,
        sortKey: TCollectionSortOrderField.CREDITAMOUNT,
        type: "number",
        editable: false,
        priority: 5,
        renderCell: (row) => formatAmount(row.creditAmount),
      },
      {
        key: "receiptNo",
        header: t("tCollection.list.columns.receiptNo"),
        minWidth: 120,
        sortable: true,
        sortKey: TCollectionSortOrderField.RECEIPTNO,
        type: "string",
        editable: false,
        priority: 6,
      },
      {
        key: "paymentChannelId",
        header: t("tCollection.list.columns.paymentChannel"),
        minWidth: 140,
        sortable: false,
        type: "string",
        editable: false,
        priority: 7,
        renderCell: (row) =>
          row.paymentChannelId
            ? (paymentChannels.byId.get(row.paymentChannelId) ?? "")
            : "",
      },
    ],
    [
      buildingUnits.byId,
      collectionTypes.byId,
      expenseCatalog.byId,
      paymentChannels.byId,
      t,
    ]
  )

  const filters = useMemo(
    () => (
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncDateTimeField
            id="year"
            type="year"
            label={t("tCollection.list.filters.year")}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncSelect
            id="buildingUnitId"
            label={t("tCollection.list.filters.unit")}
            placeholder={t("tCollection.list.filters.unitPlaceholder")}
            options={buildingUnits.options}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncSelect
            id="expenseId"
            label={t("tCollection.list.filters.expense")}
            placeholder={t("tCollection.list.filters.expensePlaceholder")}
            options={expenseCatalog.options}
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncSelect
            id="collectionTypeId"
            label={t("tCollection.list.filters.collectionType")}
            placeholder={t(
              "tCollection.list.filters.collectionTypePlaceholder"
            )}
            options={collectionTypes.options}
          />
        </View>
      </View>
    ),
    [buildingUnits.options, collectionTypes.options, expenseCatalog.options, t]
  )

  const actions: RncGridActions<TCollectionResponseDto> = useMemo(() => {
    const baseActions: RncGridActions<TCollectionResponseDto> = {
      edit: {
        disabled: () => !canUpdate,
        route: (row) => `/buildings/${buildingId}/collections/${row.id}`,
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
          title: t("tCollection.list.delete.title"),
          description: (row) =>
            t("tCollection.list.delete.description", {
              description: row.receiptNo ?? row.description ?? row.id,
            }),
        },
      },
    }
  }, [buildingId, deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.tCollection}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <View className="flex-row items-center gap-3">
          <Button
            variant="ghost"
            onPress={() => router.push(`/buildings/${buildingId}`)}
          >
            {t("tCollection.list.back")}
          </Button>
        </View>

        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("tCollection.list.title")}
        </Text>

        <RncGrid<
          TCollectionResponseDto,
          TCollectionSortOrderField,
          TCollectionListFilters
        >
          id="t-collection-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: TCollectionSortOrderField.REFERENCEDATE,
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
              route: `/buildings/${buildingId}/collections/new`,
              label: t("tCollection.list.add"),
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
