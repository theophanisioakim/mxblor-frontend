"use client"

import {
  type ExpenseCreateRequestDto,
  useCreateExpense,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useRouter } from "@workspace/router"
import { Button, RncForm, RncSubmitButton, Text, View } from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import {
  ExpenseFormFields,
  type ExpenseFormValues,
} from "./expense-form-fields"

export function CreateExpenseScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const createMutation = useCreateExpense()
  const [error, setError] = useState<string>()

  const handleSubmit = useCallback(
    async (
      data: ExpenseFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: ExpenseCreateRequestDto = {
        code: data.code,
        expenseCategoryId: data.expenseCategoryId,
        nameLabelId: data.nameLabelId,
        descriptionLabelId: data.descriptionLabelId,
      }

      try {
        await createMutation.mutateAsync({ data: payload })
        router.replace("/expenses")
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("expense.create.error")))
        return false
      }
    },
    [createMutation, router, t]
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("expense.create.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
        <RncForm<ExpenseFormValues>
          id="CreateExpenseScreen"
          onSubmit={handleSubmit}
        >
          <View className="w-full gap-6">
            <ExpenseFormFields />

            <View className="flex-row gap-3">
              <RncSubmitButton label={t("expense.create.save")} />
              <Button
                variant="outline"
                onPress={() => router.replace("/expenses")}
              >
                <Text>{t("expense.create.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}
