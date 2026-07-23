"use client"

import {
  type ExpenseCategoryCreateRequestDto,
  type ExpenseCategoryResponseDto,
  type ExpenseCategoryUpdateRequestDto,
  useCreateExpenseCategory,
  useGetExpenseCategoryById,
  useUpdateExpenseCategory,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncForm,
  RncSubmitButton,
  Spinner,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, formPermissions } from "../screen-permissions"
import { CategoryExpensesGrid } from "./category-expenses-grid"
import {
  ExpenseCategoryFormFields,
  type ExpenseCategoryFormValues,
} from "./expense-category-form-fields"

const LIST_ROUTE = "/expenses/categories"

function toFormValues(
  category: ExpenseCategoryResponseDto
): ExpenseCategoryFormValues {
  return {
    code: category.code ?? "",
    nameLabelId: category.nameLabelId ?? "",
    descriptionLabelId: category.descriptionLabelId ?? "",
  }
}

/**
 * Create, edit and view an expense category — one screen, because view is just
 * edit with everything disabled (a seeded category carries `editable = false`
 * and the server rejects any change to it).
 *
 * On an existing category the screen also shows that category's **expenses**,
 * with an Add button that pre-selects it. There is no grid in create mode: the
 * category has no id yet, so there is nothing to hang expenses off.
 */
export function ExpenseCategoryFormScreen({ id }: Readonly<{ id: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const isCreateMode = id === "new"
  const entityId = isCreateMode ? undefined : id

  const { canCreate, canUpdate } = useCrudPermissions(
    crudPermissions.expenseCategory
  )
  const canSubmit = isCreateMode ? canCreate : canUpdate
  const createMutation = useCreateExpenseCategory()
  const updateMutation = useUpdateExpenseCategory()
  const [error, setError] = useState<string>()

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetExpenseCategoryById(entityId ?? "", {
    query: { enabled: !!entityId },
  })

  const handleSubmit = useCallback(
    async (
      values: ExpenseCategoryFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("expenseCategory.edit.missingVersion"))
            return false
          }
          const payload: ExpenseCategoryUpdateRequestDto = {
            id: data.id,
            version: data.version,
            code: values.code,
            nameLabelId: values.nameLabelId,
            descriptionLabelId: values.descriptionLabelId,
          }
          await updateMutation.mutateAsync({ id: data.id, data: payload })
        } else {
          const payload: ExpenseCategoryCreateRequestDto = {
            code: values.code,
            nameLabelId: values.nameLabelId,
            descriptionLabelId: values.descriptionLabelId,
          }
          await createMutation.mutateAsync({ data: payload })
        }
        router.replace(LIST_ROUTE)
        return true
      } catch (e: unknown) {
        setError(
          getApiErrorMessage(
            e,
            entityId
              ? t("expenseCategory.edit.error")
              : t("expenseCategory.create.error")
          )
        )
        return false
      }
    },
    [entityId, data, createMutation, updateMutation, router, t]
  )

  if (entityId && isLoading) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Spinner />
      </View>
    )
  }

  if (entityId && isError) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {getApiErrorMessage(fetchError, t("expenseCategory.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">
          {t("expenseCategory.edit.notFound")}
        </Text>
      </View>
    )
  }

  // Seeded categories are system defaults — shown, never edited.
  const isLocked = !!data && data.editable === false

  return (
    <PermissionGuard
      permission={
        isCreateMode
          ? formPermissions.expenseCategory.create
          : formPermissions.expenseCategory.edit
      }
    >
      <View className="w-full gap-6 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {isCreateMode
            ? t("expenseCategory.create.title")
            : t("expenseCategory.edit.title")}
        </Text>

        {isLocked && (
          <View className="rounded-md bg-muted p-3">
            <Text className="text-muted-foreground">
              {t("expenseCategory.edit.locked")}
            </Text>
          </View>
        )}

        {error && (
          <View className="rounded-md bg-destructive/10 p-3">
            <Text className="text-destructive">{error}</Text>
          </View>
        )}

        <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
          <RncForm<ExpenseCategoryFormValues>
            id="ExpenseCategoryFormScreen"
            onSubmit={handleSubmit}
            defaultValues={data ? toFormValues(data) : undefined}
          >
            <View className="w-full gap-6">
              <ExpenseCategoryFormFields disabled={isLocked} />

              <View className="flex-row gap-3">
                {!isLocked && (
                  <RncSubmitButton
                    disabled={!canSubmit}
                    label={
                      isCreateMode
                        ? t("expenseCategory.create.save")
                        : t("expenseCategory.edit.save")
                    }
                  />
                )}
                <Button
                  variant="outline"
                  onPress={() => router.replace(LIST_ROUTE)}
                >
                  <Text>
                    {isLocked
                      ? t("expenseCategory.edit.back")
                      : t("expenseCategory.edit.cancel")}
                  </Text>
                </Button>
              </View>
            </View>
          </RncForm>
        </View>

        {!!entityId && !!data && (
          <CategoryExpensesGrid
            categoryId={entityId}
            categoryEditable={!isLocked}
          />
        )}
      </View>
    </PermissionGuard>
  )
}
