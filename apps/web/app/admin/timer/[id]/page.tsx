import {
  getSbfTimerById,
  type SbfTimerResponseDto,
} from "@workspace/api-client"
import { TimerFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  let initialData: SbfTimerResponseDto | undefined
  if (id !== "new") {
    try {
      initialData = await getSbfTimerById(id)
    } catch {
      // SSR fetch failed — TimerFormScreen fetches client-side instead.
    }
  }

  return <TimerFormScreen id={id} initialData={initialData} />
}
