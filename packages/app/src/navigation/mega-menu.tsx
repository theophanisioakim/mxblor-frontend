"use client"

import type { SbfMenuTopTreeItemResponseDto } from "@workspace/api-client"
import { useMyPathname } from "@workspace/providers"
import {
  Button,
  ChevronDown,
  cn,
  Icon,
  iconFor,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Pressable,
  Separator,
  Text,
  View,
} from "@workspace/ui"
import { useState } from "react"
import {
  getLeafMenuItems,
  getMenuChildren,
  hasActiveMenuItems,
  isMenuRouteActive,
  isMenuTreeActive,
  type TopBarMenuNode,
} from "./menu-tree"
import { NavLink } from "./nav-link"

export type MegaMenuProps = Readonly<{
  menu: SbfMenuTopTreeItemResponseDto
}>

type MegaMenuSection = Readonly<{
  key: string
  label?: string
  icon?: string
  items: TopBarMenuNode[]
}>

function getMegaMenuSections(
  menu: SbfMenuTopTreeItemResponseDto
): MegaMenuSection[] {
  const children = getMenuChildren(menu)

  if (children.length === 0) {
    return menu.route
      ? [
          {
            key: menu.id ?? menu.key ?? menu.label ?? menu.route,
            items: [menu],
          },
        ]
      : []
  }

  const sections: MegaMenuSection[] = []
  const looseItems: TopBarMenuNode[] = []

  for (const child of children) {
    const nestedChildren = getMenuChildren(child)

    if (nestedChildren.length > 0) {
      const items = getLeafMenuItems(nestedChildren)

      if (items.length > 0) {
        sections.push({
          key: child.id ?? child.key ?? child.label ?? `${menu.label}-section`,
          label: child.label,
          icon: child.icon,
          items,
        })
      }

      continue
    }

    if (child.route) {
      looseItems.push(child)
    }
  }

  if (looseItems.length > 0) {
    sections.unshift({
      key: `${menu.id ?? menu.key ?? menu.label ?? "menu"}-links`,
      items: looseItems,
    })
  }

  return sections
}

export function MegaMenu({ menu }: MegaMenuProps) {
  const [open, setOpen] = useState(false)
  const { pathname } = useMyPathname()
  const sections = getMegaMenuSections(menu)
  const menuActive = isMenuTreeActive(menu, pathname)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "rounded-md hover:bg-accent",
            menuActive && "bg-accent"
          )}
          size="sm"
          variant="ghost"
        >
          <Text className={cn("text-sm", menuActive && "font-semibold")}>
            {menu.label ?? "Menu"}
          </Text>
          <Icon
            as={ChevronDown}
            className={cn("transition-transform", open && "rotate-180")}
            size={14}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto min-w-[32rem]">
        <View className="flex-row gap-4">
          {sections.map((section) => {
            const sectionActive = hasActiveMenuItems(section.items, pathname)

            return (
              <View className="flex-1 gap-2" key={section.key}>
                {section.label ? (
                  <>
                    <View
                      className={cn(
                        "flex-row items-center gap-2 rounded-md px-2 py-1.5",
                        sectionActive && "bg-accent"
                      )}
                    >
                      {iconFor(section.icon, 16)}
                      <Text className="font-bold text-foreground text-sm">
                        {section.label}
                      </Text>
                    </View>
                    <Separator />
                  </>
                ) : null}
                <View className="gap-1">
                  {section.items.map((item) => {
                    const itemActive = isMenuRouteActive(item, pathname)

                    return (
                      <NavLink
                        href={item.route ?? "/"}
                        key={item.id ?? item.key ?? item.label ?? item.route}
                      >
                        <Pressable
                          className={cn(
                            "flex-row items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
                            itemActive && "bg-accent"
                          )}
                          onPress={() => setOpen(false)}
                        >
                          {iconFor(item.icon, 14)}
                          <Text
                            className={cn(
                              "text-sm",
                              itemActive
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      </NavLink>
                    )
                  })}
                </View>
              </View>
            )
          })}
        </View>
      </PopoverContent>
    </Popover>
  )
}
