import { Unplug, Zap } from 'lucide-react';

const DisconnectedState = () => (
  <div className="flex flex-col items-center justify-center px-4 py-16 text-center opacity-60">
    <Unplug className="mb-4 h-12 w-12 text-gray-500" />
    <h2 className="mb-2 text-lg font-medium text-gray-300">MCP server not connected</h2>
    <p className="max-w-[240px] text-sm text-gray-500">Start the MCP server to manage your plugins and tools.</p>
    <code className="mt-4 rounded border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-xs text-gray-400">
      bun --hot platform/mcp-server/dist/index.js
    </code>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-amber-400" />
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
    <Zap className="mb-3 h-10 w-10 text-gray-600" />
    <h2 className="mb-1 text-base font-medium text-gray-400">No plugins installed</h2>
    <p className="max-w-[240px] text-sm text-gray-500">
      Add a plugin path to ~/.opentabs/config.json or install one from npm.
    </p>
  </div>
);

export { DisconnectedState, LoadingState, EmptyState };
