import { requireTabId, sendErrorResult, sendSuccessResult } from './helpers.js';
import { withDebugger } from './resource-commands.js';

interface CdpMetric {
  name: string;
  value: number;
}

const CDP_METRIC_MAP: Record<string, string> = {
  Nodes: 'domNodes',
  Documents: 'domDocuments',
  JSEventListeners: 'domEventListeners',
  JSHeapUsedSize: 'jsHeapUsedBytes',
  JSHeapTotalSize: 'jsHeapTotalBytes',
  LayoutCount: 'layoutCount',
  RecalcStyleCount: 'styleRecalcCount',
  LayoutDuration: 'layoutDurationMs',
};

const extractCdpMetrics = (metrics: CdpMetric[]): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const metric of metrics) {
    const friendlyName = CDP_METRIC_MAP[metric.name];
    if (friendlyName) {
      result[friendlyName] = metric.name === 'LayoutDuration' ? metric.value * 1000 : metric.value;
    }
  }
  return result;
};

interface TimingResult {
  ttfbMs: number | null;
  domContentLoadedMs: number | null;
  loadCompleteMs: number | null;
  fcpMs: number | null;
  lcpMs: number | null;
}

export const handleBrowserGetPerformanceMetrics = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
  try {
    const tabId = requireTabId(params, id);
    if (tabId === null) return;

    let cdpMetrics: Record<string, number> = {};

    await withDebugger(tabId, async () => {
      await chrome.debugger.sendCommand({ tabId }, 'Performance.enable');
      try {
        const result = (await chrome.debugger.sendCommand({ tabId }, 'Performance.getMetrics')) as {
          metrics: CdpMetric[];
        };
        cdpMetrics = extractCdpMetrics(result.metrics);
      } finally {
        await chrome.debugger.sendCommand({ tabId }, 'Performance.disable').catch(() => {});
      }
    });

    let timing: TimingResult = {
      ttfbMs: null,
      domContentLoadedMs: null,
      loadCompleteMs: null,
      fcpMs: null,
      lcpMs: null,
    };

    try {
      const [scriptResult] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
          const paints = performance.getEntriesByType('paint');
          const fcp = paints.find(e => e.name === 'first-contentful-paint');
          const lcp = (performance as unknown as { getEntriesByType(t: string): PerformanceEntry[] })
            .getEntriesByType('largest-contentful-paint')
            .at(-1) as { startTime: number } | undefined;
          return {
            ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
            domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
            loadCompleteMs: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
            fcpMs: fcp ? Math.round(fcp.startTime) : null,
            lcpMs: lcp ? Math.round(lcp.startTime) : null,
          };
        },
        world: 'MAIN',
      });
      if (scriptResult?.result) {
        timing = scriptResult.result as TimingResult;
      }
    } catch {
      // Timing unavailable (e.g. chrome:// pages) — keep defaults
    }

    sendSuccessResult(id, {
      dom: {
        nodes: cdpMetrics.domNodes ?? null,
        documents: cdpMetrics.domDocuments ?? null,
        eventListeners: cdpMetrics.domEventListeners ?? null,
      },
      memory: {
        jsHeapUsedBytes: cdpMetrics.jsHeapUsedBytes ?? null,
        jsHeapTotalBytes: cdpMetrics.jsHeapTotalBytes ?? null,
      },
      layout: {
        count: cdpMetrics.layoutCount ?? null,
        durationMs: cdpMetrics.layoutDurationMs ?? null,
        styleRecalcs: cdpMetrics.styleRecalcCount ?? null,
      },
      timing,
    });
  } catch (err) {
    sendErrorResult(id, err);
  }
};
