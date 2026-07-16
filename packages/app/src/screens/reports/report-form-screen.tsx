"use client"

import { getCurrentLanguage, useTranslation } from "@workspace/i18n"
import { useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  PdfResult,
  RncDateTimeField,
  RncForm,
  RncSelect,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo, useState } from "react"
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import {
  type BuiltReportRequest,
  buildReportRequest,
  type ReportFormValues,
  type ReportKind,
  reportFilename,
  requestReport,
  toReportDate,
  withReportBuilding,
} from "./report-contract"
import { useReportOptions } from "./use-report-options"

function firstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function ReportFields({ kind }: Readonly<{ kind: ReportKind }>) {
  const { t } = useTranslation(["screens"])
  const { control, setValue } = useFormContext<ReportFormValues>()
  const buildingId = useWatch({ control, name: "buildingId" }) ?? ""
  const needsUnit =
    kind === "apartment-shares" || kind === "building-unit-financial"
  const needsMonth = kind === "building-shares" || kind === "apartment-shares"
  const needsDates =
    kind === "building-financial" || kind === "building-unit-financial"
  const options = useReportOptions(buildingId, {
    units: needsUnit,
    distributions: kind === "attendance-sheet",
  })

  return (
    <View className="gap-5">
      {options.isLoading && (
        <View className="flex-row items-center gap-2">
          <Spinner />
          <Text className="text-muted-foreground">
            {t("reports.states.loadingOptions")}
          </Text>
        </View>
      )}
      {options.isError && (
        <Text className="text-destructive">
          {t("reports.states.optionsError")}
        </Text>
      )}
      {options.buildingsLoaded && options.buildingOptions.length === 0 && (
        <Text className="text-muted-foreground">
          {t("reports.states.noBuildings")}
        </Text>
      )}
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[280px] md:flex-1">
          <RncSelect
            id="buildingId"
            label={t("reports.fields.building")}
            onChange={async (value, context) => {
              const next = withReportBuilding(
                context.getValues() as ReportFormValues,
                value?.toString() ?? ""
              )
              context.setValue("buildingUnitId", next.buildingUnitId)
              context.setValue(
                "buildingDistributionId",
                next.buildingDistributionId
              )
              setValue("buildingId", next.buildingId)
            }}
            options={options.buildingOptions}
            placeholder={t("reports.fields.buildingPlaceholder")}
            required
            searchable
          />
        </View>
        {needsUnit && (
          <View className="md:min-w-[240px] md:flex-1">
            <RncSelect
              disabled={!buildingId}
              id="buildingUnitId"
              label={t("reports.fields.unit")}
              options={options.unitOptions}
              placeholder={t("reports.fields.unitPlaceholder")}
              required
              searchable
            />
          </View>
        )}
        {kind === "attendance-sheet" && (
          <View className="md:min-w-[240px] md:flex-1">
            <RncSelect
              disabled={!buildingId}
              id="buildingDistributionId"
              label={t("reports.fields.distribution")}
              options={options.distributionOptions}
              placeholder={t("reports.fields.distributionPlaceholder")}
              required
              searchable
            />
          </View>
        )}
      </View>
      <View className="gap-3 md:flex-row md:flex-wrap">
        {needsMonth && (
          <View className="md:min-w-[220px] md:flex-1">
            <RncDateTimeField
              id="referenceMonth"
              label={t("reports.fields.referenceMonth")}
              required
              type="month"
            />
          </View>
        )}
        {needsDates && (
          <>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="dateFrom"
                label={t("reports.fields.dateFrom")}
                required
                type="date"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="dateTo"
                label={t("reports.fields.dateTo")}
                required
                type="date"
              />
            </View>
          </>
        )}
        {kind === "building-unit-financial" && (
          <View className="md:min-w-[180px] md:flex-1">
            <RncSelect
              id="scope"
              label={t("reports.fields.scope")}
              options={[
                { id: "ALL", label: t("reports.scopes.all") },
                { id: "CAPITAL", label: t("reports.scopes.capital") },
                { id: "MONTHLY", label: t("reports.scopes.monthly") },
              ]}
              required
            />
          </View>
        )}
        <View className="md:min-w-[180px] md:flex-1">
          <RncSelect
            id="locale"
            label={t("reports.fields.locale")}
            options={[
              { id: "en", label: t("reports.locales.en") },
              { id: "el", label: t("reports.locales.el") },
            ]}
            required
          />
        </View>
      </View>
    </View>
  )
}

export function ReportFormScreen({ kind }: Readonly<{ kind: ReportKind }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()
  const [result, setResult] = useState<{
    data: ArrayBuffer
    filename: string
  }>()
  const [error, setError] = useState<string>()
  const now = useMemo(() => new Date(), [])
  const defaultValues = useMemo<Partial<ReportFormValues>>(
    () => ({
      buildingId: "",
      buildingUnitId: "",
      buildingDistributionId: "",
      referenceMonth: firstDayOfMonth(now),
      dateFrom: firstDayOfMonth(now),
      dateTo: now,
      scope: "ALL",
      locale: getCurrentLanguage() === "el" ? "el" : "en",
    }),
    [now]
  )

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: t("reports.title"), href: "/reports" },
      { label: t(`reports.items.${kind}.title`) },
    ])
  }, [kind, setItems, t])

  const submit = useCallback(
    async (
      values: ReportFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)
      let request: BuiltReportRequest
      try {
        request = buildReportRequest(kind, values)
        if (
          "dateFrom" in request.data &&
          toReportDate(request.data.dateFrom) >
            toReportDate(request.data.dateTo)
        ) {
          setError(t("reports.validation.dateOrder"))
          return false
        }
        const data = await requestReport(request)
        setResult({ data, filename: reportFilename(request) })
        return true
      } catch (cause: unknown) {
        setError(getApiErrorMessage(cause, t("reports.states.generateError")))
        return false
      }
    },
    [kind, t]
  )

  return (
    <View className="w-full gap-5 p-4 md:p-6 lg:py-8">
      <View className="gap-2">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t(`reports.items.${kind}.title`)}
        </Text>
        <Text className="text-muted-foreground">
          {t(`reports.items.${kind}.description`)}
        </Text>
      </View>
      <Button onPress={() => router.push("/reports")} variant="outline">
        <Text>{t("reports.back")}</Text>
      </Button>
      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}
      <RncForm<ReportFormValues>
        defaultValues={defaultValues}
        id={`ReportForm-${kind}`}
        onSubmit={submit}
      >
        <ReportFields kind={kind} />
        <RncSubmitButton label={t("reports.generate")} />
      </RncForm>
      {result && (
        <PdfResult
          data={result.data}
          downloadLabel={t("reports.result.download")}
          filename={result.filename}
          onError={setError}
          openLabel={t("reports.result.open")}
          previewTitle={t("reports.result.preview")}
          shareUnavailableMessage={t("reports.result.shareError")}
          title={t("reports.result.title")}
        />
      )}
    </View>
  )
}
