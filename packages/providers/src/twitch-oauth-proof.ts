function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    ""
  )
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (value) => String.fromCharCode(value)).join(
    ""
  )
  return globalThis
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

export async function createTwitchOAuthProof(): Promise<{
  codeChallenge: string
  codeVerifier: string
}> {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.getRandomValues || !cryptoApi.subtle) {
    throw new Error("Secure cryptography is unavailable")
  }

  const randomBytes = cryptoApi.getRandomValues(new Uint8Array(32))
  const codeVerifier = bytesToHex(randomBytes)
  const digest = await cryptoApi.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  )

  return {
    codeChallenge: bytesToBase64Url(new Uint8Array(digest)),
    codeVerifier,
  }
}
