"use client"

import { useTranslation } from "@workspace/i18n"
import {
  Button,
  Icon,
  Plus,
  RncCheckbox,
  RncInput,
  RncSelect,
  Text,
  Trash2,
  View,
} from "@workspace/ui"
import type { ReactNode } from "react"
import { useFieldArray } from "react-hook-form"
import { COUNTRY_OPTIONS } from "../building/country-options"
import {
  useContactAddressTypeOptions,
  useContactEmailTypeOptions,
  useContactPhoneNumberTypeOptions,
} from "../shared/use-reference-options"

/**
 * The form shape. The three lists are the *complete desired state* of each
 * sub-collection: a row the user removes here is simply absent on submit, and
 * the server deletes it (see `ContactService.syncCollection`). Existing rows
 * carry their `id` so they are updated rather than duplicated.
 */
export type ContactFormValues = {
  namePrefix: string
  firstName: string
  middleName: string
  lastName: string
  nameSuffix: string
  emails: {
    id?: string
    emailAddress: string
    emailTypeId: string
    isPrimary: boolean
  }[]
  phoneNumbers: {
    id?: string
    phoneNumber: string
    uri?: string
    phoneNumberTypeId: string
    isPrimary: boolean
  }[]
  addresses: {
    id?: string
    num?: string
    street: string
    postcode?: string
    city: string
    region?: string
    countryCode: string
    addressTypeId: string
  }[]
}

/** One repeatable block: a heading, its rows, and an Add button. */
function RepeatableSection({
  title,
  addLabel,
  emptyLabel,
  isEmpty,
  onAdd,
  disabled,
  children,
}: Readonly<{
  title: string
  addLabel: string
  emptyLabel: string
  isEmpty: boolean
  onAdd: () => void
  disabled?: boolean
  children: ReactNode
}>) {
  return (
    <View className="w-full gap-3 rounded-md border border-border p-3 md:p-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-semibold text-foreground text-lg">{title}</Text>
        {!disabled && (
          <Button variant="outline" size="sm" onPress={onAdd}>
            <Icon as={Plus} size={16} />
            <Text>{addLabel}</Text>
          </Button>
        )}
      </View>
      {isEmpty ? (
        <Text className="text-muted-foreground text-sm">{emptyLabel}</Text>
      ) : (
        children
      )}
    </View>
  )
}

function RemoveRowButton({
  onPress,
  label,
  disabled,
}: Readonly<{ onPress: () => void; label: string; disabled?: boolean }>) {
  if (disabled) return null
  return (
    <Button variant="ghost" size="sm" onPress={onPress} aria-label={label}>
      <Icon as={Trash2} size={16} className="text-destructive" />
    </Button>
  )
}

export function ContactFormFields({
  disabled,
}: Readonly<{ disabled?: boolean }>) {
  const { t } = useTranslation(["screens"])

  const emailTypes = useContactEmailTypeOptions()
  const phoneTypes = useContactPhoneNumberTypeOptions()
  const addressTypes = useContactAddressTypeOptions()

  // `useFieldArray` picks the control up from RncForm's FormProvider.
  const emails = useFieldArray<ContactFormValues>({ name: "emails" })
  const phoneNumbers = useFieldArray<ContactFormValues>({
    name: "phoneNumbers",
  })
  const addresses = useFieldArray<ContactFormValues>({ name: "addresses" })

  return (
    <View className="w-full gap-6">
      {/* ── Name ───────────────────────────────────────────────────────── */}
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[120px] md:flex-1">
          <RncInput
            id="namePrefix"
            label={t("contact.form.fields.namePrefix")}
            disabled={disabled}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-[2]">
          <RncInput
            id="firstName"
            label={t("contact.form.fields.firstName")}
            disabled={disabled}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[140px] md:flex-1">
          <RncInput
            id="middleName"
            label={t("contact.form.fields.middleName")}
            disabled={disabled}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-[2]">
          <RncInput
            id="lastName"
            label={t("contact.form.fields.lastName")}
            disabled={disabled}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[120px] md:flex-1">
          <RncInput
            id="nameSuffix"
            label={t("contact.form.fields.nameSuffix")}
            disabled={disabled}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
      </View>

      {/* ── Emails ─────────────────────────────────────────────────────── */}
      <RepeatableSection
        title={t("contact.form.emails.title")}
        addLabel={t("contact.form.emails.add")}
        emptyLabel={t("contact.form.emails.empty")}
        isEmpty={emails.fields.length === 0}
        disabled={disabled}
        onAdd={() =>
          emails.append({
            emailAddress: "",
            emailTypeId: "",
            isPrimary: false,
          })
        }
      >
        {emails.fields.map((field, index) => (
          <View
            key={field.id}
            className="gap-3 md:flex-row md:flex-wrap md:items-end"
          >
            <View className="md:min-w-[220px] md:flex-[2]">
              <RncInput
                id={`emails.${index}.emailAddress`}
                label={t("contact.form.emails.address")}
                placeholder={t("contact.form.emails.addressPlaceholder")}
                required
                disabled={disabled}
                textValidationRules={{ maxLength: 255 }}
              />
            </View>
            <View className="md:min-w-[160px] md:flex-1">
              <RncSelect
                id={`emails.${index}.emailTypeId`}
                label={t("contact.form.emails.type")}
                placeholder={t("contact.form.emails.typePlaceholder")}
                required
                disabled={disabled}
                options={emailTypes.options}
              />
            </View>
            <View className="md:min-w-[120px]">
              <RncCheckbox
                id={`emails.${index}.isPrimary`}
                label={t("contact.form.primary")}
                disabled={disabled}
              />
            </View>
            <RemoveRowButton
              onPress={() => emails.remove(index)}
              label={t("contact.form.removeRow")}
              disabled={disabled}
            />
          </View>
        ))}
      </RepeatableSection>

      {/* ── Phone numbers ──────────────────────────────────────────────── */}
      <RepeatableSection
        title={t("contact.form.phones.title")}
        addLabel={t("contact.form.phones.add")}
        emptyLabel={t("contact.form.phones.empty")}
        isEmpty={phoneNumbers.fields.length === 0}
        disabled={disabled}
        onAdd={() =>
          phoneNumbers.append({
            phoneNumber: "",
            phoneNumberTypeId: "",
            isPrimary: false,
          })
        }
      >
        {phoneNumbers.fields.map((field, index) => (
          <View
            key={field.id}
            className="gap-3 md:flex-row md:flex-wrap md:items-end"
          >
            <View className="md:min-w-[200px] md:flex-[2]">
              <RncInput
                id={`phoneNumbers.${index}.phoneNumber`}
                label={t("contact.form.phones.number")}
                placeholder={t("contact.form.phones.numberPlaceholder")}
                required
                disabled={disabled}
                textValidationRules={{ maxLength: 255 }}
              />
            </View>
            <View className="md:min-w-[160px] md:flex-1">
              <RncSelect
                id={`phoneNumbers.${index}.phoneNumberTypeId`}
                label={t("contact.form.phones.type")}
                placeholder={t("contact.form.phones.typePlaceholder")}
                required
                disabled={disabled}
                options={phoneTypes.options}
              />
            </View>
            <View className="md:min-w-[120px]">
              <RncCheckbox
                id={`phoneNumbers.${index}.isPrimary`}
                label={t("contact.form.primary")}
                disabled={disabled}
              />
            </View>
            <RemoveRowButton
              onPress={() => phoneNumbers.remove(index)}
              label={t("contact.form.removeRow")}
              disabled={disabled}
            />
          </View>
        ))}
      </RepeatableSection>

      {/* ── Addresses ──────────────────────────────────────────────────── */}
      <RepeatableSection
        title={t("contact.form.addresses.title")}
        addLabel={t("contact.form.addresses.add")}
        emptyLabel={t("contact.form.addresses.empty")}
        isEmpty={addresses.fields.length === 0}
        disabled={disabled}
        onAdd={() =>
          addresses.append({
            street: "",
            city: "",
            countryCode: "CY",
            addressTypeId: "",
          })
        }
      >
        {addresses.fields.map((field, index) => (
          <View key={field.id} className="gap-3 border-border border-t pt-3">
            <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
              <View className="md:min-w-[100px]">
                <RncInput
                  id={`addresses.${index}.num`}
                  label={t("contact.form.addresses.num")}
                  disabled={disabled}
                  textValidationRules={{ maxLength: 255 }}
                />
              </View>
              <View className="md:min-w-[200px] md:flex-[2]">
                <RncInput
                  id={`addresses.${index}.street`}
                  label={t("contact.form.addresses.street")}
                  required
                  disabled={disabled}
                  textValidationRules={{ maxLength: 255 }}
                />
              </View>
              <View className="md:min-w-[120px]">
                <RncInput
                  id={`addresses.${index}.postcode`}
                  label={t("contact.form.addresses.postcode")}
                  disabled={disabled}
                  textValidationRules={{ maxLength: 255 }}
                />
              </View>
            </View>
            <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
              <View className="md:min-w-[160px] md:flex-1">
                <RncInput
                  id={`addresses.${index}.city`}
                  label={t("contact.form.addresses.city")}
                  required
                  disabled={disabled}
                  textValidationRules={{ maxLength: 255 }}
                />
              </View>
              <View className="md:min-w-[160px] md:flex-1">
                <RncInput
                  id={`addresses.${index}.region`}
                  label={t("contact.form.addresses.region")}
                  disabled={disabled}
                  textValidationRules={{ maxLength: 255 }}
                />
              </View>
              <View className="md:min-w-[160px] md:flex-1">
                <RncSelect
                  id={`addresses.${index}.countryCode`}
                  label={t("contact.form.addresses.country")}
                  required
                  searchable
                  disabled={disabled}
                  options={COUNTRY_OPTIONS}
                />
              </View>
              <View className="md:min-w-[150px] md:flex-1">
                <RncSelect
                  id={`addresses.${index}.addressTypeId`}
                  label={t("contact.form.addresses.type")}
                  placeholder={t("contact.form.addresses.typePlaceholder")}
                  required
                  disabled={disabled}
                  options={addressTypes.options}
                />
              </View>
              <RemoveRowButton
                onPress={() => addresses.remove(index)}
                label={t("contact.form.removeRow")}
                disabled={disabled}
              />
            </View>
          </View>
        ))}
      </RepeatableSection>
    </View>
  )
}
