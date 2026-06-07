"use client"

import {
  RncCheckbox,
  RncDateTimeField,
  RncForm,
  RncInput,
  RncSelect,
  RncSubmitButton,
  RncSwitch,
  Text,
  View,
} from "@workspace/ui"
import { useState } from "react"

type ShowcaseForm = {
  name: string
  age?: number
  password: string
  country?: string
  interests?: string[]
  birthday?: Date
  notifications?: boolean
  terms?: boolean
}

const COUNTRIES = [
  { id: "gr", label: "Greece" },
  { id: "us", label: "United States" },
  { id: "de", label: "Germany" },
  { id: "jp", label: "Japan" },
]

const INTERESTS = [
  { id: "code", label: "Coding" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food" },
]

/**
 * Shared, cross-platform showcase of the `@workspace/ui` form components.
 * Renders identically on web (Next.js) and native (Expo) — every field comes
 * through `@workspace/ui`, which resolves to the right platform variant at
 * build time.
 */
export function FormShowcaseScreen() {
  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <View className="w-full max-w-xl gap-6 self-center p-6">
      <View className="gap-1">
        <Text className="font-bold text-2xl text-foreground">
          Form components
        </Text>
        <Text className="text-muted-foreground">
          One form, shared by the web and native apps.
        </Text>
      </View>

      <RncForm<ShowcaseForm>
        id="showcase-form"
        onSubmit={async (data) => {
          setSubmitted(JSON.stringify(data, null, 2))
          return true
        }}
      >
        <RncInput
          id="name"
          label="Name"
          placeholder="Jane Doe"
          required
          textValidationRules={{ minLength: 2 }}
        />

        <RncInput
          id="age"
          label="Age"
          type="number"
          placeholder="0"
          numberValidationRules={{ min: 0, max: 120, decimalPlaces: 0 }}
        />

        <RncInput
          id="password"
          label="Password"
          type="password"
          required
          helperText="At least 8 characters"
          textValidationRules={{ minLength: 8 }}
        />

        <RncSelect
          id="country"
          label="Country"
          placeholder="Select a country"
          options={COUNTRIES}
        />

        <RncSelect
          id="interests"
          label="Interests"
          placeholder="Pick a few"
          multiple
          searchable
          options={INTERESTS}
        />

        <RncDateTimeField
          id="birthday"
          label="Birthday"
          type="date"
          disableFuture
        />

        <RncSwitch id="notifications" label="Enable notifications" />

        <RncCheckbox id="terms" label="I accept the terms" required />

        <RncSubmitButton label="Submit" />
      </RncForm>

      {submitted && (
        <View className="gap-2 rounded-xl border border-border bg-muted p-4">
          <Text className="font-semibold text-foreground">
            Submitted values
          </Text>
          <Text className="font-mono text-muted-foreground text-sm">
            {submitted}
          </Text>
        </View>
      )}
    </View>
  )
}
