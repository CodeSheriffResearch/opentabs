# Configuration

## Server Configuration

The MCP server reads configuration from `~/.opentabs/config.json`.

### Example

```json
{
  "plugins": ["/Users/you/projects/opentabs-plugin-slack", "/Users/you/projects/opentabs-plugin-datadog"]
}
```

### Options

| Option    | Type       | Default | Description                                |
| --------- | ---------- | ------- | ------------------------------------------ |
| `plugins` | `string[]` | `[]`    | Absolute paths to local plugin directories |

## MCP Client Configuration

Configure your MCP client to connect to the OpenTabs server.

### Claude Code

Edit `~/.claude/settings/mcp.json`:

```json
{
  "mcpServers": {
    "opentabs": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

### Generic MCP Client

Point any MCP Streamable HTTP client to:

```
http://127.0.0.1:3000/mcp
```

## Environment

| Variable | Default | Description             |
| -------- | ------- | ----------------------- |
| `PORT`   | `3000`  | Port for the MCP server |

## Health Endpoint

`GET http://localhost:3000/health` returns:

```json
{
  "status": "ok",
  "extension": "connected",
  "plugins": [...],
  "hotReload": {
    "reloadCount": 0,
    "lastReload": null
  }
}
```
