"use client"

import {
  type BuildingNoteCreateRequestDto,
  type BuildingNoteUpdateRequestDto,
  useCreateBuildingNote,
  useGetBuildingById,
  useGetBuildingNoteById,
  useUpdateBuildingNote,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs, useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncForm,
  RncInput,
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

type BuildingNoteFormValues = { detail: string }

export function BuildingNoteFormScreen({
  buildingId,
  noteId,
}: Readonly<{ buildingId: string; noteId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()

  const isCreateMode = noteId === "new"
  const entityId = isCreateMode ? undefined : noteId
  const listRoute = `/buildings/${buildingId}/notes`

  const { canCreate, canUpdate } = useCrudPermissions(
    crudPermissions.buildingNote
  )
  const canSubmit = isCreateMode ? canCreate : canUpdate
  const createMutation = useCreateBuildingNote()
  const updateMutation = useUpdateBuildingNote()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingNoteById(entityId ?? "", {
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
      { label: t("buildingNote.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("buildingNote.create.title")
          : t("buildingNote.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: BuildingNoteFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: BuildingNoteCreateRequestDto = {
        // Scoped by the route, never by a field.
        buildingId,
        detail: values.detail,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("buildingNote.edit.missingVersion"))
            return false
          }
          const updatePayload: BuildingNoteUpdateRequestDto = {
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
              ? t("buildingNote.edit.error")
              : t("buildingNote.create.error")
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
          {getApiErrorMessage(fetchError, t("buildingNote.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("buildingNote.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.buildingNote.create
          : formPermissions.buildingNote.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode
            ? t("buildingNote.create.title")
            : t("buildingNote.edit.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<BuildingNoteFormValues>
            id="BuildingNoteFormScreen"
            onSubmit={handleSubmit}
            defaultValues={{ detail: data?.detail ?? "" }}
          >
            <View className="w-full gap-6">
              <RncInput
                id="detail"
                label={t("buildingNote.form.fields.detail")}
                placeholder={t("buildingNote.form.fields.detailPlaceholder")}
                required
                multiline
                numberOfLines={5}
              />

              <View className="flex-row gap-3">
                <RncSubmitButton
                  disabled={!canSubmit}
                  label={
                    isCreateMode
                      ? t("buildingNote.create.save")
                      : t("buildingNote.edit.save")
                  }
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(listRoute)}
                >
                  <Text>{t("buildingNote.edit.cancel")}</Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
