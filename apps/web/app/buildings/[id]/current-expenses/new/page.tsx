import { TExpenseFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  return <TExpenseFormScreen buildingId={id} expenseId="new" />
}
