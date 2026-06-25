import {
  getSbfLogRequestById,
  type SbfLogRequestResponseDto,
} from "@workspace/api-client"
import { RequestLogDetailScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  let initialData: SbfLogRequestResponseDto | undefined
  try {
    initialData = await getSbfLogRequestById(id)
  } catch {
    // SSR fetch failed — RequestLogDetailScreen fetches client-side instead.
  }

  return <RequestLogDetailScreen id={id} initialData={initialData} />
}
