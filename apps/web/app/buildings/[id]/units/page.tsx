import { BuildingUnitListScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  return <BuildingUnitListScreen buildingId={id} />
}
