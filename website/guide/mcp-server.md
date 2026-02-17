# Start the MCP Server

The MCP server bridges AI agents and the Chrome extension.

## Running the Server

```bash
bun --hot platform/mcp-server/dist/index.js
```

The server starts on `http://localhost:3000` with:

- **`/mcp`** — Streamable HTTP endpoint for MCP clients
- **`/health`** — Health check endpoint
- **WebSocket** — Connection to the Chrome extension

## Hot Reload

The `--hot` flag enables hot reload. When you rebuild the server (`bun run build` from `platform/mcp-server/`), Bun re-evaluates modules while keeping all connections alive. No restart needed.

## Health Check

```bash
curl http://localhost:3000/health
```

Returns server state including:

- `extension` — Chrome extension connection status
- `plugins` — discovered plugins and their tools
- `hotReload.reloadCount` — number of hot reloads since process start

## Configuration

The server reads configuration from `~/.opentabs/config.json`. See [Configuration Reference](/reference/config) for all options.
