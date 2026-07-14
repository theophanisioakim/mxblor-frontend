"use client"

import { useTranslation } from "@workspace/i18n"
import {
  RncCheckbox,
  RncInput,
  RncSelect,
  type RncSelectOption,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useDistributionCalcTypeOptions } from "../shared/use-reference-options"
import {
  calculateShares,
  copyFromTableId,
  copyFromTableOption,
  type DistributionShare,
  type DistributionUnit,
  isCopyFromTable,
  totalOf,
  totalsTo100,
} from "./distribution-calc"

/**
 * The form shape.
 *
 * `percentages` is the *complete desired state* on save: one row per unit of the
 * building, always. The rows are fixed — you cannot add or remove them here,
 * because they mirror the building's units, which are maintained on the Building
 * Units screens.
 *
 * `isBank` is deliberately absent. The column exists and the API accepts it, but
 * neither v1 nor v2 ever let a user set it, and it only becomes meaningful when
 * the building-fund expense engine is built — that feature can decide how it gets
 * set. Until then it keeps its default of false.
 */
export type BuildingDistributionFormValues = {
  name: string
  isDefault: boolean
  isHidden: boolean
  /** A reference id, or `DT-<tableId>` to copy another table. Not persisted as-is. */
  calcSelection: string
  percentages: {
    buildingUnitId: string
    buildingUnitCode: string
    percentage: number
  }[]
}

export interface BuildingDistributionFormFieldsProps {
  units: DistributionUnit[]
  /** The building's other tables, offered as "copy from" choices. */
  otherTables: { id: string; name: string }[]
  /** Shares of each other table, so a copy-from choice can be applied offline. */
  sharesByTableId: Record<string, Record<string, number>>
}

export function BuildingDistributionFormFields({
  units,
  otherTables,
  sharesByTableId,
}: Readonly<BuildingDistributionFormFieldsProps>) {
  const { t } = useTranslation(["screens"])
  const { setValue, control } = useFormContext<BuildingDistributionFormValues>()
  const calcTypes = useDistributionCalcTypeOptions()

  /**
   * The units whose share the user typed. Their values are held; the method fits
   * the rest of the table around them so the total is still exactly 100.
   */
  const [dirtyUnitIds, setDirtyUnitIds] = useState<string[]>([])

  const percentages = useWatch({ control, name: "percentages" }) ?? []

  const total = useMemo(
    () =>
      totalOf(
        percentages.map((row) => ({
          buildingUnitId: row.buildingUnitId,
          percentage: Number(row.percentage) || 0,
        }))
      ),
    [percentages]
  )

  const balanced = useMemo(
    () =>
      totalsTo100(
        percentages.map((row) => ({
          buildingUnitId: row.buildingUnitId,
          percentage: Number(row.percentage) || 0,
        }))
      ),
    [percentages]
  )

  const calcOptions: RncSelectOption[] = useMemo(() => {
    const methods = calcTypes.options
      .filter((option) => option.id != null)
      .map((option) => ({
        id: option.id as string,
        label: option.label ?? (option.key as string),
      }))

    // "Copy from <table>" is not a calculation type — it fills the grid and leaves
    // the table's calc type null, because no reference row means "whatever that
    // other table happened to say".
    const copies = otherTables.map((table) => ({
      id: copyFromTableOption(table.id),
      label: t("buildingDistribution.form.calc.copyFrom", { name: table.name }),
    }))

    return [...methods, ...copies]
  }, [calcTypes.options, otherTables, t])

  /** Applies the chosen method to every row the user has not typed into. */
  const applyMethod = useCallback(
    (selection: string) => {
      if (!selection || units.length === 0) {
        return
      }

      const current: DistributionShare[] = percentages.map((row) => ({
        buildingUnitId: row.buildingUnitId,
        percentage: Number(row.percentage) || 0,
      }))

      const copyFrom = isCopyFromTable(selection)
        ? sharesByTableId[copyFromTableId(selection)]
        : undefined

      const next = calculateShares({
        units,
        calcTypeKey: isCopyFromTable(selection)
          ? ""
          : (calcTypes.keyById.get(selection) ?? ""),
        current,
        // Choosing a method is a fresh start: it overwrites the whole grid, which
        // is why the dirty set is cleared rather than honoured here.
        dirtyUnitIds: [],
        copyFrom,
      })

      const byUnit = new Map(next.map((row) => [row.buildingUnitId, row]))
      setValue(
        "percentages",
        units.map((unit) => ({
          buildingUnitId: unit.id,
          buildingUnitCode: unit.code,
          percentage: byUnit.get(unit.id)?.percentage ?? 0,
        })),
        { shouldDirty: true }
      )
      setDirtyUnitIds([])
    },
    [units, percentages, sharesByTableId, calcTypes.keyById, setValue]
  )

  /**
   * A hand-typed share is the user's. The difference it creates is absorbed by the
   * rows they have *not* touched, so the total stays 100 without ever writing back
   * over a number they entered.
   */
  const rebalanceAround = useCallback(
    (unitId: string, selection: string) => {
      const nextDirty = dirtyUnitIds.includes(unitId)
        ? dirtyUnitIds
        : [...dirtyUnitIds, unitId]

      const current: DistributionShare[] = percentages.map((row) => ({
        buildingUnitId: row.buildingUnitId,
        percentage: Number(row.percentage) || 0,
      }))

      const copyFrom =
        selection && isCopyFromTable(selection)
          ? sharesByTableId[copyFromTableId(selection)]
          : undefined

      const next = calculateShares({
        units,
        calcTypeKey:
          selection && !isCopyFromTable(selection)
            ? (calcTypes.keyById.get(selection) ?? "")
            : "",
        current,
        dirtyUnitIds: nextDirty,
        copyFrom,
      })

      const byUnit = new Map(next.map((row) => [row.buildingUnitId, row]))
      setValue(
        "percentages",
        units.map((unit) => ({
          buildingUnitId: unit.id,
          buildingUnitCode: unit.code,
          percentage: byUnit.get(unit.id)?.percentage ?? 0,
        })),
        { shouldDirty: true }
      )
      setDirtyUnitIds(nextDirty)
    },
    [
      dirtyUnitIds,
      percentages,
      units,
      sharesByTableId,
      calcTypes.keyById,
      setValue,
    ]
  )

  const selection = useWatch({ control, name: "calcSelection" }) ?? ""

  return (
    <View className="w-full gap-6">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[240px] md:flex-1">
          <RncInput
            id="name"
            label={t("buildingDistribution.form.fields.name")}
            placeholder={t("buildingDistribution.form.fields.namePlaceholder")}
            required
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[140px]">
          <RncCheckbox
            id="isDefault"
            label={t("buildingDistribution.form.fields.isDefault")}
            helperText={t("buildingDistribution.form.fields.isDefaultHelp")}
          />
        </View>
        <View className="md:min-w-[140px]">
          <RncCheckbox
            id="isHidden"
            label={t("buildingDistribution.form.fields.isHidden")}
          />
        </View>
      </View>

      {/* ── Percentages ────────────────────────────────────────────────── */}
      <View className="w-full gap-3 rounded-md border border-border p-3 md:p-4">
        <View className="flex-row flex-wrap items-end justify-between gap-3">
          <Text className="font-semibold text-foreground text-lg">
            {t("buildingDistribution.form.percentages.title")}
          </Text>
          <View className="min-w-[240px] flex-1 md:max-w-[360px]">
            <RncSelect
              id="calcSelection"
              label={t("buildingDistribution.form.calc.method")}
              placeholder={t("buildingDistribution.form.calc.placeholder")}
              options={calcOptions}
              onChange={async (value) => {
                applyMethod(String(value ?? ""))
              }}
            />
          </View>
        </View>

        {units.length === 0 ? (
          <Text className="text-destructive text-sm">
            {t("buildingDistribution.form.percentages.noUnits")}
          </Text>
        ) : (
          <>
            {percentages.map((row, index) => (
              <View
                key={row.buildingUnitId}
                className="gap-3 md:flex-row md:items-end"
              >
                <View className="justify-end md:min-w-[160px] md:flex-1">
                  <Text className="text-foreground text-sm">
                    {row.buildingUnitCode}
                  </Text>
                </View>
                <View className="md:min-w-[200px] md:flex-1">
                  <RncInput
                    id={`percentages.${index}.percentage`}
                    type="number"
                    label={t(
                      "buildingDistribution.form.percentages.percentage"
                    )}
                    required
                    numberValidationRules={{
                      min: 0,
                      max: 100,
                      positiveOnly: true,
                    }}
                    onBlur={async () => {
                      rebalanceAround(row.buildingUnitId, selection)
                    }}
                  />
                </View>
              </View>
            ))}

            <View className="flex-row items-center justify-end gap-2 border-border border-t pt-3">
              <Text className="font-semibold text-foreground">
                {t("buildingDistribution.form.percentages.total")}
              </Text>
              <Text
                className={
                  balanced
                    ? "font-semibold text-foreground"
                    : "font-semibold text-destructive"
                }
              >
                {`${total}%`}
              </Text>
            </View>

            {!balanced && (
              <Text className="text-destructive text-sm">
                {t("buildingDistribution.form.percentages.mustTotal")}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  )
}
