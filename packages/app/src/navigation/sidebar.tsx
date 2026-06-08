"use client"

import { useMenu, useSidebar } from "@workspace/providers"
import {
  Button,
  ChevronsLeft,
  ChevronsRight,
  cn,
  Icon,
  Pressable,
  Separator,
  View,
  X,
} from "@workspace/ui"
import { SidebarSection } from "./sidebar-section"
import { SidebarSkeleton } from "./sidebar-skeleton"

const SIDEBAR_EXPANDED_WIDTH = 240
const SIDEBAR_COLLAPSED_WIDTH = 64

/** Desktop sidebar — hidden on small screens. */
export function Sidebar() {
  const { expanded, toggle } = useSidebar()
  const { menus, isLoading } = useMenu()
  const sections = menus?.side ?? []

  return (
    <View className="max-sm:hidden">
      <View
        className="flex-1 justify-between overflow-hidden border-border border-r bg-background py-2"
        style={{
          width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        }}
      >
        <View
          className={cn("flex-1 gap-1 overflow-y-auto", expanded && "px-2")}
        >
          {isLoading ? (
            <SidebarSkeleton collapsed={!expanded} />
          ) : (
            sections.map((section, index) => (
              <SidebarSection
                collapsed={!expanded}
                key={section.id ?? section.label ?? index}
                section={section}
              />
            ))
          )}
        </View>

        <View className="px-2">
          <Separator className="my-2" />
          <Button
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              "rounded-full hover:bg-accent",
              expanded ? "self-end" : "self-center"
            )}
            onPress={toggle}
            size="icon"
            variant="ghost"
          >
            <Icon as={expanded ? ChevronsLeft : ChevronsRight} size={16} />
          </Button>
        </View>
      </View>
    </View>
  )
}

/** Mobile sidebar overlay — visible only on small screens when open. */
export function MobileSidebar() {
  const { mobileOpen, closeMobile } = useSidebar()
  const { menus, isLoading } = useMenu()
  const sections = menus?.side ?? []

  return (
    <View
      className={cn(
        "absolute inset-0 z-[200] flex-row sm:hidden",
        !mobileOpen && "pointer-events-none"
      )}
    >
      <View
        className={cn(
          "w-60 justify-between border-border border-r bg-background py-2 transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-60"
        )}
      >
        <View className="flex-1 gap-1 overflow-y-auto px-2">
          <View className="flex-row justify-end px-2 pb-2">
            <Button
              aria-label="Close menu"
              className="rounded-full hover:bg-accent"
              onPress={closeMobile}
              size="icon"
              variant="ghost"
            >
              <Icon as={X} size={18} />
            </Button>
          </View>
          {isLoading ? (
            <SidebarSkeleton collapsed={false} />
          ) : (
            sections.map((section, index) => (
              <SidebarSection
                collapsed={false}
                key={section.id ?? section.label ?? index}
                onItemPress={closeMobile}
                section={section}
              />
            ))
          )}
        </View>
      </View>

      <Pressable
        aria-label="Close menu"
        className={cn(
          "flex-1 bg-black/40 transition-opacity",
          mobileOpen ? "opacity-100" : "opacity-0"
        )}
        onPress={closeMobile}
      />
    </View>
  )
}
