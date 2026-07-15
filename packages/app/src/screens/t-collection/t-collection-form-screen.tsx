"use client"

import {
  type TCollectionCreateRequestDto,
  type TCollectionResponseDto,
  type TCollectionUpdateRequestDto,
  useCreateTCollection,
  useDeleteTCollection,
  useGetBuildingById,
  useGetTCollectionById,
  useUpdateTCollection,
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
  TCollectionFormFields,
  type TCollectionFormValues,
  toCollectionReferenceDate,
} from "./t-collection-form-fields"

export function TCollectionFormScreen({
  buildingId,
  collectionId,
}: Readonly<{ buildingId: string; collectionId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = collectionId === "new"
  const entityId = isCreateMode ? undefined : collectionId
  const listRoute = `/buildings/${buildingId}/collections`

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const createMutation = useCreateTCollection()
  const updateMutation = useUpdateTCollection()
  const deleteMutation = useDeleteTCollection()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetTCollectionById(entityId ?? "", {
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
      { label: t("tCollection.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("tCollection.create.title")
          : t("tCollection.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: TCollectionFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const referenceDate = entityId
        ? (data?.referenceDate ?? "")
        : toCollectionReferenceDate(values.referenceDate)

      const payload: TCollectionCreateRequestDto = {
        buildingId,
        buildingUnitId: entityId
          ? (data?.buildingUnitId ?? values.buildingUnitId)
          : values.buildingUnitId,
        expenseId: entityId
          ? (data?.expenseId ?? values.expenseId)
          : values.expenseId,
        collectionTypeId: entityId
          ? (data?.collectionTypeId ?? values.collectionTypeId)
          : values.collectionTypeId,
        referenceDate,
        // Which side of the ledger the amount lands on is decided by the payment channel — v1's own
        // discriminator. A channel means money actually came in from the unit, so it is a credit;
        // without one the row is a charge raised against the unit, so it is a debit.
        debitAmount: values.paymentChannelId ? 0 : Number(values.amount) || 0,
        creditAmount: values.paymentChannelId ? Number(values.amount) || 0 : 0,
        dueDate: values.dueDate
          ? toCollectionReferenceDate(values.dueDate)
          : undefined,
        paymentChannelId: values.paymentChannelId || undefined,
        description: values.description || undefined,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("tCollection.edit.missingVersion"))
            return false
          }

          const updatePayload: TCollectionUpdateRequestDto = {
            ...payload,
            id: data.id,
            version: data.version,
            receiptNo: data.receiptNo,
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
              ? t("tCollection.edit.error")
              : t("tCollection.create.error")
          )
        )
        return false
      }
    },
    [
      buildingId,
      createMutation,
      data,
      entityId,
      listRoute,
      router,
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
      setError(getApiErrorMessage(e, t("tCollection.edit.deleteError")))
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
          {getApiErrorMessage(fetchError, t("tCollection.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("tCollection.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode
          ? t("tCollection.create.title")
          : t("tCollection.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
        <RncForm<TCollectionFormValues>
          id="TCollectionFormScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data)}
        >
          <View className="w-full gap-6">
            <TCollectionFormFields
              buildingId={buildingId}
              isCreateMode={isCreateMode}
              lockedBuildingUnitId={data?.buildingUnitId}
              lockedExpenseId={data?.expenseId}
              lockedCollectionTypeId={data?.collectionTypeId}
              lockedReferenceDate={data?.referenceDate}
            />

            {!isCreateMode && data && (
              <View className="gap-2 rounded-md border border-border p-4">
                <Text className="font-medium text-foreground">
                  {t("tCollection.edit.audit.title")}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {t("tCollection.edit.audit.created", {
                    at: data.createdAt ?? "—",
                    by: data.createdBy ?? "—",
                  })}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {t("tCollection.edit.audit.updated", {
                    at: data.updatedAt ?? "—",
                    by: data.updatedBy ?? "—",
                  })}
                </Text>
              </View>
            )}

            <View className="flex-row flex-wrap gap-3">
              <RncSubmitButton
                label={
                  isCreateMode
                    ? t("tCollection.create.save")
                    : t("tCollection.edit.save")
                }
              />
              <Button
                variant="outline"
                onPress={() => router.replace(listRoute)}
              >
                <Text>{t("tCollection.edit.cancel")}</Text>
              </Button>
              {!isCreateMode && !isUserRole && (
                <Button variant="destructive" onPress={handleDelete}>
                  <Text>{t("tCollection.edit.delete")}</Text>
                </Button>
              )}
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}

function toFormValues(
  collection: TCollectionResponseDto | undefined
): TCollectionFormValues {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    buildingUnitId: collection?.buildingUnitId ?? "",
    expenseId: collection?.expenseId ?? "",
    collectionTypeId: collection?.collectionTypeId ?? "",
    referenceDate: collection?.referenceDate
      ? new Date(collection.referenceDate)
      : monthStart,
    // Collapse the ledger's two legs back into the one number the form edits.
    amount: Number(collection?.debitAmount || collection?.creditAmount || 0),
    dueDate: collection?.dueDate ? new Date(collection.dueDate) : undefined,
    paymentChannelId: collection?.paymentChannelId ?? "",
    receiptNo: collection?.receiptNo ?? "",
    description: collection?.description ?? "",
  }
}
