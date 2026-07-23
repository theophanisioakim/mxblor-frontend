import { readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

/**
 * Audit: every shared screen that can mutate backend data must enforce the
 * backend-driven API restrictions (root AGENTS.md §2 "API permissions are
 * backend-driven", .claude/rules/api-permissions.md). A screen that calls a
 * generated mutation hook without wiring the permission gates would silently
 * offer controls the backend rejects.
 */
const SCREENS_DIR = join(
  __dirname,
  "..",
  "..",
  "..",
  "packages",
  "app",
  "src",
  "screens"
)

/** Orval-generated TanStack mutation hooks (useCreateX/useUpdateX/...). */
const MUTATION_HOOK = /\buse(?:Create|Update|Delete|Bulk)[A-Z]\w*\s*\(/

/** A permission gate read from the shared providers. */
const PERMISSION_GATE = /\b(?:useCrudPermissions|usePermission)\s*\(/

/**
 * A permission key passed as an inline string instead of read from the
 * central `screen-permissions.ts` config — as a hook argument or as the
 * `permission` prop of `PermissionGuard`.
 */
const INLINE_PERMISSION_KEY =
  /\b(?:useCrudPermissions|hasPermission)\(\s*["'`]|\bpermission=(?:["']|\{\s*["'`])/

function collectScreenFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return collectScreenFiles(path)
    }
    return entry.name.endsWith(".tsx") ? [path] : []
  })
}

describe("api permission gating audit", () => {
  const screenFiles = collectScreenFiles(SCREENS_DIR)

  it("finds the shared screens", () => {
    expect(screenFiles.length).toBeGreaterThan(0)
  })

  it("every screen calling a mutation hook enforces the permission gates", () => {
    const ungated = screenFiles.filter((file) => {
      const source = readFileSync(file, "utf8")
      return MUTATION_HOOK.test(source) && !PERMISSION_GATE.test(source)
    })

    expect(ungated.map((file) => relative(SCREENS_DIR, file))).toEqual([])
  })

  it("every admin page screen guards the whole page with PermissionGuard", () => {
    const unguarded = screenFiles.filter((file) => {
      const rel = relative(SCREENS_DIR, file)
      const isAdminPageScreen =
        rel.startsWith(`admin${sep}`) && rel.endsWith("-screen.tsx")
      if (!isAdminPageScreen) {
        return false
      }
      return !readFileSync(file, "utf8").includes("<PermissionGuard")
    })

    expect(unguarded.map((file) => relative(SCREENS_DIR, file))).toEqual([])
  })

  it("permission keys come from the central screen-permissions config, never inline strings", () => {
    const offenders = screenFiles.filter((file) =>
      INLINE_PERMISSION_KEY.test(readFileSync(file, "utf8"))
    )

    expect(offenders.map((file) => relative(SCREENS_DIR, file))).toEqual([])
  })
})
