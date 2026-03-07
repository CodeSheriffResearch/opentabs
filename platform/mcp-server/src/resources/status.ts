/** Dynamic status resource builder. */

import type { ServerState } from '../state.js';

/** Build the dynamic status resource JSON from server state */
export const buildStatusResource = (state: ServerState): string => {
  const plugins = [...state.registry.plugins.values()].map(p => ({
    name: p.name,
    displayName: p.displayName,
    toolCount: p.tools.length,
    tools: p.tools.map(t => `${p.name}_${t.name}`),
    tabState: state.tabMapping.get(p.name)?.state ?? 'closed',
    tabs: (state.tabMapping.get(p.name)?.tabs ?? []).map(t => ({
      tabId: t.tabId,
      url: t.url,
      title: t.title,
      ready: t.ready,
    })),
  }));

  return JSON.stringify(
    {
      extensionConnected: state.extensionWs !== null,
      plugins,
      failedPlugins: [...state.registry.failures],
      browserToolCount: state.cachedBrowserTools.length,
      pluginToolCount: [...state.registry.plugins.values()].reduce((sum, p) => sum + p.tools.length, 0),
      skipPermissions: state.skipPermissions,
      uptime: Math.round((Date.now() - state.startedAt) / 1000),
    },
    null,
    2,
  );
};
