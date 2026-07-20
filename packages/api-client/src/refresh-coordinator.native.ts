type RefreshTask = Readonly<{
  previousAccessToken: string | null
  readAccessToken: () => string | null
  refresh: () => Promise<void>
}>

let inFlight: Promise<void> | null = null

export function coordinateRefresh(task: RefreshTask): Promise<void> {
  if (inFlight) {
    return inFlight
  }

  inFlight = (async () => {
    const token = task.readAccessToken()
    if (!token || token === task.previousAccessToken) {
      await task.refresh()
    }
  })().finally(() => {
    inFlight = null
  })
  return inFlight
}
