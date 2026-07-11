"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  getGetLanguageConfigQueryKey,
  useGetLanguageConfig,
} from "./generated/sbf-translation/sbf-translation"
import type { LanguageConfigResponseDto } from "./generated/springBootFrameworkAPI.schemas"

export interface LanguageConfigContextValue {
  /** The tenant's default language. Empty string until it has loaded. */
  defaultLanguage: string
  /** Every language the tenant supports, the default one always first. */
  availableLanguages: string[]
  isLoading: boolean
}

const LanguageConfigContext = createContext<LanguageConfigContextValue | null>(
  null
)

export interface LanguageConfigProviderProps {
  children: ReactNode
  /**
   * Session identity, injected by the consumer (`ProviderStack`, which owns
   * `useAuth`). It is passed in rather than read here because `api-client` sits
   * *below* `@workspace/providers` — importing it would invert the graph.
   */
  isAuthenticated: boolean
  selectedSchema: string | null
  /**
   * Config fetched during SSR (web `layout.tsx`). Seeds React Query so a form
   * paints with its languages on first load, without a client round-trip.
   */
  initialData?: LanguageConfigResponseDto
}

/**
 * Fetches the tenant's language configuration **once for the whole app** and
 * hands it to every consumer through context.
 *
 * This is the only observer of the query. Because the provider mounts at the app
 * shell and stays mounted for the app's lifetime, there is never a second
 * observer to re-trigger a fetch — so the global `staleTime: 0` / `gcTime: 0`
 * defaults are irrelevant here and are deliberately *not* overridden. The
 * context is what distributes the value; the query cache is not being used as a
 * cache. Before this, every `RncTranslationLabel` fetched the config itself on
 * mount, and with those defaults nothing was ever reused.
 *
 * The endpoint is public and its answer depends on the caller: the tenant comes
 * from the `x-schema-id` header (falling back to the main schema), so an
 * anonymous visitor gets the system defaults and a logged-in user gets their
 * tenant's override. Login, logout, and tenant switches therefore have to
 * refetch — which is what putting the session in the query key achieves.
 */
export function LanguageConfigProvider({
  children,
  isAuthenticated,
  selectedSchema,
  initialData,
}: Readonly<LanguageConfigProviderProps>) {
  // Mirrors MenuProvider: fetch for everyone (the endpoint is public), but stay
  // idle in the brief window where a session schema exists and the user has not
  // been resolved yet (mid-login), so the request never goes out with
  // half-applied auth headers.
  const isReady = isAuthenticated || selectedSchema === null

  // The SSR seed describes the session that rendered it — nothing else. Left as
  // a plain prop it would be re-applied as `initialData` to *every* future query
  // key, so logging in would keep serving the anonymous tenant's languages and
  // `enabled` would never turn on. The first change of `selectedSchema` (the
  // first login or logout) releases it permanently, after which the session in
  // the query key drives client refetches. Same latch as MenuProvider.
  const initialSchema = useRef(selectedSchema).current
  const [seedReleased, setSeedReleased] = useState(false)
  if (!seedReleased && selectedSchema !== initialSchema) {
    setSeedReleased(true)
  }
  const seed = seedReleased ? undefined : initialData

  const { data, isLoading } = useGetLanguageConfig({
    query: {
      enabled: isReady && seed === undefined,
      // The session is part of the key, so a login / logout / tenant switch
      // fetches the new tenant's config instead of reusing the old one.
      queryKey: [
        ...getGetLanguageConfigQueryKey(),
        isAuthenticated,
        selectedSchema,
      ],
      initialData: seed,
    },
  })

  const value = useMemo<LanguageConfigContextValue>(() => {
    const available = data?.availableLanguages ?? []
    const defaultLanguage = data?.defaultLanguage ?? ""
    return {
      defaultLanguage,
      // The backend already returns the default first; re-assert it here so a
      // consumer can rely on the ordering no matter what it is handed.
      availableLanguages: defaultLanguage
        ? [
            defaultLanguage,
            ...available.filter((language) => language !== defaultLanguage),
          ]
        : available,
      isLoading,
    }
  }, [data, isLoading])

  return (
    <LanguageConfigContext.Provider value={value}>
      {children}
    </LanguageConfigContext.Provider>
  )
}

/** The tenant's languages. Must be used under a `LanguageConfigProvider`. */
export function useLanguageConfig(): LanguageConfigContextValue {
  const context = useContext(LanguageConfigContext)
  if (!context) {
    throw new Error(
      "useLanguageConfig must be used within a LanguageConfigProvider"
    )
  }
  return context
}
