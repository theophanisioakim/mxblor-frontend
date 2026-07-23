"use client"

import {
  type BuildingUnitCommCreateRequestDto,
  type BuildingUnitCommUpdateRequestDto,
  searchBuildingUnits,
  searchContacts,
  useCreateBuildingUnitComm,
  useGetBuildingById,
  useGetBuildingUnitCommById,
  useUpdateBuildingUnitComm,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs, useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncDateTimeField,
  RncForm,
  RncInput,
  RncSelect,
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

type CommFormValues = {
  buildingUnitId: string
  contactId?: string
  contactedAt?: Date
  description?: string
}

/**
 * Record a communication with one of the building's units — a call, an email, a
 * letter, a meeting.
 *
 * The unit is the only required field: the point of the log is *which unit* was
 * contacted. Everything else is optional, because a hurried note is better than
 * no note.
 */
export function BuildingUnitCommFormScreen({
  buildingId,
  commId,
}: Readonly<{ buildingId: string; commId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = commId === "new"
  const entityId = isCreateMode ? undefined : commId
  const listRoute = `/buildings/${buildingId}/communication`

  const { canCreate, canUpdate } = useCrudPermissions(
    crudPermissions.buildingUnitComm
  )
  const canSubmit = isCreateMode ? canCreate : canUpdate
  const createMutation = useCreateBuildingUnitComm()
  const updateMutation = useUpdateBuildingUnitComm()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingUnitCommById(entityId ?? "", {
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
      { label: t("communication.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("communication.create.title")
          : t("communication.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: CommFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: BuildingUnitCommCreateRequestDto = {
        buildingId,
        buildingUnitId: values.buildingUnitId,
        contactId: values.contactId || undefined,
        contactedAt: values.contactedAt
          ? new Date(values.contactedAt).toISOString()
          : undefined,
        description: values.description || undefined,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("communication.edit.missingVersion"))
            return false
          }
          const updatePayload: BuildingUnitCommUpdateRequestDto = {
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
              ? t("communication.edit.error")
              : t("communication.create.error")
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
          {getApiErrorMessage(fetchError, t("communication.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("communication.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.buildingUnitComm.create
          : formPermissions.buildingUnitComm.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode
            ? t("communication.create.title")
            : t("communication.edit.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<CommFormValues>
            id="BuildingUnitCommFormScreen"
            onSubmit={handleSubmit}
            defaultValues={{
              buildingUnitId: data?.buildingUnitId ?? "",
              contactId: data?.contactId,
              contactedAt: data?.contactedAt
                ? new Date(data.contactedAt)
                : undefined,
              description: data?.description,
            }}
          >
            <View className="w-full gap-6">
              <View className="gap-3 md:flex-row md:flex-wrap">
                <View className="md:min-w-[200px] md:flex-1">
                  <RncSelect
                    id="buildingUnitId"
                    label={t("communication.form.fields.unit")}
                    placeholder={t("communication.form.fields.unitPlaceholder")}
                    required
                    searchable
                    // Only this building's units — the log is building-scoped.
                    optionsLoader={async () => {
                      const response = await searchBuildingUnits({
                        page: 0,
                        size: 100,
                        buildingId,
                      })
                      return (response.content ?? [])
                        .filter((entry) => entry.id != null)
                        .map((entry) => ({
                          id: entry.id as string,
                          label: entry.code ?? String(entry.id),
                        }))
                    }}
                  />
                </View>
                <View className="md:min-w-[200px] md:flex-1">
                  <RncSelect
                    id="contactId"
                    label={t("communication.form.fields.contact")}
                    placeholder={t(
                      "communication.form.fields.contactPlaceholder"
                    )}
                    searchable
                    optionsLoader={async () => {
                      const response = await searchContacts({
                        page: 0,
                        size: 100,
                      })
                      return (response.content ?? [])
                        .filter((entry) => entry.id != null)
                        .map((entry) => ({
                          id: entry.id as string,
                          label: entry.fullName ?? String(entry.id),
                        }))
                    }}
                  />
                </View>
                <View className="md:min-w-[200px] md:flex-1">
                  <RncDateTimeField
                    id="contactedAt"
                    type="date"
                    label={t("communication.form.fields.contactedAt")}
                  />
                </View>
              </View>

              <RncInput
                id="description"
                label={t("communication.form.fields.description")}
                placeholder={t(
                  "communication.form.fields.descriptionPlaceholder"
                )}
                multiline
                numberOfLines={5}
              />

              <View className="flex-row gap-3">
                <RncSubmitButton
                  disabled={!canSubmit}
                  label={
                    isCreateMode
                      ? t("communication.create.save")
                      : t("communication.edit.save")
                  }
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(listRoute)}
                >
                  <Text>{t("communication.edit.cancel")}</Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
