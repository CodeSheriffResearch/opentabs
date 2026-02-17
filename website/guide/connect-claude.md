# Connect to Claude Code

OpenTabs works with any MCP-compatible AI agent. Here's how to connect it to Claude Code.

## Configuration

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

## Verify Connection

After configuring, restart Claude Code. You should see OpenTabs tools available. You can verify by asking:

> "What OpenTabs tools are available?"

## Other MCP Clients

OpenTabs works with any client that supports the MCP Streamable HTTP transport. Configure it by pointing to `http://127.0.0.1:3000/mcp`.
