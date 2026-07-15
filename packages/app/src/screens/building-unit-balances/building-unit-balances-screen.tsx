"use client"

import {
  searchTCollectionUnitBalances,
  type TCollectionOpeningBalanceRequestDto,
  type TCollectionUnitBalanceDto,
  updateTCollectionOpeningBalances,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncDateTimeField,
  RncForm,
  RncInput,
  RncSubmitButton,
  Spinner,
  Text,
  useIsMobile,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { type UseFormReturn, useWatch } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import {
  defaultOpeningBalanceDate,
  formatBalance,
  formatDateOnly,
  parseDateOnly,
  previewBalance,
} from "./unit-balance-calculations"

const PAGE_SIZE = 100

export interface BuildingUnitBalancesScreenProps {
  buildingId: string
}

export type BuildingUnitBalanceFormValues = {
  referenceDate?: Date
  balances: Array<{
    buildingUnitId: string
    capital: number
    monthly: number
  }>
}

export type BuildingUnitBalanceSheet = {
  referenceDate?: string
  rows: TCollectionUnitBalanceDto[]
}

/** Loads every API page before the building-wide form becomes editable. */
export async function fetchAllBuildingUnitBalances(
  buildingId: string,
  signal?: AbortSignal
): Promise<BuildingUnitBalanceSheet> {
  const rows: TCollectionUnitBalanceDto[] = []
  let referenceDate: string | undefined
  let page = 0

  while (true) {
    const response = await searchTCollectionUnitBalances(
      { buildingId, page, size: PAGE_SIZE },
      signal
    )
    referenceDate ??= response.referenceDate
    rows.push(...(response.content ?? []))

    const totalPages = response.totalPages ?? 1
    if (response.last ?? page + 1 >= totalPages) break
    page += 1
  }

  return { referenceDate, rows }
}

function amount(value?: number): number {
  return Number.isFinite(value) ? (value ?? 0) : 0
}

function toFormValues(
  sheet: BuildingUnitBalanceSheet,
  fallbackDate: Date
): BuildingUnitBalanceFormValues {
  return {
    referenceDate: parseDateOnly(sheet.referenceDate) ?? fallbackDate,
    balances: sheet.rows
      .filter(
        (row): row is TCollectionUnitBalanceDto & { buildingUnitId: string } =>
          !!row.buildingUnitId
      )
      .map((row) => ({
        buildingUnitId: row.buildingUnitId,
        capital: amount(row.openingCapital),
        monthly: amount(row.openingMonthly),
      })),
  }
}

function ReadOnlyAmount({
  label,
  value,
}: Readonly<{ label?: string; value: number }>) {
  return (
    <View className="min-w-[90px] flex-1 gap-1">
      {label && (
        <Text className="font-medium text-muted-foreground text-xs">
          {label}
        </Text>
      )}
      <Text className="font-medium text-foreground tabular-nums">
        {formatBalance(value)}
      </Text>
    </View>
  )
}

function BalanceRow({
  index,
  row,
  mobile,
}: Readonly<{
  index: number
  row: TCollectionUnitBalanceDto
  mobile: boolean
}>) {
  const { t } = useTranslation(["screens"])
  const capital = useWatch<BuildingUnitBalanceFormValues>({
    name: `balances.${index}.capital`,
  })
  const monthly = useWatch<BuildingUnitBalanceFormValues>({
    name: `balances.${index}.monthly`,
  })

  const previewCapital = previewBalance(
    amount(row.capital),
    amount(capital as number),
    amount(row.openingCapital)
  )
  const previewMonthly = previewBalance(
    amount(row.monthly),
    amount(monthly as number),
    amount(row.openingMonthly)
  )

  if (mobile) {
    return (
      <View className="gap-4 rounded-lg border border-border bg-background p-4">
        <Text className="font-bold text-foreground text-lg">
          {row.buildingUnitCode ?? row.buildingUnitId ?? "—"}
        </Text>
        <View className="gap-3">
          <RncInput
            id={`balances.${index}.capital`}
            type="number"
            label={t("buildingUnitBalances.columns.openingCapital")}
            required
            numberValidationRules={{ decimalPlaces: 2 }}
          />
          <RncInput
            id={`balances.${index}.monthly`}
            type="number"
            label={t("buildingUnitBalances.columns.openingMonthly")}
            required
            numberValidationRules={{ decimalPlaces: 2 }}
          />
        </View>
        <View className="flex-row flex-wrap gap-3 rounded-md bg-muted/50 p-3">
          <ReadOnlyAmount
            label={t("buildingUnitBalances.columns.liveCapital")}
            value={previewCapital}
          />
          <ReadOnlyAmount
            label={t("buildingUnitBalances.columns.liveMonthly")}
            value={previewMonthly}
          />
          <ReadOnlyAmount
            label={t("buildingUnitBalances.columns.total")}
            value={previewCapital + previewMonthly}
          />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-row items-center gap-3 border-border border-t py-3">
      <View className="min-w-[80px] flex-[0.8]">
        <Text className="font-medium text-foreground">
          {row.buildingUnitCode ?? row.buildingUnitId ?? "—"}
        </Text>
      </View>
      <View className="min-w-[120px] flex-1">
        <RncInput
          id={`balances.${index}.capital`}
          type="number"
          required
          numberValidationRules={{ decimalPlaces: 2 }}
        />
      </View>
      <View className="min-w-[120px] flex-1">
        <RncInput
          id={`balances.${index}.monthly`}
          type="number"
          required
          numberValidationRules={{ decimalPlaces: 2 }}
        />
      </View>
      <ReadOnlyAmount value={previewCapital} />
      <ReadOnlyAmount value={previewMonthly} />
      <ReadOnlyAmount value={previewCapital + previewMonthly} />
    </View>
  )
}

function TableHeader() {
  const { t } = useTranslation(["screens"])
  const headers = [
    ["unit", "min-w-[80px] flex-[0.8]"],
    ["openingCapital", "min-w-[120px] flex-1"],
    ["openingMonthly", "min-w-[120px] flex-1"],
    ["liveCapital", "min-w-[90px] flex-1"],
    ["liveMonthly", "min-w-[90px] flex-1"],
    ["total", "min-w-[90px] flex-1"],
  ] as const

  return (
    <View className="flex-row gap-3 pb-3">
      {headers.map(([key, className]) => (
        <View key={key} className={className}>
          <Text className="font-semibold text-muted-foreground text-sm">
            {t(`buildingUnitBalances.columns.${key}`)}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function BuildingUnitBalancesScreen({
  buildingId,
}: Readonly<BuildingUnitBalancesScreenProps>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()
  const mobile = useIsMobile()
  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })
  const [sheet, setSheet] = useState<BuildingUnitBalanceSheet>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const activeRequest = useRef<AbortController | undefined>(undefined)

  const fallbackDate = useMemo(
    () => defaultOpeningBalanceDate(building?.startedAt),
    [building?.startedAt]
  )

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("buildingUnitBalances.title") },
    ])
  }, [building, buildingId, setItems, t])

  const load = useCallback(
    async (
      showLoading = true
    ): Promise<BuildingUnitBalanceSheet | undefined> => {
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller
      if (showLoading) setLoading(true)
      setError(undefined)

      try {
        const result = await fetchAllBuildingUnitBalances(
          buildingId,
          controller.signal
        )
        setSheet(result)
        return result
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return undefined
        setError(
          getApiErrorMessage(loadError, t("buildingUnitBalances.loadError"))
        )
        return undefined
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [buildingId, t]
  )

  useEffect(() => {
    void load()
    return () => activeRequest.current?.abort()
  }, [load])

  const handleSubmit = useCallback(
    async (
      values: BuildingUnitBalanceFormValues,
      methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)
      setSuccess(undefined)

      if (!values.referenceDate) {
        setError(t("buildingUnitBalances.validation.referenceDate"))
        return false
      }

      const payload: TCollectionOpeningBalanceRequestDto = {
        buildingId,
        referenceDate: formatDateOnly(values.referenceDate),
        balances: values.balances.map((row) => ({
          buildingUnitId: row.buildingUnitId,
          capital: row.capital,
          monthly: row.monthly,
        })),
      }

      try {
        await updateTCollectionOpeningBalances(payload)
        const refreshed = await load(false)
        if (refreshed) {
          methods.reset(toFormValues(refreshed, fallbackDate))
          setSuccess(t("buildingUnitBalances.success"))
        }
        return true
      } catch (saveError: unknown) {
        setError(
          getApiErrorMessage(saveError, t("buildingUnitBalances.saveError"))
        )
        return false
      }
    },
    [buildingId, fallbackDate, load, t]
  )

  if (loading) {
    return (
      <View className="w-full items-center p-6">
        <Spinner />
        <Text className="mt-3 text-muted-foreground">
          {t("buildingUnitBalances.loading")}
        </Text>
      </View>
    )
  }

  if (!sheet) {
    return (
      <View className="w-full items-center gap-4 p-6">
        <Text className="text-center text-destructive">
          {error ?? t("buildingUnitBalances.loadError")}
        </Text>
        <Button onPress={() => void load()}>
          <Text>{t("buildingUnitBalances.retry")}</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => router.push(`/buildings/${buildingId}`)}
        >
          <Text>{t("buildingUnitBalances.back")}</Text>
        </Button>
      </View>
    )
  }

  if (sheet.rows.length === 0) {
    return (
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Button
          variant="ghost"
          onPress={() => router.push(`/buildings/${buildingId}`)}
        >
          <Text>{t("buildingUnitBalances.back")}</Text>
        </Button>
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("buildingUnitBalances.title")}
        </Text>
        <View className="items-center rounded-lg border border-border p-8">
          <Text className="text-center text-muted-foreground">
            {t("buildingUnitBalances.empty")}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <View className="items-start">
        <Button
          variant="ghost"
          onPress={() => router.push(`/buildings/${buildingId}`)}
        >
          <Text>{t("buildingUnitBalances.back")}</Text>
        </Button>
      </View>
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("buildingUnitBalances.title")}
      </Text>
      <Text className="text-muted-foreground">
        {t("buildingUnitBalances.guidance")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}
      {success && (
        <View className="rounded-md bg-green-600/10 p-3">
          <Text className="text-green-700">{success}</Text>
        </View>
      )}

      <RncForm<BuildingUnitBalanceFormValues>
        id="BuildingUnitBalancesScreen"
        onSubmit={handleSubmit}
        defaultValues={toFormValues(sheet, fallbackDate)}
        unstyled
      >
        <View className="w-full gap-5">
          <View className="max-w-[320px]">
            <RncDateTimeField
              id="referenceDate"
              type="date"
              label={t("buildingUnitBalances.referenceDate")}
              helperText={t("buildingUnitBalances.referenceDateHelp")}
              required
            />
          </View>

          <View className="w-full gap-3">
            {!mobile && <TableHeader />}
            {sheet.rows.map((row, index) => (
              <BalanceRow
                key={row.buildingUnitId ?? `${row.buildingUnitCode}-${index}`}
                index={index}
                row={row}
                mobile={mobile}
              />
            ))}
          </View>

          <View className="flex-row flex-wrap gap-3">
            <RncSubmitButton label={t("buildingUnitBalances.saveAll")} />
            <Button
              variant="outline"
              onPress={() => router.push(`/buildings/${buildingId}`)}
            >
              <Text>{t("buildingUnitBalances.back")}</Text>
            </Button>
          </View>
        </View>
      </RncForm>
    </View>
  )
}
