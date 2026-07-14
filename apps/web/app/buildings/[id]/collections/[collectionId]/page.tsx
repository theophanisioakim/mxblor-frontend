import { TCollectionFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string; collectionId: string }> }>) {
  const { id, collectionId } = await params

  return <TCollectionFormScreen buildingId={id} collectionId={collectionId} />
}
