"use client"

import { useTranslation } from "@workspace/i18n"
import {
  RncDateTimeField,
  RncInput,
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useExpenseCatalogOptions } from "../t-expense/use-expense-catalog-options"

export type TPaymentFormValues = {
  expenseId: string
  referenceDate?: Date | string
  amount: number
  dueDate?: Date | string
  invoiceNo?: string
  description?: string
}

export interface TPaymentFormFieldsProps {
  isCreateMode: boolean
  lockedExpenseId?: string
  lockedReferenceDate?: string
}

function toIsoDate(value: Date | string): string {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function toPaymentReferenceDate(
  value: Date | string | undefined
): string {
  if (!value) {
    const now = new Date()
    return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1))
  }
  const date = new Date(value)
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function TPaymentFormFields({
  isCreateMode,
  lockedExpenseId,
  lockedReferenceDate,
}: Readonly<TPaymentFormFieldsProps>) {
  const { t } = useTranslation(["screens"])
  const expenseCatalog = useExpenseCatalogOptions()

  return (
    <View className="w-full gap-6">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[240px] md:flex-1">
          {isCreateMode ? (
            <RncSelect
              id="expenseId"
              label={t("tPayment.form.fields.expense")}
              placeholder={t("tPayment.form.fields.expensePlaceholder")}
              required
              options={expenseCatalog.options}
            />
          ) : (
            <View className="gap-1">
              <Text className="font-medium text-foreground text-sm">
                {t("tPayment.form.fields.expense")}
              </Text>
              <Text className="text-foreground">
                {lockedExpenseId
                  ? (expenseCatalog.byId.get(lockedExpenseId) ??
                    lockedExpenseId)
                  : "—"}
              </Text>
            </View>
          )}
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          {isCreateMode ? (
            <RncDateTimeField
              id="referenceDate"
              type="month"
              label={t("tPayment.form.fields.referenceDate")}
              required
            />
          ) : (
            <View className="gap-1">
              <Text className="font-medium text-foreground text-sm">
                {t("tPayment.form.fields.referenceDate")}
              </Text>
              <Text className="text-foreground">
                {lockedReferenceDate
                  ? formatReferenceMonth(lockedReferenceDate)
                  : "—"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="amount"
            type="number"
            label={t("tPayment.form.fields.amount")}
            required
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncDateTimeField
            id="dueDate"
            type="month"
            label={t("tPayment.form.fields.dueDate")}
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncInput
            id="invoiceNo"
            label={t("tPayment.form.fields.invoiceNo")}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
      </View>

      <View className="w-full">
        <RncInput
          id="description"
          label={t("tPayment.form.fields.description")}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  )
}

function formatReferenceMonth(value: string): string {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getFullYear()}`
}
