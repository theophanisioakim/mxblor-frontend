"use client"

import { useTranslation } from "@workspace/i18n"
import {
  Button,
  RncDateTimeField,
  RncDialog,
  RncInput,
  RncSelect,
  type RncSelectOption,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

/**
 * The form shape.
 *
 * `months` is the *complete desired state* on save, and it is always **twelve
 * rows** — a budget covers a whole year. The rows are fixed: you cannot add or
 * remove a month, because a month nobody is billed for is a gap that only shows
 * up when the money doesn't arrive. The backend refuses anything but twelve.
 */
export type BuildingYearlyBudgetFormValues = {
  /** A `Date` from the year picker, or the ISO date the API returned. */
  refYear: Date | string
  months: {
    id?: string
    month: number
    amount: number
    buildingDistributionId: string
  }[]
  /**
   * The bulk-helper dialogs' fields.
   *
   * They live in the form rather than in local state because `RncInput` and
   * `RncSelect` are react-hook-form fields — they bind by `id`, and there is no
   * controlled variant. They are transient: the submit handler builds its payload
   * from `refYear` and `months` only, so these never reach the API.
   */
  bulkAmount?: number
  bulkAmountFrom?: string
  bulkTable?: string
  bulkTableFrom?: string
}

export interface BuildingYearlyBudgetFormFieldsProps {
  /** The building's distribution tables — the only ones a month may name. */
  distributionTables: { id: string; name: string }[]
}

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

/**
 * The month labels, as literal keys.
 *
 * Spelled out rather than built with a template literal because `useTranslation`
 * is type-safe: a key assembled from a `number` widens to `string` and stops
 * type-checking against the locale files.
 */
const MONTH_LABEL_KEYS = [
  "yearlyBudget.months.1",
  "yearlyBudget.months.2",
  "yearlyBudget.months.3",
  "yearlyBudget.months.4",
  "yearlyBudget.months.5",
  "yearlyBudget.months.6",
  "yearlyBudget.months.7",
  "yearlyBudget.months.8",
  "yearlyBudget.months.9",
  "yearlyBudget.months.10",
  "yearlyBudget.months.11",
  "yearlyBudget.months.12",
] as const

function monthLabelKey(month: number): (typeof MONTH_LABEL_KEYS)[number] {
  return MONTH_LABEL_KEYS[month - 1] ?? MONTH_LABEL_KEYS[0]
}

export function BuildingYearlyBudgetFormFields({
  distributionTables,
}: Readonly<BuildingYearlyBudgetFormFieldsProps>) {
  const { t } = useTranslation(["screens"])
  const { setValue, control } = useFormContext<BuildingYearlyBudgetFormValues>()

  const months = useWatch({ control, name: "months" }) ?? []

  const tableOptions: RncSelectOption[] = useMemo(
    () =>
      distributionTables.map((table) => ({
        id: table.id,
        label: table.name,
      })),
    [distributionTables]
  )

  const monthOptions: RncSelectOption[] = useMemo(
    () =>
      MONTHS.map((month) => ({
        id: String(month),
        label: t(monthLabelKey(month)),
      })),
    [t]
  )

  const total = useMemo(
    () => months.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [months]
  )

  // ── Bulk helpers ────────────────────────────────────────────────────────
  // A building usually charges the same amount through the same table for most of
  // the year, so filling twelve rows by hand is twelve chances to fat-finger one.
  // Both helpers apply from a chosen month *onwards* — which is what a mid-year
  // change actually looks like.
  const [amountDialogOpen, setAmountDialogOpen] = useState(false)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)

  const bulkAmount = useWatch({ control, name: "bulkAmount" })
  const bulkAmountFrom = useWatch({ control, name: "bulkAmountFrom" }) ?? "1"
  const bulkTable = useWatch({ control, name: "bulkTable" })
  const bulkTableFrom = useWatch({ control, name: "bulkTableFrom" }) ?? "1"

  const applyAmountFromMonth = useCallback(() => {
    const amount = Number(bulkAmount)
    const from = Number(bulkAmountFrom)
    if (!Number.isFinite(amount) || amount < 0) {
      return
    }

    for (const [index, row] of months.entries()) {
      if (row.month >= from) {
        setValue(`months.${index}.amount`, amount, { shouldDirty: true })
      }
    }
    setAmountDialogOpen(false)
  }, [bulkAmount, bulkAmountFrom, months, setValue])

  const applyTableFromMonth = useCallback(() => {
    const from = Number(bulkTableFrom)
    if (!bulkTable) {
      return
    }

    for (const [index, row] of months.entries()) {
      if (row.month >= from) {
        setValue(`months.${index}.buildingDistributionId`, bulkTable, {
          shouldDirty: true,
        })
      }
    }
    setTableDialogOpen(false)
  }, [bulkTable, bulkTableFrom, months, setValue])

  return (
    <View className="w-full gap-6">
      <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
        <View className="md:min-w-[200px] md:flex-1">
          <RncDateTimeField
            id="refYear"
            type="year"
            label={t("yearlyBudget.form.fields.refYear")}
            required
          />
        </View>
        <View className="flex-row flex-wrap gap-3">
          <Button
            variant="outline"
            onPress={() => setAmountDialogOpen(true)}
            disabled={distributionTables.length === 0}
          >
            <Text>{t("yearlyBudget.form.bulk.setAmount")}</Text>
          </Button>
          <Button
            variant="outline"
            onPress={() => setTableDialogOpen(true)}
            disabled={distributionTables.length === 0}
          >
            <Text>{t("yearlyBudget.form.bulk.setTable")}</Text>
          </Button>
        </View>
      </View>

      {/* ── The twelve months ───────────────────────────────────────────── */}
      <View className="w-full gap-3 rounded-md border border-border p-3 md:p-4">
        <Text className="font-semibold text-foreground text-lg">
          {t("yearlyBudget.form.months.title")}
        </Text>

        {distributionTables.length === 0 ? (
          <Text className="text-destructive text-sm">
            {t("yearlyBudget.form.months.noTables")}
          </Text>
        ) : (
          <>
            {months.map((row, index) => (
              <View key={row.month} className="gap-3 md:flex-row md:items-end">
                <View className="justify-end md:min-w-[120px]">
                  <Text className="text-foreground text-sm">
                    {t(monthLabelKey(row.month))}
                  </Text>
                </View>
                <View className="md:min-w-[160px] md:flex-1">
                  <RncInput
                    id={`months.${index}.amount`}
                    type="number"
                    label={t("yearlyBudget.form.months.amount")}
                    required
                    numberValidationRules={{
                      min: 0,
                      positiveOnly: true,
                      decimalPlaces: 2,
                    }}
                  />
                </View>
                <View className="md:min-w-[220px] md:flex-[2]">
                  <RncSelect
                    id={`months.${index}.buildingDistributionId`}
                    label={t("yearlyBudget.form.months.table")}
                    placeholder={t("yearlyBudget.form.months.tablePlaceholder")}
                    required
                    options={tableOptions}
                  />
                </View>
              </View>
            ))}

            <View className="flex-row items-center justify-end gap-2 border-border border-t pt-3">
              <Text className="font-semibold text-foreground">
                {t("yearlyBudget.form.months.total")}
              </Text>
              <Text className="font-semibold text-foreground">
                {total.toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Plain local state, not a nested RncForm: a form inside a form would make
          the outer Save submit the dialog's fields too. */}
      <RncDialog
        open={amountDialogOpen}
        onOpenChange={setAmountDialogOpen}
        title={t("yearlyBudget.form.bulk.setAmount")}
        description={t("yearlyBudget.form.bulk.setAmountHelp")}
        onCancel={() => setAmountDialogOpen(false)}
        cancelLabel={t("yearlyBudget.form.bulk.cancel")}
        onConfirm={applyAmountFromMonth}
        confirmLabel={t("yearlyBudget.form.bulk.apply")}
        confirmDisabled={bulkAmount === undefined}
      >
        <View className="gap-3">
          <RncInput
            id="bulkAmount"
            type="number"
            label={t("yearlyBudget.form.months.amount")}
            numberValidationRules={{ min: 0, positiveOnly: true }}
          />
          <RncSelect
            id="bulkAmountFrom"
            label={t("yearlyBudget.form.bulk.fromMonth")}
            options={monthOptions}
            defaultValue="1"
          />
        </View>
      </RncDialog>

      <RncDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        title={t("yearlyBudget.form.bulk.setTable")}
        description={t("yearlyBudget.form.bulk.setTableHelp")}
        onCancel={() => setTableDialogOpen(false)}
        cancelLabel={t("yearlyBudget.form.bulk.cancel")}
        onConfirm={applyTableFromMonth}
        confirmLabel={t("yearlyBudget.form.bulk.apply")}
        confirmDisabled={!bulkTable}
      >
        <View className="gap-3">
          <RncSelect
            id="bulkTable"
            label={t("yearlyBudget.form.months.table")}
            options={tableOptions}
          />
          <RncSelect
            id="bulkTableFrom"
            label={t("yearlyBudget.form.bulk.fromMonth")}
            options={monthOptions}
            defaultValue="1"
          />
        </View>
      </RncDialog>
    </View>
  )
}
