// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const path = require("node:path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo. Append to (not replace) Expo's default
//    watchFolders so we keep the SDK's defaults and just add the workspace root.
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot]
// 2. Also resolve packages from the app and the workspace root. Hierarchical
//    lookup stays enabled so Metro can find transitive deps in pnpm's nested
//    store; a single react / react-native version is guaranteed via the
//    workspace catalog instead, so there are no duplicates.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

module.exports = withNativeWind(config, { input: "./src/global.css" })
