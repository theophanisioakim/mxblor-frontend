/**
 * Outcome of starting the Twitch OAuth flow. Web full-page redirects (the
 * callback is finished by the `/` route), so it only ever reports `redirecting`.
 * Native opens an in-app auth session that returns the `code`/`state` inline, so
 * it reports `callback` (or `cancelled` if the user dismisses the browser).
 */
export type TwitchAuthResult =
  | { type: "redirecting" }
  | { type: "callback"; code: string; state: string }
  | { type: "cancelled" }

/**
 * Starts the Twitch OAuth flow — web variant.
 *
 * Full-page redirects the browser to Twitch's authorize URL. Twitch then
 * redirects back to the `/` route with `?code&state`, where `TwitchCallback`
 * performs the exchange — so this never returns a `callback`, only `redirecting`.
 */
export function startTwitchAuth(authUrl: string): Promise<TwitchAuthResult> {
  const loc = (globalThis as { location?: { assign?: (u: string) => void } })
    .location
  loc?.assign?.(authUrl)
  return Promise.resolve({ type: "redirecting" })
}
