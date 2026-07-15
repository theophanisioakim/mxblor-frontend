"use client"

import {
  type BuildingResponseDto,
  type BuildingUpdateRequestDto,
  useDeleteBuilding,
  useGetBuildingById,
  useUpdateBuilding,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth } from "@workspace/providers"
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
  icon,
  label,
  onPress,
}: Readonly<{ icon: string; label: string; onPress: () => void }>) {
  return (
    <Pressable
      className="min-w-[140px] flex-1 cursor-pointer flex-row items-center gap-3 rounded-md border border-border p-4 hover:bg-accent"
      onPress={onPress}
      aria-label={label}
    >
      {iconFor(icon, 20)}
      <Text className="font-medium text-foreground">{label}</Text>
    </Pressable>
  )
}

/**
 * Edit a building, and act as the **hub** for everything that belongs to it.
 *
 * Deliberately scoped: the tiles navigate, they do not show counts, and the
 * lifecycle actions from the original design (Publish, Create external users)
 * plus photos, attached files, the audit block and the summary figures are not
 * built — see the SDD's "Deferred" section. What is here is the building's own
 * data and a way to reach its sub-entities.
 */
export function EditBuildingScreen({ id }: Readonly<{ id: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
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
    <View className="w-full gap-6 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {data.name ?? t("building.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
        <RncForm<BuildingFormValues>
          id="EditBuildingScreen"
          onSubmit={handleSubmit}
          defaultValues={toFormValues(data)}
        >
          <View className="w-full gap-6">
            <BuildingFormFields />

            <View className="flex-row flex-wrap gap-3">
              <RncSubmitButton label={t("building.edit.save")} />
              <Button
                variant="outline"
                onPress={() => router.replace(LIST_ROUTE)}
              >
                <Text>{t("building.edit.back")}</Text>
              </Button>
              {/* Same role rule as the buildings list: `user` does not delete. */}
              {!isUserRole && (
                <Button variant="destructive" onPress={handleDelete}>
                  <Text>{t("building.edit.delete")}</Text>
                </Button>
              )}
            </View>
          </View>
        </RncForm>
      </View>

      {/* ── Sub-entity hub ─────────────────────────────────────────────────
          A tile is added here in the same change set as the screen it opens, so
          the hub never offers a link that goes nowhere. */}
      <View className="gap-3">
        <Text className="font-semibold text-foreground text-xl">
          {t("building.edit.manage")}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <HubTile
            icon="Home"
            label={t("building.edit.tiles.units")}
            onPress={() => router.push(`/buildings/${id}/units`)}
          />
          <HubTile
            icon="Scale"
            label={t("building.edit.tiles.unitBalances")}
            onPress={() => router.push(`/buildings/${id}/unit-balances`)}
          />
          <HubTile
            icon="Users"
            label={t("building.edit.tiles.relatedPeople")}
            onPress={() => router.push(`/buildings/${id}/related-people`)}
          />
          <HubTile
            icon="Mail"
            label={t("building.edit.tiles.communication")}
            onPress={() => router.push(`/buildings/${id}/communication`)}
          />
          <HubTile
            icon="StickyNote"
            label={t("building.edit.tiles.notes")}
            onPress={() => router.push(`/buildings/${id}/notes`)}
          />
          <HubTile
            icon="Percent"
            label={t("building.edit.tiles.distributions")}
            onPress={() => router.push(`/buildings/${id}/distributions`)}
          />
          <HubTile
            icon="CalendarRange"
            label={t("building.edit.tiles.budgets")}
            onPress={() => router.push(`/buildings/${id}/budgets`)}
          />
          <HubTile
            icon="Landmark"
            label={t("building.edit.tiles.bankAccounts")}
            onPress={() => router.push(`/buildings/${id}/bank-accounts`)}
          />
          <HubTile
            icon="Receipt"
            label={t("building.edit.tiles.currentExpenses")}
            onPress={() => router.push(`/buildings/${id}/current-expenses`)}
          />
          <HubTile
            icon="CreditCard"
            label={t("building.edit.tiles.payments")}
            onPress={() => router.push(`/buildings/${id}/payments`)}
          />
          <HubTile
            icon="HandCoins"
            label={t("building.edit.tiles.collections")}
            onPress={() => router.push(`/buildings/${id}/collections`)}
          />
        </View>
      </View>
    </View>
  )
}
