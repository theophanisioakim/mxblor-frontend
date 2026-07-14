"use client"

import { useTranslation } from "@workspace/i18n"
import {
  Button,
  Icon,
  Plus,
  RncDateTimeField,
  RncInput,
  RncSelect,
  Text,
  Trash2,
  View,
} from "@workspace/ui"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import {
  useBankAccountTypeOptions,
  useTransactionTypeOptions,
} from "../shared/use-reference-options"

/**
 * The form shape.
 *
 * `transactions` is the *complete desired state* on save: a row removed here is
 * removed from the account, and `balance` is recomputed from what remains. That
 * is why the balance is never edited directly after creation — it is the sum of
 * these rows, not an independent number.
 *
 * `balance` is the **opening** balance on create. The server turns a non-zero
 * value into a `Balance B/F` transaction, so even the opening figure has a
 * movement behind it and the account reconciles against the list below.
 */
export type TBankAccountFormValues = {
  bankName: string
  accountName?: string
  accountNo: string
  ibanNo?: string
  swiftBic?: string
  accountTypeId: string
  balance: number
  description?: string
  transactions: {
    id?: string
    amount: number
    transactionDate: Date | string
    transactionTypeId: string
    description?: string
  }[]
}

export interface TBankAccountFormFieldsProps {
  /** Create shows an editable *Initial balance*; edit shows a read-only *Balance*. */
  isCreateMode: boolean
  /** The transactions grid is edit-only, and hidden from the `user` role. */
  canManageTransactions: boolean
}

export function TBankAccountFormFields({
  isCreateMode,
  canManageTransactions,
}: Readonly<TBankAccountFormFieldsProps>) {
  const { t } = useTranslation(["screens"])
  const { control } = useFormContext<TBankAccountFormValues>()
  const accountTypes = useBankAccountTypeOptions()
  // Only the *manual* types: payment and collection rows are written by the
  // system to record the bank side of a receipt, and the save rejects an attempt
  // to enter one — so the dropdown must not offer them either.
  const transactionTypes = useTransactionTypeOptions()

  const transactions = useFieldArray<TBankAccountFormValues>({
    name: "transactions",
  })

  const rows = useWatch({ control, name: "transactions" }) ?? []

  return (
    <View className="w-full gap-6">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="bankName"
            label={t("bankAccount.form.fields.bankName")}
            required
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="accountName"
            label={t("bankAccount.form.fields.accountName")}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncInput
            id="accountNo"
            label={t("bankAccount.form.fields.accountNo")}
            required
          />
        </View>
      </View>

      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="ibanNo"
            label={t("bankAccount.form.fields.iban")}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          {/* Upper-cased by the server on save — SWIFT/BIC codes are upper case
              by definition. */}
          <RncInput
            id="swiftBic"
            label={t("bankAccount.form.fields.swiftBic")}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncSelect
            id="accountTypeId"
            label={t("bankAccount.form.fields.accountType")}
            placeholder={t("bankAccount.form.fields.accountTypePlaceholder")}
            required
            options={accountTypes.options}
          />
        </View>
        <View className="md:min-w-[180px] md:flex-1">
          <RncInput
            id="balance"
            type="number"
            label={
              isCreateMode
                ? t("bankAccount.form.fields.initialBalance")
                : t("bankAccount.form.fields.balance")
            }
            required={isCreateMode}
            disabled={!isCreateMode}
            helperText={
              isCreateMode
                ? t("bankAccount.form.fields.initialBalanceHelp")
                : t("bankAccount.form.fields.balanceHelp")
            }
          />
        </View>
      </View>

      <View className="w-full">
        <RncInput
          id="description"
          label={t("bankAccount.form.fields.description")}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* ── Transactions (edit only) ────────────────────────────────────── */}
      {!isCreateMode && canManageTransactions && (
        <View className="w-full gap-3 rounded-md border border-border p-3 md:p-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-semibold text-foreground text-lg">
              {t("bankAccount.form.transactions.title")}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() =>
                transactions.append({
                  amount: 0,
                  transactionDate: new Date(),
                  transactionTypeId: "",
                  description: "",
                })
              }
            >
              <Icon as={Plus} size={16} />
              <Text>{t("bankAccount.form.transactions.add")}</Text>
            </Button>
          </View>

          <Text className="text-muted-foreground text-sm">
            {t("bankAccount.form.transactions.help")}
          </Text>

          {transactions.fields.length === 0 ? (
            <Text className="text-muted-foreground text-sm">
              {t("bankAccount.form.transactions.empty")}
            </Text>
          ) : (
            transactions.fields.map((field, index) => (
              <View
                key={field.id}
                className="gap-3 md:flex-row md:flex-wrap md:items-end"
              >
                <View className="md:min-w-[180px] md:flex-1">
                  <RncDateTimeField
                    id={`transactions.${index}.transactionDate`}
                    type="date"
                    label={t("bankAccount.form.transactions.date")}
                    required
                  />
                </View>
                <View className="md:min-w-[200px] md:flex-[2]">
                  <RncSelect
                    id={`transactions.${index}.transactionTypeId`}
                    label={t("bankAccount.form.transactions.type")}
                    placeholder={t(
                      "bankAccount.form.transactions.typePlaceholder"
                    )}
                    required
                    options={transactionTypes.options}
                  />
                </View>
                <View className="md:min-w-[160px] md:flex-1">
                  {/* One signed number, not a credit/debit pair: positive is money
                      in, negative is money out. The columns below derive from it. */}
                  <RncInput
                    id={`transactions.${index}.amount`}
                    type="number"
                    label={t("bankAccount.form.transactions.amount")}
                    required
                    helperText={t("bankAccount.form.transactions.amountHelp")}
                  />
                </View>
                <View className="md:min-w-[180px] md:flex-[2]">
                  <RncInput
                    id={`transactions.${index}.description`}
                    label={t("bankAccount.form.transactions.description")}
                  />
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => transactions.remove(index)}
                  aria-label={t("bankAccount.form.transactions.remove")}
                >
                  <Icon as={Trash2} size={16} className="text-destructive" />
                </Button>
              </View>
            ))
          )}

          <View className="flex-row items-center justify-end gap-2 border-border border-t pt-3">
            <Text className="font-semibold text-foreground">
              {t("bankAccount.form.transactions.balance")}
            </Text>
            <Text className="font-semibold text-foreground">
              {rows
                .reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
                .toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
