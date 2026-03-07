/** CLI Reference resource content. */

export const CLI_CONTENT = `# CLI Reference

## opentabs CLI

User-facing CLI for managing the OpenTabs platform.

### Core Commands

| Command | Description |
|---------|-------------|
| \`opentabs start [options]\` | Start the MCP server |
| \`opentabs stop [options]\` | Stop the background MCP server |
| \`opentabs status [options]\` | Show server status, extension connection, and plugin states |
| \`opentabs logs [options]\` | Show recent MCP server log output |
| \`opentabs audit [options]\` | Show recent tool invocation history |
| \`opentabs doctor [options]\` | Diagnose your OpenTabs setup |
| \`opentabs update\` | Update CLI to the latest version |

### start

\`\`\`bash
opentabs start [--port <number>] [--background] [--show-config]
\`\`\`

- \`--port <number>\` — Server port (default: 9515)
- \`--background\` — Run as a background process (PID written to \`~/.opentabs/server.pid\`)
- \`--show-config\` — Print MCP client configuration blocks

On first run, creates \`~/.opentabs/\`, generates auth secret, and prints configuration.

### stop

\`\`\`bash
opentabs stop [--port <number>]
\`\`\`

Stops a background server started with \`opentabs start --background\`.

### status

\`\`\`bash
opentabs status [--port <number>] [--json]
\`\`\`

- \`--json\` — Output raw JSON from the health endpoint

Shows: server version, uptime, extension connection, plugin count, per-plugin details.

### logs

\`\`\`bash
opentabs logs [--lines <n>] [-f|--follow] [--plugin <name>]
\`\`\`

- \`--lines <n>\` — Number of lines (default: 50)
- \`-f, --follow\` — Tail the log (like \`tail -f\`)
- \`--plugin <name>\` — Filter logs by plugin name

### audit

\`\`\`bash
opentabs audit [--limit <n>] [--plugin <name>] [--tool <name>] [--since <duration>] [--json] [--file]
\`\`\`

- \`--limit <n>\` — Number of entries (default: 20)
- \`--plugin <name>\` — Filter by plugin name
- \`--tool <name>\` — Filter by tool name
- \`--since <duration>\` — Time range (e.g., \`30m\`, \`1h\`, \`2d\`)
- \`--file\` — Read from disk log (\`~/.opentabs/audit.log\`) instead of running server

### doctor

\`\`\`bash
opentabs doctor [--port <number>]
\`\`\`

Checks: runtime, browser, config file, auth secret, server health, extension status, extension version, MCP client config, local plugins, npm plugins.

### update

\`\`\`bash
opentabs update
\`\`\`

Checks npm for updates, warns if server is running, auto-restarts background servers after update.

## Configuration Commands

### config show (alias: config get)

\`\`\`bash
opentabs config show [--json] [--show-secret]
\`\`\`

- \`--json\` — Output as JSON
- \`--show-secret\` — Display auth secret and MCP client configurations

### config set

\`\`\`bash
opentabs config set <key> [value] [-f|--force]
\`\`\`

**Supported keys:**

| Key Format | Value | Example |
|------------|-------|---------|
| \`tool-permission.<plugin>.<tool>\` | \`off\\|ask\\|auto\` | \`opentabs config set tool-permission.slack.send_message auto\` |
| \`plugin-permission.<plugin>\` | \`off\\|ask\\|auto\` | \`opentabs config set plugin-permission.slack ask\` |
| \`port\` | \`1-65535\` | \`opentabs config set port 9515\` |
| \`localPlugins.add\` | path | \`opentabs config set localPlugins.add /path/to/plugin\` |
| \`localPlugins.remove\` | path | \`opentabs config set localPlugins.remove /path/to/plugin\` |

\`--force\` allows \`localPlugins.add\` even if the path doesn't exist yet.

### config path

\`\`\`bash
opentabs config path
\`\`\`

Prints the absolute path to \`~/.opentabs/config.json\`.

### config reset

\`\`\`bash
opentabs config reset [--confirm]
\`\`\`

Deletes the config file. Server regenerates defaults on next start.

### config rotate-secret

\`\`\`bash
opentabs config rotate-secret [--confirm]
\`\`\`

Generates new 256-bit auth secret, notifies running server, requires MCP clients to update.

## Plugin Management Commands

### plugin search

\`\`\`bash
opentabs plugin search [query]
\`\`\`

Search npm registry for OpenTabs plugins. Omit query to list all available plugins.

### plugin list (alias: plugin ls)

\`\`\`bash
opentabs plugin list [--port <number>] [--json] [-v|--verbose]
\`\`\`

- \`--json\` — Machine-readable JSON output
- \`-v, --verbose\` — Show tool names for each plugin

### plugin install (alias: plugin add)

\`\`\`bash
opentabs plugin install <name>
\`\`\`

Resolves shorthand names (e.g., \`slack\` → \`opentabs-plugin-slack\` or \`@opentabs-dev/opentabs-plugin-slack\`).

### plugin remove (alias: plugin rm)

\`\`\`bash
opentabs plugin remove <name> [-y|--confirm]
\`\`\`

### plugin create

\`\`\`bash
opentabs plugin create [name] [--domain <domain>] [--display <name>] [--description <desc>]
\`\`\`

Scaffolds a new plugin project. Interactive mode if arguments not provided.

## opentabs-plugin CLI

Plugin developer CLI for building and inspecting plugins.

### opentabs-plugin build

\`\`\`bash
opentabs-plugin build [--watch]
\`\`\`

- Generates \`dist/tools.json\` (tool schemas + SDK version)
- Bundles adapter as IIFE in \`dist/adapter.iife.js\`
- Auto-registers in \`~/.opentabs/config.json\` on first build
- Notifies running MCP server via \`POST /reload\`
- \`--watch\` — Rebuild on file changes

### opentabs-plugin inspect

\`\`\`bash
opentabs-plugin inspect [--json]
\`\`\`

Pretty-prints the built plugin manifest: name, version, SDK version, tool count, and detailed tool schemas.

## File Paths

| Path | Purpose |
|------|---------|
| \`~/.opentabs/config.json\` | Server and plugin configuration |
| \`~/.opentabs/extension/auth.json\` | WebSocket auth secret |
| \`~/.opentabs/server.log\` | Server log output |
| \`~/.opentabs/audit.log\` | Persistent audit log (NDJSON) |
| \`~/.opentabs/server.pid\` | Background server PID |
| \`~/.opentabs/extension/\` | Chrome extension files |
`;
