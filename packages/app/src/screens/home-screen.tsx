"use client"

import { useTranslation } from "@workspace/i18n"
import { LinkButton } from "@workspace/router"
import { Button, Text, View } from "@workspace/ui"

/**
 * Shared, cross-platform screen.
 *
 * It is written once here and consumed by both the Next.js web app and the
 * Expo native app. It depends on `@workspace/ui`, whose primitives (`View`,
 * `Text`, `Button`) resolve to the correct platform implementation at build
 * time (web -> `@workspace/web-ui`, native -> `@workspace/native-ui`).
 *
 * Navigation goes through `@workspace/router`, whose platform variants wrap
 * Next Router on web and Expo Router on native without Solito.
 */
export function HomeScreen() {
  const { t } = useTranslation(["screens"])

  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="font-bold text-2xl text-foreground">
        {t("home.title")}
      </Text>
      <Text className="text-muted-foreground">{t("home.crossPlatform")}</Text>
      <Button>
        <Text>{t("home.buttonLabel")}</Text>
      </Button>
      <LinkButton href="/forms">{t("home.formLink")}</LinkButton>
      <LinkButton href="/grid">{t("home.gridLink")}</LinkButton>
    </View>
  )
}
