"use client"

import {
  type ExpenseResponseDto,
  type ExpenseUpdateRequestDto,
  useGetExpenseById,
  useUpdateExpense,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
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
import {
  ExpenseFormFields,
  type ExpenseFormValues,
} from "./expense-form-fields"

function toFormValues(expense: ExpenseResponseDto): ExpenseFormValues {
  return {
    code: expense.code ?? "",
    expenseCategoryId: expense.expenseCategoryId ?? "",
    nameLabelId: expense.nameLabelId ?? "",
    descriptionLabelId: expense.descriptionLabelId ?? "",
  }
}

export function EditExpenseScreen({ id }: Readonly<{ id: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const updateMutation = useUpdateExpense()
  const [error, setError] = useState<string>()

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetExpenseById(id, {
    query: { enabled: !!id },
  })

  const handleSubmit = useCallback(
    async (
      values: ExpenseFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      if (!data?.id || data.version === undefined) {
        setError(t("expense.edit.missingVersion"))
        return false
      }

      const payload: ExpenseUpdateRequestDto = {
        id: data.id,
        version: data.version,
        code: values.code,
        expenseCategoryId: values.expenseCategoryId,
        nameLabelId: values.nameLabelId,
        descriptionLabelId: values.descriptionLabelId,
      }

      try {
        await updateMutation.mutateAsync({ id: data.id, data: payload })
        router.replace("/expenses")
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("expense.edit.error")))
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
          {getApiErrorMessage(fetchError, t("expense.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">{t("expense.edit.notFound")}</Text>
      </View>
    )
  }

  // Seeded expenses are system defaults — they are shown, never edited.
  const isLocked = data.editable === false

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("expense.edit.title")}
      </Text>

      {isLocked && (
        <View className="rounded-md bg-muted p-3">
          <Text className="text-muted-foreground">
            {t("expense.edit.locked")}
          </Text>
        </View>
      )}

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
        <RncForm<ExpenseFormValues>
          id="EditExpenseScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data)}
        >
          <View className="w-full gap-6">
            <ExpenseFormFields disabled={isLocked} />

            <View className="flex-row gap-3">
              {!isLocked && <RncSubmitButton label={t("expense.edit.save")} />}
              <Button
                variant="outline"
                onPress={() => router.replace("/expenses")}
              >
                <Text>
                  {isLocked ? t("expense.edit.back") : t("expense.edit.cancel")}
                </Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}
