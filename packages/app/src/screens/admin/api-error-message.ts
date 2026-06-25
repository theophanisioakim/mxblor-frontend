type ApiErrorLike = {
  message?: unknown
  response?: {
    data?: {
      message?: unknown
    }
  }
}

/**
 * Extracts a human-readable message from an unknown API error, preferring the
 * backend's `response.data.message`, then the error's own `message`, falling
 * back to the provided default. Shared by the admin form screens.
 */
export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as ApiErrorLike
  const responseMessage = apiError.response?.data?.message
  if (typeof responseMessage === "string" && responseMessage) {
    return responseMessage
  }
  if (typeof apiError.message === "string" && apiError.message) {
    return apiError.message
  }
  return fallback
}
