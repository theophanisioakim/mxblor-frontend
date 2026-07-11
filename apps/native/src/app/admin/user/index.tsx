import { UserListScreen } from "@workspace/app"

/**
 * Native `/admin/user` route. Renders the same `UserListScreen` from
 * `@workspace/app` that the web app serves at `/admin/user`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function User() {
  return <UserListScreen />
}
