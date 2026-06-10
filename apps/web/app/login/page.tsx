import { getTwitchAuthenticationRedirectUrl } from "@workspace/api-client"
import { LoginScreen } from "@workspace/app"
import { Suspense } from "react"

export default async function Page() {
  // Server-side resolve the Twitch authorize URL so the OAuth button paints on
  // first load instead of waiting for the client effect. The endpoint is
  // anonymous (the visitor is logging in), so no auth headers are needed. On
  // any failure we leave `initialTwitchUrl` undefined and LoginScreen falls
  // back to client-side fetching.
  let initialTwitchUrl: string | null | undefined
  try {
    const { redirectUrl } = await getTwitchAuthenticationRedirectUrl()
    initialTwitchUrl = redirectUrl ?? null
  } catch {
    // SSR fetch failed (e.g. API unreachable) — the client resolves it instead.
  }

  return (
    <Suspense>
      <LoginScreen initialTwitchUrl={initialTwitchUrl} />
    </Suspense>
  )
}
