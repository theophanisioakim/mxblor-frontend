"use client"

import {
  type ExpenseCreateRequestDto,
  useCreateExpense,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter, useSearchParams } from "@workspace/router"
import { Button, RncForm, RncSubmitButton, Text, View } from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, formPermissions } from "../screen-permissions"
import {
  ExpenseFormFields,
  type ExpenseFormValues,
} from "./expense-form-fields"

export function CreateExpenseScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { canCreate } = useCrudPermissions(crudPermissions.expense)
  const createMutation = useCreateExpense()
  const [error, setError] = useState<string>()

  // Reached from an expense category's own screen ("Add expense" on its
  // expenses grid), which passes the category through the query string. The
  // category is then pinned, and cancelling goes back where the user came from.
  const presetCategoryId = searchParams.get("categoryId") ?? undefined
  const cancelRoute = presetCategoryId
    ? `/expenses/categories/${presetCategoryId}`
    : "/expenses"

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
        router.replace(cancelRoute)
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("expense.create.error")))
        return false
      }
    },
    [createMutation, router, t, cancelRoute]
  )

  return (
    <PermissionGuard permission={formPermissions.expense.create}>
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
            defaultValues={
              presetCategoryId
                ? { expenseCategoryId: presetCategoryId }
                : undefined
            }
          >
            <View className="w-full gap-6">
              <ExpenseFormFields categoryLocked={!!presetCategoryId} />

              <View className="flex-row gap-3">
                <RncSubmitButton
                  disabled={!canCreate}
                  label={t("expense.create.save")}
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(cancelRoute)}
                >
                  <Text>{t("expense.create.cancel")}</Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
