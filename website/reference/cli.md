# CLI Reference

## MCP Server

### Start the server

```bash
bun --hot platform/mcp-server/dist/index.js
```

Starts the MCP server with hot reload enabled.

### Build the server

```bash
bun run build
```

Run from `platform/mcp-server/` to compile TypeScript to `dist/`.

## Plugin SDK CLI

### `opentabs build`

```bash
bunx opentabs build
```

Builds the plugin in the current directory:

1. Bundles `src/index.ts` into `dist/adapter.iife.js`
2. Generates `opentabs-plugin.json`

### `create-opentabs-plugin`

```bash
bunx create-opentabs-plugin <name>
```

Scaffolds a new plugin project with the standard directory structure.

| Argument | Description                                              |
| -------- | -------------------------------------------------------- |
| `name`   | Name of the plugin (used for directory and package name) |
