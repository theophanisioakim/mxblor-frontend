import { afterEach, describe, expect, it, jest } from "@jest/globals"
import { createPdfObjectUrl } from "../../../packages/ui/src/components/pdf-result/pdf-result-url"

describe("web PDF object URL lifecycle", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("revokes the exact preview URL during cleanup", () => {
    const create = jest
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:report-preview")
    const revoke = jest
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation((_url) => undefined)

    const objectUrl = createPdfObjectUrl(new ArrayBuffer(4))
    objectUrl.revoke()

    expect(create).toHaveBeenCalledTimes(1)
    expect(revoke).toHaveBeenCalledWith("blob:report-preview")
  })
})
