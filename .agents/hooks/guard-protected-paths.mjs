#!/usr/bin/env node
// PreToolUse guard for Edit/Write/MultiEdit/NotebookEdit — cross-platform (Windows + Linux/macOS),
// shared by Claude Code (.claude/settings.json) and Codex (.codex/hooks.json).
//
// Protects paths in the react-mono-core repo (root AGENTS.md §4–§5):
//   * build output / deps (node_modules, .next, .turbo, .expo, dist, build, android, ios) → DENY
//   * packages/api-client/src/generated/** — Orval-owned, wiped by `pnpm generate`        → DENY
//   * packages/{web-ui,native-ui}/src/components/** — vendored, overwritten by
//     `pnpm shadcn-update` / `pnpm rnr-update`                                            → ASK
//
// Speaks the documented PreToolUse `hookSpecificOutput.permissionDecision` JSON contract on
// stdout; anything else is allowed. Fails open: a guard bug must never block a legitimate edit.

function emit(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    })
  )
}

try {
  let raw = ""
  process.stdin.setEncoding("utf8")
  for await (const chunk of process.stdin) raw += chunk

  const toolInput = raw.trim() ? (JSON.parse(raw).tool_input ?? {}) : {}
  const path = toolInput.file_path ?? toolInput.notebook_path ?? ""
  const p = String(path).replaceAll("\\", "/")

  if (p === "") {
    // No target path — nothing to guard.
  } else if (
    /(^|\/)(node_modules|\.next|\.turbo|\.expo|dist|build)\//.test(p) ||
    /(^|\/)apps\/native\/(android|ios)\//.test(p)
  ) {
    emit(
      "deny",
      "Refusing to edit generated build output / dependencies. Edit the source and rebuild (pnpm build / pnpm --filter native prebuild)."
    )
  } else if (/\/api-client\/src\/generated\//.test(p)) {
    emit(
      "deny",
      "This is Orval-GENERATED code. `pnpm generate` wipes packages/api-client/src/generated (clean:true), so edits are lost (AGENTS.md §5). Change openapi.json / orval.config.ts and re-run `pnpm generate` instead."
    )
  } else if (/\/(web-ui|native-ui)\/src\/components\//.test(p)) {
    emit(
      "ask",
      "This is a VENDORED UI component (shadcn / react-native-reusables). `pnpm shadcn-update` / `pnpm rnr-update` overwrite all of these (--all --overwrite), so manual edits WILL be lost (AGENTS.md §4). Customize in the @workspace/ui wrapper instead. Confirm only if a change must truly live in the vendored file."
    )
  }
  process.exit(0)
} catch (err) {
  process.stderr.write(
    `guard-protected-paths.mjs error (allowing edit): ${err instanceof Error ? err.message : String(err)}\n`
  )
  process.exit(0)
}
