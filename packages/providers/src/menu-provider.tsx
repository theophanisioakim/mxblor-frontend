"use client"

import {
  getGetMyMenusQueryKey,
  type SbfMenuTreeResponseDto,
  useGetMyMenus,
} from "@workspace/api-client"
import type { ReactNode } from "react"
import { createContext, useContext, useMemo } from "react"
import { useAuth } from "./auth-provider"

export interface MenuContextValue {
  menus: SbfMenuTreeResponseDto | undefined
  isLoading: boolean
}

const MenuContext = createContext<MenuContextValue | null>(null)

export interface MenuProviderProps {
  children: ReactNode
}

export function MenuProvider({ children }: Readonly<MenuProviderProps>) {
  const { isAuthenticated, selectedSchema } = useAuth()

  const { data: menus, isLoading } = useGetMyMenus({
    query: {
      enabled: isAuthenticated && selectedSchema !== null,
      queryKey: [...getGetMyMenusQueryKey(), isAuthenticated, selectedSchema],
    },
  })

  const value = useMemo(() => ({ menus, isLoading }), [menus, isLoading])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error("useMenu must be used within MenuProvider")
  }
  return context
}
