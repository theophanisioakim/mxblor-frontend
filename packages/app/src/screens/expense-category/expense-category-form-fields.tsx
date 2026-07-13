"use client"

import { useTranslation } from "@workspace/i18n"
import { RncInput, RncTranslationLabel, View } from "@workspace/ui"

/** Key namespace of every expense category *name* translation label. */
export const EXPENSE_CATEGORY_NAME_NAMESPACE = "mxblor.expenseCategory.name"
/** Key namespace of every expense category *description* translation label. */
export const EXPENSE_CATEGORY_DESCRIPTION_NAMESPACE =
  "mxblor.expenseCategory.description"

/** Flat form shape shared by the create, edit and view category screens. */
export type ExpenseCategoryFormValues = {
  code: string
  nameLabelId: string
  descriptionLabelId: string
}

export function ExpenseCategoryFormFields({
  disabled,
}: Readonly<{ disabled?: boolean }>) {
  const { t } = useTranslation(["screens"])

  return (
    <View className="w-full gap-4">
      <View className="md:max-w-[240px]">
        <RncInput
          id="code"
          label={t("expenseCategory.form.fields.code")}
          placeholder={t("expenseCategory.form.fields.codePlaceholder")}
          required
          disabled={disabled}
          textValidationRules={{ maxLength: 10 }}
        />
      </View>

      {/* The name is stored as a translation label — the form submits its id. */}
      <RncTranslationLabel
        id="nameLabelId"
        keyNamespace={EXPENSE_CATEGORY_NAME_NAMESPACE}
        label={t("expenseCategory.form.fields.name")}
        placeholder={t("expenseCategory.form.fields.namePlaceholder")}
        helperText={t("expenseCategory.form.fields.nameHelper")}
        required
        requiredLanguages="default"
        display="default"
        disabled={disabled}
      />

      {/* Same, but shown in every language and reusable across the tenant. */}
      <RncTranslationLabel
        id="descriptionLabelId"
        keyNamespace={EXPENSE_CATEGORY_DESCRIPTION_NAMESPACE}
        label={t("expenseCategory.form.fields.description")}
        placeholder={t("expenseCategory.form.fields.descriptionPlaceholder")}
        helperText={t("expenseCategory.form.fields.descriptionHelper")}
        required
        requiredLanguages="default"
        display="all"
        allowGlobalNamespace
        disabled={disabled}
      />
    </View>
  )
}
