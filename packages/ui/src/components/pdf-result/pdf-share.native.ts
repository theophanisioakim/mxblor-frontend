import { File, Paths } from "expo-file-system"
import * as Sharing from "expo-sharing"

export interface NativePdfShareDependencies {
  isAvailable: () => Promise<boolean>
  writeFile: (filename: string, data: ArrayBuffer) => string
  share: (uri: string) => Promise<void>
}

const nativeDependencies: NativePdfShareDependencies = {
  isAvailable: () => Sharing.isAvailableAsync(),
  writeFile: (filename, data) => {
    const file = new File(Paths.cache, filename)
    file.create({ intermediates: true, overwrite: true })
    file.write(new Uint8Array(data))
    return file.uri
  },
  share: (uri) =>
    Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    }),
}

export async function writeAndSharePdf(
  data: ArrayBuffer,
  filename: string,
  unavailableMessage: string,
  dependencies: NativePdfShareDependencies = nativeDependencies
): Promise<void> {
  if (!(await dependencies.isAvailable())) {
    throw new Error(unavailableMessage)
  }
  const uri = dependencies.writeFile(filename, data)
  await dependencies.share(uri)
}
