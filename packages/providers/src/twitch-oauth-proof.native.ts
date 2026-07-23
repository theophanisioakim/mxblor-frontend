import * as Crypto from "expo-crypto"

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    ""
  )
}

function base64ToBase64Url(value: string): string {
  return value.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

export async function createTwitchOAuthProof(): Promise<{
  codeChallenge: string
  codeVerifier: string
}> {
  const randomBytes = await Crypto.getRandomBytesAsync(32)
  const codeVerifier = bytesToHex(randomBytes)
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  )

  return {
    codeChallenge: base64ToBase64Url(digest),
    codeVerifier,
  }
}
