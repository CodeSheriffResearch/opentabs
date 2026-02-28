import { vi, describe, expect, test, beforeEach } from 'vitest';

const { mockDispatchToExtension } = vi.hoisted(() => ({
  mockDispatchToExtension:
    vi.fn<(state: unknown, method: string, params: Record<string, unknown>) => Promise<unknown>>(),
}));

vi.mock('../extension-protocol.js', () => ({
  dispatchToExtension: mockDispatchToExtension,
}));

const { exportHar } = await import('./export-har.js');
const { createState } = await import('../state.js');

describe('exportHar HAR body size fields', () => {
  beforeEach(() => {
    mockDispatchToExtension.mockReset();
  });

  test('non-ASCII request and response bodies use byte length, not string length', async () => {
    const state = createState();
    state.activeNetworkCaptures.add(1);

    // '😀' is 2 JS chars (surrogate pair) but 4 bytes in UTF-8
    const emoji = '😀';
    expect(emoji.length).toBe(2);
    expect(Buffer.byteLength(emoji, 'utf-8')).toBe(4);

    const request = {
      url: 'https://example.com/api',
      method: 'POST',
      status: 200,
      statusText: 'OK',
      requestBody: emoji,
      responseBody: emoji,
      timestamp: 1000,
    };

    mockDispatchToExtension.mockResolvedValueOnce([request]);

    const result = await exportHar.handler({ tabId: 1 }, state);
    const har = JSON.parse((result as { har: string }).har) as {
      log: { entries: { request: { bodySize: number }; response: { content: { size: number }; bodySize: number } }[] };
    };

    const entry = har.log.entries[0];
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(entry.request.bodySize).toBe(4);
    expect(entry.response.content.size).toBe(4);
    expect(entry.response.bodySize).toBe(4);
  });

  test('ASCII request and response bodies produce the same size as string.length', async () => {
    const state = createState();
    state.activeNetworkCaptures.add(2);

    const ascii = 'hello world';
    expect(ascii.length).toBe(11);
    expect(Buffer.byteLength(ascii, 'utf-8')).toBe(11);

    const request = {
      url: 'https://example.com/api',
      method: 'POST',
      status: 200,
      statusText: 'OK',
      requestBody: ascii,
      responseBody: ascii,
      timestamp: 2000,
    };

    mockDispatchToExtension.mockResolvedValueOnce([request]);

    const result = await exportHar.handler({ tabId: 2 }, state);
    const har = JSON.parse((result as { har: string }).har) as {
      log: { entries: { request: { bodySize: number }; response: { content: { size: number }; bodySize: number } }[] };
    };

    const entry = har.log.entries[0];
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(entry.request.bodySize).toBe(11);
    expect(entry.response.content.size).toBe(11);
    expect(entry.response.bodySize).toBe(11);
  });

  test('absent request body uses 0 and absent response body uses -1', async () => {
    const state = createState();
    state.activeNetworkCaptures.add(3);

    const request = {
      url: 'https://example.com/api',
      method: 'GET',
      status: 200,
      statusText: 'OK',
      timestamp: 3000,
    };

    mockDispatchToExtension.mockResolvedValueOnce([request]);

    const result = await exportHar.handler({ tabId: 3 }, state);
    const har = JSON.parse((result as { har: string }).har) as {
      log: { entries: { request: { bodySize: number }; response: { content: { size: number }; bodySize: number } }[] };
    };

    const entry = har.log.entries[0];
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(entry.request.bodySize).toBe(0);
    expect(entry.response.content.size).toBe(0);
    expect(entry.response.bodySize).toBe(-1);
  });
});
