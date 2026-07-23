"use client"

import {
  getSbfRoleById,
  type SbfRoleCreateRequestDto,
  type SbfRoleResponseDto,
  type SbfRoleUpdateRequestDto,
  useCreateSbfRole,
  useUpdateSbfRole,
} from "@workspace/api-client"
import { useCrudPermissions } from "@workspace/providers"
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
import { PermissionGuard } from "../../permission-guard"
import { crudPermissions, formPermissions } from "../../screen-permissions"
import { getApiErrorMessage } from "../api-error-message"
import { RoleFormFields } from "./role-form-fields"
import { RolePermissionsTab } from "./role-permissions-tab"

const TABS = ["Details", "Permissions"] as const
type Tab = (typeof TABS)[number]

export function RoleFormScreen({
  id,
  initialData,
}: Readonly<{ id: string; initialData?: SbfRoleResponseDto }>) {
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

  const createMutation = useCreateSbfRole()
  const updateMutation = useUpdateSbfRole()
  const { canCreate, canUpdate } = useCrudPermissions(crudPermissions.role)
  const canSubmit = isCreateMode ? canCreate : canUpdate

  const loadFormValues = useCallback(async () => {
    if (initialData) {
      return initialData
    }
    if (isCreateMode || !entityId) {
      return {}
    }
    return await getSbfRoleById(entityId)
  }, [isCreateMode, entityId, initialData])

  const handleSubmit = useCallback(
    async (
      data: SbfRoleCreateRequestDto | SbfRoleUpdateRequestDto,
      methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)
      setSuccess(undefined)

      try {
        let result: SbfRoleResponseDto
        if (entityId) {
          result = await updateMutation.mutateAsync({
            id: entityId,
            data: data as SbfRoleUpdateRequestDto,
          })
        } else {
          result = await createMutation.mutateAsync({
            data: data as SbfRoleCreateRequestDto,
          })
        }
        setSuccess(`Role ${entityId ? "updated" : "created"} successfully`)
        if (result.id) {
          if (entityId) {
            methods.reset(result)
          } else {
            router.replace(`/admin/role/${result.id}`)
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
        isCreateMode ? formPermissions.role.create : formPermissions.role.edit
      }
    >
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode ? "Create Role" : `Edit Role #${id}`}
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
          <View className="flex-row gap-1 border-border border-b pb-2">
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
            <RncForm<SbfRoleCreateRequestDto | SbfRoleUpdateRequestDto>
              id="RoleFormScreen"
              onSubmit={handleSubmit}
              loadFormValues={loadFormValues}
            >
              <RoleFormFields />
              <RncSubmitButton
                label={isCreateMode ? "Create Role" : "Update Role"}
                className="mt-2"
                disabled={!canSubmit}
              />
            </RncForm>
          </View>
        )}

        {!isCreateMode && !!entityId && activeTab === "Permissions" && (
          <RolePermissionsTab roleId={entityId} onDirtyChange={setTabDirty} />
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
    </PermissionGuard>
  )
}
