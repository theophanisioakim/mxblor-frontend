// Emits src/generated/api-permissions.ts from openapi.json: every backend
// route as a "<METHOD> <endpoint template>" permission key, plus the derived
// CRUD base-path type. Runs after Orval in the package's `generate` script
// (Orval's clean:true wipes src/generated first).
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const spec = JSON.parse(readFileSync(join(packageRoot, "openapi.json"), "utf8"))

const HTTP_METHODS = new Set([
  "delete",
  "get",
  "head",
  "options",
  "patch",
  "post",
  "put",
  "trace",
])

const keys = []
for (const [path, operations] of Object.entries(spec.paths)) {
  for (const method of Object.keys(operations)) {
    if (HTTP_METHODS.has(method)) {
      keys.push(`${method.toUpperCase()} ${path}`)
    }
  }
}
keys.sort()

const content = `// Generated from openapi.json by scripts/generate-api-permissions.mjs.
// Do not edit — \`pnpm generate\` rewrites this file.

export const API_PERMISSIONS = [
${keys.map((key) => `  "${key}",`).join("\n")}
] as const

/**
 * One backend route as its permission key: \`"<METHOD> <endpoint template>"\` —
 * exactly the (endpoint, method) pair the backend's sbf_permission table and
 * RouteAuthorizationManager are keyed on, and the shape returned by
 * GET /sbf-permission/my-permissions.
 */
export type ApiPermissionKey = (typeof API_PERMISSIONS)[number]

/**
 * Base paths whose full generated CRUD route family exists:
 * \`POST <base>\`, \`PUT <base>/{id}\` and \`DELETE <base>/{id}\`.
 */
export type CrudBasePath = {
  [K in ApiPermissionKey]: K extends \`POST \${infer P}\`
    ? \`PUT \${P}/{id}\` extends ApiPermissionKey
      ? \`DELETE \${P}/{id}\` extends ApiPermissionKey
        ? P
        : never
      : never
    : never
}[ApiPermissionKey]
`

writeFileSync(join(packageRoot, "src/generated/api-permissions.ts"), content)
console.log(`api-permissions: ${keys.length} routes`)
