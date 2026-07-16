export function createPdfObjectUrl(data: ArrayBuffer): {
  url: string
  revoke: () => void
} {
  const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }))
  return { url, revoke: () => URL.revokeObjectURL(url) }
}
