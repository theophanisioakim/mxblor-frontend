"use client"

import { useBreadcrumbs } from "@workspace/providers"
import { ChevronRight, cn, Icon, Text, View } from "@workspace/ui"
import { NavLink } from "./nav-link"

/** Renders the breadcrumb trail from the shared breadcrumbs provider. */
export function Breadcrumbs() {
  const { items } = useBreadcrumbs()

  if (items.length === 0) {
    return null
  }

  return (
    <View className="flex-row items-center gap-1 overflow-hidden bg-background px-4 py-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <View
            key={item.label}
            className={cn(
              "flex-row items-center gap-1",
              isLast ? "shrink" : "shrink-0"
            )}
          >
            {index > 0 ? (
              <Icon
                as={ChevronRight}
                className="text-muted-foreground"
                size={12}
              />
            ) : null}
            {isLast || !item.href ? (
              <Text className="truncate text-muted-foreground text-sm">
                {item.label}
              </Text>
            ) : (
              <NavLink href={item.href}>
                <Text className="cursor-pointer text-muted-foreground text-sm hover:text-foreground">
                  {item.label}
                </Text>
              </NavLink>
            )}
          </View>
        )
      })}
    </View>
  )
}
