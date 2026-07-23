"use client"

import { useAuth } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Apple,
  Button,
  cn,
  Github,
  Google,
  Icon,
  RncForm,
  RncInput,
  RncSelect,
  RncSubmitButton,
  Separator,
  Spinner,
  Text,
  Twitch,
  View,
} from "@workspace/ui"
import { useEffect, useState } from "react"
import { startTwitchAuth } from "./twitch-auth"

type LoginForm = {
  username: string
  password: string
}

type SchemaSelectionForm = { schema: string }

export interface LoginScreenProps {
  /** Twitch flow resolved during web SSR; omitted on native or SSR failure. */
  initialTwitchUrl?: string | null
  initialTwitchState?: string | null
  initialTwitchCodeVerifier?: string | null
}

type OAuthProvider = "twitch" | "google" | "apple" | "github"

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  twitch: "Twitch",
  google: "Google",
  apple: "Apple",
  github: "GitHub",
}

/**
 * OAuth providers, in display order. Each carries its brand color (solid fill +
 * white glyph). Only Twitch is wired to the backend today (see `handleOAuth`).
 */
const PROVIDERS = [
  {
    id: "twitch" as const,
    icon: Twitch,
    className: "bg-[#9146FF] hover:bg-[#7c38e6]",
  },
  {
    id: "google" as const,
    icon: Google,
    className: "bg-[#4285F4] hover:bg-[#3b78dc]",
  },
  {
    id: "apple" as const,
    icon: Apple,
    className: "bg-black hover:bg-black/85",
  },
  {
    id: "github" as const,
    icon: Github,
    className: "bg-[#24292e] hover:bg-[#24292e]/85",
  },
]

/**
 * Shared, cross-platform login screen rendered by both `apps/web` and
 * `apps/native`. A responsive two-pane "aurora" layout: on wide (web) viewports
 * a luminous brand panel sits beside the form; on narrow (native) viewports the
 * panel collapses and only the form shows — driven by `lg:` breakpoints, with no
 * platform branching.
 *
 * Username/email + password is the primary path. Twitch
 * OAuth is initiated here via `startTwitchAuth`, which diverges by platform: on
 * web it full-page redirects to Twitch and the `/` route's `TwitchCallback`
 * finishes the exchange; on native it opens an in-app auth session that returns
 * `code`/`state` inline, which this screen exchanges via `loginWithTwitch`.
 * Google/Apple/GitHub are presented as providers but not yet backed by the API —
 * they surface a "coming soon" notice until their server flows exist.
 *
 * Web receives its client-bound Twitch flow from SSR. Native, or web after an
 * SSR failure, resolves the flow client-side.
 */
export function LoginScreen({
  initialTwitchCodeVerifier,
  initialTwitchState,
  initialTwitchUrl,
}: Readonly<LoginScreenProps> = {}) {
  const {
    actionState,
    cancelSchemaSelection,
    cancelTwitchLogin,
    getTwitchRedirectUrl,
    isAuthenticated,
    login,
    loginWithTwitch,
    pendingSchemaSelection,
    selectSchema,
  } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [retryDeadline, setRetryDeadline] = useState<number | null>(null)
  const [retryRemaining, setRetryRemaining] = useState(0)
  // `null` = unavailable or not yet known; a non-empty string = ready to use.
  const [twitchUrl, setTwitchUrl] = useState<string | null>(
    initialTwitchUrl && initialTwitchState && initialTwitchCodeVerifier
      ? initialTwitchUrl
      : null
  )

  // Redirect away once authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (pendingSchemaSelection) {
      setError(null)
      setOauthLoading(null)
      setRetryDeadline(null)
      setRetryRemaining(0)
    }
  }, [pendingSchemaSelection])

  useEffect(() => {
    if (retryDeadline === null) {
      return
    }

    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.ceil((retryDeadline - Date.now()) / 1000)
      )
      setRetryRemaining(remaining)
      if (remaining === 0) {
        setRetryDeadline(null)
        setError(null)
      }
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 250)
    return () => clearInterval(interval)
  }, [retryDeadline])

  // Register the SSR-created proof in this browser session. Native and the SSR
  // failure path resolve a fresh flow client-side instead.
  useEffect(() => {
    const hasInitialResult = initialTwitchUrl !== undefined
    const initialFlow =
      initialTwitchUrl && initialTwitchState && initialTwitchCodeVerifier
        ? {
            codeVerifier: initialTwitchCodeVerifier,
            redirectUrl: initialTwitchUrl,
            state: initialTwitchState,
          }
        : undefined

    if (hasInitialResult && !initialFlow) {
      setTwitchUrl(null)
      return
    }

    let active = true
    getTwitchRedirectUrl(initialFlow)
      .then((url) => {
        if (active) {
          setTwitchUrl(url)
        }
      })
      .catch(() => {
        if (active) {
          setTwitchUrl(null)
        }
      })

    return () => {
      active = false
    }
  }, [
    getTwitchRedirectUrl,
    initialTwitchCodeVerifier,
    initialTwitchState,
    initialTwitchUrl,
  ])

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null)
    setNotice(null)

    // Only Twitch has a backend flow today; the rest are placeholders.
    if (provider !== "twitch") {
      setNotice(`${PROVIDER_LABELS[provider]} sign-in is coming soon.`)
      return
    }

    let authUrl = twitchUrl
    if (initialTwitchUrl && initialTwitchState && initialTwitchCodeVerifier) {
      authUrl = await getTwitchRedirectUrl({
        codeVerifier: initialTwitchCodeVerifier,
        redirectUrl: initialTwitchUrl,
        state: initialTwitchState,
      })
    }

    // The Twitch button only renders when the backend supplied a URL.
    if (!authUrl) {
      setError("Twitch login is currently unavailable.")
      return
    }

    setOauthLoading("twitch")

    // Web full-page redirects (the `/` route's TwitchCallback finishes the
    // exchange); native opens an in-app auth session and returns code/state
    // inline, which we exchange here.
    const result = await startTwitchAuth(authUrl)
    if (result.type === "redirecting") {
      return
    }
    if (result.type === "cancelled") {
      cancelTwitchLogin()
      setOauthLoading(null)
      return
    }

    const session = await loginWithTwitch(result.code, result.state)
    if (session.status === "authenticated") {
      router.replace("/dashboard")
    } else if (session.status === "error") {
      setError(session.errorMessage)
      if (session.retryAfterSeconds !== undefined) {
        setRetryRemaining(session.retryAfterSeconds)
        setRetryDeadline(Date.now() + session.retryAfterSeconds * 1000)
      }
      setOauthLoading(null)
    } else {
      setOauthLoading(null)
    }
  }

  const rateLimited = retryRemaining > 0
  const busy =
    oauthLoading !== null || actionState.login.isLoading || rateLimited
  // Hide Twitch unless the backend handed us a non-empty redirect URL.
  const providers = PROVIDERS.filter(
    (provider) => provider.id !== "twitch" || Boolean(twitchUrl)
  )
  const displayedError = rateLimited
    ? `Too many sign-in attempts. Try again in ${retryRemaining}s.`
    : (error ?? actionState.selectSchema.errorMessage)

  return (
    <View className="min-h-full flex-1 bg-background lg:flex-row">
      {/* Brand panel — web/desktop only; collapses on native via lg: */}
      <View className="relative hidden overflow-hidden bg-primary p-12 lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        {/* Ambient aurora shapes for depth. */}
        <View className="absolute -top-24 -left-24 size-96 rounded-full bg-primary-foreground/10" />
        <View className="absolute top-1/3 right-[-7rem] size-80 rounded-full bg-primary-foreground/5" />
        <View className="absolute -bottom-28 left-1/3 size-96 rounded-full bg-primary-foreground/10" />

        <View className="relative flex-row items-center gap-3">
          <View className="size-10 items-center justify-center rounded-xl bg-primary-foreground">
            <Text className="font-bold text-lg text-primary">M</Text>
          </View>
          <Text className="font-semibold text-lg text-primary-foreground tracking-tight">
            Monocore
          </Text>
        </View>

        <View className="relative gap-5">
          <Text className="font-semibold text-4xl text-primary-foreground leading-tight tracking-tight">
            One codebase. Every platform.
          </Text>
          <Text className="max-w-md text-base text-primary-foreground/80 leading-relaxed">
            Sign in to manage your workspace across web and native — built once,
            shipped everywhere.
          </Text>
        </View>

        <View className="relative flex-row items-center gap-2">
          <View className="size-1.5 rounded-full bg-primary-foreground/60" />
          <Text className="text-primary-foreground/70 text-sm">
            Secured with end-to-end encryption
          </Text>
        </View>
      </View>

      {/* Form panel */}
      <View className="flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-10">
        <View className="w-full max-w-sm gap-8">
          {/* Brand mark (shown when the side panel is hidden) + heading */}
          <View className="gap-6">
            <View className="size-12 items-center justify-center rounded-2xl bg-primary shadow-sm lg:hidden">
              <Text className="font-bold text-primary-foreground text-xl">
                M
              </Text>
            </View>
            <View className="gap-2">
              <Text className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
                {pendingSchemaSelection ? "Choose workspace" : "Welcome back"}
              </Text>
              <Text className="font-semibold text-3xl text-foreground tracking-tight">
                {pendingSchemaSelection
                  ? "Select a schema"
                  : "Good to see you again"}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {pendingSchemaSelection
                  ? "Choose the tenant context for this signed session."
                  : "Sign in to pick up right where you left off."}
              </Text>
            </View>
          </View>

          {displayedError ? (
            <View className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <Text className="text-center text-destructive text-sm">
                {displayedError}
              </Text>
            </View>
          ) : null}

          {notice ? (
            <View className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <Text className="text-center text-foreground text-sm">
                {notice}
              </Text>
            </View>
          ) : null}

          {pendingSchemaSelection ? (
            <View className="gap-4">
              <RncForm<SchemaSelectionForm>
                defaultValues={{
                  schema: pendingSchemaSelection.availableSchemas[0],
                }}
                id="schema-selection-form"
                onSubmit={async ({ schema }) => {
                  setError(null)
                  const result = await selectSchema(schema)
                  if (result.status === "authenticated") {
                    router.replace("/dashboard")
                    return true
                  }
                  if (result.status === "error") {
                    setError(result.errorMessage)
                  }
                  return false
                }}
              >
                <RncSelect
                  defaultValue={pendingSchemaSelection.availableSchemas[0]}
                  id="schema"
                  label="Schema"
                  options={pendingSchemaSelection.availableSchemas.map(
                    (schema) => ({ id: schema, label: schema })
                  )}
                  required
                />
                <RncSubmitButton className="h-11 w-full" label="Continue" />
              </RncForm>
              <Button
                disabled={actionState.selectSchema.isLoading}
                onPress={() => {
                  setError(null)
                  cancelSchemaSelection()
                }}
                variant="ghost"
              >
                <Text>Back to sign in</Text>
              </Button>
            </View>
          ) : (
            <>
              <RncForm<LoginForm>
                id="login-form"
                onSubmit={async (data) => {
                  setError(null)
                  setNotice(null)
                  const result = await login(data)
                  if (result.status === "authenticated") {
                    router.replace("/dashboard")
                    return true
                  }
                  if (result.status === "error") {
                    setError(result.errorMessage)
                    if (result.retryAfterSeconds !== undefined) {
                      setRetryRemaining(result.retryAfterSeconds)
                      setRetryDeadline(
                        Date.now() + result.retryAfterSeconds * 1000
                      )
                    }
                  }
                  return false
                }}
              >
                <RncInput
                  autoCapitalize="none"
                  autoComplete="username"
                  id="username"
                  label="Username or email"
                  placeholder="you@example.com"
                  required
                />
                <RncInput
                  autoComplete="current-password"
                  id="password"
                  label="Password"
                  placeholder="••••••••"
                  required
                  type="password"
                />
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium text-primary text-sm">
                    Forgot password?
                  </Text>
                </View>
                <RncSubmitButton
                  className="h-11 w-full"
                  disabled={rateLimited}
                  label={
                    rateLimited ? `Try again in ${retryRemaining}s` : "Sign in"
                  }
                />
              </RncForm>

              {/* Divider */}
              <View className="flex-row items-center gap-3">
                <Separator className="flex-1" />
                <Text className="text-muted-foreground text-xs uppercase tracking-wider">
                  or continue with
                </Text>
                <Separator className="flex-1" />
              </View>

              {/* OAuth providers — each in its brand color */}
              <View className="flex-row gap-3">
                {providers.map((provider) => (
                  <Button
                    aria-label={`Continue with ${PROVIDER_LABELS[provider.id]}`}
                    className={cn("h-11 flex-1", provider.className)}
                    disabled={busy}
                    key={provider.id}
                    onPress={() => void handleOAuth(provider.id)}
                  >
                    {oauthLoading === provider.id ? (
                      <Spinner />
                    ) : (
                      <Icon
                        as={provider.icon}
                        className="text-white"
                        size={20}
                      />
                    )}
                  </Button>
                ))}
              </View>
            </>
          )}

          {/* Footer */}
          {!pendingSchemaSelection ? (
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-muted-foreground text-sm">New here?</Text>
              <Text className="font-medium text-primary text-sm">
                Create an account
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}
