"use client"

import {
  searchTBankAccounts,
  type TBankAccountResponseDto,
  type TBankAccountSearchRequestDto,
  TBankAccountSortOrderField,
  useDeleteTBankAccount,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth, useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
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
import { useCallback, useEffect, useMemo } from "react"
import { useBankAccountTypeOptions } from "../shared/use-reference-options"

export interface TBankAccountListScreenProps {
  buildingId: string
}

type TBankAccountListFilters = Omit<
  TBankAccountSearchRequestDto,
  "page" | "size" | "sort" | "buildingId"
>

/**
 * The building's bank and fund accounts.
 *
 * The Balance column is a *running* total — the sum of the account's
 * transactions, kept on the row by the server so it can be sorted and filtered
 * on. It is never typed in directly after the account is created.
 */
export function TBankAccountListScreen({
  buildingId,
}: Readonly<TBankAccountListScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { data: building } = useGetBuildingById(buildingId)
  const deleteMutation = useDeleteTBankAccount()
  const accountTypes = useBankAccountTypeOptions()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("bankAccount.list.title") },
    ])
  }, [building, buildingId, setItems, t])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        TBankAccountSortOrderField,
        TBankAccountListFilters
      >
    ): Promise<RncGridData<TBankAccountResponseDto>> => {
      const payload: TBankAccountSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        buildingId,
      }

      const apiResponse = await searchTBankAccounts(payload, params.signal)
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
    TBankAccountResponseDto,
    TBankAccountSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "accountNo",
        header: t("bankAccount.list.columns.accountNo"),
        minWidth: 140,
        sortable: true,
        sortKey: TBankAccountSortOrderField.ACCOUNTNO,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "bankName",
        header: t("bankAccount.list.columns.bankName"),
        minWidth: 150,
        sortable: true,
        sortKey: TBankAccountSortOrderField.BANKNAME,
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "accountTypeId",
        header: t("bankAccount.list.columns.accountType"),
        minWidth: 120,
        sortable: false,
        type: "string",
        editable: false,
        priority: 4,
        // The row carries the reference id; the label comes from the lookup.
        renderCell: (row) =>
          row.accountTypeId
            ? (accountTypes.byId.get(row.accountTypeId) ?? "")
            : "",
      },
      {
        key: "ibanNo",
        header: t("bankAccount.list.columns.iban"),
        minWidth: 180,
        sortable: true,
        sortKey: TBankAccountSortOrderField.IBANNO,
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "balance",
        header: t("bankAccount.list.columns.balance"),
        minWidth: 130,
        sortable: true,
        sortKey: TBankAccountSortOrderField.BALANCE,
        type: "number",
        editable: false,
        priority: 3,
      },
    ],
    [t, accountTypes.byId]
  )

  const filters = useMemo(
    () => (
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="accountNo"
            label={t("bankAccount.list.filters.accountNo")}
            placeholder={t("bankAccount.list.filters.accountNoPlaceholder")}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="bankName"
            label={t("bankAccount.list.filters.bankName")}
            placeholder={t("bankAccount.list.filters.bankNamePlaceholder")}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncSelect
            id="accountTypeId"
            label={t("bankAccount.list.filters.accountType")}
            placeholder={t("bankAccount.list.filters.accountTypePlaceholder")}
            options={accountTypes.options}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="ibanNo"
            label={t("bankAccount.list.filters.iban")}
            placeholder={t("bankAccount.list.filters.ibanPlaceholder")}
          />
        </View>
      </View>
    ),
    [t, accountTypes.options]
  )

  const actions: RncGridActions<TBankAccountResponseDto> = useMemo(() => {
    const baseActions: RncGridActions<TBankAccountResponseDto> = {
      edit: {
        route: (row) => `/buildings/${buildingId}/bank-accounts/${row.id}`,
      },
    }

    if (isUserRole) {
      return baseActions
    }

    return {
      ...baseActions,
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: t("bankAccount.list.delete.title"),
          description: (row) =>
            t("bankAccount.list.delete.description", {
              accountNo: row.accountNo ?? row.id,
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
          {t("bankAccount.list.back")}
        </Button>
      </View>

      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("bankAccount.list.title")}
      </Text>

      <RncGrid<
        TBankAccountResponseDto,
        TBankAccountSortOrderField,
        TBankAccountListFilters
      >
        id="t-bank-account-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: TBankAccountSortOrderField.ACCOUNTNO, direction: "ASC" },
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
            route: `/buildings/${buildingId}/bank-accounts/new`,
            label: t("bankAccount.list.add"),
          },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
