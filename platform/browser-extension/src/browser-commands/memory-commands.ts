import { requireTabId, sendErrorResult, sendSuccessResult } from './helpers.js';
import { withDebugger } from './resource-commands.js';

interface MemoryResult {
  dom: {
    documents: number;
    nodes: number;
    eventListeners: number;
  };
  heap: {
    usedBytes: number;
    totalBytes: number;
    usagePercent: number;
  };
}

export const handleBrowserGetMemoryUsage = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
  try {
    const tabId = requireTabId(params, id);
    if (tabId === null) return;

    let result: MemoryResult | null = null;

    await withDebugger(tabId, async () => {
      const domCounters = (await chrome.debugger.sendCommand({ tabId }, 'Memory.getDOMCounters')) as
        | {
            documents?: number;
            nodes?: number;
            jsEventListeners?: number;
          }
        | undefined;

      const heapUsage = (await chrome.debugger.sendCommand({ tabId }, 'Runtime.getHeapUsage')) as
        | {
            usedSize?: number;
            totalSize?: number;
          }
        | undefined;

      const documents = typeof domCounters?.documents === 'number' ? domCounters.documents : 0;
      const nodes = typeof domCounters?.nodes === 'number' ? domCounters.nodes : 0;
      const eventListeners = typeof domCounters?.jsEventListeners === 'number' ? domCounters.jsEventListeners : 0;

      const usedBytes = typeof heapUsage?.usedSize === 'number' ? heapUsage.usedSize : 0;
      const totalBytes = typeof heapUsage?.totalSize === 'number' ? heapUsage.totalSize : 0;
      const usagePercent = totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 10000) / 100 : 0;

      result = {
        dom: { documents, nodes, eventListeners },
        heap: { usedBytes, totalBytes, usagePercent },
      };
    });

    sendSuccessResult(id, result);
  } catch (err) {
    sendErrorResult(id, err);
  }
};
