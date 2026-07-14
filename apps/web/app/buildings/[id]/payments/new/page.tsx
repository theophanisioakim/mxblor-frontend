import { TPaymentFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  return <TPaymentFormScreen buildingId={id} paymentId="new" />
}
