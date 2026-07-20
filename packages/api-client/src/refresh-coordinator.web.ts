import { StorageKeys } from "@workspace/storage"

const LOCK_NAME = "sbf-auth-refresh"
const LEASE_KEY = StorageKeys.AUTH_REFRESH_LEASE
const LEASE_TTL_MS = 35_000
const POLL_INTERVAL_MS = 100

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

  inFlight = coordinateAcrossTabs(task).finally(() => {
    inFlight = null
  })
  return inFlight
}

async function coordinateAcrossTabs(task: RefreshTask): Promise<void> {
  const locks = globalThis.navigator?.locks
  if (locks) {
    await locks.request(LOCK_NAME, async () => {
      if (!hasNewAccessToken(task)) {
        await task.refresh()
      }
    })
    return
  }

  const storage = getLocalStorage()
  if (!storage) {
    await task.refresh()
    return
  }

  const owner = createOwnerId()
  while (!hasNewAccessToken(task)) {
    if (tryAcquireLease(storage, owner)) {
      try {
        if (!hasNewAccessToken(task)) {
          await task.refresh()
        }
      } finally {
        releaseLease(storage, owner)
      }
      return
    }
    await wait(POLL_INTERVAL_MS)
  }
}

function hasNewAccessToken(task: RefreshTask): boolean {
  const token = task.readAccessToken()
  return Boolean(token && token !== task.previousAccessToken)
}

function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function tryAcquireLease(storage: Storage, owner: string): boolean {
  try {
    const now = Date.now()
    const current = readLease(storage)
    if (current && current.expiresAt > now && current.owner !== owner) {
      return false
    }

    const lease = { owner, expiresAt: now + LEASE_TTL_MS }
    storage.setItem(LEASE_KEY, JSON.stringify(lease))
    return readLease(storage)?.owner === owner
  } catch {
    // Storage may be disabled. Fall back to the per-tab single-flight promise.
    return true
  }
}

function releaseLease(storage: Storage, owner: string): void {
  try {
    if (readLease(storage)?.owner === owner) {
      storage.removeItem(LEASE_KEY)
    }
  } catch {
    // Nothing to release when storage is unavailable.
  }
}

function readLease(
  storage: Storage
): { owner: string; expiresAt: number } | null {
  try {
    const value = storage.getItem(LEASE_KEY)
    if (!value) return null
    const parsed = JSON.parse(value) as { owner?: unknown; expiresAt?: unknown }
    if (
      typeof parsed.owner !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null
    }
    return { owner: parsed.owner, expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

function createOwnerId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
