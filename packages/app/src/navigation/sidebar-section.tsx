"use client"

import type { SbfMenuSideTreeItemResponseDto } from "@workspace/api-client"
import { useMyPathname } from "@workspace/providers"
import {
  ChevronDown,
  cn,
  Icon,
  iconFor,
  Pressable,
  Text,
  View,
} from "@workspace/ui"
import { memo, useState } from "react"
import {
  getFirstNavigableMenuItem,
  getMenuChildren,
  hasActiveMenuItems,
  hasMenuChildren,
  isMenuRouteActive,
} from "./menu-tree"
import { NavLink } from "./nav-link"

export interface SidebarSectionProps {
  section: SbfMenuSideTreeItemResponseDto
  collapsed: boolean
  onItemPress?: () => void
}

function leafTextClass(active: boolean, depth: number) {
  if (active) {
    return "font-semibold text-foreground"
  }
  return depth > 0 ? "text-muted-foreground" : "text-foreground"
}

const SidebarMenuItem = memo(function SidebarMenuItem({
  item,
  depth = 0,
  pathname,
  onItemPress,
}: Readonly<{
  item: SbfMenuSideTreeItemResponseDto
  depth?: number
  pathname: string
  onItemPress?: () => void
}>) {
  const children = getMenuChildren(item)
  const hasChildren = hasMenuChildren(item)
  const [open, setOpen] = useState(
    () => hasChildren && hasActiveMenuItems(children, pathname)
  )

  if (hasChildren) {
    return (
      <View>
        <Pressable
          className="flex-row items-center gap-2 rounded-md px-3 py-2 hover:bg-accent active:bg-accent"
          onPress={() => setOpen((prev) => !prev)}
          style={{ marginLeft: depth * 12 }}
        >
          {iconFor(item.icon, 14)}
          <Text
            className={cn(
              "flex-1 text-sm",
              depth > 0 ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {item.label}
          </Text>
          <Icon
            as={ChevronDown}
            className={cn(
              "text-muted-foreground transition-transform",
              open ? "rotate-0" : "-rotate-90"
            )}
            size={12}
          />
        </Pressable>

        {open
          ? children.map((child, index) => (
              <SidebarMenuItem
                key={child.id ?? child.label ?? index}
                depth={depth + 1}
                item={child}
                onItemPress={onItemPress}
                pathname={pathname}
              />
            ))
          : null}
      </View>
    )
  }

  const active = isMenuRouteActive(item, pathname)

  return (
    <NavLink href={item.route ?? "/"}>
      <Pressable
        className={cn(
          "flex-row items-center gap-2 rounded-md px-3 py-2 hover:bg-accent active:bg-accent",
          active && "bg-accent"
        )}
        onPress={onItemPress}
        style={{ marginLeft: depth * 12 }}
      >
        {iconFor(item.icon, 14)}
        <Text className={cn("text-sm", leafTextClass(active, depth))}>
          {item.label}
        </Text>
      </Pressable>
    </NavLink>
  )
})

export function SidebarSection({
  section,
  collapsed,
  onItemPress,
}: Readonly<SidebarSectionProps>) {
  const items = getMenuChildren(section)
  const { pathname } = useMyPathname()
  const sectionActive = hasActiveMenuItems(items, pathname)
  const [open, setOpen] = useState(sectionActive)

  if (collapsed) {
    const firstLeaf = getFirstNavigableMenuItem(items)
    return (
      <View className="items-center py-1">
        <NavLink href={firstLeaf?.route ?? section.route ?? "/"}>
          <Pressable
            className={cn(
              "size-10 items-center justify-center rounded-full hover:bg-accent active:bg-accent",
              sectionActive && "bg-accent"
            )}
            onPress={onItemPress}
          >
            {iconFor(section.icon, 18)}
          </Pressable>
        </NavLink>
      </View>
    )
  }

  return (
    <View>
      <Pressable
        className="flex-row items-center gap-2 rounded-md px-3 py-2 hover:bg-accent active:bg-accent"
        onPress={() => setOpen((prev) => !prev)}
      >
        {iconFor(section.icon, 18)}
        <Text className="flex-1 font-semibold text-foreground text-sm">
          {section.label}
        </Text>
        <Icon
          as={ChevronDown}
          className={cn(
            "text-muted-foreground transition-transform",
            open ? "rotate-0" : "-rotate-90"
          )}
          size={14}
        />
      </Pressable>

      {open
        ? items.map((item, index) => (
            <View className="pl-3" key={item.id ?? item.label ?? index}>
              <SidebarMenuItem
                depth={0}
                item={item}
                onItemPress={onItemPress}
                pathname={pathname}
              />
            </View>
          ))
        : null}
    </View>
  )
}
