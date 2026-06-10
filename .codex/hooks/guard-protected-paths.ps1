# PreToolUse guard for Edit/Write/MultiEdit/NotebookEdit.
#
# Protects paths in the react-mono-core repo (see AGENTS.md sec 4-5):
#   * build output / deps (node_modules, .next, .turbo, dist, build, .expo, android, ios)
#                                          -> never hand-edit.                          DENY.
#   * packages/api-client/src/generated/** -> Orval-owned, wiped by `pnpm generate`.    DENY.
#   * packages/web-ui/src/components/**     -> vendored shadcn, overwritten by
#     packages/native-ui/src/components/**     `pnpm shadcn-update` / `pnpm rnr-update`. ASK.
#
# Communicates back to Claude Code via a JSON object on stdout using the documented
# PreToolUse `hookSpecificOutput.permissionDecision` contract. Anything else is allowed.

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

    $payload = $raw | ConvertFrom-Json
    $toolInput = $payload.tool_input

    # Resolve the target path across the edit tools (Edit/Write/NotebookEdit use file_path).
    $path = $null
    if ($null -ne $toolInput) {
        if ($toolInput.PSObject.Properties.Name -contains 'file_path') { $path = $toolInput.file_path }
        elseif ($toolInput.PSObject.Properties.Name -contains 'notebook_path') { $path = $toolInput.notebook_path }
    }
    if ([string]::IsNullOrWhiteSpace($path)) { exit 0 }

    $normalized = $path -replace '\\', '/'

    function Emit($decision, $reason) {
        $out = @{
            hookSpecificOutput = @{
                hookEventName            = 'PreToolUse'
                permissionDecision       = $decision
                permissionDecisionReason = $reason
            }
        }
        $out | ConvertTo-Json -Depth 5 -Compress
    }

    # Build output / dependencies / native build dirs — never hand-edit.
    if ($normalized -match '(^|/)(node_modules|\.next|\.turbo|\.expo|dist|build)/' `
            -or $normalized -match '(^|/)apps/native/(android|ios)/') {
        Emit 'deny' "Refusing to edit generated build output / dependencies. Edit the source and rebuild (pnpm build / pnpm --filter native prebuild)."
        exit 0
    }

    # Orval-generated API client: wiped (clean:true) on every `pnpm generate`.
    if ($normalized -match '/api-client/src/generated/') {
        Emit 'deny' "This is Orval-GENERATED code. `pnpm generate` wipes packages/api-client/src/generated (clean:true), so edits are lost (AGENTS.md sec 5). Change openapi.json / orval.config.ts and re-run `pnpm generate` instead."
        exit 0
    }

    # Vendored UI component libraries: overwritten wholesale by the update CLIs.
    if ($normalized -match '/web-ui/src/components/' -or $normalized -match '/native-ui/src/components/') {
        Emit 'ask' "This is a VENDORED UI component (shadcn / react-native-reusables). `pnpm shadcn-update` / `pnpm rnr-update` overwrite all of these (--all --overwrite), so manual edits WILL be lost (AGENTS.md sec 4). Customize in the @workspace/ui wrapper instead. Confirm only if a change must truly live in the vendored file."
        exit 0
    }

    exit 0
}
catch {
    # Fail open: never block a legitimate edit because the guard itself errored.
    [Console]::Error.WriteLine("guard-protected-paths.ps1 error (allowing edit): $($_.Exception.Message)")
    exit 0
}