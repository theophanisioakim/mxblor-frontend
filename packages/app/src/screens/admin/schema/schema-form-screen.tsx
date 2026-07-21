"use client"

import {
  getSbfSchemaById,
  type SbfSchemaCreateRequestDto,
  type SbfSchemaResponseDto,
  type SbfSchemaUpdateRequestDto,
  useCreateSbfSchema,
  useUpdateSbfSchema,
} from "@workspace/api-client"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import { Button, cn, RncForm, RncSubmitButton, Text, View } from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { PermissionGuard } from "../../permission-guard"
import { crudPermissions, formPermissions } from "../../screen-permissions"
import { getApiErrorMessage } from "../api-error-message"
import { SchemaFormFields } from "./schema-form-fields"
import { SchemaPropertiesTab } from "./schema-properties-tab"

const TABS = ["Details", "Properties"] as const
type Tab = (typeof TABS)[number]

export function SchemaFormScreen({
  id,
  initialData,
}: Readonly<{ id: string; initialData?: SbfSchemaResponseDto }>) {
  const router = useRouter()
  const isCreateMode = id === "new"
  const entityId = isCreateMode ? undefined : id

  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const [activeTab, setActiveTab] = useState<Tab>("Details")

  const createMutation = useCreateSbfSchema()
  const updateMutation = useUpdateSbfSchema()
  const { canCreate, canUpdate } = useCrudPermissions(crudPermissions.schema)
  const canSubmit = isCreateMode ? canCreate : canUpdate

  const loadFormValues = useCallback(async () => {
    if (initialData) {
      return initialData
    }
    if (isCreateMode || !entityId) {
      return {}
    }
    return await getSbfSchemaById(entityId)
  }, [isCreateMode, entityId, initialData])

  const handleSubmit = useCallback(
    async (
      data: SbfSchemaCreateRequestDto | SbfSchemaUpdateRequestDto,
      methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)
      setSuccess(undefined)

      try {
        let result: SbfSchemaResponseDto
        if (entityId) {
          result = await updateMutation.mutateAsync({
            id: entityId,
            data: data as SbfSchemaUpdateRequestDto,
          })
        } else {
          result = await createMutation.mutateAsync({
            data: data as SbfSchemaCreateRequestDto,
          })
        }
        setSuccess(`Schema ${entityId ? "updated" : "created"} successfully`)
        if (result.id) {
          if (entityId) {
            methods.reset(result)
          } else {
            router.replace(`/admin/schema/${result.id}`)
          }
        }
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "An error occurred"))
        return false
      }
    },
    [entityId, createMutation, updateMutation, router]
  )

  if (!id) return null

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.schema.create
          : formPermissions.schema.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode ? "Create Schema" : `Edit Schema #${id}`}
        </Text>

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        {success && (
          <View className="rounded-md bg-green-500/10 p-3">
            <Text className="text-green-600">{success}</Text>
          </View>
        )}

        {!isCreateMode && !!entityId && (
          <View className="flex-row flex-wrap gap-1 border-border border-b pb-2">
            {TABS.map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                size="sm"
                onPress={() => setActiveTab(tab)}
                className={cn(
                  "rounded-none border-b-2 px-3",
                  activeTab === tab ? "border-primary" : "border-transparent"
                )}
              >
                <Text
                  className={cn(
                    activeTab === tab
                      ? "font-semibold text-primary"
                      : "text-foreground"
                  )}
                >
                  {tab}
                </Text>
              </Button>
            ))}
          </View>
        )}

        {(isCreateMode || activeTab === "Details") && (
          <View className="max-w-[600px] md:max-w-[700px] lg:max-w-[900px]">
            <RncForm<SbfSchemaCreateRequestDto | SbfSchemaUpdateRequestDto>
              id="SchemaFormScreen"
              onSubmit={handleSubmit}
              loadFormValues={loadFormValues}
            >
              <SchemaFormFields />
              <RncSubmitButton
                label={isCreateMode ? "Create Schema" : "Update Schema"}
                className="mt-2"
                disabled={!canSubmit}
              />
            </RncForm>
          </View>
        )}

        {!isCreateMode && !!entityId && activeTab === "Properties" && (
          <SchemaPropertiesTab />
        )}
      </View>
    </PermissionGuard>
  )
}
