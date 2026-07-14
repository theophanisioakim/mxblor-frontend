"use client"

import {
  type TBankAccountCreateRequestDto,
  type TBankAccountResponseDto,
  type TBankAccountUpdateRequestDto,
  useCreateTBankAccount,
  useGetBuildingById,
  useGetTBankAccountById,
  useUpdateTBankAccount,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth, useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncForm,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import {
  TBankAccountFormFields,
  type TBankAccountFormValues,
} from "./t-bank-account-form-fields"

/**
 * Create and edit one of the building's bank/fund accounts.
 *
 * The account's balance is not a field the user maintains — it is the sum of its
 * transactions. On create, the opening balance is turned into a `Balance B/F`
 * transaction by the server, so the figure always has a movement behind it; from
 * then on only a transaction can move it.
 */
export function TBankAccountFormScreen({
  buildingId,
  accountId,
}: Readonly<{ buildingId: string; accountId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = accountId === "new"
  const entityId = isCreateMode ? undefined : accountId
  const listRoute = `/buildings/${buildingId}/bank-accounts`

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const createMutation = useCreateTBankAccount()
  const updateMutation = useUpdateTBankAccount()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetTBankAccountById(entityId ?? "", {
    query: { enabled: !!entityId },
  })

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("bankAccount.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("bankAccount.create.title")
          : t("bankAccount.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: TBankAccountFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: TBankAccountCreateRequestDto = {
        // Scoped by the route, never by a field.
        buildingId,
        bankName: values.bankName,
        accountName: values.accountName || undefined,
        accountNo: values.accountNo,
        ibanNo: values.ibanNo || undefined,
        swiftBic: values.swiftBic || undefined,
        accountTypeId: values.accountTypeId,
        // On create this is the opening balance, which the server turns into a
        // Balance B/F transaction. On edit the server ignores whatever is sent and
        // recomputes from the transactions — the field is read-only for a reason.
        balance: Number(values.balance) || 0,
        description: values.description || undefined,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("bankAccount.edit.missingVersion"))
            return false
          }
          const updatePayload: TBankAccountUpdateRequestDto = {
            ...payload,
            id: data.id,
            version: data.version,
            // The complete desired set: a row the user removed is deleted, and the
            // balance follows. Only sent by roles that may manage them — omitting
            // the list entirely leaves the account's transactions untouched.
            transactions: isUserRole
              ? undefined
              : values.transactions.map((row) => ({
                  id: row.id,
                  amount: Number(row.amount) || 0,
                  transactionDate: new Date(row.transactionDate).toISOString(),
                  transactionTypeId: row.transactionTypeId,
                  description: row.description || undefined,
                })),
          }
          await updateMutation.mutateAsync({ id: data.id, data: updatePayload })
        } else {
          await createMutation.mutateAsync({ data: payload })
        }
        router.replace(listRoute)
        return true
      } catch (e: unknown) {
        setError(
          getApiErrorMessage(
            e,
            entityId
              ? t("bankAccount.edit.error")
              : t("bankAccount.create.error")
          )
        )
        return false
      }
    },
    [
      buildingId,
      entityId,
      data,
      isUserRole,
      createMutation,
      updateMutation,
      router,
      listRoute,
      t,
    ]
  )

  if (entityId && isLoading) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Spinner />
      </View>
    )
  }

  if (entityId && isError) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {getApiErrorMessage(fetchError, t("bankAccount.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("bankAccount.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode
          ? t("bankAccount.create.title")
          : t("bankAccount.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
        <RncForm<TBankAccountFormValues>
          id="TBankAccountFormScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data)}
        >
          <View className="w-full gap-6">
            <TBankAccountFormFields
              isCreateMode={isCreateMode}
              canManageTransactions={!isUserRole}
            />

            <View className="flex-row gap-3">
              <RncSubmitButton
                label={
                  isCreateMode
                    ? t("bankAccount.create.save")
                    : t("bankAccount.edit.save")
                }
              />
              <Button
                variant="outline"
                onPress={() => router.replace(listRoute)}
              >
                <Text>{t("bankAccount.edit.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}

function toFormValues(
  account: TBankAccountResponseDto | undefined
): TBankAccountFormValues {
  return {
    bankName: account?.bankName ?? "",
    accountName: account?.accountName ?? "",
    accountNo: account?.accountNo ?? "",
    ibanNo: account?.ibanNo ?? "",
    swiftBic: account?.swiftBic ?? "",
    accountTypeId: account?.accountTypeId ?? "",
    balance: Number(account?.balance ?? 0),
    description: account?.description ?? "",
    transactions: (account?.transactions ?? []).map((row) => ({
      id: row.id,
      amount: Number(row.amount ?? 0),
      transactionDate: row.transactionDate ?? new Date().toISOString(),
      transactionTypeId: row.transactionTypeId ?? "",
      description: row.description ?? "",
    })),
  }
}
