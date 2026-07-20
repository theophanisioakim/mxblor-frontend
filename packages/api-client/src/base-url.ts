const DEFAULT_API_PORT = "21001"

function defaultWebApiUrl(): string {
  if (typeof window === "undefined") {
    return `http://localhost:${DEFAULT_API_PORT}`
  }

  const apiUrl = new URL(window.location.origin)
  apiUrl.port = DEFAULT_API_PORT
  return apiUrl.origin
}

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? defaultWebApiUrl()
