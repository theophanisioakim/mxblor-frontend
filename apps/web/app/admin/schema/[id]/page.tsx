import {
  getSbfSchemaById,
  type SbfSchemaResponseDto,
} from "@workspace/api-client"
import { SchemaFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  let initialData: SbfSchemaResponseDto | undefined
  if (id !== "new") {
    try {
      initialData = await getSbfSchemaById(id)
    } catch {
      // SSR fetch failed — SchemaFormScreen fetches client-side instead.
    }
  }

  return <SchemaFormScreen id={id} initialData={initialData} />
}
