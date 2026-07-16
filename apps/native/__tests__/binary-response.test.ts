import { describe, expect, it } from "@jest/globals"
import { decodeBinaryResponseData } from "../../../packages/api-client/src/binary-response"

describe("binary API error decoding", () => {
  it("restores JSON errors returned by arraybuffer requests", () => {
    const payload = new TextEncoder().encode(
      JSON.stringify({ errorCode: "OTP_REQUIRED", message: "Enter the OTP" })
    ).buffer

    expect(
      decodeBinaryResponseData(
        payload,
        "application/problem+json;charset=UTF-8"
      )
    ).toEqual({ errorCode: "OTP_REQUIRED", message: "Enter the OTP" })
  })

  it("preserves non-JSON binary responses and malformed JSON", () => {
    const binary = new TextEncoder().encode("binary-content").buffer
    const malformed = new TextEncoder().encode("not-json").buffer

    expect(decodeBinaryResponseData(binary, "application/octet-stream")).toBe(
      binary
    )
    expect(decodeBinaryResponseData(malformed, "application/json")).toBe(
      malformed
    )
  })
})
