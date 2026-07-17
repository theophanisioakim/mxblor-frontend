"use client"

import {
  searchBuildings,
  searchBuildingUnits,
  searchContacts,
  searchExpenses,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth } from "@workspace/providers"
import { LinkButton, useRouter } from "@workspace/router"
import { Button, iconFor, Pressable, Spinner, Text, View } from "@workspace/ui"
import { useEffect, useMemo, useState } from "react"

export interface DashboardMetrics {
  buildings: number
  buildingUnits: number
  contacts: number
  expenses: number
}

/** Fetches fresh totals for one dashboard render. No result is cached client-side. */
export async function fetchDashboardMetrics(
  signal?: AbortSignal
): Promise<DashboardMetrics> {
  const [buildings, buildingUnits, contacts, expenses] = await Promise.all([
    searchBuildings({ page: 0, size: 1 }, signal),
    searchBuildingUnits({ page: 0, size: 1 }, signal),
    searchContacts({ page: 0, size: 1 }, signal),
    searchExpenses({ page: 0, size: 1 }, signal),
  ])

  return {
    buildings: buildings.totalElements ?? 0,
    buildingUnits: buildingUnits.totalElements ?? 0,
    contacts: contacts.totalElements ?? 0,
    expenses: expenses.totalElements ?? 0,
  }
}

type DashboardLoadState =
  | { status: "loading" }
  | { status: "ready"; metrics: DashboardMetrics }
  | { status: "error" }
  | { status: "forbidden" }

function httpStatusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined
  }

  const response = error.response
  if (
    typeof response !== "object" ||
    response === null ||
    !("status" in response) ||
    typeof response.status !== "number"
  ) {
    return undefined
  }

  return response.status
}

/** Authenticated portfolio overview shared by the Next.js and Expo routes. */
export function DashboardScreen() {
  const { t } = useTranslation(["screens"])
  const { isAuthenticated, isAuthReady, selectedSchema } = useAuth()
  const { push, replace } = useRouter()
  const [retryKey, setRetryKey] = useState(0)
  const [loadState, setLoadState] = useState<DashboardLoadState>({
    status: "loading",
  })
  const requestContext = useMemo(
    () => ({ selectedSchema, attempt: retryKey }),
    [selectedSchema, retryKey]
  )

  useEffect(() => {
    if (!isAuthReady) {
      return
    }

    if (!isAuthenticated) {
      replace("/login")
      return
    }

    if (!requestContext.selectedSchema) {
      return
    }

    let active = true
    const controller = new AbortController()
    setLoadState({ status: "loading" })

    fetchDashboardMetrics(controller.signal)
      .then((metrics) => {
        if (active) {
          setLoadState({ status: "ready", metrics })
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadState({
            status: httpStatusOf(error) === 403 ? "forbidden" : "error",
          })
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [isAuthReady, isAuthenticated, replace, requestContext])

  if (!isAuthReady || !isAuthenticated || !selectedSchema) {
    return (
      <View className="flex-1 items-center justify-center gap-3 p-6">
        <Spinner size="large" />
        <Text className="text-muted-foreground text-sm">
          {t("dashboard.loading")}
        </Text>
      </View>
    )
  }

  if (loadState.status === "loading") {
    return (
      <View className="flex-1 items-center justify-center gap-3 p-6">
        <Spinner size="large" />
        <Text className="text-muted-foreground text-sm">
          {t("dashboard.loading")}
        </Text>
      </View>
    )
  }

  if (loadState.status === "forbidden") {
    return (
      <View className="flex-1 items-center justify-center gap-5 p-6">
        <View className="size-14 items-center justify-center rounded-2xl bg-destructive/10">
          {iconFor("ShieldX", 28, "text-destructive")}
        </View>
        <Text className="text-center font-bold text-2xl text-foreground">
          {t("dashboard.forbidden.title")}
        </Text>
        <Text className="max-w-lg text-center text-muted-foreground leading-relaxed">
          {t("dashboard.forbidden.description")}
        </Text>
        <LinkButton href="/">{t("dashboard.forbidden.back")}</LinkButton>
      </View>
    )
  }

  if (loadState.status === "error") {
    return (
      <View className="flex-1 items-center justify-center gap-5 p-6">
        <View className="size-14 items-center justify-center rounded-2xl bg-destructive/10">
          {iconFor("TriangleAlert", 28, "text-destructive")}
        </View>
        <Text className="text-center font-bold text-2xl text-foreground">
          {t("dashboard.error.title")}
        </Text>
        <Text className="max-w-lg text-center text-muted-foreground leading-relaxed">
          {t("dashboard.error.description")}
        </Text>
        <Button onPress={() => setRetryKey((value) => value + 1)}>
          <Text>{t("dashboard.error.retry")}</Text>
        </Button>
      </View>
    )
  }

  const cards = [
    {
      key: "buildings" as const,
      label: t("dashboard.metrics.buildings"),
      icon: "Building2",
      href: "/buildings",
    },
    {
      key: "buildingUnits" as const,
      label: t("dashboard.metrics.buildingUnits"),
      icon: "House",
      href: "/buildings",
    },
    {
      key: "contacts" as const,
      label: t("dashboard.metrics.contacts"),
      icon: "ContactRound",
      href: "/contacts",
    },
    {
      key: "expenses" as const,
      label: t("dashboard.metrics.expenses"),
      icon: "ReceiptEuro",
      href: "/expenses",
    },
  ]

  return (
    <View className="w-full gap-8 p-4 md:p-6 lg:py-8">
      <View className="gap-2">
        <Text className="font-bold text-3xl text-foreground tracking-tight">
          {t("dashboard.title")}
        </Text>
        <Text className="text-muted-foreground">
          {t("dashboard.description")}
        </Text>
      </View>

      <View className="w-full flex-row flex-wrap justify-between gap-4">
        {cards.map((card) => (
          <Pressable
            aria-label={t("dashboard.metrics.open", { name: card.label })}
            className="w-full gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-brand/50 hover:bg-brand/5 md:w-[48%] xl:w-[23%]"
            key={card.key}
            onPress={() => push(card.href)}
          >
            <View className="size-12 items-center justify-center rounded-xl bg-brand/15">
              {iconFor(card.icon, 24, "text-brand")}
            </View>
            <View className="gap-1">
              <Text className="font-bold text-4xl text-card-foreground">
                {loadState.metrics[card.key].toLocaleString()}
              </Text>
              <Text className="font-medium text-muted-foreground text-sm">
                {card.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
