import { GridShowcaseScreen } from "@workspace/app"

/**
 * Native `/grid` route. Renders the same `GridShowcaseScreen` from
 * `@workspace/app` that the web app serves at `/grid`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function Grid() {
  return <GridShowcaseScreen />
}
