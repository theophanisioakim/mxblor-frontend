"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useMyPathname } from "./pathname-provider"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsContextValue {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  buildings: "Buildings",
  "form-demo": "Form Demo",
  forms: "Forms",
  login: "Login",
  settings: "Settings",
  user: "Users",
}

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null)

export interface BreadcrumbsProviderProps {
  children: ReactNode
}

export function BreadcrumbsProvider({
  children,
}: Readonly<BreadcrumbsProviderProps>) {
  const { pathname } = useMyPathname()
  const [items, setItems] = useState<BreadcrumbItem[]>(() =>
    buildBreadcrumbsFromPathname(pathname)
  )

  useEffect(() => {
    const next = buildBreadcrumbsFromPathname(pathname)
    setItems((current) => (areBreadcrumbsEqual(current, next) ? current : next))
  }, [pathname])

  const value = useMemo(() => ({ items, setItems }), [items])

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbsContext)
  if (!context) {
    throw new Error("useBreadcrumbs must be used within BreadcrumbsProvider")
  }
  return context
}

function buildBreadcrumbsFromPathname(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

  if (pathname === "/") {
    return items
  }

  const segments = pathname.split("/").filter(Boolean)
  let currentPath = ""

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]
    if (!segment) {
      continue
    }

    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    items.push({
      label: getSegmentLabel(segment),
      href: isLast ? undefined : currentPath,
    })
  }

  return items
}

function getSegmentLabel(segment: string) {
  const label = SEGMENT_LABELS[segment]
  if (label) {
    return label
  }

  if (/^\d+$/.test(segment)) {
    return `#${segment}`
  }

  if (segment === "new") {
    return "New"
  }

  return segment.charAt(0).toUpperCase() + segment.slice(1).replaceAll("-", " ")
}

function areBreadcrumbsEqual(
  current: BreadcrumbItem[],
  next: BreadcrumbItem[]
) {
  if (current.length !== next.length) {
    return false
  }

  return current.every(
    (item, index) =>
      item.label === next[index]?.label && item.href === next[index]?.href
  )
}
