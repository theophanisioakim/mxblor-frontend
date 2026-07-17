"use client"

import { useAuth } from "@workspace/providers"
import { useRouter, useSearchParams } from "@workspace/router"
import { Spinner, Text, View } from "@workspace/ui"
import { useEffect, useRef } from "react"

/**
 * Web-only handler for the Twitch OAuth callback. The sign-in is initiated from
 * the login screen; Twitch redirects back to `/` with `?code&state`, which this
 * component exchanges for a session via the auth provider. The token can only
 * be persisted client-side, so this runs in the browser. While the exchange is
 * in flight it shows a full-screen loading overlay; it renders nothing once
 * there is no callback to handle.
 */
export function TwitchCallback() {
  const { loginWithTwitch } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  // Exchange the single-use `code` once, even under StrictMode's double-invoke.
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current || !(code && state)) {
      return
    }
    handled.current = true

    let active = true
    loginWithTwitch(code, state).then((result) => {
      if (active) {
        // Drop `?code&state`; on failure send the user back to the login screen.
        router.replace(result.success ? "/dashboard" : "/login")
      }
    })

    return () => {
      active = false
    }
  }, [code, state, loginWithTwitch, router])

  // While the callback params are present the exchange is in progress; cover the
  // page until it resolves and `router.replace` clears them.
  if (code && state) {
    return (
      <View className="fixed inset-0 z-50 items-center justify-center gap-4 bg-background">
        <Spinner className="size-8" />
        <Text className="text-muted-foreground text-sm">
          Completing sign-in…
        </Text>
      </View>
    )
  }

  return null
}
