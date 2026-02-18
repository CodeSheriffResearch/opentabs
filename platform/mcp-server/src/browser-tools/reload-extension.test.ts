import { reloadExtension } from './reload-extension.js';
import { createState } from '../state.js';
import { describe, expect, test } from 'bun:test';

describe('reloadExtension handler', () => {
  test('returns error when extensionWs is null', async () => {
    const state = createState();
    state.extensionWs = null;

    const result = await reloadExtension.handler({}, state);

    expect(result).toEqual({ ok: false, error: 'Extension not connected' });
  });

  test('sends JSON-RPC extension.reload message and returns success', async () => {
    const state = createState();
    const sent: string[] = [];
    state.extensionWs = {
      send: (data: string) => sent.push(data),
      close: () => {},
    };

    const result = await reloadExtension.handler({}, state);

    expect(result).toEqual({ ok: true, message: 'Reload signal sent to extension' });
    expect(sent).toHaveLength(1);
    const msg = JSON.parse(sent[0] as string) as { jsonrpc: string; method: string; id: number };
    expect(msg.jsonrpc).toBe('2.0');
    expect(msg.method).toBe('extension.reload');
    expect(typeof msg.id).toBe('number');
  });

  test('returns error when ws.send throws', async () => {
    const state = createState();
    state.extensionWs = {
      send: () => {
        throw new Error('ws closed');
      },
      close: () => {},
    };

    const result = await reloadExtension.handler({}, state);

    expect(result).toEqual({
      ok: false,
      error: 'Failed to send reload signal — extension may be disconnecting',
    });
  });

  test('increments nextRequestId after sending', async () => {
    const state = createState();
    state.extensionWs = {
      send: () => {},
      close: () => {},
    };
    const idBefore = state.nextRequestId;

    await reloadExtension.handler({}, state);

    expect(state.nextRequestId).toBe(idBefore + 1);
  });

  test('uses numeric id from getNextRequestId in the message', async () => {
    const state = createState();
    state.nextRequestId = 42;
    let captured = '';
    state.extensionWs = {
      send: (data: string) => {
        captured = data;
      },
      close: () => {},
    };

    await reloadExtension.handler({}, state);

    const msg = JSON.parse(captured) as { id: number };
    expect(msg.id).toBe(42);
  });
});
