import { BuildingRelatedPersonFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string; subId: string }> }>) {
  const { id, subId } = await params

  return (
    <div className="flex min-h-svh flex-col">
      <BuildingRelatedPersonFormScreen buildingId={id} personId={subId} />
    </div>
  )
}
