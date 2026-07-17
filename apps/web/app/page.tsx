import { LandingScreen } from "@workspace/app"
import { Suspense } from "react"
import { TwitchCallback } from "@/components/twitch-callback"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingScreen />
      {/* Finalizes a Twitch sign-in that redirects back here with ?code&state. */}
      <Suspense>
        <TwitchCallback />
      </Suspense>
    </div>
  )
}
