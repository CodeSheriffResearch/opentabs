import { AlertTriangle } from 'lucide-react';

const VersionMismatchBanner = () => (
  <div className="flex items-center gap-2 border-b border-amber-900/40 bg-amber-950/30 px-4 py-2 text-xs text-amber-300">
    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
    <span>Server version mismatch — restart the MCP server for best results.</span>
  </div>
);

export { VersionMismatchBanner };
