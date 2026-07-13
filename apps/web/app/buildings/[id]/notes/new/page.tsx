import { BuildingNoteFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  return (
    <div className="flex min-h-svh flex-col">
      <BuildingNoteFormScreen buildingId={id} noteId="new" />
    </div>
  )
}
