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

Object.assign(globalThis, {
  chrome: {
    ...((globalThis as Record<string, unknown>).chrome as object),
    debugger: {
      attach: mockAttach,
      detach: mockDetach,
      sendCommand: mockSendCommand,
      onEvent: { addListener: vi.fn(), removeListener: vi.fn() },
    },
  },
});

const { handleBrowserGetMemoryUsage } = await import('./memory-commands.js');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('handleBrowserGetMemoryUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue(undefined);
  });

  test('returns DOM counters and heap usage', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Memory.getDOMCounters') {
        return { documents: 3, nodes: 150, jsEventListeners: 42 };
      }
      if (method === 'Runtime.getHeapUsage') {
        return { usedSize: 5000000, totalSize: 10000000 };
      }
      return undefined;
    });

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 1);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({ jsonrpc: '2.0', id: 1 });
    const result = response.result as {
      dom: { documents: number; nodes: number; eventListeners: number };
      heap: { usedBytes: number; totalBytes: number; usagePercent: number };
    };
    expect(result.dom.documents).toBe(3);
    expect(result.dom.nodes).toBe(150);
    expect(result.dom.eventListeners).toBe(42);
    expect(result.heap.usedBytes).toBe(5000000);
    expect(result.heap.totalBytes).toBe(10000000);
    expect(result.heap.usagePercent).toBe(50);
  });

  test('calculates usage percentage correctly', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Memory.getDOMCounters') {
        return { documents: 1, nodes: 10, jsEventListeners: 5 };
      }
      if (method === 'Runtime.getHeapUsage') {
        return { usedSize: 3333333, totalSize: 10000000 };
      }
      return undefined;
    });

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 2);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { heap: { usagePercent: number } };
    expect(result.heap.usagePercent).toBe(33.33);
  });

  test('handles zero total heap size', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Memory.getDOMCounters') {
        return { documents: 0, nodes: 0, jsEventListeners: 0 };
      }
      if (method === 'Runtime.getHeapUsage') {
        return { usedSize: 0, totalSize: 0 };
      }
      return undefined;
    });

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 3);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { heap: { usagePercent: number } };
    expect(result.heap.usagePercent).toBe(0);
  });

  test('handles missing fields in CDP response', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Memory.getDOMCounters') {
        return {};
      }
      if (method === 'Runtime.getHeapUsage') {
        return {};
      }
      return undefined;
    });

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 4);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as {
      dom: { documents: number; nodes: number; eventListeners: number };
      heap: { usedBytes: number; totalBytes: number };
    };
    expect(result.dom.documents).toBe(0);
    expect(result.dom.nodes).toBe(0);
    expect(result.dom.eventListeners).toBe(0);
    expect(result.heap.usedBytes).toBe(0);
    expect(result.heap.totalBytes).toBe(0);
  });

  test('sends error for missing tabId', async () => {
    await handleBrowserGetMemoryUsage({}, 5);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: expect.objectContaining({ message: expect.stringContaining('tabId') }),
      id: 5,
    });
  });

  test('sends error when debugger attach fails', async () => {
    mockAttach.mockRejectedValueOnce(new Error('Cannot attach'));

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 6);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: expect.objectContaining({ message: expect.stringContaining('attach debugger') }),
      id: 6,
    });
  });

  test('handles null CDP responses', async () => {
    mockSendCommand.mockResolvedValue(null);

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 7);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as {
      dom: { documents: number; nodes: number; eventListeners: number };
      heap: { usedBytes: number; totalBytes: number };
    };
    expect(result.dom.documents).toBe(0);
    expect(result.dom.nodes).toBe(0);
    expect(result.heap.usedBytes).toBe(0);
  });

  test('returns all numeric values greater than or equal to zero', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Memory.getDOMCounters') {
        return { documents: 1, nodes: 500, jsEventListeners: 200 };
      }
      if (method === 'Runtime.getHeapUsage') {
        return { usedSize: 8000000, totalSize: 16000000 };
      }
      return undefined;
    });

    await handleBrowserGetMemoryUsage({ tabId: 42 }, 8);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as {
      dom: { documents: number; nodes: number; eventListeners: number };
      heap: { usedBytes: number; totalBytes: number; usagePercent: number };
    };
    expect(result.dom.documents).toBeGreaterThanOrEqual(0);
    expect(result.dom.nodes).toBeGreaterThanOrEqual(0);
    expect(result.dom.eventListeners).toBeGreaterThanOrEqual(0);
    expect(result.heap.usedBytes).toBeGreaterThanOrEqual(0);
    expect(result.heap.totalBytes).toBeGreaterThanOrEqual(0);
    expect(result.heap.usagePercent).toBeGreaterThanOrEqual(0);
    expect(result.heap.usagePercent).toBeLessThanOrEqual(100);
  });
});
