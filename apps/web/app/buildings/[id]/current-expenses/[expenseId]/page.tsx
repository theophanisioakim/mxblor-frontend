import { TExpenseFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string; expenseId: string }> }>) {
  const { id, expenseId } = await params

  return <TExpenseFormScreen buildingId={id} expenseId={expenseId} />
}
