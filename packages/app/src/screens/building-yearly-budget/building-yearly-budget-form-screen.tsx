"use client"

import {
  type BuildingYearlyBudgetCreateRequestDto,
  type BuildingYearlyBudgetResponseDto,
  type BuildingYearlyBudgetUpdateRequestDto,
  searchBuildingDistributions,
  useCreateBuildingYearlyBudget,
  useGetBuildingById,
  useGetBuildingYearlyBudgetById,
  useUpdateBuildingYearlyBudget,
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
  BuildingYearlyBudgetFormFields,
  type BuildingYearlyBudgetFormValues,
  MONTHS,
} from "./building-yearly-budget-form-fields"

/**
 * Create and edit a building's budget for one year.
 *
 * The twelve months are the point of the screen: they are what each unit is
 * actually billed, and which distribution table shares that month's cost out. The
 * backend refuses a budget that isn't all twelve, or whose month names a table
 * belonging to another building.
 */
export function BuildingYearlyBudgetFormScreen({
  buildingId,
  budgetId,
}: Readonly<{ buildingId: string; budgetId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = budgetId === "new"
  const entityId = isCreateMode ? undefined : budgetId
  const listRoute = `/buildings/${buildingId}/budgets`

  const createMutation = useCreateBuildingYearlyBudget()
  const updateMutation = useUpdateBuildingYearlyBudget()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingYearlyBudgetById(entityId ?? "", {
    query: { enabled: !!entityId },
  })

  // Every month must name one of *this* building's distribution tables — a table
  // from another building would split the cost across units that live somewhere
  // else. With no tables at all there is no budget to make, and the form says so.
  const [distributionTables, setDistributionTables] = useState<
    { id: string; name: string }[]
  >([])
  const [tablesLoading, setTablesLoading] = useState(true)

  useEffect(() => {
    if (!buildingId) {
      return
    }

    let cancelled = false
    setTablesLoading(true)

    const load = async () => {
      const response = await searchBuildingDistributions({
        page: 0,
        size: 100,
        buildingId,
      })
      if (cancelled) {
        return
      }
      // Default table first: a new budget pre-points every month at the head of
      // this list, and the default is the table the building uses when nothing
      // says otherwise — so it is the right guess for nearly every month.
      const tables = (response.content ?? [])
        .filter((table) => table.id != null)
        .sort(
          (a, b) => Number(b.isDefault ?? false) - Number(a.isDefault ?? false)
        )
        .map((table) => ({
          id: table.id as string,
          name: table.name ?? (table.id as string),
        }))

      setDistributionTables(tables)
      setTablesLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [buildingId])

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("yearlyBudget.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("yearlyBudget.create.title")
          : t("yearlyBudget.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: BuildingYearlyBudgetFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const year = new Date(values.refYear).getFullYear()

      const payload: BuildingYearlyBudgetCreateRequestDto = {
        // Scoped by the route, never by a field.
        buildingId,
        // The column is a DATE; only the year is meaningful, so it is pinned to
        // January 1st — the same convention v1 uses.
        refYear: `${year}-01-01`,
        // Note the bulk-helper fields are deliberately not spread in: they are
        // form-local scratch, not part of the budget.
        months: values.months.map((row) => ({
          id: row.id,
          month: row.month,
          amount: Number(row.amount) || 0,
          buildingDistributionId: row.buildingDistributionId,
        })),
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("yearlyBudget.edit.missingVersion"))
            return false
          }
          const updatePayload: BuildingYearlyBudgetUpdateRequestDto = {
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
        // A second budget for the same year lands here, with the server's message
        // ("A budget for 2026 already exists for this building.").
        setError(
          getApiErrorMessage(
            e,
            entityId
              ? t("yearlyBudget.edit.error")
              : t("yearlyBudget.create.error")
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

  if ((entityId && isLoading) || tablesLoading) {
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
          {getApiErrorMessage(fetchError, t("yearlyBudget.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("yearlyBudget.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode
          ? t("yearlyBudget.create.title")
          : t("yearlyBudget.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
        <RncForm<BuildingYearlyBudgetFormValues>
          id="BuildingYearlyBudgetFormScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data, distributionTables)}
        >
          <View className="w-full gap-6">
            <BuildingYearlyBudgetFormFields
              distributionTables={distributionTables}
            />

            <View className="flex-row gap-3">
              <RncSubmitButton
                label={
                  isCreateMode
                    ? t("yearlyBudget.create.save")
                    : t("yearlyBudget.edit.save")
                }
                disabled={distributionTables.length === 0}
              />
              <Button
                variant="outline"
                onPress={() => router.replace(listRoute)}
              >
                <Text>{t("yearlyBudget.edit.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}

/**
 * Always builds twelve rows, in calendar order — never however many the record
 * happens to carry.
 *
 * On create they start empty, pre-pointed at the building's **default** table (or
 * its first, if none is marked default), which is the choice the user would make
 * for nearly every month anyway. On edit the stored values fill them in.
 */
function toFormValues(
  budget: BuildingYearlyBudgetResponseDto | undefined,
  distributionTables: { id: string; name: string }[]
): BuildingYearlyBudgetFormValues {
  const stored = new Map((budget?.months ?? []).map((row) => [row.month, row]))
  const fallbackTableId = distributionTables[0]?.id ?? ""

  return {
    refYear: budget?.refYear ?? new Date(),
    months: MONTHS.map((month) => {
      const row = stored.get(month)
      return {
        id: row?.id,
        month,
        amount: Number(row?.amount ?? 0),
        buildingDistributionId: row?.buildingDistributionId ?? fallbackTableId,
      }
    }),
    bulkAmountFrom: "1",
    bulkTableFrom: "1",
  }
}
