"use client"

import {
  type BuildingCreateRequestDto,
  SbfUserSortOrderField,
  searchSbfUsers,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import {
  RncDateTimeField,
  RncInput,
  RncSelect,
  RncSwitch,
  Text,
  View,
} from "@workspace/ui"
import { COUNTRY_OPTIONS } from "./country-options"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Flat form shape — the address is flattened into the form and re-nested on
 * submit, because a form field's name is a flat path and the API wants a nested
 * `address` object.
 */
export type BuildingFormValues = {
  code: string
  name: string
  isActive: boolean
  ownerUserId?: string
  emailAddress?: string
  emailTransmission: boolean
  smsTransmission: boolean
  autoCommunicationDay?: number
  startedAt?: Date
  num?: string
  street: string
  postcode?: string
  region?: string
  city: string
  countryCode?: string
}

export const BUILDING_FORM_DEFAULTS: Partial<BuildingFormValues> = {
  isActive: true,
  emailTransmission: false,
  smsTransmission: false,
  countryCode: "CY",
}

/** Re-nests the flattened address for the API. Shared by create and edit. */
export function toBuildingPayload(
  values: BuildingFormValues
): BuildingCreateRequestDto {
  return {
    code: values.code,
    name: values.name,
    isActive: values.isActive ?? true,
    emailTransmission: values.emailTransmission ?? false,
    smsTransmission: values.smsTransmission ?? false,
    ownerUserId: values.ownerUserId || undefined,
    emailAddress: values.emailAddress || undefined,
    autoCommunicationDay: values.autoCommunicationDay ?? undefined,
    startedAt: values.startedAt
      ? new Date(values.startedAt).toISOString()
      : undefined,
    address: {
      num: values.num || undefined,
      street: values.street,
      postcode: values.postcode || undefined,
      region: values.region || undefined,
      city: values.city,
      countryCode: values.countryCode || undefined,
    },
  }
}

export function BuildingFormFields() {
  const { t } = useTranslation(["screens"])

  return (
    <View className="w-full gap-6">
      {/* Identity */}
      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          {t("building.create.sections.identity")}
        </Text>
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[160px] md:flex-1">
            <RncInput
              id="code"
              label={t("building.create.fields.code")}
              placeholder={t("building.create.fields.codePlaceholder")}
              required
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
          <View className="md:min-w-[240px] md:flex-[2]">
            <RncInput
              id="name"
              label={t("building.create.fields.name")}
              placeholder={t("building.create.fields.namePlaceholder")}
              required
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
        </View>
      </View>

      {/* Management */}
      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          {t("building.create.sections.management")}
        </Text>
        <RncSwitch id="isActive" label={t("building.create.fields.active")} />
        <View className="md:max-w-[360px]">
          <RncSelect
            id="ownerUserId"
            label={t("building.create.fields.manager")}
            placeholder={t("building.create.fields.managerPlaceholder")}
            searchable
            optionsLoader={async () => {
              const response = await searchSbfUsers({
                page: 0,
                size: 100,
                sort: [
                  { field: SbfUserSortOrderField.USERNAME, direction: "ASC" },
                ],
              })
              return (response.content ?? [])
                .filter((entry) => entry.id != null)
                .map((entry) => ({
                  id: entry.id as string,
                  label: entry.username ?? String(entry.id),
                }))
            }}
          />
        </View>
      </View>

      {/* Communication */}
      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          {t("building.create.sections.communication")}
        </Text>
        <View className="md:max-w-[360px]">
          <RncInput
            id="emailAddress"
            label={t("building.create.fields.email")}
            placeholder={t("building.create.fields.emailPlaceholder")}
            textValidationRules={{ maxLength: 255 }}
            validationRules={{
              pattern: {
                value: EMAIL_PATTERN,
                message: t("building.create.validation.email"),
              },
            }}
          />
        </View>
        <View className="gap-3 md:flex-row md:flex-wrap">
          <RncSwitch
            id="emailTransmission"
            label={t("building.create.fields.emailTransmission")}
          />
          <RncSwitch
            id="smsTransmission"
            label={t("building.create.fields.smsTransmission")}
          />
        </View>
        <View className="md:max-w-[280px]">
          <RncInput
            id="autoCommunicationDay"
            type="number"
            label={t("building.create.fields.autoCommunicationDay")}
            placeholder="1 - 31"
            numberValidationRules={{ min: 1, max: 31, positiveOnly: true }}
            validationRules={{
              // Required only once a transmission method is switched on — the
              // server enforces the same rule.
              validate: (value, formValues) => {
                const enabled =
                  formValues.emailTransmission || formValues.smsTransmission
                const empty =
                  value === undefined || value === null || value === ""
                if (enabled && empty) {
                  return t("building.create.validation.autoDayRequired")
                }
                return true
              },
            }}
          />
        </View>
      </View>

      {/* Ownership */}
      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          {t("building.create.sections.ownership")}
        </Text>
        <View className="md:max-w-[280px]">
          <RncDateTimeField
            id="startedAt"
            type="date"
            label={t("building.create.fields.acquiredDate")}
          />
        </View>
      </View>

      {/* Address */}
      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          {t("building.create.sections.address")}
        </Text>
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[120px] md:flex-1">
            <RncInput
              id="num"
              label={t("building.create.fields.number")}
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
          <View className="md:min-w-[240px] md:flex-[3]">
            <RncInput
              id="street"
              label={t("building.create.fields.street")}
              required
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
        </View>
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[140px] md:flex-1">
            <RncInput
              id="postcode"
              label={t("building.create.fields.postCode")}
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
          <View className="md:min-w-[180px] md:flex-[2]">
            <RncInput
              id="region"
              label={t("building.create.fields.area")}
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
        </View>
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[180px] md:flex-1">
            <RncInput
              id="city"
              label={t("building.create.fields.city")}
              required
              textValidationRules={{ maxLength: 255 }}
            />
          </View>
          <View className="md:min-w-[180px] md:flex-1">
            <RncSelect
              id="countryCode"
              label={t("building.create.fields.country")}
              placeholder={t("building.create.fields.countryPlaceholder")}
              searchable
              options={COUNTRY_OPTIONS}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
