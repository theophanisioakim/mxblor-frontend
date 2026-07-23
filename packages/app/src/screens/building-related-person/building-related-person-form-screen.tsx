"use client"

import {
  type BuildingRelatedPersonCreateRequestDto,
  type BuildingRelatedPersonUpdateRequestDto,
  searchContacts,
  useCreateBuildingRelatedPerson,
  useGetBuildingById,
  useGetBuildingRelatedPersonById,
  useUpdateBuildingRelatedPerson,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs, useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
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
import { useBuildingRelatedPersonTypeOptions } from "../shared/use-reference-options"

type RelatedPersonFormValues = {
  contactId: string
  relatedPersonTypeId: string
  relation: string
}

/**
 * Link a person to a building at building level — a committee member, the
 * caretaker, the lawyer — as opposed to a unit's owner or tenant, which lives on
 * the building unit screens.
 *
 * The person must already exist as a contact; this screen links, it never
 * creates.
 */
export function BuildingRelatedPersonFormScreen({
  buildingId,
  personId,
}: Readonly<{ buildingId: string; personId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()
  const types = useBuildingRelatedPersonTypeOptions()

  const isCreateMode = personId === "new"
  const entityId = isCreateMode ? undefined : personId
  const listRoute = `/buildings/${buildingId}/related-people`

  const { canCreate, canUpdate } = useCrudPermissions(
    crudPermissions.buildingRelatedPerson
  )
  const canSubmit = isCreateMode ? canCreate : canUpdate
  const createMutation = useCreateBuildingRelatedPerson()
  const updateMutation = useUpdateBuildingRelatedPerson()
  const [error, setError] = useState<string>()

  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetBuildingRelatedPersonById(entityId ?? "", {
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
      { label: t("relatedPerson.list.title"), href: listRoute },
      {
        label: isCreateMode
          ? t("relatedPerson.create.title")
          : t("relatedPerson.edit.title"),
      },
    ])
  }, [setItems, t, building, buildingId, listRoute, isCreateMode])

  const handleSubmit = useCallback(
    async (
      values: RelatedPersonFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: BuildingRelatedPersonCreateRequestDto = {
        buildingId,
        contactId: values.contactId,
        relatedPersonTypeId: values.relatedPersonTypeId,
        relation: values.relation,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("relatedPerson.edit.missingVersion"))
            return false
          }
          const updatePayload: BuildingRelatedPersonUpdateRequestDto = {
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
              ? t("relatedPerson.edit.error")
              : t("relatedPerson.create.error")
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
          {getApiErrorMessage(fetchError, t("relatedPerson.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("relatedPerson.edit.notFound")}
        </Text>
      </View>
    )
  }

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.buildingRelatedPerson.create
          : formPermissions.buildingRelatedPerson.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode
            ? t("relatedPerson.create.title")
            : t("relatedPerson.edit.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<RelatedPersonFormValues>
            id="BuildingRelatedPersonFormScreen"
            onSubmit={handleSubmit}
            defaultValues={{
              contactId: data?.contactId ?? "",
              relatedPersonTypeId: data?.relatedPersonTypeId ?? "",
              relation: data?.relation ?? "",
            }}
          >
            <View className="w-full gap-6">
              <View className="gap-3 md:flex-row md:flex-wrap">
                <View className="md:min-w-[220px] md:flex-[2]">
                  <RncSelect
                    id="contactId"
                    label={t("relatedPerson.form.fields.contact")}
                    placeholder={t(
                      "relatedPerson.form.fields.contactPlaceholder"
                    )}
                    required
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
                  <RncSelect
                    id="relatedPersonTypeId"
                    label={t("relatedPerson.form.fields.type")}
                    placeholder={t("relatedPerson.form.fields.typePlaceholder")}
                    required
                    options={types.options}
                  />
                </View>
              </View>

              <RncInput
                id="relation"
                label={t("relatedPerson.form.fields.relation")}
                placeholder={t("relatedPerson.form.fields.relationPlaceholder")}
                required
                textValidationRules={{ maxLength: 255 }}
              />

              <View className="flex-row gap-3">
                <RncSubmitButton
                  disabled={!canSubmit}
                  label={
                    isCreateMode
                      ? t("relatedPerson.create.save")
                      : t("relatedPerson.edit.save")
                  }
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace(listRoute)}
                >
                  <Text>{t("relatedPerson.edit.cancel")}</Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
