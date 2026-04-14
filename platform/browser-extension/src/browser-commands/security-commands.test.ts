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
const mockAddListener = vi.fn();
const mockRemoveListener = vi.fn();

Object.assign(globalThis, {
  chrome: {
    ...((globalThis as Record<string, unknown>).chrome as object),
    debugger: {
      attach: mockAttach,
      detach: mockDetach,
      sendCommand: mockSendCommand,
      onEvent: { addListener: mockAddListener, removeListener: mockRemoveListener },
    },
  },
});

const { handleBrowserGetSecurityInfo } = await import('./security-commands.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fireSecurityEvent = (tabId: number, visibleSecurityState: Record<string, unknown>) => {
  const listener = mockAddListener.mock.calls[0]?.[0] as
    | ((source: { tabId: number }, method: string, params?: Record<string, unknown>) => void)
    | undefined;
  if (listener) {
    listener({ tabId }, 'Security.visibleSecurityStateChanged', { visibleSecurityState });
  }
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('handleBrowserGetSecurityInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue(undefined);
  });

  test('returns security state for a secure page', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Security.enable') {
        fireSecurityEvent(42, {
          securityState: 'secure',
          certificateSecurityState: {
            subjectName: 'example.com',
            issuer: "Let's Encrypt",
            validFrom: 1700000000,
            validTo: 1710000000,
            protocol: 'TLS 1.3',
            keyExchange: 'X25519',
            cipher: 'AES_256_GCM',
          },
        });
      }
      return undefined;
    });

    await handleBrowserGetSecurityInfo({ tabId: 42 }, 1);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({ jsonrpc: '2.0', id: 1 });
    const result = response.result as {
      securityState: string;
      certificate: Record<string, unknown>;
      mixedContent: Record<string, boolean>;
    };
    expect(result.securityState).toBe('secure');
    expect(result.certificate).toBeDefined();
    expect(result.certificate.subject).toBe('example.com');
    expect(result.certificate.issuer).toBe("Let's Encrypt");
    expect(result.certificate.protocol).toBe('TLS 1.3');
    expect(result.certificate.cipher).toBe('AES_256_GCM');
    expect(result.mixedContent.hasInsecureContent).toBe(false);
  });

  test('returns insecure state for HTTP pages', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Security.enable') {
        fireSecurityEvent(42, {
          securityState: 'insecure',
        });
      }
      return undefined;
    });

    await handleBrowserGetSecurityInfo({ tabId: 42 }, 2);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as {
      securityState: string;
      certificate: unknown;
      mixedContent: Record<string, boolean>;
    };
    expect(result.securityState).toBe('insecure');
    expect(result.certificate).toBeNull();
    expect(result.mixedContent.hasInsecureContent).toBe(true);
  });

  test('returns certificate dates as ISO strings', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Security.enable') {
        fireSecurityEvent(42, {
          securityState: 'secure',
          certificateSecurityState: {
            subjectName: 'test.com',
            issuer: 'CA',
            validFrom: 1700000000,
            validTo: 1710000000,
            protocol: 'TLS 1.3',
          },
        });
      }
      return undefined;
    });

    await handleBrowserGetSecurityInfo({ tabId: 42 }, 3);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { certificate: { validFrom: string; validTo: string } };
    expect(result.certificate.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.certificate.validTo).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('handles neutral security state (mixed content displayed)', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Security.enable') {
        fireSecurityEvent(42, {
          securityState: 'neutral',
        });
      }
      return undefined;
    });

    await handleBrowserGetSecurityInfo({ tabId: 42 }, 4);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { mixedContent: Record<string, boolean> };
    expect(result.mixedContent.hasInsecureContent).toBe(true);
    expect(result.mixedContent.displayedInsecureContent).toBe(true);
    expect(result.mixedContent.ranInsecureContent).toBe(false);
  });

  test('sends error for missing tabId', async () => {
    await handleBrowserGetSecurityInfo({}, 5);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: expect.objectContaining({ message: expect.stringContaining('tabId') }),
      id: 5,
    });
  });

  test('sends error when debugger attach fails', async () => {
    mockAttach.mockRejectedValueOnce(new Error('Cannot attach'));

    await handleBrowserGetSecurityInfo({ tabId: 42 }, 6);

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(response).toMatchObject({
      jsonrpc: '2.0',
      error: expect.objectContaining({ message: expect.stringContaining('attach debugger') }),
      id: 6,
    });
  });

  test('ignores events from other tabs', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Security.enable') {
        fireSecurityEvent(99, { securityState: 'secure' });
      }
      return undefined;
    });

    // The handler should timeout and return unknown since the event is for tab 99
    const promise = handleBrowserGetSecurityInfo({ tabId: 42 }, 7);

    // Wait for the 3s timeout — use a fake timer approach
    // Since we can't easily mock setTimeout in this test setup, verify the listener was added
    await promise;

    const response = mockSendToServer.mock.calls[0]?.[0] as Record<string, unknown>;
    const result = response.result as { securityState: string } | undefined;
    // Either returns unknown (timeout) or the listener was cleaned up
    expect(result?.securityState).toBe('unknown');
  });

  test('removes event listener after completion', async () => {
    mockSendCommand.mockImplementation(async (_target, method) => {
      if (method === 'Security.enable') {
        fireSecurityEvent(42, { securityState: 'secure' });
      }
      return undefined;
    });

    await handleBrowserGetSecurityInfo({ tabId: 42 }, 8);

    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
  });
});
