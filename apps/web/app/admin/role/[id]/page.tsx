import { getSbfRoleById, type SbfRoleResponseDto } from "@workspace/api-client"
import { RoleFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  // Best-effort SSR prefetch so the edit form paints with data on first load.
  // The endpoint requires auth, so on the server (no session) this typically
  // fails — RoleFormScreen then fetches client-side via loadFormValues.
  let initialData: SbfRoleResponseDto | undefined
  if (id !== "new") {
    try {
      initialData = await getSbfRoleById(id)
    } catch {
      // SSR fetch failed — fall back to client-side fetching in RoleFormScreen.
    }
  }

  return <RoleFormScreen id={id} initialData={initialData} />
}
