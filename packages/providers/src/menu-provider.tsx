"use client"

import {
  getGetMyMenusQueryKey,
  type SbfMenuTreeResponseDto,
  useGetMyMenus,
} from "@workspace/api-client"
import type { ReactNode } from "react"
import { createContext, useContext, useMemo, useRef, useState } from "react"
import { useAuth } from "./auth-provider"

export interface MenuContextValue {
  menus: SbfMenuTreeResponseDto | undefined
  isLoading: boolean
}

const MenuContext = createContext<MenuContextValue | null>(null)

export interface MenuProviderProps {
  children: ReactNode
  /**
   * Menu tree fetched during SSR (web `layout.tsx`). Seeds React Query so the
   * navigation chrome paints on first load without a client round-trip. Native
   * leaves this undefined and fetches client-side.
   */
  initialMenus?: SbfMenuTreeResponseDto
}

export function MenuProvider({
  children,
  initialMenus,
}: Readonly<MenuProviderProps>) {
  const { isAuthenticated, selectedSchema } = useAuth()

  // Menus are fetched for everyone — authenticated users get their own tree,
  // anonymous users get the public menus. We only hold off during the brief
  // window where a session schema exists but the user hasn't been resolved
  // yet (e.g. mid-login), so the request never fires with half-applied auth
  // headers.
  const isReady = isAuthenticated || selectedSchema === null

  // The SSR menu tree (web `layout.tsx`) seeds React Query for the initial
  // page load so the client doesn't refetch what the server already fetched.
  // The seed is only valid until the session changes: the first login or
  // logout (a change in `selectedSchema`) releases it for good, after which
  // auth changes drive client refetches via the queryKey, like before.
  const initialSchema = useRef(selectedSchema).current
  const [seedReleased, setSeedReleased] = useState(false)
  if (!seedReleased && selectedSchema !== initialSchema) {
    setSeedReleased(true)
  }
  const seed = seedReleased ? undefined : initialMenus

  const { data: menus, isLoading } = useGetMyMenus({
    query: {
      // While the SSR seed is serving the initial session the client stays
      // idle; once released, login/logout refetch through the changing
      // queryKey.
      enabled: isReady && seed === undefined,
      queryKey: [...getGetMyMenusQueryKey(), isAuthenticated, selectedSchema],
      initialData: seed,
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
