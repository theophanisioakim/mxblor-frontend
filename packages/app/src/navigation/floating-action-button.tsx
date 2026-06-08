"use client"

import { useMenu, useMyPathname } from "@workspace/providers"
import {
  Button,
  cn,
  Icon,
  iconFor,
  Plus,
  Pressable,
  Text,
  View,
} from "@workspace/ui"
import { useEffect, useState } from "react"
import { getNavigableFlatMenuItems, isMenuRouteActive } from "./menu-tree"
import { NavLink } from "./nav-link"

/** Speed-dial floating action button driven by the menu `fab` section. */
export function FloatingActionButton() {
  const { menus } = useMenu()
  const [open, setOpen] = useState(false)
  const { pathname } = useMyPathname()
  const actions = getNavigableFlatMenuItems(menus?.fab)

  useEffect(() => {
    setOpen(false)
  }, [])

  if (actions.length === 0) {
    return null
  }

  return (
    <View className="pointer-events-none absolute right-6 bottom-6 z-[300] items-end gap-2 max-sm:bottom-20">
      {actions.map((action) => {
        const active = isMenuRouteActive(action, pathname)

        return (
          <View
            className={cn(
              "flex-row items-center gap-2 transition-opacity",
              open
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            )}
            key={action.id ?? action.key ?? action.label ?? action.route}
          >
            <NavLink href={action.route}>
              <Pressable
                className="flex-row items-center gap-2"
                onPress={() => setOpen(false)}
              >
                <Text
                  className={cn(
                    "rounded-md bg-background px-2 py-1 text-sm",
                    active ? "font-semibold text-foreground" : "text-foreground"
                  )}
                >
                  {action.label ?? "Action"}
                </Text>
                <View
                  className={cn(
                    "size-10 items-center justify-center rounded-full shadow",
                    active ? "bg-primary" : "bg-primary/80"
                  )}
                >
                  {iconFor(action.icon, 16, "text-primary-foreground")}
                </View>
              </Pressable>
            </NavLink>
          </View>
        )
      })}

      <Button
        aria-label="Actions"
        className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
        onPress={() => setOpen((prev) => !prev)}
        size="icon"
      >
        <Icon
          as={Plus}
          className={cn(
            "text-primary-foreground transition-transform",
            open && "rotate-45"
          )}
          size={24}
        />
      </Button>
    </View>
  )
}
