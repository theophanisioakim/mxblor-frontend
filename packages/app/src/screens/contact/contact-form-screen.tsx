"use client"

import {
  type ContactCreateRequestDto,
  type ContactResponseDto,
  type ContactUpdateRequestDto,
  useCreateContact,
  useGetContactById,
  useUpdateContact,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
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
import {
  ContactFormFields,
  type ContactFormValues,
} from "./contact-form-fields"

const LIST_ROUTE = "/contacts"

const EMPTY_VALUES: ContactFormValues = {
  namePrefix: "",
  firstName: "",
  middleName: "",
  lastName: "",
  nameSuffix: "",
  emails: [],
  phoneNumbers: [],
  addresses: [],
}

function toFormValues(contact: ContactResponseDto): ContactFormValues {
  return {
    namePrefix: contact.namePrefix ?? "",
    firstName: contact.firstName ?? "",
    middleName: contact.middleName ?? "",
    lastName: contact.lastName ?? "",
    nameSuffix: contact.nameSuffix ?? "",
    emails: (contact.emails ?? []).map((email) => ({
      id: email.id,
      emailAddress: email.emailAddress ?? "",
      emailTypeId: email.emailTypeId ?? "",
      isPrimary: email.isPrimary ?? false,
    })),
    phoneNumbers: (contact.phoneNumbers ?? []).map((phone) => ({
      id: phone.id,
      phoneNumber: phone.phoneNumber ?? "",
      uri: phone.uri,
      phoneNumberTypeId: phone.phoneNumberTypeId ?? "",
      isPrimary: phone.isPrimary ?? false,
    })),
    addresses: (contact.addresses ?? []).map((address) => ({
      id: address.id,
      num: address.num,
      street: address.street ?? "",
      postcode: address.postcode,
      city: address.city ?? "",
      region: address.region,
      countryCode: address.countryCode ?? "CY",
      addressTypeId: address.addressTypeId ?? "",
    })),
  }
}

/**
 * Create and edit a contact, together with its emails, phone numbers and
 * addresses.
 *
 * The three sub-collections are submitted as the complete desired state, so a
 * row the user removed is simply gone from the payload and the server deletes
 * it. Rows that already existed keep their `id`, so they are updated rather than
 * duplicated.
 */
export function ContactFormScreen({ id }: Readonly<{ id: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const isCreateMode = id === "new"
  const entityId = isCreateMode ? undefined : id

  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact()
  const [error, setError] = useState<string>()

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
  } = useGetContactById(entityId ?? "", {
    query: { enabled: !!entityId },
  })

  const handleSubmit = useCallback(
    async (
      values: ContactFormValues,
      _methods: UseFormReturn
    ): Promise<boolean> => {
      setError(undefined)

      const payload: ContactCreateRequestDto = {
        namePrefix: values.namePrefix || undefined,
        firstName: values.firstName || undefined,
        middleName: values.middleName || undefined,
        lastName: values.lastName || undefined,
        nameSuffix: values.nameSuffix || undefined,
        emails: values.emails,
        phoneNumbers: values.phoneNumbers,
        addresses: values.addresses,
      }

      try {
        if (entityId) {
          if (!data?.id || data.version === undefined) {
            setError(t("contact.edit.missingVersion"))
            return false
          }
          const updatePayload: ContactUpdateRequestDto = {
            ...payload,
            id: data.id,
            version: data.version,
          }
          await updateMutation.mutateAsync({ id: data.id, data: updatePayload })
        } else {
          await createMutation.mutateAsync({ data: payload })
        }
        router.replace(LIST_ROUTE)
        return true
      } catch (e: unknown) {
        setError(
          getApiErrorMessage(
            e,
            entityId ? t("contact.edit.error") : t("contact.create.error")
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
          {getApiErrorMessage(fetchError, t("contact.edit.loadError"))}
        </Text>
      </View>
    )
  }

  if (entityId && !data) {
    return (
      <View className="w-full items-center self-center p-4 md:p-6 lg:py-8">
        <Text className="text-destructive">{t("contact.edit.notFound")}</Text>
      </View>
    )
  }

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        {isCreateMode ? t("contact.create.title") : t("contact.edit.title")}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="max-w-[600px] md:max-w-[900px] lg:max-w-[1200px]">
        <RncForm<ContactFormValues>
          id="ContactFormScreen"
          onSubmit={handleSubmit}
          defaultValues={data ? toFormValues(data) : EMPTY_VALUES}
        >
          <View className="w-full gap-6">
            <ContactFormFields />

            <View className="flex-row gap-3">
              <RncSubmitButton
                label={
                  isCreateMode
                    ? t("contact.create.save")
                    : t("contact.edit.save")
                }
              />
              <Button
                variant="outline"
                onPress={() => router.replace(LIST_ROUTE)}
              >
                <Text>{t("contact.edit.cancel")}</Text>
              </Button>
            </View>
          </View>
        </RncForm>
      </View>
    </View>
  )
}
