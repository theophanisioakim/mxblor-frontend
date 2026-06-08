import { LoginScreen } from "@workspace/app"
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  )
}
