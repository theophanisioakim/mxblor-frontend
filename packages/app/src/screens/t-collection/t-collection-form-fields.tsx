"use client"

import { useTranslation } from "@workspace/i18n"
import {
  RncDateTimeField,
  RncInput,
  RncSelect,
  Text,
  View,
} from "@workspace/ui"
import { useCollectionTypeOptions } from "../t-expense/use-collection-type-options"
import { useExpenseCatalogOptions } from "../t-expense/use-expense-catalog-options"
import { toPaymentReferenceDate } from "../t-payment/t-payment-form-fields"
import { useBuildingUnitOptions } from "./use-building-unit-options"
import { usePaymentChannelOptions } from "./use-payment-channel-options"

export type TCollectionFormValues = {
  buildingUnitId: string
  expenseId: string
  collectionTypeId: string
  referenceDate?: Date | string
  amount: number
  dueDate?: Date | string
  paymentChannelId?: string
  receiptNo?: string
  description?: string
}

export interface TCollectionFormFieldsProps {
  buildingId: string
  isCreateMode: boolean
  lockedBuildingUnitId?: string
  lockedExpenseId?: string
  lockedCollectionTypeId?: string
  lockedReferenceDate?: string
}

function formatReferenceMonth(value: string): string {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getFullYear()}`
}

export { toPaymentReferenceDate as toCollectionReferenceDate }

export function TCollectionFormFields({
  buildingId,
  isCreateMode,
  lockedBuildingUnitId,
  lockedExpenseId,
  lockedCollectionTypeId,
  lockedReferenceDate,
}: Readonly<TCollectionFormFieldsProps>) {
  const { t } = useTranslation(["screens"])
  const expenseCatalog = useExpenseCatalogOptions()
  const collectionTypes = useCollectionTypeOptions()
  const buildingUnits = useBuildingUnitOptions(buildingId)
  const paymentChannels = usePaymentChannelOptions()

  return (
    <View className="w-full gap-6">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          {isCreateMode ? (
            <RncSelect
              id="buildingUnitId"
              label={t("tCollection.form.fields.unit")}
              placeholder={t("tCollection.form.fields.unitPlaceholder")}
              required
              options={buildingUnits.options}
            />
          ) : (
            <View className="gap-1">
              <Text className="font-medium text-foreground text-sm">
                {t("tCollection.form.fields.unit")}
              </Text>
              <Text className="text-foreground">
                {lockedBuildingUnitId
                  ? (buildingUnits.byId.get(lockedBuildingUnitId) ??
                    lockedBuildingUnitId)
                  : "—"}
              </Text>
            </View>
          )}
        </View>
        <View className="md:min-w-[220px] md:flex-1">
          {isCreateMode ? (
            <RncSelect
              id="expenseId"
              label={t("tCollection.form.fields.expense")}
              placeholder={t("tCollection.form.fields.expensePlaceholder")}
              required
              options={expenseCatalog.options}
            />
          ) : (
            <View className="gap-1">
              <Text className="font-medium text-foreground text-sm">
                {t("tCollection.form.fields.expense")}
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
            <RncSelect
              id="collectionTypeId"
              label={t("tCollection.form.fields.collectionType")}
              placeholder={t(
                "tCollection.form.fields.collectionTypePlaceholder"
              )}
              required
              options={collectionTypes.options}
            />
          ) : (
            <View className="gap-1">
              <Text className="font-medium text-foreground text-sm">
                {t("tCollection.form.fields.collectionType")}
              </Text>
              <Text className="text-foreground">
                {lockedCollectionTypeId
                  ? (collectionTypes.byId.get(lockedCollectionTypeId) ??
                    lockedCollectionTypeId)
                  : "—"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[180px] md:flex-1">
          {isCreateMode ? (
            <RncDateTimeField
              id="referenceDate"
              type="month"
              label={t("tCollection.form.fields.referenceDate")}
              required
            />
          ) : (
            <View className="gap-1">
              <Text className="font-medium text-foreground text-sm">
                {t("tCollection.form.fields.referenceDate")}
              </Text>
              <Text className="text-foreground">
                {lockedReferenceDate
                  ? formatReferenceMonth(lockedReferenceDate)
                  : "—"}
              </Text>
            </View>
          )}
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="amount"
            type="number"
            label={t("tCollection.form.fields.amount")}
            required
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncDateTimeField
            id="dueDate"
            type="month"
            label={t("tCollection.form.fields.dueDate")}
          />
        </View>
      </View>

      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncSelect
            id="paymentChannelId"
            label={t("tCollection.form.fields.paymentChannel")}
            placeholder={t("tCollection.form.fields.paymentChannelPlaceholder")}
            options={paymentChannels.options}
          />
        </View>
        {!isCreateMode && (
          <View className="md:min-w-[160px] md:flex-1">
            <RncInput
              id="receiptNo"
              label={t("tCollection.form.fields.receiptNo")}
              disabled
            />
          </View>
        )}
      </View>

      <View className="w-full">
        <RncInput
          id="description"
          label={t("tCollection.form.fields.description")}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  )
}
