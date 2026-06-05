/** @type {import("eslint").Linter.Config} */
import { config as reactInternalConfig } from "@workspace/eslint-config/react-internal"

export default [
  ...reactInternalConfig,
  {
    // Orval output is generated; don't lint it.
    ignores: ["src/generated/**"],
  },
]
