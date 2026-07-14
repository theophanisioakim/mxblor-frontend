import { TBankAccountFormScreen } from "@workspace/app"

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params

  return (
    <div className="flex min-h-svh flex-col">
      <TBankAccountFormScreen buildingId={id} accountId="new" />
    </div>
  )
}
