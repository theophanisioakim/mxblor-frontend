import {
  getSbfIntegrationById,
  type SbfIntegrationResponseDto,
} from "@workspace/api-client"
import { IntegrationFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  let initialData: SbfIntegrationResponseDto | undefined
  if (id !== "new") {
    try {
      initialData = await getSbfIntegrationById(id)
    } catch {
      // SSR fetch failed — IntegrationFormScreen fetches client-side instead.
    }
  }

  return <IntegrationFormScreen id={id} initialData={initialData} />
}
