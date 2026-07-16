/**
 * Binary requests use `arraybuffer` so the same response shape works in browsers
 * and React Native. Axios applies that response type to failures too, so restore
 * JSON error bodies before the shared error handlers inspect them.
 */
export function decodeBinaryResponseData(
  data: unknown,
  contentType: unknown
): unknown {
  if (
    !(data instanceof ArrayBuffer) ||
    typeof contentType !== "string" ||
    !contentType.toLowerCase().includes("json")
  ) {
    return data
  }

  try {
    return JSON.parse(new TextDecoder().decode(data))
  } catch {
    return data
  }
}
