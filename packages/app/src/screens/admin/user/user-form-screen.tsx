"use client"

import {
  getSbfUserById,
  type SbfUserCreateRequestDto,
  type SbfUserResponseDto,
  type SbfUserUpdateRequestDto,
  useCreateSbfUser,
  useUpdateSbfUser,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import {
  Button,
  cn,
  RncDialog,
  RncForm,
  RncSubmitButton,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../api-error-message"
import { UserBlockPermissionsTab } from "./user-block-permissions-tab"
import { UserConfigurationTab } from "./user-configuration-tab"
import { UserEmailsTab } from "./user-emails-tab"
import { UserFormFields } from "./user-form-fields"
import { UserPhonesTab } from "./user-phones-tab"
import { UserRolesTab } from "./user-roles-tab"
import { UserSchemasTab } from "./user-schemas-tab"

const TABS = [
  "Details",
  "Emails",
  "Phones",
  "Roles",
  "Schemas",
  "Configuration",
  "Block Permissions",
] as const
type Tab = (typeof TABS)[number]

export function UserFormScreen({
  id,
  initialData,
}: Readonly<{ id: string; initialData?: SbfUserResponseDto }>) {
  const router = useRouter()
  const isCreateMode = id === "new"
  const entityId = isCreateMode ? undefined : id

  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const [activeTab, setActiveTab] = useState<Tab>("Details")
  const [tabDirty, setTabDirty] = useState(false)
  const [pendingTab, setPendingTab] = useState<Tab | null>(null)

  const handleTabChange = useCallback(
    (tab: Tab) => {
      if (tabDirty) {
        setPendingTab(tab)
        return
      }
      setActiveTab(tab)
    },
    [tabDirty]
  )

  const confirmTabChange = useCallback(() => {
    if (pendingTab) {
      setTabDirty(false)
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
  }, [pendingTab])

  const createMutation = useCreateSbfUser()
  const updateMutation = useUpdateSbfUser()

  const loadFormValues = useCallback(async () => {
    if (initialData) {
      return initialData
    }
    if (isCreateMode || !entityId) {
      return {}
    }
    return await getSbfUserById(entityId)
  }, [isCreateMode, entityId, initialData])

  const handleSubmit = useCallback(
    async (
      data: SbfUserCreateRequestDto | SbfUserUpdateRequestDto,
      methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)
      setSuccess(undefined)

      try {
        let result: SbfUserResponseDto
        if (entityId) {
          result = await updateMutation.mutateAsync({
            id: entityId,
            data: data as SbfUserUpdateRequestDto,
          })
        } else {
          result = await createMutation.mutateAsync({
            data: data as SbfUserCreateRequestDto,
          })
        }
        setSuccess(`User ${entityId ? "updated" : "created"} successfully`)
        if (result.id) {
          if (entityId) {
            methods.reset(result)
          } else {
            router.replace(`/admin/user/${result.id}`)
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
        {isCreateMode ? "Create User" : `Edit User #${id}`}
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
              onPress={() => handleTabChange(tab)}
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
          <RncForm<SbfUserCreateRequestDto | SbfUserUpdateRequestDto>
            id="UserFormScreen"
            onSubmit={handleSubmit}
            loadFormValues={loadFormValues}
          >
            <UserFormFields isCreateMode={isCreateMode} />
            <RncSubmitButton
              label={isCreateMode ? "Create User" : "Update User"}
              className="mt-2"
            />
          </RncForm>
        </View>
      )}

      {!isCreateMode && !!entityId && activeTab === "Emails" && (
        <UserEmailsTab userId={entityId} />
      )}

      {!isCreateMode && !!entityId && activeTab === "Phones" && (
        <UserPhonesTab userId={entityId} />
      )}

      {!isCreateMode && !!entityId && activeTab === "Roles" && (
        <UserRolesTab userId={entityId} onDirtyChange={setTabDirty} />
      )}

      {!isCreateMode && !!entityId && activeTab === "Schemas" && (
        <UserSchemasTab userId={entityId} onDirtyChange={setTabDirty} />
      )}

      {!isCreateMode && !!entityId && activeTab === "Configuration" && (
        <UserConfigurationTab userId={entityId} />
      )}

      {!isCreateMode && !!entityId && activeTab === "Block Permissions" && (
        <UserBlockPermissionsTab
          userId={entityId}
          onDirtyChange={setTabDirty}
        />
      )}

      <RncDialog
        title="Unsaved Changes"
        description="You have unsaved changes. Switching tabs will discard them. Continue?"
        open={!!pendingTab}
        onOpenChange={(open) => {
          if (!open) setPendingTab(null)
        }}
        onCancel={() => setPendingTab(null)}
        onConfirm={confirmTabChange}
        confirmLabel="Continue"
      />
    </View>
  )
}
