"use client"

import { searchContacts } from "@workspace/api-client"
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
import { useFieldArray } from "react-hook-form"
import { useBuildingUnitContactTypeOptions } from "../shared/use-reference-options"

/**
 * The form shape. `contacts` is the unit's people — its owner, tenant, contact
 * persons — and is the *complete desired state* on save: a row removed here is
 * unlinked from the unit. Existing rows keep their `id` so they are updated
 * rather than duplicated.
 *
 * A row links an **existing** contact; it never creates one. People are
 * tenant-wide and are maintained on the contacts screens.
 */
export type BuildingUnitFormValues = {
  code: string
  floor?: number
  confinedSpace: number
  coveredTerraces?: number
  uncoveredTerraces?: number
  storeRoom?: number
  roofGardens?: number
  contacts: {
    id?: string
    contactId: string
    buContactTypeId: string
    shouldSendEmail: boolean
  }[]
}

const AREA_RULES = { min: 0, positiveOnly: true } as const

export function BuildingUnitFormFields() {
  const { t } = useTranslation(["screens"])
  const contactTypes = useBuildingUnitContactTypeOptions()

  const contacts = useFieldArray<BuildingUnitFormValues>({ name: "contacts" })

  return (
    <View className="w-full gap-6">
      {/* ── Identity & areas ───────────────────────────────────────────── */}
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[140px] md:flex-1">
          <RncInput
            id="code"
            label={t("buildingUnit.form.fields.code")}
            placeholder={t("buildingUnit.form.fields.codePlaceholder")}
            required
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[120px] md:flex-1">
          {/* May be negative — basements are floors too. */}
          <RncInput
            id="floor"
            type="number"
            label={t("buildingUnit.form.fields.floor")}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="confinedSpace"
            type="number"
            label={t("buildingUnit.form.fields.confinedSpace")}
            required
            numberValidationRules={AREA_RULES}
          />
        </View>
      </View>

      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="coveredTerraces"
            type="number"
            label={t("buildingUnit.form.fields.coveredTerraces")}
            numberValidationRules={AREA_RULES}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="uncoveredTerraces"
            type="number"
            label={t("buildingUnit.form.fields.uncoveredTerraces")}
            numberValidationRules={AREA_RULES}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="storeRoom"
            type="number"
            label={t("buildingUnit.form.fields.storeRoom")}
            numberValidationRules={AREA_RULES}
          />
        </View>
        <View className="md:min-w-[160px] md:flex-1">
          <RncInput
            id="roofGardens"
            type="number"
            label={t("buildingUnit.form.fields.roofGardens")}
            numberValidationRules={AREA_RULES}
          />
        </View>
      </View>

      {/* ── People ─────────────────────────────────────────────────────── */}
      <View className="w-full gap-3 rounded-md border border-border p-3 md:p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-semibold text-foreground text-lg">
            {t("buildingUnit.form.contacts.title")}
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() =>
              contacts.append({
                contactId: "",
                buContactTypeId: "",
                shouldSendEmail: false,
              })
            }
          >
            <Icon as={Plus} size={16} />
            <Text>{t("buildingUnit.form.contacts.add")}</Text>
          </Button>
        </View>

        {contacts.fields.length === 0 ? (
          <Text className="text-muted-foreground text-sm">
            {t("buildingUnit.form.contacts.empty")}
          </Text>
        ) : (
          contacts.fields.map((field, index) => (
            <View
              key={field.id}
              className="gap-3 md:flex-row md:flex-wrap md:items-end"
            >
              <View className="md:min-w-[200px] md:flex-[2]">
                <RncSelect
                  id={`contacts.${index}.contactId`}
                  label={t("buildingUnit.form.contacts.person")}
                  placeholder={t(
                    "buildingUnit.form.contacts.personPlaceholder"
                  )}
                  required
                  searchable
                  optionsLoader={async () => {
                    const response = await searchContacts({
                      page: 0,
                      size: 100,
                    })
                    return (response.content ?? [])
                      .filter((entry) => entry.id != null)
                      .map((entry) => ({
                        id: entry.id as string,
                        label: entry.fullName ?? String(entry.id),
                      }))
                  }}
                />
              </View>
              <View className="md:min-w-[180px] md:flex-1">
                <RncSelect
                  id={`contacts.${index}.buContactTypeId`}
                  label={t("buildingUnit.form.contacts.type")}
                  placeholder={t("buildingUnit.form.contacts.typePlaceholder")}
                  required
                  options={contactTypes.options}
                />
              </View>
              <View className="md:min-w-[140px]">
                <RncCheckbox
                  id={`contacts.${index}.shouldSendEmail`}
                  label={t("buildingUnit.form.contacts.sendEmail")}
                />
              </View>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => contacts.remove(index)}
                aria-label={t("buildingUnit.form.contacts.remove")}
              >
                <Icon as={Trash2} size={16} className="text-destructive" />
              </Button>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
