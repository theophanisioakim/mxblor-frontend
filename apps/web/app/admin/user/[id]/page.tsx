import { getSbfUserById, type SbfUserResponseDto } from "@workspace/api-client"
import { UserFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  // Best-effort SSR prefetch so the edit form paints with data on first load.
  // The endpoint requires auth, so on the server (no session) this typically
  // fails — UserFormScreen then fetches client-side via loadFormValues.
  let initialData: SbfUserResponseDto | undefined
  if (id !== "new") {
    try {
      initialData = await getSbfUserById(id)
    } catch {
      // SSR fetch failed — fall back to client-side fetching in UserFormScreen.
    }
  }

  return <UserFormScreen id={id} initialData={initialData} />
}
