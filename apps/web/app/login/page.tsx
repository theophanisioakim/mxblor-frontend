import { getTwitchAuthenticationRedirectUrl } from "@workspace/api-client"
import { LoginScreen } from "@workspace/app"
import { createTwitchOAuthProof } from "@workspace/providers/twitch-oauth-proof"
import { Suspense } from "react"

export default async function Page() {
  // Resolve the client-bound Twitch authorize flow during SSR so backend-driven
  // availability is reflected on first paint. The verifier is delivered only
  // to this browser response and is persisted to sessionStorage on hydration.
  let initialTwitchUrl: string | null | undefined
  let initialTwitchState: string | null | undefined
  let initialTwitchCodeVerifier: string | null | undefined
  try {
    const proof = await createTwitchOAuthProof()
    const { redirectUrl, state } = await getTwitchAuthenticationRedirectUrl({
      codeChallenge: proof.codeChallenge,
    })
    initialTwitchUrl = redirectUrl ?? null
    initialTwitchState = state ?? null
    initialTwitchCodeVerifier = redirectUrl && state ? proof.codeVerifier : null
  } catch {
    // SSR fetch failed (e.g. API unreachable) — the client resolves it instead.
  }

  return (
    <Suspense>
      <LoginScreen
        initialTwitchCodeVerifier={initialTwitchCodeVerifier}
        initialTwitchState={initialTwitchState}
        initialTwitchUrl={initialTwitchUrl}
      />
    </Suspense>
  )
}
