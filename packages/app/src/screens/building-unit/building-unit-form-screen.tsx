"use client"

import {
  type BuildingUnitCreateRequestDto,
  type BuildingUnitResponseDto,
  type BuildingUnitUpdateRequestDto,
  useCreateBuildingUnit,
  useGetBuildingById,
  useGetBuildingUnitById,
  useUpdateBuildingUnit,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs, useCrudPermissions } from "@workspace/providers"
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
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, formPermissions } from "../screen-permissions"
import {
  BuildingUnitFormFields,
  type BuildingUnitFormValues,
} from "./building-unit-form-fields"

const EMPTY_VALUES: BuildingUnitFormValues = {
  code: "",
  confinedSpace: 0,
  contacts: [],
}

function toFormValues(unit: BuildingUnitResponseDto): BuildingUnitFormValues {
  return {
    code: unit.code ?? "",
    floor: unit.floor,
    confinedSpace: Number(unit.confinedSpace ?? 0),
    coveredTerraces: unit.coveredTerraces
      ? Number(unit.coveredTerraces)
      : undefined,
    uncoveredTerraces: unit.uncoveredTerraces
      ? Number(unit.uncoveredTerraces)
      : undefined,
    storeRoom: unit.storeRoom ? Number(unit.storeRoom) : undefined,
    roofGardens: unit.roofGardens ? Number(unit.roofGardens) : undefined,
    contacts: (unit.contacts ?? []).map((link) => ({
      id: link.id,
      contactId: link.contactId ?? "",
      buContactTypeId: link.buContactTypeId ?? "",
      shouldSendEmail: link.shouldSendEmail ?? false,
    })),
  }
}

/**
 * Create and edit a building unit, together with the people attached to it.
 *
 * Always scoped to a building: `buildingId` comes from the route, never from a
 * field, so a unit cannot be created in the wrong building by mistake.
 */
export function BuildingUnitFormScreen({
  buildingId,
  unitId,
}: Readonly<{ buildingId: string; unitId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = unitId === "new"
  const entityId = isCreateMode ? undefined : unitId
  const listRoute = `/buildings/${buildingId}/units`

  const { canCreate, canUpdate } = useCrudPermissions(
    crudPermissions.buildingUnit
  )
  const canSubmit = isCreateMode ? canCreate : canUpdate
  const createMutation = useCreateBuildingUnit()
  const updateMutation = useUpdateBuildingUnit()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingUnitById(entityId ?? "", {
    query: { enabled: !!entityId },
  })

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("buildingUnit.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("buildingUnit.create.title")
          : t("buildingUnit.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: BuildingUnitFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: BuildingUnitCreateRequestDto = {
        // Scoped by the route, never by a field.
        buildingId,
        code: values.code,
        floor: values.floor ?? undefined,
        confinedSpace: values.confinedSpace,
        coveredTerraces: values.coveredTerraces ?? undefined,
        uncoveredTerraces: values.uncoveredTerraces ?? undefined,
        storeRoom: values.storeRoom ?? undefined,
        roofGardens: values.roofGardens ?? undefined,
        contacts: values.contacts,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("buildingUnit.edit.missingVersion"))
            return false
          }
          const updatePayload: BuildingUnitUpdateRequestDto = {
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
              ? t("buildingUnit.edit.error")
              : t("buildingUnit.create.error")
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

  if (entityId && isLoading) {
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
          {getApiErrorMessage(fetchError, t("buildingUnit.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("buildingUnit.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.buildingUnit.create
          : formPermissions.buildingUnit.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode
            ? t("buildingUnit.create.title")
            : t("buildingUnit.edit.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
          <RncForm<BuildingUnitFormValues>
            id="BuildingUnitFormScreen"
            onSubmit={handleSubmit}
            defaultValues={data ? toFormValues(data) : EMPTY_VALUES}
          >
            <View className="w-full gap-6">
              <BuildingUnitFormFields />

              <View className="flex-row gap-3">
                <RncSubmitButton
                  disabled={!canSubmit}
                  label={
                    isCreateMode
                      ? t("buildingUnit.create.save")
                      : t("buildingUnit.edit.save")
                  }
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(listRoute)}
                >
                  <Text>{t("buildingUnit.edit.cancel")}</Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
