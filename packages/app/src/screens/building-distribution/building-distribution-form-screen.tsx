"use client"

import {
  type BuildingDistributionCreateRequestDto,
  type BuildingDistributionResponseDto,
  type BuildingDistributionUpdateRequestDto,
  getBuildingDistributionById,
  searchBuildingDistributions,
  searchBuildingUnits,
  useCreateBuildingDistribution,
  useGetBuildingById,
  useGetBuildingDistributionById,
  useUpdateBuildingDistribution,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncForm,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import {
  BuildingDistributionFormFields,
  type BuildingDistributionFormValues,
} from "./building-distribution-form-fields"
import type { DistributionUnit } from "./distribution-calc"
import { totalsTo100 } from "./distribution-calc"

/**
 * Create and edit a distribution table, together with its per-unit shares.
 *
 * The shares are the point of the screen: they must cover every unit of the
 * building exactly once and total 100, or the backend refuses the save — a table
 * that doesn't add up would silently mis-charge every unit on every expense
 * routed through it.
 */
export function BuildingDistributionFormScreen({
  buildingId,
  distributionId,
}: Readonly<{ buildingId: string; distributionId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = distributionId === "new"
  const entityId = isCreateMode ? undefined : distributionId
  const listRoute = `/buildings/${buildingId}/distributions`

  const createMutation = useCreateBuildingDistribution()
  const updateMutation = useUpdateBuildingDistribution()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingDistributionById(entityId ?? "", {
    query: { enabled: !!entityId },
  })

  // The grid's rows are the building's units — fixed, not editable here — and the
  // building's other tables, so "copy the shares from that one" can be offered and
  // then applied without a further round trip.
  const [units, setUnits] = useState<DistributionUnit[]>([])
  const [otherTables, setOtherTables] = useState<
    { id: string; name: string }[]
  >([])
  const [sharesByTableId, setSharesByTableId] = useState<
    Record<string, Record<string, number>>
  >({})
  const [contextLoading, setContextLoading] = useState(true)

  useEffect(() => {
    if (!buildingId) {
      return
    }

    let cancelled = false
    setContextLoading(true)

    const load = async () => {
      const [unitPage, tablePage] = await Promise.all([
        searchBuildingUnits({ page: 0, size: 100, buildingId }),
        searchBuildingDistributions({ page: 0, size: 100, buildingId }),
      ])

      const loadedUnits: DistributionUnit[] = (unitPage.content ?? [])
        .filter((unit) => unit.id != null)
        .map((unit) => ({
          id: unit.id as string,
          code: unit.code ?? (unit.id as string),
          confinedSpace: Number(unit.confinedSpace ?? 0),
          coveredTerraces: Number(unit.coveredTerraces ?? 0),
          uncoveredTerraces: Number(unit.uncoveredTerraces ?? 0),
          storeRoom: Number(unit.storeRoom ?? 0),
          roofGardens: Number(unit.roofGardens ?? 0),
        }))

      const others = (tablePage.content ?? []).filter(
        (table) => table.id != null && table.id !== entityId
      )

      const shares: Record<string, Record<string, number>> = {}
      await Promise.all(
        others.map(async (table) => {
          const full = await getBuildingDistributionById(table.id as string)
          const byUnit: Record<string, number> = {}
          for (const row of full.percentages ?? []) {
            if (row.buildingUnitId) {
              byUnit[row.buildingUnitId] = Number(row.percentage ?? 0)
            }
          }
          shares[table.id as string] = byUnit
        })
      )

      if (cancelled) {
        return
      }
      setUnits(loadedUnits)
      setOtherTables(
        others.map((table) => ({
          id: table.id as string,
          name: table.name ?? (table.id as string),
        }))
      )
      setSharesByTableId(shares)
      setContextLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [buildingId, entityId])

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("buildingDistribution.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("buildingDistribution.create.title")
          : t("buildingDistribution.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: BuildingDistributionFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const shares = values.percentages.map((row) => ({
        buildingUnitId: row.buildingUnitId,
        percentage: Number(row.percentage) || 0,
      }))

      // The server enforces this too — this check exists so the user is told before
      // a round trip, not so the rule lives here.
      if (!totalsTo100(shares)) {
        setError(t("buildingDistribution.form.percentages.mustTotal"))
        return false
      }

      const payload: BuildingDistributionCreateRequestDto = {
        // Scoped by the route, never by a field.
        buildingId,
        name: values.name,
        isDefault: values.isDefault,
        isHidden: values.isHidden,
        // Hidden from the form; see BuildingDistributionFormValues.
        isBank: false,
        // A "copy from another table" choice is not a calculation type, so it
        // persists as no calc type at all.
        distributionCalcTypeId:
          values.calcSelection && !values.calcSelection.startsWith("DT-")
            ? values.calcSelection
            : undefined,
        percentages: shares,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("buildingDistribution.edit.missingVersion"))
            return false
          }
          const updatePayload: BuildingDistributionUpdateRequestDto = {
            ...payload,
            id: data.id,
            version: data.version,
          }
          await updateMutation.mutateAsync({ id: data.id, data: updatePayload })
        } else {
          await createMutation.mutateAsync({ data: payload })
        }
        router.replace(listRoute)
        return true
      } catch (e: unknown) {
        setError(
          getApiErrorMessage(
            e,
            entityId
              ? t("buildingDistribution.edit.error")
              : t("buildingDistribution.create.error")
          )
        )
        return false
      }
    },
    [
      buildingId,
      entityId,
      data,
      createMutation,
      updateMutation,
      router,
      listRoute,
      t,
    ]
  )

  if ((entityId && isLoading) || contextLoading) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Spinner />
      </View>
    )
  }

  if (entityId && isError) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {getApiErrorMessage(
            fetchError,
            t("buildingDistribution.edit.loadError")
          )}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("buildingDistribution.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode
          ? t("buildingDistribution.create.title")
          : t("buildingDistribution.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
        <RncForm<BuildingDistributionFormValues>
          id="BuildingDistributionFormScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data, units)}
        >
          <View className="w-full gap-6">
            <BuildingDistributionFormFields
              units={units}
              otherTables={otherTables}
              sharesByTableId={sharesByTableId}
            />

            <View className="flex-row gap-3">
              <RncSubmitButton
                label={
                  isCreateMode
                    ? t("buildingDistribution.create.save")
                    : t("buildingDistribution.edit.save")
                }
              />
              <Button
                variant="outline"
                onPress={() => router.replace(listRoute)}
              >
                <Text>{t("buildingDistribution.edit.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}

/**
 * Builds the form's rows from the building's units, not from what the table
 * happens to have stored.
 *
 * That matters on edit: a unit added after the table was written has no share
 * yet, and it must still appear — at 0% — so the user is forced to give it one
 * before the total can reach 100. v1 quietly appended such units at 0% and left
 * the total at 100, so the new unit simply paid nothing and nobody noticed.
 */
function toFormValues(
  table: BuildingDistributionResponseDto | undefined,
  units: DistributionUnit[]
): BuildingDistributionFormValues {
  const stored = new Map(
    (table?.percentages ?? []).map((row) => [
      row.buildingUnitId,
      Number(row.percentage ?? 0),
    ])
  )

  return {
    name: table?.name ?? "",
    isDefault: table?.isDefault ?? false,
    isHidden: table?.isHidden ?? false,
    calcSelection: table?.distributionCalcTypeId ?? "",
    percentages: units.map((unit) => ({
      buildingUnitId: unit.id,
      buildingUnitCode: unit.code,
      percentage: stored.get(unit.id) ?? 0,
    })),
  }
}
