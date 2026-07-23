"use client"

import {
  type RevenueResponseDto,
  type RevenueUpdateRequestDto,
  useGetRevenueById,
  useUpdateRevenue,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncForm,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, formPermissions } from "../screen-permissions"
import {
  RevenueFormFields,
  type RevenueFormValues,
} from "./revenue-form-fields"

function toFormValues(revenue: RevenueResponseDto): RevenueFormValues {
  return {
    code: revenue.code ?? "",
    revenueCategoryId: revenue.revenueCategoryId ?? "",
    nameLabelId: revenue.nameLabelId ?? "",
    descriptionLabelId: revenue.descriptionLabelId ?? "",
  }
}

export function EditRevenueScreen({ id }: Readonly<{ id: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { canUpdate } = useCrudPermissions(crudPermissions.revenue)
  const updateMutation = useUpdateRevenue()
  const [error, setError] = useState<string>()

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetRevenueById(id, {
    query: { enabled: !!id },
  })

  const handleSubmit = useCallback(
    async (
      values: RevenueFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      if (!data?.id || data.version === undefined) {
        setError(t("revenue.edit.missingVersion"))
        return false
      }

      const payload: RevenueUpdateRequestDto = {
        id: data.id,
        version: data.version,
        code: values.code,
        revenueCategoryId: values.revenueCategoryId,
        nameLabelId: values.nameLabelId,
        descriptionLabelId: values.descriptionLabelId,
      }

      try {
        await updateMutation.mutateAsync({ id: data.id, data: payload })
        router.replace("/revenues")
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("revenue.edit.error")))
        return false
      }
    },
    [data, updateMutation, router, t]
  )

  if (isLoading) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Spinner />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {getApiErrorMessage(fetchError, t("revenue.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">{t("revenue.edit.notFound")}</Text>
      </View>
    )
  }

  // Seeded revenues are system defaults — they are shown, never edited.
  const isLocked = data.editable === false

  return (
    <PermissionGuard permission={formPermissions.revenue.edit}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("revenue.edit.title")}
        </Text>

        {isLocked && (
          <View className="rounded-md bg-muted p-3">
            <Text className="text-muted-foreground">
              {t("revenue.edit.locked")}
            </Text>
          </View>
        )}

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<RevenueFormValues>
            id="EditRevenueScreen"
            onSubmit={handleSubmit}
            defaultValues={toFormValues(data)}
          >
            <View className="w-full gap-6">
              <RevenueFormFields disabled={isLocked} />

              <View className="flex-row gap-3">
                {!isLocked && (
                  <RncSubmitButton
                    disabled={!canUpdate}
                    label={t("revenue.edit.save")}
                  />
                )}
                <Button
                  variant="outline"
                  onPress={() => router.replace("/revenues")}
                >
                  <Text>
                    {isLocked
                      ? t("revenue.edit.back")
                      : t("revenue.edit.cancel")}
                  </Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
