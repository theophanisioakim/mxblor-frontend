"use client"

import { useTranslation } from "@workspace/i18n"
import { useBreadcrumbs } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import { Button, Text, View } from "@workspace/ui"
import { useEffect } from "react"
import type { ReportKind } from "./report-contract"

const REPORTS: ReportKind[] = [
  "building-shares",
  "apartment-shares",
  "building-financial",
  "building-unit-financial",
  "attendance-sheet",
]

export function ReportCentreScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { setItems } = useBreadcrumbs()

  useEffect(() => {
    setItems([{ label: "Home", href: "/" }, { label: t("reports.title") }])
  }, [setItems, t])

  return (
    <View className="w-full gap-6 p-4 md:p-6 lg:py-8">
      <View className="gap-2">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("reports.title")}
        </Text>
        <Text className="text-muted-foreground">
          {t("reports.description")}
        </Text>
      </View>
      <View className="gap-4 md:flex-row md:flex-wrap">
        {REPORTS.map((kind) => (
          <View
            className="min-w-[260px] flex-1 gap-3 rounded-xl border border-border bg-background p-5 md:max-w-[420px]"
            key={kind}
          >
            <Text className="font-semibold text-foreground text-lg">
              {t(`reports.items.${kind}.title`)}
            </Text>
            <Text className="min-h-12 text-muted-foreground text-sm">
              {t(`reports.items.${kind}.description`)}
            </Text>
            <Button onPress={() => router.push(`/reports/${kind}`)}>
              <Text>{t("reports.open")}</Text>
            </Button>
          </View>
        ))}
      </View>
    </View>
  )
}
