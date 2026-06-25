"use client"

import {
  getSbfIntegrationById,
  type SbfIntegrationCreateRequestDto,
  type SbfIntegrationResponseDto,
  type SbfIntegrationUpdateRequestDto,
  useCreateSbfIntegration,
  useUpdateSbfIntegration,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import { Button, cn, RncForm, RncSubmitButton, Text, View } from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../api-error-message"
import { IntegrationFormFields } from "./integration-form-fields"
import { IntegrationLogTab } from "./integration-log-tab"

const TABS = ["Details", "Integration Logs"] as const
type Tab = (typeof TABS)[number]

export function IntegrationFormScreen({
  id,
  initialData,
}: Readonly<{ id: string; initialData?: SbfIntegrationResponseDto }>) {
  const router = useRouter()
  const isCreateMode = id === "new"
  const entityId = isCreateMode ? undefined : id

  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const [activeTab, setActiveTab] = useState<Tab>("Details")
  const [integrationData, setIntegrationData] = useState<
    SbfIntegrationResponseDto | undefined
  >(initialData)

  const createMutation = useCreateSbfIntegration()
  const updateMutation = useUpdateSbfIntegration()

  const loadFormValues = useCallback(async () => {
    if (initialData) {
      setIntegrationData(initialData)
      return initialData
    }
    if (isCreateMode || !entityId) {
      return {}
    }
    const data = await getSbfIntegrationById(entityId)
    setIntegrationData(data)
    return data
  }, [isCreateMode, entityId, initialData])

  const handleSubmit = useCallback(
    async (
      data: SbfIntegrationCreateRequestDto | SbfIntegrationUpdateRequestDto,
      methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)
      setSuccess(undefined)

      try {
        let result: SbfIntegrationResponseDto
        if (entityId) {
          result = await updateMutation.mutateAsync({
            id: entityId,
            data: data as SbfIntegrationUpdateRequestDto,
          })
        } else {
          result = await createMutation.mutateAsync({
            data: data as SbfIntegrationCreateRequestDto,
          })
        }
        setSuccess(
          `Integration ${entityId ? "updated" : "created"} successfully`
        )
        setIntegrationData(result)
        if (result.id) {
          if (entityId) {
            methods.reset(result)
          } else {
            router.replace(`/admin/integration/${result.id}`)
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
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode ? "Create Integration" : `Edit Integration #${id}`}
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
          <RncForm<
            SbfIntegrationCreateRequestDto | SbfIntegrationUpdateRequestDto
          >
            id="IntegrationFormScreen"
            onSubmit={handleSubmit}
            loadFormValues={loadFormValues}
          >
            <IntegrationFormFields />
            <RncSubmitButton
              label={isCreateMode ? "Create Integration" : "Update Integration"}
              className="mt-2"
            />
          </RncForm>
        </View>
      )}

      {!isCreateMode &&
        !!entityId &&
        activeTab === "Integration Logs" &&
        integrationData && (
          <IntegrationLogTab
            className={integrationData.className ?? ""}
            methodName={integrationData.methodName ?? ""}
          />
        )}
    </View>
  )
}
