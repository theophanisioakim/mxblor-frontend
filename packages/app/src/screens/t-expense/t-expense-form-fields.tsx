"use client"

import { useTranslation } from "@workspace/i18n"
import {
  RncDateTimeField,
  RncInput,
  RncSelect,
  type RncSelectOption,
  Text,
  View,
} from "@workspace/ui"
import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useBuildingDistributionOptions } from "./use-building-distribution-options"
import {
  DISTRIBUTED_COLLECTION_TYPE_KEYS,
  NON_DISTRIBUTED_COLLECTION_TYPE_KEY,
  useCollectionTypeOptions,
} from "./use-collection-type-options"
import { useExpenseCatalogOptions } from "./use-expense-catalog-options"

export type TExpenseFormValues = {
  expenseId: string
  collectionTypeId: string
  buildingDistributionId: string
  amount: number
  periodStart?: Date | string
  periodEnd?: Date | string
  description: string
}

export interface TExpenseFormFieldsProps {
  buildingId: string
  isCreateMode: boolean
  lockedCollectionTypeKey?: string
  lockedReferenceDate?: string
}

function firstDayOfMonth(value: Date | string): Date {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function formatMonthYear(value: Date | string): string {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getFullYear()}`
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function TExpenseFormFields({
  buildingId,
  isCreateMode,
  lockedCollectionTypeKey,
  lockedReferenceDate,
}: Readonly<TExpenseFormFieldsProps>) {
  const { t } = useTranslation(["screens"])
  const { setValue, control } = useFormContext<TExpenseFormValues>()

  const expenseCatalog = useExpenseCatalogOptions()
  const collectionTypes = useCollectionTypeOptions()
  const distributionTables = useBuildingDistributionOptions(buildingId)

  const expenseId = useWatch({ control, name: "expenseId" }) ?? ""
  const collectionTypeId = useWatch({ control, name: "collectionTypeId" }) ?? ""
  const periodStart = useWatch({ control, name: "periodStart" })

  const collectionTypeKey =
    lockedCollectionTypeKey ??
    collectionTypes.keyById.get(collectionTypeId) ??
    ""

  const isDistributed = DISTRIBUTED_COLLECTION_TYPE_KEYS.has(collectionTypeKey)
  const isNonDistributed =
    collectionTypeKey === NON_DISTRIBUTED_COLLECTION_TYPE_KEY

  const expenseOptions: RncSelectOption[] = useMemo(
    () =>
      expenseCatalog.options.map((option) => ({
        id: option.id,
        label: option.label,
      })),
    [expenseCatalog.options]
  )

  const collectionTypeOptions: RncSelectOption[] = useMemo(
    () =>
      collectionTypes.options.map((option) => ({
        id: option.id,
        label: option.label,
      })),
    [collectionTypes.options]
  )

  const distributionOptions: RncSelectOption[] = useMemo(
    () =>
      distributionTables.options.map((option) => ({
        id: option.id,
        label: option.label,
      })),
    [distributionTables.options]
  )

  useEffect(() => {
    if (!isCreateMode || !expenseId || !periodStart) {
      return
    }

    const expenseLabel = expenseCatalog.byId.get(expenseId) ?? ""
    const expenseName = expenseLabel.includes("—")
      ? expenseLabel.split("—").slice(1).join("—").trim()
      : expenseLabel

    setValue(
      "description",
      `${expenseName} ${formatMonthYear(periodStart)}`.trim(),
      { shouldDirty: false }
    )
  }, [expenseCatalog.byId, expenseId, isCreateMode, periodStart, setValue])

  return (
    <View className="gap-4">
      <RncSelect
        id="expenseId"
        label={t("tExpense.form.fields.expense")}
        placeholder={t("tExpense.form.fields.expensePlaceholder")}
        options={expenseOptions}
        required
        disabled={!isCreateMode}
      />

      <RncSelect
        id="collectionTypeId"
        label={t("tExpense.form.fields.collectionType")}
        placeholder={t("tExpense.form.fields.collectionTypePlaceholder")}
        options={collectionTypeOptions}
        required
        disabled={!isCreateMode}
      />

      {!isNonDistributed && (
        <RncSelect
          id="buildingDistributionId"
          label={t("tExpense.form.fields.distributionTable")}
          placeholder={t("tExpense.form.fields.distributionTablePlaceholder")}
          options={distributionOptions}
          required={isDistributed}
        />
      )}

      {isCreateMode ? (
        <>
          <RncDateTimeField
            id="periodStart"
            type="month"
            label={t("tExpense.form.fields.periodStart")}
            required
          />
          {isDistributed && (
            <RncDateTimeField
              id="periodEnd"
              type="month"
              label={t("tExpense.form.fields.periodEnd")}
              required
            />
          )}
        </>
      ) : (
        <View className="gap-1">
          <Text className="font-medium text-foreground text-sm">
            {t("tExpense.form.fields.referenceDate")}
          </Text>
          <Text className="text-foreground">
            {lockedReferenceDate ? formatMonthYear(lockedReferenceDate) : "—"}
          </Text>
        </View>
      )}

      <RncInput
        id="amount"
        label={t("tExpense.form.fields.amount")}
        type="number"
        required
      />

      <View className="gap-1">
        <RncInput
          id="description"
          label={t("tExpense.form.fields.description")}
          readOnly
          disabled
        />
        <Text className="text-muted-foreground text-sm">
          {t("tExpense.form.fields.descriptionHelp")}
        </Text>
      </View>

      {!isCreateMode &&
        distributionTables.options.length === 0 &&
        isDistributed && (
          <Text className="text-destructive text-sm">
            {t("tExpense.form.noDistributionTables")}
          </Text>
        )}
    </View>
  )
}

export function toSpreadPeriodStart(value: Date | string | undefined): string {
  if (!value) {
    throw new Error("periodStart is required")
  }
  return toIsoDate(firstDayOfMonth(value))
}

export function toSpreadPeriodEnd(
  value: Date | string | undefined
): string | undefined {
  if (!value) {
    return undefined
  }
  return toIsoDate(firstDayOfMonth(value))
}
