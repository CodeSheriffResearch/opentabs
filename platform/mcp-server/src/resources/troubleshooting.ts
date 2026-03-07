/** Troubleshooting Guide resource content. */

export const TROUBLESHOOTING_CONTENT = `# Troubleshooting Guide

Common errors when using OpenTabs, their causes, and resolution steps.

## Quick Diagnosis

Before diving into specific errors, run these diagnostic commands:

\`\`\`bash
opentabs status      # Server, extension, and plugin state
opentabs doctor      # Comprehensive setup diagnostics
\`\`\`

From your AI client:
- Call \`extension_get_state\` — extension health and WebSocket status
- Call \`plugin_list_tabs\` — per-plugin tab readiness
- Fetch \`opentabs://status\` — full server state snapshot

## Error Reference

### Extension Not Connected

**Error:** \`Extension not connected. Please ensure the OpenTabs Chrome extension is running.\`

**Cause:** The Chrome extension WebSocket connection to the MCP server is not active.

**Resolution:**
1. Verify server is running: \`opentabs status\`
2. Check extension is loaded: open \`chrome://extensions\`, verify OpenTabs is enabled
3. Reload extension: click the refresh icon on the OpenTabs card in \`chrome://extensions\`
4. Close and reopen the side panel
5. If still failing, run \`opentabs doctor\` for full diagnostics
6. Check for stale auth secret: \`opentabs config rotate-secret --confirm\`, then reload extension

### Tab Closed

**Error:** \`Tab closed: <message>\`

**Cause:** No browser tab matches the plugin's URL patterns, or the matching tab was closed during dispatch.

**Resolution:**
1. Open the target web application in Chrome
2. Verify the URL matches the plugin's \`urlPatterns\` (\`opentabs status\` shows patterns)
3. Call \`plugin_list_tabs\` to verify the tab is detected
4. Retry the tool call

### Tab Unavailable

**Error:** \`Tab unavailable: <message>\`

**Cause:** A tab matches the plugin's URL patterns but \`isReady()\` returns false. The user is likely not logged in.

**Resolution:**
1. Log into the web application in the matching browser tab
2. Refresh the tab (Ctrl+R / Cmd+R)
3. Wait 5 seconds for the readiness probe to complete
4. Call \`plugin_list_tabs\` to check the \`ready\` field
5. Retry the tool call

### Plugin Not Reviewed

**Error:** \`Plugin "<name>" (v<version>) has not been reviewed yet.\`

**Cause:** New plugins start with permission \`'off'\` and require a security review before use.

**Resolution (AI client flow):**
1. Call \`plugin_inspect({"plugin": "<name>"})\` — retrieves adapter source code + review token
2. Review the code for security concerns (data exfiltration, credential access, suspicious network requests)
3. Share findings with the user
4. If approved, call \`plugin_mark_reviewed({"plugin": "<name>", "version": "<ver>", "reviewToken": "<token>", "permission": "auto"})\`

**Resolution (side panel):** Open the side panel, click the shield icon on the plugin card, and confirm.

### Plugin Updated — Re-Review Required

**Error:** \`Plugin "<name>" has been updated from v<old> to v<new> and needs re-review.\`

**Cause:** Plugin version changed since last review. Permission resets to \`'off'\` on version change.

**Resolution:** Same as "Plugin Not Reviewed" above — call \`plugin_inspect\` and re-review.

### Tool Disabled

**Error:** \`Tool "<name>" is currently disabled. Ask the user to enable it in the OpenTabs side panel.\`

**Cause:** The tool's permission is set to \`'off'\`.

**Resolution:**
- User enables in side panel, OR
- \`opentabs config set tool-permission.<plugin>.<tool> ask\`
- \`opentabs config set plugin-permission.<plugin> ask\`

### Permission Denied by User

**Error:** \`Tool "<name>" was denied by the user.\`

**Cause:** Tool permission is \`'ask'\` and the user clicked "Deny" in the approval dialog.

**Resolution:** Do NOT retry immediately. Ask the user if they want to approve the action. To skip future prompts: \`opentabs config set tool-permission.<plugin>.<tool> auto\`

### Too Many Concurrent Dispatches

**Error:** \`Too many concurrent dispatches for plugin "<name>" (limit: 5). Wait for in-flight requests to complete.\`

**Cause:** More than 5 simultaneous tool calls to the same plugin.

**Resolution:** Wait 100-500ms for in-flight dispatches to complete, then retry.

### Dispatch Timeout

**Error:** \`Dispatch <label> timed out after <ms>ms\`

**Cause:** Tool handler did not respond within 30 seconds (or 5 minutes with progress reporting).

**Resolution:**
1. Check if the tab is responsive (take a screenshot, check console logs)
2. Refresh the target tab if unresponsive
3. For legitimately long operations, the plugin should use \`context.reportProgress()\` to extend the timeout
4. Break long operations into multiple tool calls

**Timeout rules:**
- Default: 30s per dispatch
- Progress resets the timer: each \`reportProgress()\` call extends by 30s
- Absolute ceiling: 5 minutes regardless of progress

### Schema Validation Error

**Error:** \`Invalid arguments for tool "<name>": - <field>: <issue>\`

**Cause:** Tool arguments don't match the JSON Schema defined by the plugin.

**Resolution:** Check the tool's input schema via \`tools/list\` and ensure all required fields are provided with correct types.

### Tool Not Found

**Error:** \`Tool <name> not found\`

**Cause:** The prefixed tool name doesn't exist in the registry. Plugin may not be installed.

**Resolution:**
1. Run \`opentabs status\` to verify the plugin is installed
2. Check the tool name (format: \`<plugin>_<tool>\`, e.g., \`slack_send_message\`)
3. Reinstall: \`opentabs plugin install <name>\`

### Rate Limited

**Error:** Tool response includes \`retryable: true\` and \`retryAfterMs\`.

**Cause:** The target web application's API returned HTTP 429.

**Resolution:** Wait the specified \`retryAfterMs\` before retrying. The \`ToolError.rateLimited\` metadata includes the exact delay.

## Diagnostic Tools Reference

| Tool | What it checks |
|------|---------------|
| \`extension_get_state\` | WebSocket status, registered plugins, active captures |
| \`extension_get_logs\` | Extension background script logs, injection warnings |
| \`extension_check_adapter({"plugin": "<name>"})\` | Adapter injection status, hash match, isReady() result |
| \`plugin_list_tabs\` | Per-plugin tab matching and readiness |
| \`browser_get_console_logs\` | Browser console errors (requires network capture) |
| \`opentabs status\` | Server uptime, extension connection, plugin states |
| \`opentabs doctor\` | Full setup diagnostics with fix suggestions |
| \`opentabs logs --plugin <name>\` | Server-side plugin-specific logs |
`;
