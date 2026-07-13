"use client"

import { useTranslation } from "@workspace/i18n"
import { RncInput, RncTranslationLabel, View } from "@workspace/ui"

/** Key namespace of every revenue category *name* translation label. */
export const REVENUE_CATEGORY_NAME_NAMESPACE = "mxblor.revenueCategory.name"
/** Key namespace of every revenue category *description* translation label. */
export const REVENUE_CATEGORY_DESCRIPTION_NAMESPACE =
  "mxblor.revenueCategory.description"

/** Flat form shape shared by the create, edit and view category screens. */
export type RevenueCategoryFormValues = {
  code: string
  nameLabelId: string
  descriptionLabelId: string
}

export function RevenueCategoryFormFields({
  disabled,
}: Readonly<{ disabled?: boolean }>) {
  const { t } = useTranslation(["screens"])

  return (
    <View className="w-full gap-4">
      <View className="md:max-w-[240px]">
        <RncInput
          id="code"
          label={t("revenueCategory.form.fields.code")}
          placeholder={t("revenueCategory.form.fields.codePlaceholder")}
          required
          disabled={disabled}
          textValidationRules={{ maxLength: 10 }}
        />
      </View>

      {/* The name is stored as a translation label — the form submits its id. */}
      <RncTranslationLabel
        id="nameLabelId"
        keyNamespace={REVENUE_CATEGORY_NAME_NAMESPACE}
        label={t("revenueCategory.form.fields.name")}
        placeholder={t("revenueCategory.form.fields.namePlaceholder")}
        helperText={t("revenueCategory.form.fields.nameHelper")}
        required
        requiredLanguages="default"
        display="default"
        disabled={disabled}
      />

      {/* Same, but shown in every language and reusable across the tenant. */}
      <RncTranslationLabel
        id="descriptionLabelId"
        keyNamespace={REVENUE_CATEGORY_DESCRIPTION_NAMESPACE}
        label={t("revenueCategory.form.fields.description")}
        placeholder={t("revenueCategory.form.fields.descriptionPlaceholder")}
        helperText={t("revenueCategory.form.fields.descriptionHelper")}
        required
        requiredLanguages="default"
        display="all"
        allowGlobalNamespace
        disabled={disabled}
      />
    </View>
  )
}
