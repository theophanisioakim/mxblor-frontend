import { describe, expect, it, jest } from "@jest/globals"
import { writeAndSharePdf } from "../../../packages/ui/src/components/pdf-result/pdf-share.native"

describe("native PDF sharing", () => {
  it("propagates an OS sharing failure after writing the cache file", async () => {
    const writeFile = jest.fn(() => "file:///cache/report.pdf")
    const share = jest.fn<(uri: string) => Promise<void>>()
    share.mockRejectedValue(new Error("native share failed"))

    await expect(
      writeAndSharePdf(new ArrayBuffer(4), "report.pdf", "unavailable", {
        isAvailable: async () => true,
        writeFile,
        share,
      })
    ).rejects.toThrow("native share failed")

    expect(writeFile).toHaveBeenCalledWith(
      "report.pdf",
      expect.any(ArrayBuffer)
    )
    expect(share).toHaveBeenCalledWith("file:///cache/report.pdf")
  })

  it("does not write when the operating-system share flow is unavailable", async () => {
    const writeFile = jest.fn(() => "unused")

    await expect(
      writeAndSharePdf(new ArrayBuffer(4), "report.pdf", "unavailable", {
        isAvailable: async () => false,
        writeFile,
        share: async () => undefined,
      })
    ).rejects.toThrow("unavailable")

    expect(writeFile).not.toHaveBeenCalled()
  })
})
