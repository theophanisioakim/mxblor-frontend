import { defineConfig } from "orval"

export default defineConfig({
  apiClient: {
    input: {
      target: "./openapi.json",
    },
    output: {
      clean: true,
      prettier: true,
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
  },
})
