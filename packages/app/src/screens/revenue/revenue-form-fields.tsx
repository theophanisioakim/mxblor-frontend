"use client"

import { useTranslation } from "@workspace/i18n"
import { RncInput, RncSelect, RncTranslationLabel, View } from "@workspace/ui"
import { useRevenueCategoryOptions } from "./use-revenue-category-options"

/** Key namespace of every revenue *name* translation label. */
export const REVENUE_NAME_NAMESPACE = "mxblor.revenue.name"
/** Key namespace of every revenue *description* translation label. */
export const REVENUE_DESCRIPTION_NAMESPACE = "mxblor.revenue.description"

/** Flat form shape shared by the create and edit revenue screens. */
export type RevenueFormValues = {
  code: string
  revenueCategoryId: string
  nameLabelId: string
  descriptionLabelId: string
}

export function RevenueFormFields({
  disabled,
  categoryLocked,
}: Readonly<{
  disabled?: boolean
  /** Pins the category (e.g. when adding an revenue from inside a category). */
  categoryLocked?: boolean
}>) {
  const { t } = useTranslation(["screens"])
  // Only offer user-created categories — an revenue may never be filed under a
  // system-default one (the server rejects it; see RevenueService).
  //
  // Except in view mode: a locked revenue lives in a *seeded* category, which by
  // definition is not in the editable-only list. Asking for the full catalog
  // there is what lets the disabled select still render its category's name
  // instead of showing an unresolved blank.
  const { options: categoryOptions } = useRevenueCategoryOptions({
    editableOnly: !disabled,
  })

  return (
    <View className="w-full gap-4">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="code"
            label={t("revenue.form.fields.code")}
            placeholder={t("revenue.form.fields.codePlaceholder")}
            required
            disabled={disabled}
            textValidationRules={{ maxLength: 10 }}
          />
        </View>
        <View className="md:min-w-[240px] md:flex-[2]">
          <RncSelect
            id="revenueCategoryId"
            label={t("revenue.form.fields.category")}
            placeholder={t("revenue.form.fields.categoryPlaceholder")}
            required
            disabled={disabled}
            readOnly={categoryLocked}
            searchable
            options={categoryOptions}
          />
        </View>
      </View>

      {/* The name is stored as a translation label — the form submits its id. */}
      <RncTranslationLabel
        id="nameLabelId"
        keyNamespace={REVENUE_NAME_NAMESPACE}
        label={t("revenue.form.fields.name")}
        placeholder={t("revenue.form.fields.namePlaceholder")}
        helperText={t("revenue.form.fields.nameHelper")}
        required
        requiredLanguages="default"
        display="default"
        disabled={disabled}
      />

      {/* Same, but shown in every language and reusable across the tenant. */}
      <RncTranslationLabel
        id="descriptionLabelId"
        keyNamespace={REVENUE_DESCRIPTION_NAMESPACE}
        label={t("revenue.form.fields.description")}
        placeholder={t("revenue.form.fields.descriptionPlaceholder")}
        helperText={t("revenue.form.fields.descriptionHelper")}
        required
        requiredLanguages="default"
        display="all"
        allowGlobalNamespace
        disabled={disabled}
      />
    </View>
  )
}
