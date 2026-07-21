"use client"

import {
  type ApiPermissionKey,
  type CrudBasePath,
  getGetMyPermissionsQueryKey,
  type SbfMyPermissionsResponseDto,
  useGetMyPermissions,
} from "@workspace/api-client"
import type { ReactNode } from "react"
import { createContext, useContext, useMemo, useRef, useState } from "react"
import { useAuth } from "./auth-provider"

export interface PermissionContextValue {
  /** True while the grant list for the current session is still loading. */
  isLoading: boolean
  /**
   * True once a grant list is known for the current session — from the SSR
   * seed, a completed fetch, or a failed fetch (which resolves to an empty
   * grant list, so gates fail closed). Page guards render a loading state
   * until this is true.
   */
  isResolved: boolean
  /**
   * True when the current context may invoke the given API route. The key is
   * the generated `"<METHOD> <endpoint template>"` union from openapi.json
   * (e.g. `"PUT /sbf-user/{id}"`), so unknown routes fail typecheck instead
   * of silently gating nothing. While the grants are still loading this
   * returns false, so gated controls start disabled and enable once the grant
   * list arrives (the SSR seed makes that immediate on web).
   */
  hasPermission: (permission: ApiPermissionKey) => boolean
}

const PermissionContext = createContext<PermissionContextValue | null>(null)

export interface PermissionProviderProps {
  children: ReactNode
  /**
   * Grant list fetched during SSR (web `layout.tsx`). Seeds React Query so
   * permission-gated controls render correctly on first load without a client
   * round-trip. Native leaves this undefined and fetches client-side.
   */
  initialPermissions?: SbfMyPermissionsResponseDto
}

export function PermissionProvider({
  children,
  initialPermissions,
}: Readonly<PermissionProviderProps>) {
  const { isAuthenticated, selectedSchema } = useAuth()

  // Permissions are fetched for everyone — authenticated users get their
  // effective role grants plus the public permissions, anonymous users get the
  // public permissions only. Mirrors MenuProvider: hold off during the brief
  // window where a session schema exists but the user hasn't been resolved yet.
  const isReady = isAuthenticated || selectedSchema === null

  // The SSR grant list (web `layout.tsx`) seeds React Query for the initial
  // page load. The seed is only valid until the session changes: the first
  // login or logout (a change in `selectedSchema`) releases it for good, after
  // which auth changes drive client refetches via the queryKey.
  const initialSchema = useRef(selectedSchema).current
  const [seedReleased, setSeedReleased] = useState(false)
  if (!seedReleased && selectedSchema !== initialSchema) {
    setSeedReleased(true)
  }
  const seed = seedReleased ? undefined : initialPermissions

  const {
    data: fetched,
    isError,
    isLoading,
  } = useGetMyPermissions({
    query: {
      // While the SSR seed is serving the initial session the client stays
      // idle; once released, login/logout refetch through the changing
      // queryKey.
      enabled: isReady && seed === undefined,
      queryKey: [
        ...getGetMyPermissionsQueryKey(),
        isAuthenticated,
        selectedSchema,
      ],
    },
  })

  // While the seed is active, read the SSR prop DIRECTLY instead of routing it
  // through React Query. The server-side query client is a module-level
  // singleton shared across requests with gcTime 0, so what a deeply-rendered
  // page reads from the cache during SSR is not guaranteed to equal the seed —
  // the prop, serialized through the RSC payload, is byte-identical on the
  // server and on client hydration, which keeps permission-dependent markup
  // (disabled buttons, page guards) hydration-safe.
  const permissions = seed ?? fetched

  const value = useMemo(() => {
    const grants =
      permissions !== undefined
        ? new Set(
            (permissions.permissions ?? []).map(
              (grant) =>
                `${(grant.method ?? "").toUpperCase()} ${grant.endpoint ?? ""}`
            )
          )
        : undefined
    return {
      isLoading,
      // A failed fetch resolves to "no grants" so guards deny instead of
      // spinning forever.
      isResolved: grants !== undefined || isError,
      hasPermission: (permission: ApiPermissionKey) =>
        grants?.has(permission) ?? false,
    }
  }, [permissions, isLoading, isError])

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error("usePermission must be used within PermissionProvider")
  }
  return context
}

export interface CrudPermissions {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

/**
 * Convenience gate over the generated CRUD route family of one backend
 * resource: create is `POST <basePath>`, update `PUT <basePath>/{id}` and
 * delete `DELETE <basePath>/{id}`. `basePath` is the generated `CrudBasePath`
 * union, so only resources whose full CRUD family exists in openapi.json are
 * accepted. Screens gate their grid/form actions with these flags; routes
 * outside the CRUD family use `usePermission` directly.
 */
export function useCrudPermissions(basePath: CrudBasePath): CrudPermissions {
  const { hasPermission } = usePermission()
  return {
    canCreate: hasPermission(`POST ${basePath}` as ApiPermissionKey),
    canUpdate: hasPermission(`PUT ${basePath}/{id}` as ApiPermissionKey),
    canDelete: hasPermission(`DELETE ${basePath}/{id}` as ApiPermissionKey),
  }
}
