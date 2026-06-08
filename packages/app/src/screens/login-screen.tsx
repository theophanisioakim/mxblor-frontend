"use client"

import { useAuth } from "@workspace/providers"
import { useRouter, useSearchParams } from "@workspace/router"
import {
  Button,
  Icon,
  RncCheckbox,
  RncForm,
  RncInput,
  RncSubmitButton,
  Separator,
  Spinner,
  Text,
  Twitch,
  View,
} from "@workspace/ui"
import { useEffect, useState } from "react"

type LoginForm = {
  username: string
  password: string
  rememberMe?: boolean
}

/** Opens an external URL (full-page redirect on web). */
function openExternalUrl(url: string) {
  const loc = (globalThis as { location?: { assign?: (u: string) => void } })
    .location
  loc?.assign?.(url)
}

/**
 * Shared, cross-platform login screen: username/email + password with a
 * "remember me" option, plus Twitch OAuth. The Twitch flow fetches the authorize
 * URL from the backend (`getTwitchRedirectUrl`) and, when Twitch redirects back
 * to this screen with `?code&state`, exchanges them via `loginWithTwitch`.
 */
export function LoginScreen() {
  const { login, loginWithTwitch, getTwitchRedirectUrl, isAuthenticated } =
    useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [twitchLoading, setTwitchLoading] = useState(false)

  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // Redirect away once authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  // Handle the Twitch OAuth callback (?code&state) landing back on this screen.
  useEffect(() => {
    if (!(code && state)) {
      return
    }

    let active = true
    setTwitchLoading(true)
    setError(null)

    loginWithTwitch(code, state).then((result) => {
      if (!active) {
        return
      }
      if (result.success) {
        router.replace("/")
      } else {
        setError(result.errorMessage)
        setTwitchLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [code, state, loginWithTwitch, router])

  const handleTwitchLogin = async () => {
    setError(null)
    setTwitchLoading(true)
    try {
      const url = await getTwitchRedirectUrl()
      if (url) {
        openExternalUrl(url)
      } else {
        setError("Twitch login is currently unavailable.")
        setTwitchLoading(false)
      }
    } catch {
      setError("Could not start Twitch login. Please try again.")
      setTwitchLoading(false)
    }
  }

  return (
    <View className="min-h-full flex-1 items-center justify-center bg-muted/30 p-6">
      <View className="w-full max-w-sm gap-6 rounded-2xl border border-border bg-background p-8 shadow-sm">
        {/* Brand + heading */}
        <View className="items-center gap-3">
          <View className="size-12 items-center justify-center rounded-xl bg-primary">
            <Text className="font-bold text-primary-foreground text-xl">M</Text>
          </View>
          <View className="items-center gap-1">
            <Text className="font-bold text-2xl text-foreground">
              Welcome back
            </Text>
            <Text className="text-center text-muted-foreground text-sm">
              Sign in to your account to continue
            </Text>
          </View>
        </View>

        {error ? (
          <View className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            <Text className="text-center text-destructive text-sm">
              {error}
            </Text>
          </View>
        ) : null}

        <RncForm<LoginForm>
          id="login-form"
          onSubmit={async (data) => {
            setError(null)
            const result = await login(data)
            if (result.success) {
              router.replace("/")
              return true
            }
            setError(result.errorMessage)
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
          <RncCheckbox id="rememberMe" label="Remember me" />
          <RncSubmitButton className="w-full" label="Sign in" />
        </RncForm>

        {/* Divider */}
        <View className="flex-row items-center gap-3">
          <Separator className="flex-1" />
          <Text className="text-muted-foreground text-xs uppercase">or</Text>
          <Separator className="flex-1" />
        </View>

        {/* Twitch OAuth */}
        <Button
          aria-label="Continue with Twitch"
          className="w-full bg-[#9146FF] hover:bg-[#772ce8]"
          disabled={twitchLoading}
          onPress={() => void handleTwitchLogin()}
        >
          {twitchLoading ? (
            <Spinner />
          ) : (
            <Icon as={Twitch} className="text-white" size={18} />
          )}
          <Text className="font-medium text-sm text-white">
            Continue with Twitch
          </Text>
        </Button>
      </View>
    </View>
  )
}
