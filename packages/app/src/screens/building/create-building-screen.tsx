"use client"

import {
  type BuildingCreateRequestDto,
  SbfUserSortOrderField,
  searchSbfUsers,
  useCreateBuilding,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncDateTimeField,
  RncForm,
  RncInput,
  RncSelect,
  RncSubmitButton,
  RncSwitch,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { getApiErrorMessage } from "../admin/api-error-message"
import { COUNTRY_OPTIONS } from "./country-options"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Flat form shape — the nested `address` payload is assembled on submit. */
type CreateBuildingForm = {
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

export function CreateBuildingScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const createMutation = useCreateBuilding()
  const [error, setError] = useState<string>()

  const handleSubmit = useCallback(
    async (
      data: CreateBuildingForm,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: BuildingCreateRequestDto = {
        code: data.code,
        name: data.name,
        isActive: data.isActive ?? true,
        emailTransmission: data.emailTransmission ?? false,
        smsTransmission: data.smsTransmission ?? false,
        ownerUserId: data.ownerUserId || undefined,
        emailAddress: data.emailAddress || undefined,
        autoCommunicationDay: data.autoCommunicationDay ?? undefined,
        startedAt: data.startedAt
          ? new Date(data.startedAt).toISOString()
          : undefined,
        address: {
          num: data.num || undefined,
          street: data.street,
          postcode: data.postcode || undefined,
          region: data.region || undefined,
          city: data.city,
          countryCode: data.countryCode || undefined,
        },
      }

      try {
        await createMutation.mutateAsync({ data: payload })
        router.replace("/buildings")
        return true
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, t("building.create.error")))
        return false
      }
    },
    [createMutation, router, t]
  )

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {t("building.create.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[760px] lg:max-w-[960px]">
        <RncForm<CreateBuildingForm>
          id="CreateBuildingScreen"
          onSubmit={handleSubmit}
          defaultValues={{
            isActive: true,
            emailTransmission: false,
            smsTransmission: false,
            countryCode: "CY",
            startedAt: new Date(),
          }}
        >
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
              <RncSwitch
                id="isActive"
                label={t("building.create.fields.active")}
                defaultValue={true}
              />
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
                        {
                          field: SbfUserSortOrderField.USERNAME,
                          direction: "ASC",
                        },
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
                  defaultValue={false}
                />
                <RncSwitch
                  id="smsTransmission"
                  label={t("building.create.fields.smsTransmission")}
                  defaultValue={false}
                />
              </View>
              <View className="md:max-w-[280px]">
                <RncInput
                  id="autoCommunicationDay"
                  type="number"
                  label={t("building.create.fields.autoCommunicationDay")}
                  placeholder="1 - 31"
                  numberValidationRules={{
                    min: 1,
                    max: 31,
                    positiveOnly: true,
                  }}
                  validationRules={{
                    validate: (value, formValues) => {
                      const enabled =
                        formValues.emailTransmission ||
                        formValues.smsTransmission
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
                  defaultValue={new Date()}
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

            <View className="flex-row gap-3">
              <RncSubmitButton label={t("building.create.save")} />
              <Button
                variant="outline"
                onPress={() => router.replace("/buildings")}
              >
                <Text>{t("building.create.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}
