# Install a Plugin

Plugins add support for specific web applications.

## From npm

Install any plugin published to npm:

```bash
bun add opentabs-plugin-slack
```

The MCP server automatically discovers packages matching `opentabs-plugin-*` or with the `opentabs-plugin` keyword.

## From a Local Path

For local development or private plugins, add the plugin path to `~/.opentabs/config.json`:

```json
{
  "plugins": ["/absolute/path/to/your/plugin"]
}
```

The plugin directory must contain:

- `opentabs-plugin.json` — plugin manifest
- `dist/adapter.iife.js` — bundled adapter script

## Verify Installation

Check the health endpoint to confirm the plugin was discovered:

```bash
curl http://localhost:3000/health
```

The plugin's tools should appear in the `plugins` section of the response.

## File Watcher

The MCP server watches local plugin directories for changes. When you rebuild a plugin, the server automatically picks up the new version and notifies the Chrome extension.
