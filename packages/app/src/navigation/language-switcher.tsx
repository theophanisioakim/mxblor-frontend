"use client"

import {
  changeLanguage,
  getCurrentLanguage,
  type SupportedLanguage,
} from "@workspace/i18n"
import { Button, Globe, Icon, Text } from "@workspace/ui"
import { useState } from "react"

/** Toggles the app language between English and Greek via `@workspace/i18n`. */
export function LanguageSwitcher() {
  // SSR renders in the cookie language (see `apps/web/app/layout.tsx`), and the
  // i18n module initializes from the same persisted value on the client, so the
  // initial render matches on both sides.
  const [language, setLanguage] = useState<SupportedLanguage>(
    getCurrentLanguage()
  )

  const toggleLanguage = () => {
    const next: SupportedLanguage = language === "en" ? "el" : "en"
    void changeLanguage(next).then(() => setLanguage(next))
  }

  const label = language === "en" ? "EN" : "EL"
  const fullLabel = language === "en" ? "English" : "Ελληνικά"

  return (
    <Button
      aria-label={`Current language: ${fullLabel}. Press to switch language.`}
      className="hover:bg-accent"
      onPress={toggleLanguage}
      size="sm"
      variant="ghost"
    >
      <Icon as={Globe} size={16} />
      <Text className="text-sm">{label}</Text>
    </Button>
  )
}
