"use client"

import {
  type TPaymentCreateRequestDto,
  type TPaymentResponseDto,
  type TPaymentUpdateRequestDto,
  useCreateTPayment,
  useDeleteTPayment,
  useGetBuildingById,
  useGetTPaymentById,
  useUpdateTPayment,
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
  TPaymentFormFields,
  type TPaymentFormValues,
  toPaymentReferenceDate,
} from "./t-payment-form-fields"

export function TPaymentFormScreen({
  buildingId,
  paymentId,
}: Readonly<{ buildingId: string; paymentId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = paymentId === "new"
  const entityId = isCreateMode ? undefined : paymentId
  const listRoute = `/buildings/${buildingId}/payments`

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const createMutation = useCreateTPayment()
  const updateMutation = useUpdateTPayment()
  const deleteMutation = useDeleteTPayment()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetTPaymentById(entityId ?? "", {
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
      { label: t("tPayment.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("tPayment.create.title")
          : t("tPayment.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: TPaymentFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const referenceDate = entityId
        ? (data?.referenceDate ?? "")
        : toPaymentReferenceDate(values.referenceDate)

      const payload: TPaymentCreateRequestDto = {
        buildingId,
        expenseId: entityId
          ? (data?.expenseId ?? values.expenseId)
          : values.expenseId,
        referenceDate,
        // A hand-entered payment is money paid out — a debit. The credit side of the ledger is
        // written by the expense that raised the obligation, never typed in here.
        debitAmount: Number(values.amount) || 0,
        creditAmount: 0,
        dueDate: values.dueDate
          ? toPaymentReferenceDate(values.dueDate)
          : undefined,
        invoiceNo: values.invoiceNo || undefined,
        description: values.description || undefined,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("tPayment.edit.missingVersion"))
            return false
          }

          const updatePayload: TPaymentUpdateRequestDto = {
            ...payload,
            id: data.id,
            version: data.version,
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
            entityId ? t("tPayment.edit.error") : t("tPayment.create.error")
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
      setError(getApiErrorMessage(e, t("tPayment.edit.deleteError")))
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
          {getApiErrorMessage(fetchError, t("tPayment.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">{t("tPayment.edit.notFound")}</Text>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode ? t("tPayment.create.title") : t("tPayment.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
        <RncForm<TPaymentFormValues>
          id="TPaymentFormScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data)}
        >
          <View className="w-full gap-6">
            <TPaymentFormFields
              isCreateMode={isCreateMode}
              lockedExpenseId={data?.expenseId}
              lockedReferenceDate={data?.referenceDate}
            />

            {!isCreateMode && data && (
              <View className="gap-2 rounded-md border border-border p-4">
                <Text className="font-medium text-foreground">
                  {t("tPayment.edit.audit.title")}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {t("tPayment.edit.audit.created", {
                    at: data.createdAt ?? "—",
                    by: data.createdBy ?? "—",
                  })}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {t("tPayment.edit.audit.updated", {
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
                    ? t("tPayment.create.save")
                    : t("tPayment.edit.save")
                }
              />
              <Button
                variant="outline"
                onPress={() => router.replace(listRoute)}
              >
                <Text>{t("tPayment.edit.cancel")}</Text>
              </Button>
              {!isCreateMode && !isUserRole && (
                <Button variant="destructive" onPress={handleDelete}>
                  <Text>{t("tPayment.edit.delete")}</Text>
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
  payment: TPaymentResponseDto | undefined
): TPaymentFormValues {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    expenseId: payment?.expenseId ?? "",
    referenceDate: payment?.referenceDate
      ? new Date(payment.referenceDate)
      : monthStart,
    amount: Number(payment?.debitAmount ?? 0),
    dueDate: payment?.dueDate ? new Date(payment.dueDate) : undefined,
    invoiceNo: payment?.invoiceNo ?? "",
    description: payment?.description ?? "",
  }
}
