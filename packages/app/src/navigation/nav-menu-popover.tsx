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
  Text,
  View,
} from "@workspace/ui"
import { useEffect, useState } from "react"
import {
  getMenuChildren,
  hasActiveMenuItems,
  isMenuRouteActive,
  isMenuTreeActive,
  type TopBarMenuNode,
} from "./menu-tree"
import { NavLink } from "./nav-link"

export type NavMenuPopoverProps = Readonly<{
  menu: SbfMenuTopTreeItemResponseDto
}>

function menuItemTextClass(
  depth: number,
  active: boolean,
  hasActiveChild: boolean,
  hasChildren: boolean
): string {
  const color =
    active || hasActiveChild || depth === 0
      ? "text-foreground"
      : "text-muted-foreground"
  const weight =
    active || hasActiveChild || hasChildren || depth === 0
      ? "font-semibold"
      : "font-normal"
  return cn(color, weight)
}

function NavMenuItemLabel({
  item,
  textClass,
}: Readonly<{ item: TopBarMenuNode; textClass: string }>) {
  return (
    <View className="flex-1 flex-row items-center gap-2">
      {iconFor(item.icon, 14)}
      <Text className={cn("flex-1 text-sm", textClass)}>{item.label}</Text>
    </View>
  )
}

function NavMenuLinkRow({
  href,
  label,
  paddingLeft,
  active,
  onItemPress,
}: Readonly<{
  href: string
  label: React.ReactNode
  paddingLeft: number
  active: boolean
  onItemPress: () => void
}>) {
  return (
    <NavLink href={href}>
      <Pressable
        className={cn(
          "w-full flex-1 flex-row items-center gap-2 rounded-md py-2 pr-2 hover:bg-accent active:bg-accent",
          active && "bg-accent"
        )}
        onPress={onItemPress}
        style={{ paddingLeft }}
      >
        {label}
      </Pressable>
    </NavLink>
  )
}

function NavMenuGroupRow({
  label,
  paddingLeft,
  hasChildren,
  hasActiveChild,
  expanded,
  onToggle,
}: Readonly<{
  label: React.ReactNode
  paddingLeft: number
  hasChildren: boolean
  hasActiveChild: boolean
  expanded: boolean
  onToggle: () => void
}>) {
  return (
    <Pressable
      className={cn(
        "flex-1 flex-row items-center gap-2 rounded-md py-2 pr-2 hover:bg-accent active:bg-accent",
        hasActiveChild && "bg-accent"
      )}
      onPress={hasChildren ? onToggle : undefined}
      style={{ paddingLeft }}
    >
      {label}
      {hasChildren ? (
        <View className="w-5 items-center justify-center">
          <Icon
            as={ChevronDown}
            className={cn(
              "transition-transform",
              expanded ? "rotate-0" : "-rotate-90"
            )}
            size={12}
          />
        </View>
      ) : null}
    </Pressable>
  )
}

function NavMenuExpandButton({
  expanded,
  onToggle,
}: Readonly<{ expanded: boolean; onToggle: () => void }>) {
  return (
    <Button
      aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
      className="shrink-0 rounded-full hover:bg-accent"
      onPress={onToggle}
      size="icon"
      variant="ghost"
    >
      <Icon
        as={ChevronDown}
        className={cn(
          "transition-transform",
          expanded ? "rotate-0" : "-rotate-90"
        )}
        size={12}
      />
    </Button>
  )
}

function NavMenuLeafItem({
  item,
  depth,
  pathname,
  onItemPress,
}: Readonly<{
  item: TopBarMenuNode
  depth: number
  pathname: string
  onItemPress: () => void
}>) {
  const active = isMenuRouteActive(item, pathname)
  const paddingLeft = 12 + depth * 10
  const textClass = menuItemTextClass(depth, active, false, false)
  const label = <NavMenuItemLabel item={item} textClass={textClass} />

  if (item.route) {
    return (
      <NavMenuLinkRow
        active={active}
        href={item.route}
        label={label}
        onItemPress={onItemPress}
        paddingLeft={paddingLeft}
      />
    )
  }

  return (
    <NavMenuGroupRow
      expanded={false}
      hasActiveChild={false}
      hasChildren={false}
      label={label}
      onToggle={() => undefined}
      paddingLeft={paddingLeft}
    />
  )
}

function NavMenuBranchItem({
  item,
  childItems,
  depth,
  pathname,
  onItemPress,
}: Readonly<{
  item: TopBarMenuNode
  childItems: TopBarMenuNode[]
  depth: number
  pathname: string
  onItemPress: () => void
}>) {
  const active = isMenuRouteActive(item, pathname)
  const hasActiveChild = hasActiveMenuItems(childItems, pathname)
  const [expanded, setExpanded] = useState(hasActiveChild)
  const paddingLeft = 12 + depth * 10
  const textClass = menuItemTextClass(depth, active, hasActiveChild, true)
  const onToggle = () => setExpanded((current) => !current)
  const label = <NavMenuItemLabel item={item} textClass={textClass} />

  useEffect(() => {
    setExpanded(hasActiveChild)
  }, [hasActiveChild])

  return (
    <View className="gap-1">
      <View className="w-full flex-row items-center gap-1">
        {item.route ? (
          <NavMenuLinkRow
            active={active}
            href={item.route}
            label={label}
            onItemPress={onItemPress}
            paddingLeft={paddingLeft}
          />
        ) : (
          <NavMenuGroupRow
            expanded={expanded}
            hasActiveChild={hasActiveChild}
            hasChildren
            label={label}
            onToggle={onToggle}
            paddingLeft={paddingLeft}
          />
        )}

        {item.route ? (
          <NavMenuExpandButton expanded={expanded} onToggle={onToggle} />
        ) : null}
      </View>

      {expanded ? (
        <View className="ml-2 gap-1 border-border border-l pl-2">
          {childItems.map((child, index) => (
            <NavMenuTreeItem
              depth={depth + 1}
              item={child}
              key={child.id ?? child.key ?? child.label ?? child.route ?? index}
              onItemPress={onItemPress}
              pathname={pathname}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}

function NavMenuTreeItem({
  item,
  depth = 0,
  pathname,
  onItemPress,
}: Readonly<{
  item: TopBarMenuNode
  depth?: number
  pathname: string
  onItemPress: () => void
}>) {
  const children = getMenuChildren(item)
  if (children.length === 0) {
    return (
      <NavMenuLeafItem
        depth={depth}
        item={item}
        onItemPress={onItemPress}
        pathname={pathname}
      />
    )
  }

  return (
    <NavMenuBranchItem
      childItems={children}
      depth={depth}
      item={item}
      onItemPress={onItemPress}
      pathname={pathname}
    />
  )
}

export function NavMenuPopover({ menu }: NavMenuPopoverProps) {
  const [open, setOpen] = useState(false)
  const { pathname } = useMyPathname()
  const items = getMenuChildren(menu)
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

      <PopoverContent align="start" className="w-auto min-w-[14rem] gap-1">
        {items.map((item, index) => (
          <NavMenuTreeItem
            item={item}
            key={item.id ?? item.key ?? item.label ?? item.route ?? index}
            onItemPress={() => setOpen(false)}
            pathname={pathname}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}
