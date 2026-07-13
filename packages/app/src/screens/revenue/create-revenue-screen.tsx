"use client"

import {
  type RevenueCreateRequestDto,
  useCreateRevenue,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useRouter, useSearchParams } from "@workspace/router"
import { Button, RncForm, RncSubmitButton, Text, View } from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import {
  RevenueFormFields,
  type RevenueFormValues,
} from "./revenue-form-fields"

export function CreateRevenueScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const searchParams = useSearchParams()
  const createMutation = useCreateRevenue()
  const [error, setError] = useState<string>()

  // Reached from an revenue category's own screen ("Add revenue" on its
  // revenues grid), which passes the category through the query string. The
  // category is then pinned, and cancelling goes back where the user came from.
  const presetCategoryId = searchParams.get("categoryId") ?? undefined
  const cancelRoute = presetCategoryId
    ? `/revenues/categories/${presetCategoryId}`
    : "/revenues"

  const handleSubmit = useCallback(
    async (
      data: RevenueFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: RevenueCreateRequestDto = {
        code: data.code,
        revenueCategoryId: data.revenueCategoryId,
        nameLabelId: data.nameLabelId,
        descriptionLabelId: data.descriptionLabelId,
      }

      try {
        await createMutation.mutateAsync({ data: payload })
        router.replace(cancelRoute)
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("revenue.create.error")))
        return false
      }
    },
    [createMutation, router, t, cancelRoute]
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("revenue.create.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
        <RncForm<RevenueFormValues>
          id="CreateRevenueScreen"
          onSubmit={handleSubmit}
          defaultValues={
            presetCategoryId
              ? { revenueCategoryId: presetCategoryId }
              : undefined
          }
        >
          <View className="w-full gap-6">
            <RevenueFormFields categoryLocked={!!presetCategoryId} />

            <View className="flex-row gap-3">
              <RncSubmitButton label={t("revenue.create.save")} />
              <Button
                variant="outline"
                onPress={() => router.replace(cancelRoute)}
              >
                <Text>{t("revenue.create.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}
