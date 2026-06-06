import { config as reactConfig } from "@workspace/eslint-config/react-internal"

/**
 * `@workspace/web-ui` self-imports via its own package alias (e.g.
 * `@workspace/web-ui/lib/utils`), so relax the base ban for `web-ui` here — but
 * keep `@workspace/native-ui` banned (the two vendored libraries must not import
 * each other; see AGENTS.md §2).
 *
 * @type {import("eslint").Linter.Config}
 */
export default [
  ...reactConfig,
  {
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@workspace/native-ui", "@workspace/native-ui/*"],
              message:
                "web-ui must not import native-ui — both are private to @workspace/ui (AGENTS.md §2).",
            },
          ],
        },
      ],
    },
  },
]
