/**
 * MCP resource definitions for the OpenTabs server.
 *
 * Resources are static or dynamic documents that AI clients can fetch on demand
 * via `resources/read`. Unlike instructions (sent on every session), resources
 * are pull-based — clients discover them via `resources/list` and fetch content
 * when they need deeper context.
 *
 * Static resources return pre-built markdown content (guides, references).
 * The `opentabs://status` resource is dynamic — built from ServerState at read time.
 */

import { BROWSER_TOOLS_CONTENT } from './resources/browser-tools.js';
import { CLI_CONTENT } from './resources/cli.js';
import { PLUGIN_DEVELOPMENT_CONTENT } from './resources/plugin-development.js';
import { QUICK_START_CONTENT } from './resources/quick-start.js';
import { SDK_API_CONTENT } from './resources/sdk-api.js';
import { buildStatusResource } from './resources/status.js';
import { TROUBLESHOOTING_CONTENT } from './resources/troubleshooting.js';
import type { ServerState } from './state.js';

/** A resource definition for MCP resources/list */
export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/** A resolved resource for MCP resources/read */
export interface ResolvedResource {
  uri: string;
  mimeType: string;
  text: string;
}

/** All registered resources */
const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'opentabs://guide/quick-start',
    name: 'Quick Start Guide',
    description: 'Installation, configuration, and first tool call',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://guide/plugin-development',
    name: 'Plugin Development Guide',
    description: 'Full guide to building OpenTabs plugins (SDK, patterns, conventions)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://guide/troubleshooting',
    name: 'Troubleshooting Guide',
    description: 'Common errors and resolution steps',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/sdk-api',
    name: 'SDK API Reference',
    description: 'Plugin SDK API reference (utilities, errors, lifecycle hooks)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/cli',
    name: 'CLI Reference',
    description: 'CLI command reference (opentabs, opentabs-plugin)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/browser-tools',
    name: 'Browser Tools Reference',
    description: 'All browser tools organized by category',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://status',
    name: 'Server Status',
    description: 'Live server state: loaded plugins, extension connectivity, tab states',
    mimeType: 'application/json',
  },
];

/** Resource URI → definition for O(1) lookup */
const RESOURCE_MAP = new Map(RESOURCES.map(r => [r.uri, r]));

/** URI → content for static resources */
const CONTENT_MAP = new Map<string, string>([
  ['opentabs://guide/quick-start', QUICK_START_CONTENT],
  ['opentabs://guide/plugin-development', PLUGIN_DEVELOPMENT_CONTENT],
  ['opentabs://guide/troubleshooting', TROUBLESHOOTING_CONTENT],
  ['opentabs://reference/sdk-api', SDK_API_CONTENT],
  ['opentabs://reference/cli', CLI_CONTENT],
  ['opentabs://reference/browser-tools', BROWSER_TOOLS_CONTENT],
]);

/** Return all resource definitions for resources/list */
export const getAllResources = (_state: ServerState): ResourceDefinition[] =>
  RESOURCES.map(r => ({
    uri: r.uri,
    name: r.name,
    description: r.description,
    mimeType: r.mimeType,
  }));

/**
 * Resolve a resource by URI, returning its content.
 * Returns null if the URI is not recognized.
 */
export const resolveResource = (state: ServerState, uri: string): ResolvedResource | null => {
  const def = RESOURCE_MAP.get(uri);
  if (!def) return null;

  if (uri === 'opentabs://status') {
    return { uri, mimeType: 'application/json', text: buildStatusResource(state) };
  }

  const content = CONTENT_MAP.get(uri);
  if (content) {
    return { uri, mimeType: def.mimeType, text: content };
  }

  // Static resources without content yet return a placeholder
  return { uri, mimeType: def.mimeType, text: `# ${def.name}\n\nContent coming soon.` };
};
