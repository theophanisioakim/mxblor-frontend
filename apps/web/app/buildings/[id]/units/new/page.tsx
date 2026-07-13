import { BuildingUnitFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  return (
    <div className="flex min-h-svh flex-col">
      <BuildingUnitFormScreen buildingId={id} unitId="new" />
    </div>
  )
}
