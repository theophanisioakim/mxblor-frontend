"use client"

import { useCreateBuilding } from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import { Button, RncForm, RncSubmitButton, Text, View } from "@workspace/ui"
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

export function CreateBuildingScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { canCreate } = useCrudPermissions(crudPermissions.building)
  const createMutation = useCreateBuilding()
  const [error, setError] = useState<string>()

  const handleSubmit = useCallback(
    async (
      data: BuildingFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      try {
        await createMutation.mutateAsync({ data: toBuildingPayload(data) })
        router.replace("/buildings")
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("building.create.error")))
        return false
      }
    },
    [createMutation, router, t]
  )

  return (
    <PermissionGuard permission={formPermissions.building.create}>
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("building.create.title")}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<BuildingFormValues>
            id="CreateBuildingScreen"
            onSubmit={handleSubmit}
            defaultValues={{ ...BUILDING_FORM_DEFAULTS, startedAt: new Date() }}
          >
            <View className="w-full gap-6">
              <BuildingFormFields />

              <View className="flex-row gap-3">
                <RncSubmitButton
                  disabled={!canCreate}
                  label={t("building.create.save")}
                />
                <Button
                  variant="outline"
                  onPress={() => router.replace("/buildings")}
                >
                  <Text>{t("building.create.cancel")}</Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>
      </View>
    </PermissionGuard>
  )
}
