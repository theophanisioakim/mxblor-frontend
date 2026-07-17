"use client"

import { useTranslation } from "@workspace/i18n"
import { useAuth } from "@workspace/providers"
import { LinkButton } from "@workspace/router"
import { iconFor, Text, View } from "@workspace/ui"

const PRIMARY_FEATURES = [
  {
    icon: "ReceiptText",
    title: "landing.features.expenses.title",
    description: "landing.features.expenses.description",
  },
  {
    icon: "UsersRound",
    title: "landing.features.roles.title",
    description: "landing.features.roles.description",
  },
  {
    icon: "FileChartColumnIncreasing",
    title: "landing.features.reports.title",
    description: "landing.features.reports.description",
  },
  {
    icon: "ListChecks",
    title: "landing.features.audit.title",
    description: "landing.features.audit.description",
  },
] as const

const CAPABILITIES = [
  {
    icon: "Smartphone",
    title: "landing.capabilities.mobile.title",
    description: "landing.capabilities.mobile.description",
  },
  {
    icon: "ChartNoAxesCombined",
    title: "landing.capabilities.insight.title",
    description: "landing.capabilities.insight.description",
  },
  {
    icon: "Languages",
    title: "landing.capabilities.languages.title",
    description: "landing.capabilities.languages.description",
  },
  {
    icon: "ShieldCheck",
    title: "landing.capabilities.security.title",
    description: "landing.capabilities.security.description",
  },
] as const

const PREVIEW_METRICS = [
  { icon: "Building2", label: "landing.preview.buildings", value: "24" },
  { icon: "House", label: "landing.preview.units", value: "186" },
  { icon: "ContactRound", label: "landing.preview.contacts", value: "431" },
  { icon: "ReceiptEuro", label: "landing.preview.expenses", value: "92" },
] as const

function FeatureCard({
  description,
  icon,
  title,
}: Readonly<{ description: string; icon: string; title: string }>) {
  return (
    <View className="w-full gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:w-[48%] xl:w-[23%]">
      <View className="size-12 items-center justify-center rounded-xl bg-brand/15">
        {iconFor(icon, 24, "text-brand")}
      </View>
      <Text className="font-semibold text-card-foreground text-lg">
        {title}
      </Text>
      <Text className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </Text>
    </View>
  )
}

/** Public, cross-platform marketing page built from the strongest v1/v2 ideas. */
export function LandingScreen() {
  const { t } = useTranslation(["screens"])
  const { isAuthenticated } = useAuth()

  return (
    <View className="w-full bg-background">
      <View className="w-full overflow-hidden border-border border-b bg-brand/10 px-5 py-12 sm:px-8 md:py-16 lg:flex-row lg:items-center lg:gap-14 lg:px-12 lg:py-20">
        <View className="w-full gap-6 lg:w-1/2">
          <View className="self-start rounded-full border border-brand/30 bg-background px-4 py-2">
            <Text className="font-semibold text-brand text-xs uppercase tracking-widest">
              {t("landing.eyebrow")}
            </Text>
          </View>
          <View className="gap-4">
            <Text className="font-black text-5xl text-foreground tracking-tight md:text-6xl">
              MXBLOR
            </Text>
            <Text className="font-semibold text-3xl text-foreground leading-tight md:text-5xl">
              {t("landing.title")}
            </Text>
            <Text className="max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
              {t("landing.description")}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <LinkButton
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              href={isAuthenticated ? "/dashboard" : "/login"}
              size="lg"
            >
              {isAuthenticated
                ? t("landing.actions.dashboard")
                : t("landing.actions.login")}
            </LinkButton>
            <LinkButton href="mailto:info@mhalloumas.com.cy" size="lg">
              {t("landing.actions.contact")}
            </LinkButton>
          </View>
        </View>

        <View className="mt-10 w-full rounded-3xl border border-border bg-card p-4 shadow-xl lg:mt-0 lg:w-1/2 lg:p-6">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="font-semibold text-card-foreground text-lg">
                {t("landing.preview.title")}
              </Text>
              <Text className="text-muted-foreground text-xs">
                {t("landing.preview.subtitle")}
              </Text>
            </View>
            <View className="size-3 rounded-full bg-brand" />
          </View>
          <View className="flex-row flex-wrap justify-between gap-3">
            {PREVIEW_METRICS.map((metric) => (
              <View
                className="w-[47%] gap-3 rounded-2xl border border-border bg-background p-4"
                key={metric.label}
              >
                {iconFor(metric.icon, 20, "text-brand")}
                <Text className="font-bold text-2xl text-foreground">
                  {metric.value}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {t(metric.label)}
                </Text>
              </View>
            ))}
          </View>
          <View className="mt-4 gap-3 rounded-2xl bg-muted p-4">
            <Text className="font-medium text-foreground text-sm">
              {t("landing.preview.activity")}
            </Text>
            <View className="h-2 w-full rounded-full bg-brand/20">
              <View className="h-2 w-4/5 rounded-full bg-brand" />
            </View>
            <View className="h-2 w-full rounded-full bg-brand/20">
              <View className="h-2 w-3/5 rounded-full bg-brand" />
            </View>
          </View>
        </View>
      </View>

      <View className="w-full gap-8 px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <View className="items-center gap-3">
          <Text className="text-center font-bold text-3xl text-foreground md:text-4xl">
            {t("landing.features.title")}
          </Text>
          <Text className="max-w-3xl text-center text-muted-foreground leading-relaxed">
            {t("landing.features.description")}
          </Text>
        </View>
        <View className="w-full flex-row flex-wrap justify-between gap-4">
          {PRIMARY_FEATURES.map((feature) => (
            <FeatureCard
              description={t(feature.description)}
              icon={feature.icon}
              key={feature.title}
              title={t(feature.title)}
            />
          ))}
        </View>
      </View>

      <View className="w-full gap-8 bg-muted/60 px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <View className="items-center gap-3">
          <Text className="text-center font-bold text-3xl text-foreground md:text-4xl">
            {t("landing.capabilities.title")}
          </Text>
          <Text className="max-w-3xl text-center text-muted-foreground leading-relaxed">
            {t("landing.capabilities.description")}
          </Text>
        </View>
        <View className="w-full flex-row flex-wrap justify-between gap-4">
          {CAPABILITIES.map((feature) => (
            <FeatureCard
              description={t(feature.description)}
              icon={feature.icon}
              key={feature.title}
              title={t(feature.title)}
            />
          ))}
        </View>
      </View>

      <View className="w-full items-center gap-5 px-5 py-14 sm:px-8 lg:py-20">
        <Text className="font-semibold text-brand text-xs uppercase tracking-widest">
          {t("landing.pricing.eyebrow")}
        </Text>
        <Text className="max-w-3xl text-center font-bold text-3xl text-foreground md:text-4xl">
          {t("landing.pricing.title")}
        </Text>
        <Text className="max-w-2xl text-center text-muted-foreground leading-relaxed">
          {t("landing.pricing.description")}
        </Text>
        <View className="flex-row flex-wrap justify-center gap-3">
          <LinkButton
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            href="mailto:info@mhalloumas.com.cy"
            size="lg"
          >
            {t("landing.contact.email")}
          </LinkButton>
          <LinkButton href="tel:+35722878595" size="lg">
            {t("landing.contact.phone")}
          </LinkButton>
          <LinkButton href="https://mhalloumas.com.cy/" size="lg">
            {t("landing.contact.company")}
          </LinkButton>
        </View>
      </View>

      <View className="w-full items-center gap-5 border-border border-t px-5 py-8">
        <Text className="text-center text-muted-foreground text-sm">
          {t("landing.footer.trademark")}
        </Text>
        <View className="flex-row flex-wrap justify-center gap-2">
          <LinkButton
            href="https://www.facebook.com/M.HalloumasC.C.Ltd"
            size="sm"
            variant="ghost"
          >
            {t("landing.footer.facebook")}
          </LinkButton>
          <LinkButton
            href="https://x.com/marioshalloumas"
            size="sm"
            variant="ghost"
          >
            {t("landing.footer.x")}
          </LinkButton>
          <LinkButton
            href="https://www.youtube.com/user/MHalloumas"
            size="sm"
            variant="ghost"
          >
            {t("landing.footer.youtube")}
          </LinkButton>
        </View>
      </View>
    </View>
  )
}
