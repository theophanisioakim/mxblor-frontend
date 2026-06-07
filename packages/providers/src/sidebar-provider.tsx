"use client"

import type { ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

export interface SidebarContextValue {
  expanded: boolean
  mobileOpen: boolean
  toggle: () => void
  setExpanded: (expanded: boolean) => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: Readonly<SidebarProviderProps>) {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleMobile = useCallback(
    () => setMobileOpen((current) => !current),
    []
  )
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggle = useCallback(() => setExpanded((current) => !current), [])

  const value = useMemo<SidebarContextValue>(
    () => ({
      expanded,
      mobileOpen,
      toggle,
      setExpanded,
      toggleMobile,
      closeMobile,
    }),
    [expanded, mobileOpen, toggle, toggleMobile, closeMobile]
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}
