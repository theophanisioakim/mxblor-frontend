"use client"

import { useTranslation } from "@workspace/i18n"
import { RncInput, RncSelect, RncTranslationLabel, View } from "@workspace/ui"
import { useExpenseCategoryOptions } from "./use-expense-category-options"

/** Key namespace of every expense *name* translation label. */
export const EXPENSE_NAME_NAMESPACE = "mxblor.expense.name"
/** Key namespace of every expense *description* translation label. */
export const EXPENSE_DESCRIPTION_NAMESPACE = "mxblor.expense.description"

/** Flat form shape shared by the create and edit expense screens. */
export type ExpenseFormValues = {
  code: string
  expenseCategoryId: string
  nameLabelId: string
  descriptionLabelId: string
}

export function ExpenseFormFields({
  disabled,
  categoryLocked,
}: Readonly<{
  disabled?: boolean
  /** Pins the category (e.g. when adding an expense from inside a category). */
  categoryLocked?: boolean
}>) {
  const { t } = useTranslation(["screens"])
  // Only offer user-created categories — an expense may never be filed under a
  // system-default one (the server rejects it; see ExpenseService).
  //
  // Except in view mode: a locked expense lives in a *seeded* category, which by
  // definition is not in the editable-only list. Asking for the full catalog
  // there is what lets the disabled select still render its category's name
  // instead of showing an unresolved blank.
  const { options: categoryOptions } = useExpenseCategoryOptions({
    editableOnly: !disabled,
  })

  return (
    <View className="w-full gap-4">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="code"
            label={t("expense.form.fields.code")}
            placeholder={t("expense.form.fields.codePlaceholder")}
            required
            disabled={disabled}
            textValidationRules={{ maxLength: 10 }}
          />
        </View>
        <View className="md:min-w-[240px] md:flex-[2]">
          <RncSelect
            id="expenseCategoryId"
            label={t("expense.form.fields.category")}
            placeholder={t("expense.form.fields.categoryPlaceholder")}
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
        keyNamespace={EXPENSE_NAME_NAMESPACE}
        label={t("expense.form.fields.name")}
        placeholder={t("expense.form.fields.namePlaceholder")}
        helperText={t("expense.form.fields.nameHelper")}
        required
        requiredLanguages="default"
        display="default"
        disabled={disabled}
      />

      {/* Same, but shown in every language and reusable across the tenant. */}
      <RncTranslationLabel
        id="descriptionLabelId"
        keyNamespace={EXPENSE_DESCRIPTION_NAMESPACE}
        label={t("expense.form.fields.description")}
        placeholder={t("expense.form.fields.descriptionPlaceholder")}
        helperText={t("expense.form.fields.descriptionHelper")}
        required
        requiredLanguages="default"
        display="all"
        allowGlobalNamespace
        disabled={disabled}
      />
    </View>
  )
}
