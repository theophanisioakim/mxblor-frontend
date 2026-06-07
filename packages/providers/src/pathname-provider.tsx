"use client"

import { usePathname } from "@workspace/router"
import type { ReactNode } from "react"
import { createContext, useContext, useMemo } from "react"

export interface PathnameContextValue {
  pathname: string
}

const PathnameContext = createContext<PathnameContextValue | null>(null)

export interface PathnameProviderProps {
  children: ReactNode
}

export function PathnameProvider({
  children,
}: Readonly<PathnameProviderProps>) {
  const hookPathname = usePathname()
  const pathname = hookPathname ?? "/"

  const value = useMemo<PathnameContextValue>(
    () => ({
      pathname,
    }),
    [pathname]
  )

  return (
    <PathnameContext.Provider value={value}>
      {children}
    </PathnameContext.Provider>
  )
}

export function useMyPathname() {
  const context = useContext(PathnameContext)
  if (!context) {
    throw new Error("useMyPathname must be used within PathnameProvider")
  }
  return context
}
