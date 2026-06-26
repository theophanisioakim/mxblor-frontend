export const RNC_GRID_DRAFT_ID_PREFIX = "__draft__:"

function randomDraftSuffix(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createRncGridDraftId(): string {
  return `${RNC_GRID_DRAFT_ID_PREFIX}${randomDraftSuffix()}`
}

export function isRncGridDraftRow(row: { id?: string | number }): boolean {
  return (
    typeof row.id === "string" && row.id.startsWith(RNC_GRID_DRAFT_ID_PREFIX)
  )
}
