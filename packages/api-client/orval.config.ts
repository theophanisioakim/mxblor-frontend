import { defineConfig } from "orval"

export default defineConfig({
  apiClient: {
    input: {
      target: "./openapi.json",
    },
    output: {
      clean: true,
      workspace: "./src/generated",
      target: "./",
      client: "react-query",
      mode: "tags-split",
      httpClient: "axios",

      override: {
        mutator: {
          path: "../axios-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
          useSuspenseQuery: true,
          signal: true,
        },
      },
    },

    // Format the generated output with Biome. `--vcs-enabled=false` is required
    // because `src/generated` is gitignored (packages/api-client/.gitignore) and
    // Biome's `vcs.useIgnoreFile` would otherwise skip every file, making
    // `biome check` exit 1 ("no files processed"). This replaces the `biome: true`
    // output option, which runs Biome without that flag and so fails.
    hooks: {
      afterAllFilesWrite:
        "biome check --write --vcs-enabled=false ./src/generated",
    },
  },
})
