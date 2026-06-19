import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import type { TwitchAuthResult } from "./twitch-auth"

export type { TwitchAuthResult } from "./twitch-auth"

// Finalizes any pending auth session when the app regains focus (Expo
// requirement; harmless for the custom-scheme redirect used below).
WebBrowser.maybeCompleteAuthSession()

/**
 * Starts the Twitch OAuth flow — native variant.
 *
 * Opens Twitch's authorize URL in a system auth session (SFAuthenticationSession
 * on iOS / Chrome Custom Tabs on Android). The deep link to return to is read
 * from the authorize URL the backend returns, so the target stays a backend
 * concern (no hardcoding). Twitch only accepts an `https` `redirect_uri`, so the
 * backend points Twitch at an https endpoint that bounces (302) to the app's
 * custom scheme, and advertises that scheme here as `app_redirect`. iOS's auth
 * session only auto-closes on a custom scheme, so that — not the https
 * `redirect_uri` — is what we watch for. `redirect_uri` is used as a fallback in
 * case it is ever itself a custom scheme. When the bounce lands on the deep
 * link, the session returns that URL; we parse `code`/`state` and hand them back
 * to be exchanged. There is no `/`-route round trip on native.
 */
export async function startTwitchAuth(
  authUrl: string
): Promise<TwitchAuthResult> {
  const params = Linking.parse(authUrl).queryParams
  const appRedirect = params?.app_redirect
  const redirectUri = params?.redirect_uri
  const returnUri =
    typeof appRedirect === "string"
      ? appRedirect
      : typeof redirectUri === "string"
        ? redirectUri
        : null
  if (!returnUri) {
    return { type: "cancelled" }
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUri)
  if (result.type !== "success") {
    return { type: "cancelled" }
  }

  const { queryParams } = Linking.parse(result.url)
  const code = queryParams?.code
  const state = queryParams?.state

  if (typeof code !== "string" || typeof state !== "string") {
    return { type: "cancelled" }
  }

  return { type: "callback", code, state }
}
