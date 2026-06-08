"use client"

import { useMenu, useMyPathname } from "@workspace/providers"
import { cn, iconFor, Text, useContainerWidth, View } from "@workspace/ui"
import type { ComponentProps } from "react"
import { getNavigableFlatMenuItems, isMenuRouteActive } from "./menu-tree"
import { NavLink } from "./nav-link"

const INDICATOR_PADDING = 6

/** Mobile bottom tab bar — visible only on small screens. */
export function BottomTabBar() {
  const { menus } = useMenu()
  const { pathname } = useMyPathname()
  const { width: containerWidth, containerProps } = useContainerWidth()
  const tabs = getNavigableFlatMenuItems(menus?.tabs)

  if (tabs.length === 0) {
    return null
  }

  const activeIndex = tabs.findIndex((tab) => isMenuRouteActive(tab, pathname))
  const tabWidth = containerWidth / tabs.length

  return (
    <View
      className="relative hidden h-[60px] flex-row items-center justify-around border-border border-t bg-background px-2 max-sm:flex"
      {...(containerProps as unknown as ComponentProps<typeof View>)}
    >
      {/* Sliding indicator pill */}
      {containerWidth > 0 && activeIndex >= 0 ? (
        <View
          className="absolute rounded-md bg-accent"
          style={{
            left: activeIndex * tabWidth + INDICATOR_PADDING,
            top: 6,
            bottom: 6,
            width: tabWidth - INDICATOR_PADDING * 2,
          }}
        />
      ) : null}

      {tabs.map((tab) => {
        const active = isMenuRouteActive(tab, pathname)

        return (
          <NavLink
            className="z-[1] flex-1"
            href={tab.route}
            key={tab.id ?? tab.key ?? tab.label ?? tab.route}
          >
            <View className="items-center justify-center gap-1 rounded-md py-1.5">
              {iconFor(
                tab.icon,
                20,
                active ? "text-foreground" : "text-muted-foreground"
              )}
              <Text
                className={cn(
                  "text-[10px]",
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab.label ?? "Tab"}
              </Text>
            </View>
          </NavLink>
        )
      })}
    </View>
  )
}
