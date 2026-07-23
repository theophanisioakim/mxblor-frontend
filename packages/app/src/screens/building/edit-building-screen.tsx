"use client"

import {
  type BuildingHubSummaryResponseDto,
  type BuildingResponseDto,
  type BuildingUpdateRequestDto,
  useDeleteBuilding,
  useGetBuildingById,
  useGetBuildingHubSummary,
  useUpdateBuilding,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth, useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  iconFor,
  Pressable,
  RncForm,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, formPermissions } from "../screen-permissions"
import {
  BUILDING_FORM_DEFAULTS,
  BuildingFormFields,
  type BuildingFormValues,
  toBuildingPayload,
} from "./building-form-fields"

const LIST_ROUTE = "/buildings"

function toFormValues(building: BuildingResponseDto): BuildingFormValues {
  return {
    ...(BUILDING_FORM_DEFAULTS as BuildingFormValues),
    code: building.code ?? "",
    name: building.name ?? "",
    isActive: building.isActive ?? true,
    ownerUserId: building.ownerUserId,
    emailAddress: building.emailAddress,
    emailTransmission: building.emailTransmission ?? false,
    smsTransmission: building.smsTransmission ?? false,
    autoCommunicationDay: building.autoCommunicationDay,
    startedAt: building.startedAt ? new Date(building.startedAt) : undefined,
    // The address comes back nested; the form works on it flat.
    num: building.address?.num,
    street: building.address?.street ?? "",
    postcode: building.address?.postcode,
    region: building.address?.region,
    city: building.address?.city ?? "",
    countryCode: building.address?.countryCode ?? "CY",
  }
}

/** One tile in the sub-entity hub. */
function HubTile({
  count,
  icon,
  label,
  onPress,
  totalLabel,
  totalValue,
}: Readonly<{
  count?: number
  icon: string
  label: string
  onPress: () => void
  totalLabel?: string
  totalValue?: string
}>) {
  const accessibilityParts = [label, count == null ? "—" : String(count)]
  if (totalLabel && totalValue) {
    accessibilityParts.push(`${totalLabel}: ${totalValue}`)
  }

  return (
    <Pressable
      className="min-w-[220px] flex-1 cursor-pointer flex-row items-center gap-4 rounded-lg border border-border bg-background p-4 hover:bg-accent"
      onPress={onPress}
      aria-label={accessibilityParts.join(", ")}
    >
      <View className="rounded-full bg-primary/10 p-3">
        {iconFor(icon, 22, "text-primary")}
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-medium text-foreground">{label}</Text>
        <Text className="font-bold text-2xl text-foreground tabular-nums">
          {count ?? "—"}
        </Text>
        {totalLabel && totalValue && (
          <Text className="text-muted-foreground text-sm tabular-nums">
            {totalLabel}: {totalValue}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

function formatEuro(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function summaryCount(
  summary: BuildingHubSummaryResponseDto | undefined,
  loadingOrError: boolean,
  field: keyof BuildingHubSummaryResponseDto
): number | undefined {
  if (loadingOrError || !summary) return undefined
  const value = summary[field]
  return typeof value === "number" ? value : 0
}

/**
 * Edit a building, and act as the **hub** for everything that belongs to it.
 *
 * Deliberately scoped: the hub restores the useful v1/v2 counts and financial
 * totals, while lifecycle actions (Publish, Create external users), photos,
 * attached files, the audit block and the summary figures remain deferred.
 */
export function EditBuildingScreen({ id }: Readonly<{ id: string }>) {
  const { i18n, t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { canUpdate, canDelete } = useCrudPermissions(crudPermissions.building)
  const updateMutation = useUpdateBuilding()
  const deleteMutation = useDeleteBuilding()
  const [error, setError] = useState<string>()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingById(id, { query: { enabled: !!id } })
  const {
    data: hubSummary,
    isError: isHubSummaryError,
    isFetching: isHubSummaryFetching,
    isLoading: isHubSummaryLoading,
    refetch: refetchHubSummary,
  } = useGetBuildingHubSummary(id, { query: { enabled: !!id } })

  const summaryUnavailable = isHubSummaryLoading || isHubSummaryError
  const financialValue = (
    field: keyof BuildingHubSummaryResponseDto
  ): string | undefined => {
    if (summaryUnavailable || !hubSummary) return undefined
    const value = hubSummary[field]
    return formatEuro(typeof value === "number" ? value : 0, i18n.language)
  }

  const handleSubmit = useCallback(
    async (
      values: BuildingFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      if (!data?.id || data.version === undefined) {
        setError(t("building.edit.missingVersion"))
        return false
      }

      const payload: BuildingUpdateRequestDto = {
        ...toBuildingPayload(values),
        id: data.id,
        version: data.version,
      }

      try {
        await updateMutation.mutateAsync({ id: data.id, data: payload })
        router.replace(LIST_ROUTE)
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("building.edit.error")))
        return false
      }
    },
    [data, updateMutation, router, t]
  )

  const handleDelete = useCallback(async () => {
    if (!data?.id) return
    setError(undefined)
    try {
      await deleteMutation.mutateAsync({ id: data.id })
      router.replace(LIST_ROUTE)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, t("building.edit.deleteError")))
    }
  }, [data, deleteMutation, router, t])

  if (isLoading) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Spinner />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {getApiErrorMessage(fetchError, t("building.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">{t("building.edit.notFound")}</Text>
      </View>
    )
  }

  return (
    <PermissionGuard permission={formPermissions.building.edit}>
      <View className="w-full gap-6 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {data.name ?? t("building.edit.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        {/* The management hub stays outside the form so navigation never submits
          edits. It is above the fields, matching the v1/v2 building overview. */}
        <View className="gap-3">
          <Text className="font-semibold text-foreground text-xl">
            {t("building.edit.manage")}
          </Text>
          {isHubSummaryLoading && (
            <Text className="text-muted-foreground">
              {t("building.edit.summaryLoading")}
            </Text>
          )}
          {isHubSummaryError && (
            <View className="flex-row flex-wrap items-center gap-3 rounded-md bg-destructive/10 p-3">
              <Text className="flex-1 text-destructive">
                {t("building.edit.summaryLoadError")}
              </Text>
              <Button
                variant="outline"
                disabled={isHubSummaryFetching}
                onPress={() => void refetchHubSummary()}
              >
                <Text>{t("building.edit.summaryRetry")}</Text>
              </Button>
            </View>
          )}
          <View className="flex-row flex-wrap gap-3">
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "buildingUnitCount"
              )}
              icon="Home"
              label={t("building.edit.tiles.units")}
              onPress={() => router.push(`/buildings/${id}/units`)}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "unitBalanceCount"
              )}
              icon="Scale"
              label={t("building.edit.tiles.unitBalances")}
              onPress={() => router.push(`/buildings/${id}/unit-balances`)}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "relatedPersonCount"
              )}
              icon="Users"
              label={t("building.edit.tiles.relatedPeople")}
              onPress={() => router.push(`/buildings/${id}/related-people`)}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "communicationCount"
              )}
              icon="Mail"
              label={t("building.edit.tiles.communication")}
              onPress={() => router.push(`/buildings/${id}/communication`)}
            />
            <HubTile
              count={summaryCount(hubSummary, summaryUnavailable, "noteCount")}
              icon="StickyNote"
              label={t("building.edit.tiles.notes")}
              onPress={() => router.push(`/buildings/${id}/notes`)}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "distributionCount"
              )}
              icon="Percent"
              label={t("building.edit.tiles.distributions")}
              onPress={() => router.push(`/buildings/${id}/distributions`)}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "yearlyBudgetCount"
              )}
              icon="CalendarRange"
              label={t("building.edit.tiles.budgets")}
              onPress={() => router.push(`/buildings/${id}/budgets`)}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "bankAccountCount"
              )}
              icon="Landmark"
              label={t("building.edit.tiles.bankAccounts")}
              onPress={() => router.push(`/buildings/${id}/bank-accounts`)}
              totalLabel={t("building.edit.metrics.balance")}
              totalValue={financialValue("bankAccountBalance")}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "currentExpenseCount"
              )}
              icon="Receipt"
              label={t("building.edit.tiles.currentExpenses")}
              onPress={() => router.push(`/buildings/${id}/current-expenses`)}
              totalLabel={t("building.edit.metrics.total")}
              totalValue={financialValue("currentExpenseTotal")}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "paymentCount"
              )}
              icon="CreditCard"
              label={t("building.edit.tiles.payments")}
              onPress={() => router.push(`/buildings/${id}/payments`)}
              totalLabel={t("building.edit.metrics.outstanding")}
              totalValue={financialValue("paymentOutstanding")}
            />
            <HubTile
              count={summaryCount(
                hubSummary,
                summaryUnavailable,
                "collectionCount"
              )}
              icon="HandCoins"
              label={t("building.edit.tiles.collections")}
              onPress={() => router.push(`/buildings/${id}/collections`)}
              totalLabel={t("building.edit.metrics.outstanding")}
              totalValue={financialValue("collectionOutstanding")}
            />
          </View>
        </View>

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<BuildingFormValues>
            id="EditBuildingScreen"
            onSubmit={handleSubmit}
            defaultValues={toFormValues(data)}
          >
            <View className="w-full gap-6">
              <BuildingFormFields />

              <View className="flex-row flex-wrap gap-3">
                <RncSubmitButton
                  disabled={!canUpdate}
                  label={t("building.edit.save")}
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(LIST_ROUTE)}
                >
                  <Text>{t("building.edit.back")}</Text>
                </Button>
                {/* Same role rule as the buildings list: `user` does not delete. */}
                {!isUserRole && (
                  <Button
                    variant="destructive"
                    disabled={!canDelete}
                    onPress={handleDelete}
                  >
                    <Text>{t("building.edit.delete")}</Text>
                  </Button>
                )}
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
