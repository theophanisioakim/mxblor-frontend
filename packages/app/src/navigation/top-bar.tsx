"use client"

import { useMenu, useMyPathname, useSidebar } from "@workspace/providers"
import {
  Button,
  cn,
  Icon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Text,
  View,
} from "@workspace/ui"
import { MegaMenu } from "./mega-menu"
import { hasMenuChildren, isMenuTreeActive } from "./menu-tree"
import { NavLink } from "./nav-link"
import { NavMenuPopover } from "./nav-menu-popover"
import { TopBarUserActions } from "./top-bar-user-actions"

export function TopBar() {
  const { menus, isLoading } = useMenu()
  const { pathname } = useMyPathname()
  const { expanded, toggle, toggleMobile } = useSidebar()
  const topMenus = menus?.top ?? []
  // The sidebar toggles only make sense when there's a side menu to open; hide
  // them while the backend hasn't returned side rows (loading or empty).
  const hasSideMenu = (menus?.side ?? []).length > 0

  return (
    <View className="h-14 w-full flex-row items-center justify-between border-border border-b bg-background px-4">
      {/* Left - sidebar toggles + logo */}
      <View className="flex-row items-center gap-2">
        {hasSideMenu ? (
          <>
            <Button
              aria-label="Open menu"
              className="hidden rounded-full hover:bg-accent max-sm:flex"
              onPress={toggleMobile}
              size="icon"
              variant="ghost"
            >
              <Icon as={Menu} size={18} />
            </Button>
            <Button
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              className="rounded-full hover:bg-accent max-sm:hidden"
              onPress={toggle}
              size="icon"
              variant="ghost"
            >
              <Icon as={expanded ? PanelLeftClose : PanelLeftOpen} size={18} />
            </Button>
          </>
        ) : null}

        <NavLink href="/">
          <View className="flex-row items-center gap-2">
            <View className="size-8 items-center justify-center rounded-md bg-brand">
              <Text className="font-bold text-base text-brand-foreground">
                M
              </Text>
            </View>
            <Text className="font-semibold text-base text-foreground max-sm:hidden">
              MXBLOR
            </Text>
          </View>
        </NavLink>
      </View>

      {/* Center - top navigation menus */}
      <View className="flex-row items-center gap-1 max-sm:hidden">
        {isLoading
          ? null
          : topMenus.map((menu, index) => {
              const key =
                menu.id ?? menu.key ?? menu.label ?? menu.route ?? index

              if (menu.mega) {
                return <MegaMenu key={key} menu={menu} />
              }

              if (hasMenuChildren(menu)) {
                return <NavMenuPopover key={key} menu={menu} />
              }

              if (!menu.route) {
                return null
              }

              const active = isMenuTreeActive(menu, pathname)

              return (
                <NavLink href={menu.route} key={key}>
                  <View
                    className={cn(
                      "rounded-md px-3 py-2 hover:bg-accent",
                      active && "bg-accent"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm",
                        active
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      {menu.label}
                    </Text>
                  </View>
                </NavLink>
              )
            })}
      </View>

      {/* Right - user actions */}
      <TopBarUserActions />
    </View>
  )
}
