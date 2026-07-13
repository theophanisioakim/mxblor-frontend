import { BuildingUnitFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string; unitId: string }> }>) {
  const { id, unitId } = await params

  return (
    <div className="flex min-h-svh flex-col">
      <BuildingUnitFormScreen buildingId={id} unitId={unitId} />
    </div>
  )
}
