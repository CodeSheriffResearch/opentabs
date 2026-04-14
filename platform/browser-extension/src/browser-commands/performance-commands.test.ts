import { beforeEach, describe, expect, test, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockSendToServer } = vi.hoisted(() => ({
  mockSendToServer: vi.fn<(data: unknown) => void>(),
}));

vi.mock('../messaging.js', () => ({
  sendToServer: mockSendToServer,
  forwardToSidePanel: vi.fn(),
}));

vi.mock('../sanitize-error.js', () => ({
  sanitizeErrorMessage: (msg: string) => msg,
}));

vi.mock('../network-capture.js', () => ({
  isCapturing: () => false,
}));

// Chrome API stubs
const mockSendCommand = vi.fn<(target: unknown, method: string, params?: unknown) => Promise<unknown>>();
const mockAttach = vi.fn<(target: unknown, version: string) => Promise<void>>().mockResolvedValue(undefined);
const mockDetach = vi.fn<(target: unknown) => Promise<void>>().mockResolvedValue(undefined);
const mockExecuteScript = vi.fn<(injection: unknown) => Promise<Array<{ result?: unknown }>>>();

Object.assign(globalThis, {
  chrome: {
    ...((globalThis as Record<string, unknown>).chrome as object),
    debugger: {
      attach: mockAttach,
      detach: mockDetach,
      sendCommand: mockSendCommand,
      onEvent: { addListener: vi.fn() },
    },
    scripting: {
      executeScript: mockExecuteScript,
    },
  },
});

const { handleBrowserGetPerformanceMetrics } = await import('./performance-commands.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCdpMetrics = () => ({
  metrics: [
    { name: 'Nodes', value: 150 },
    { name: 'Documents', value: 3 },
    { name: 'JSEventListeners', value: 42 },
    { name: 'JSHeapUsedSize', value: 8_000_000 },
    { name: 'JSHeapTotalSize', value: 16_000_000 },
    { name: 'LayoutCount', value: 10 },
    { name: 'RecalcStyleCount', value: 5 },
    { name: 'LayoutDuration', value: 0.025 },
  ],
});

const makeTimingResult = () => ({
  ttfbMs: 50,
  domContentLoadedMs: 200,
  loadCompleteMs: 500,
  fcpMs: 120,
  lcpMs: 350,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('handleBrowserGetPerformanceMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue(undefined);
    mockExecuteScript.mockReset();
    mockExecuteScript.mockResolvedValue([{ result: makeTimingResult() }]);
  });

  test('returns structured performance metrics', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Performance.getMetrics') {
        return makeCdpMetrics();
      }
      return undefined;
    });

    await handleBrowserGetPerformanceMetrics({ tabId: 42 }, 1);

    expect(mockSendCommand).toHaveBeenCalledWith({ tabId: 42 }, 'Performance.enable');
    expect(mockSendCommand).toHaveBeenCalledWith({ tabId: 42 }, 'Performance.getMetrics');

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({ jsonrpc: '2.0', id: 1 });

    const result = response.result as Record<string, unknown>;
    expect(result.dom).toEqual({ nodes: 150, documents: 3, eventListeners: 42 });
    expect(result.memory).toEqual({ jsHeapUsedBytes: 8_000_000, jsHeapTotalBytes: 16_000_000 });
    expect(result.layout).toEqual({ count: 10, durationMs: 25, styleRecalcs: 5 });
    expect(result.timing).toEqual(makeTimingResult());
  });

  test('converts LayoutDuration from seconds to milliseconds', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Performance.getMetrics') {
        return { metrics: [{ name: 'LayoutDuration', value: 0.1 }] };
      }
      return undefined;
    });

    await handleBrowserGetPerformanceMetrics({ tabId: 42 }, 2);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { layout: { durationMs: number } };
    expect(result.layout.durationMs).toBe(100);
  });

  test('returns null timing values when executeScript fails', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Performance.getMetrics') {
        return makeCdpMetrics();
      }
      return undefined;
    });
    mockExecuteScript.mockRejectedValueOnce(new Error('Script injection blocked'));

    await handleBrowserGetPerformanceMetrics({ tabId: 42 }, 3);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { timing: Record<string, unknown> };
    expect(result.timing).toEqual({
      ttfbMs: null,
      domContentLoadedMs: null,
      loadCompleteMs: null,
      fcpMs: null,
      lcpMs: null,
    });
  });

  test('sends error for missing tabId', async () => {
    await handleBrowserGetPerformanceMetrics({}, 4);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: expect.objectContaining({ message: expect.stringContaining('tabId') }),
      id: 4,
    });
  });

  test('sends error when debugger attach fails', async () => {
    mockAttach.mockRejectedValueOnce(new Error('Cannot attach'));

    await handleBrowserGetPerformanceMetrics({ tabId: 42 }, 5);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: expect.objectContaining({ message: expect.stringContaining('attach debugger') }),
      id: 5,
    });
  });

  test('always disables Performance domain in finally block', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Performance.getMetrics') {
        throw new Error('CDP error');
      }
      return undefined;
    });

    await handleBrowserGetPerformanceMetrics({ tabId: 42 }, 6);

    expect(mockSendCommand).toHaveBeenCalledWith({ tabId: 42 }, 'Performance.disable');
  });

  test('returns null for metrics not in CDP response', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Performance.getMetrics') {
        return { metrics: [] };
      }
      return undefined;
    });

    await handleBrowserGetPerformanceMetrics({ tabId: 42 }, 7);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as Record<string, unknown>;
    expect(result.dom).toEqual({ nodes: null, documents: null, eventListeners: null });
    expect(result.memory).toEqual({ jsHeapUsedBytes: null, jsHeapTotalBytes: null });
    expect(result.layout).toEqual({ count: null, durationMs: null, styleRecalcs: null });
  });
});
