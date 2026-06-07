module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)"],
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo/.*|react-navigation|@react-navigation/.*|@rn-primitives/.*|nativewind|react-native-css-interop|react-native-reanimated|react-native-safe-area-context|react-native-svg|lucide-react-native))",
  ],
  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/__mocks__/style-mock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@workspace/app$": "<rootDir>/../../packages/app/src/index.ts",
    "^@workspace/app/(.*)$": "<rootDir>/../../packages/app/src/$1",
    "^@workspace/api-client$":
      "<rootDir>/../../packages/api-client/src/index.ts",
    "^@workspace/api-client/(.*)$":
      "<rootDir>/../../packages/api-client/src/$1",
    "^@workspace/i18n$": "<rootDir>/../../packages/i18n/src/index.ts",
    "^@workspace/i18n/(.*)$": "<rootDir>/../../packages/i18n/src/$1",
    "^@workspace/providers$": "<rootDir>/../../packages/providers/src/index.ts",
    "^@workspace/providers/(.*)$": "<rootDir>/../../packages/providers/src/$1",
    "^@workspace/router$": "<rootDir>/../../packages/router/src/index.ts",
    "^@workspace/router/(.*)$": "<rootDir>/../../packages/router/src/$1",
    "^@workspace/storage$": "<rootDir>/../../packages/storage/src/index.ts",
    "^@workspace/storage/(.*)$": "<rootDir>/../../packages/storage/src/$1",
    "^@workspace/ui$": "<rootDir>/../../packages/ui/src/index.ts",
    "^@workspace/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
    "^@workspace/native-ui/(.*)$": "<rootDir>/../../packages/native-ui/src/$1",
  },
}
