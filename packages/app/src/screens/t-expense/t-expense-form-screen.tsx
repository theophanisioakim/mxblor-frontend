"use client"

import {
  type TExpenseResponseDto,
  type TExpenseSpreadCreateRequestDto,
  type TExpenseUpdateRequestDto,
  useDeleteTExpense,
  useGetBuildingById,
  useGetTExpenseById,
  useSpreadTExpense,
  useUpdateTExpense,
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
  RncForm,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, formPermissions } from "../screen-permissions"
import {
  TExpenseFormFields,
  type TExpenseFormValues,
  toSpreadPeriodEnd,
  toSpreadPeriodStart,
} from "./t-expense-form-fields"
import {
  DISTRIBUTED_COLLECTION_TYPE_KEYS,
  NON_DISTRIBUTED_COLLECTION_TYPE_KEY,
  useCollectionTypeOptions,
} from "./use-collection-type-options"

export function TExpenseFormScreen({
  buildingId,
  expenseId,
}: Readonly<{ buildingId: string; expenseId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const collectionTypes = useCollectionTypeOptions()

  const isCreateMode = expenseId === "new"
  const entityId = isCreateMode ? undefined : expenseId
  const listRoute = `/buildings/${buildingId}/current-expenses`

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const spreadMutation = useSpreadTExpense()
  const { hasPermission } = usePermission()
  const canCreate = hasPermission(formPermissions.tExpense.create)
  const { canUpdate, canDelete } = useCrudPermissions(crudPermissions.tExpense)
  const canSubmit = isCreateMode ? canCreate : canUpdate
  const updateMutation = useUpdateTExpense()
  const deleteMutation = useDeleteTExpense()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetTExpenseById(entityId ?? "", {
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
      { label: t("tExpense.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("tExpense.create.title")
          : t("tExpense.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: TExpenseFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const collectionTypeKey =
        collectionTypes.keyById.get(values.collectionTypeId) ?? ""
      const isDistributed =
        DISTRIBUTED_COLLECTION_TYPE_KEYS.has(collectionTypeKey)
      const isNonDistributed =
        collectionTypeKey === NON_DISTRIBUTED_COLLECTION_TYPE_KEY

      if (isDistributed && !values.buildingDistributionId) {
        setError(t("tExpense.form.validation.distributionRequired"))
        return false
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("tExpense.edit.missingVersion"))
            return false
          }

          const updatePayload: TExpenseUpdateRequestDto = {
            id: data.id,
            version: data.version,
            buildingId,
            expenseId: data.expenseId ?? values.expenseId,
            collectionTypeId: data.collectionTypeId ?? values.collectionTypeId,
            referenceDate: data.referenceDate ?? "",
            amount: Number(values.amount) || 0,
            buildingDistributionId: isNonDistributed
              ? undefined
              : values.buildingDistributionId || data.buildingDistributionId,
            description: data.description,
          }
          await updateMutation.mutateAsync({ id: data.id, data: updatePayload })
        } else {
          const spreadPayload: TExpenseSpreadCreateRequestDto = {
            buildingId,
            expenseId: values.expenseId,
            collectionTypeId: values.collectionTypeId,
            amount: Number(values.amount) || 0,
            periodStart: toSpreadPeriodStart(values.periodStart),
            periodEnd: isDistributed
              ? toSpreadPeriodEnd(values.periodEnd ?? values.periodStart)
              : isNonDistributed
                ? toSpreadPeriodStart(values.periodStart)
                : toSpreadPeriodStart(values.periodStart),
            buildingDistributionId: isNonDistributed
              ? undefined
              : values.buildingDistributionId || undefined,
          }
          await spreadMutation.mutateAsync({ data: spreadPayload })
        }

        router.replace(listRoute)
        return true
      } catch (e: unknown) {
        setError(
          getApiErrorMessage(
            e,
            entityId ? t("tExpense.edit.error") : t("tExpense.create.error")
          )
        )
        return false
      }
    },
    [
      buildingId,
      collectionTypes.keyById,
      data,
      entityId,
      router,
      listRoute,
      spreadMutation,
      t,
      updateMutation,
    ]
  )

  const handleDelete = useCallback(async () => {
    if (!data?.id) {
      return
    }

    setError(undefined)
    try {
      await deleteMutation.mutateAsync({ id: data.id })
      router.replace(listRoute)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, t("tExpense.edit.deleteError")))
    }
  }, [data?.id, deleteMutation, listRoute, router, t])

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
          {getApiErrorMessage(fetchError, t("tExpense.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">{t("tExpense.edit.notFound")}</Text>
      </View>
    )
  }

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.tExpense.create
          : formPermissions.tExpense.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode ? t("tExpense.create.title") : t("tExpense.edit.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
          <RncForm<TExpenseFormValues>
            id="TExpenseFormScreen"
            onSubmit={handleSubmit}
            defaultValues={toFormValues(data)}
          >
            <View className="w-full gap-6">
              <TExpenseFormFields
                buildingId={buildingId}
                isCreateMode={isCreateMode}
                lockedCollectionTypeKey={data?.collectionTypeKey}
                lockedReferenceDate={data?.referenceDate}
              />

              {!isCreateMode && data && (
                <View className="gap-2 rounded-md border border-border p-4">
                  <Text className="font-medium text-foreground">
                    {t("tExpense.edit.audit.title")}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {t("tExpense.edit.audit.created", {
                      at: data.createdAt ?? "—",
                      by: data.createdBy ?? "—",
                    })}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {t("tExpense.edit.audit.updated", {
                      at: data.updatedAt ?? "—",
                      by: data.updatedBy ?? "—",
                    })}
                  </Text>
                </View>
              )}

              <View className="flex-row flex-wrap gap-3">
                <RncSubmitButton
                  disabled={!canSubmit}
                  label={
                    isCreateMode
                      ? t("tExpense.create.save")
                      : t("tExpense.edit.save")
                  }
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(listRoute)}
                >
                  <Text>{t("tExpense.edit.cancel")}</Text>
                </Button>
                {!isCreateMode && !isUserRole && (
                  <Button
                    variant="destructive"
                    disabled={!canDelete}
                    onPress={handleDelete}
                  >
                    <Text>{t("tExpense.edit.delete")}</Text>
                  </Button>
                )}
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}

function toFormValues(
  expense: TExpenseResponseDto | undefined
): TExpenseFormValues {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    expenseId: expense?.expenseId ?? "",
    collectionTypeId: expense?.collectionTypeId ?? "",
    buildingDistributionId: expense?.buildingDistributionId ?? "",
    amount: Number(expense?.amount ?? 0),
    periodStart: expense?.referenceDate
      ? new Date(expense.referenceDate)
      : monthStart,
    periodEnd: expense?.referenceDate
      ? new Date(expense.referenceDate)
      : monthStart,
    description: expense?.description ?? "",
  }
}
