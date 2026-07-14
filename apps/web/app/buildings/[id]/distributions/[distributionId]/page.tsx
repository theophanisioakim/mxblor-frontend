import { BuildingDistributionFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string; distributionId: string }> }>) {
  const { id, distributionId } = await params

  return (
    <div className="flex min-h-svh flex-col">
      <BuildingDistributionFormScreen
        buildingId={id}
        distributionId={distributionId}
      />
    </div>
  )
}
