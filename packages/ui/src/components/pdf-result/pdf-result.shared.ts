export interface PdfResultProps {
  data: ArrayBuffer
  filename: string
  title: string
  downloadLabel: string
  openLabel: string
  previewTitle: string
  shareUnavailableMessage: string
  onError?: (message: string) => void
}
