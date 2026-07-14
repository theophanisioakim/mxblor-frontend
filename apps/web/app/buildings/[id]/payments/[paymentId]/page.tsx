import { TPaymentFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string; paymentId: string }> }>) {
  const { id, paymentId } = await params

  return <TPaymentFormScreen buildingId={id} paymentId={paymentId} />
}
