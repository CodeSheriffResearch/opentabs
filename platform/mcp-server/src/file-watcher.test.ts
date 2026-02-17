import { startFileWatching, stopFileWatching } from './file-watcher.js';
import { createState } from './state.js';
import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { RegisteredPlugin, ServerState } from './state.js';

/** No-op file watcher callbacks */
const noopCallbacks = {
  onManifestChanged: () => {},
  onIifeChanged: () => {},
};

/** Create a minimal registered plugin with the given overrides */
const makePlugin = (overrides: Partial<RegisteredPlugin> = {}): RegisteredPlugin => ({
  name: 'test-plugin',
  version: '1.0.0',
  urlPatterns: ['http://localhost/*'],
  trustTier: 'local',
  iife: '(function(){})()',
  tools: [],
  ...overrides,
});

describe('file watcher generation counter', () => {
  test('createState initializes fileWatcherGeneration to 0', () => {
    const state = createState();
    expect(state.fileWatcherGeneration).toBe(0);
  });

  test('startFileWatching increments fileWatcherGeneration', () => {
    const state = createState();
    expect(state.fileWatcherGeneration).toBe(0);

    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(1);

    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(2);
  });

  test('stopFileWatching does NOT change fileWatcherGeneration', () => {
    const state = createState();
    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(1);

    stopFileWatching(state);
    expect(state.fileWatcherGeneration).toBe(1);
  });

  test('stale callback with old generation is rejected', () => {
    const state = createState();
    let callbackExecuted = false;

    // Capture generation 0 (simulating what watchPlugin does)
    const capturedGen = state.fileWatcherGeneration;

    // Bump generation (simulating startFileWatching being called during hot reload)
    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(1);

    // Simulate the stale debounce callback check (same pattern as watchPlugin's setTimeout)
    if (state.fileWatcherGeneration !== capturedGen) {
      // Stale — bail out (this is what the real code does: `return;`)
    } else {
      callbackExecuted = true;
    }

    expect(callbackExecuted).toBe(false);
  });

  test('current-generation callback executes normally', () => {
    const state = createState();
    let callbackExecuted = false;

    // Bump generation via startFileWatching
    startFileWatching(state, noopCallbacks);

    // Capture generation 1 (simulating what watchPlugin does after restart)
    const capturedGen = state.fileWatcherGeneration;
    expect(capturedGen).toBe(1);

    // Simulate the debounce callback check — generation matches
    if (state.fileWatcherGeneration !== capturedGen) {
      // Stale — bail out
    } else {
      callbackExecuted = true;
    }

    expect(callbackExecuted).toBe(true);
  });
});

describe('file watcher lifecycle with real plugins', () => {
  let tmpDir: string;
  let state: ServerState;

  afterEach(() => {
    stopFileWatching(state);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test('startFileWatching creates watchers for local plugins and increments generation', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'fw-gen-'));
    const pluginDir = join(tmpDir, 'test-plugin');
    mkdirSync(join(pluginDir, 'dist'), { recursive: true });
    writeFileSync(join(pluginDir, 'opentabs-plugin.json'), '{}');
    writeFileSync(join(pluginDir, 'dist', 'adapter.iife.js'), '(function(){})()');

    state = createState();
    state.plugins.set('test-plugin', makePlugin({ sourcePath: pluginDir }));

    expect(state.fileWatcherGeneration).toBe(0);
    expect(state.fileWatcherEntries).toHaveLength(0);

    startFileWatching(state, noopCallbacks);

    expect(state.fileWatcherGeneration).toBe(1);
    expect(state.fileWatcherEntries).toHaveLength(1);
    const entry = state.fileWatcherEntries[0];
    expect(entry).toBeDefined();
    expect((entry as NonNullable<typeof entry>).pluginName).toBe('test-plugin');
  });

  test('restarting file watchers bumps generation and replaces entries', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'fw-gen-'));
    const pluginDir = join(tmpDir, 'test-plugin');
    mkdirSync(join(pluginDir, 'dist'), { recursive: true });
    writeFileSync(join(pluginDir, 'opentabs-plugin.json'), '{}');
    writeFileSync(join(pluginDir, 'dist', 'adapter.iife.js'), '(function(){})()');

    state = createState();
    state.plugins.set('test-plugin', makePlugin({ sourcePath: pluginDir }));

    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(1);
    const firstEntries = [...state.fileWatcherEntries];

    // Restart watchers (simulating hot reload)
    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(2);
    expect(state.fileWatcherEntries).toHaveLength(1);

    // Old entries should have been cleaned up (watchers closed)
    // New entries are different instances
    const newEntry = state.fileWatcherEntries[0];
    expect(newEntry).toBeDefined();
    expect(newEntry).not.toBe(firstEntries[0]);
  });

  test('stale debounce timer fires after restart but generation check prevents execution', async () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'fw-gen-'));
    const pluginDir = join(tmpDir, 'test-plugin');
    mkdirSync(join(pluginDir, 'dist'), { recursive: true });
    writeFileSync(join(pluginDir, 'opentabs-plugin.json'), '{}');
    writeFileSync(join(pluginDir, 'dist', 'adapter.iife.js'), '(function(){})()');

    state = createState();
    state.plugins.set('test-plugin', makePlugin({ sourcePath: pluginDir }));

    // Start file watching (generation becomes 1)
    startFileWatching(state, noopCallbacks);
    expect(state.fileWatcherGeneration).toBe(1);

    // Manually insert a stale timer that captured generation 0
    const staleGen = 0;
    let staleCallbackRan = false;
    const key = `${pluginDir}:test-stale`;
    state.fileWatcherTimers.set(
      key,
      setTimeout(() => {
        state.fileWatcherTimers.delete(key);
        if (state.fileWatcherGeneration !== staleGen) return;
        staleCallbackRan = true;
      }, 10),
    );

    // Wait for the timer to fire
    await new Promise(r => setTimeout(r, 50));

    // The stale callback should NOT have executed because generation 0 !== 1
    expect(staleCallbackRan).toBe(false);
    expect(state.fileWatcherTimers.has(key)).toBe(false);
  });

  test('current-generation timer fires and executes the callback', async () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'fw-gen-'));
    const pluginDir = join(tmpDir, 'test-plugin');
    mkdirSync(join(pluginDir, 'dist'), { recursive: true });
    writeFileSync(join(pluginDir, 'opentabs-plugin.json'), '{}');
    writeFileSync(join(pluginDir, 'dist', 'adapter.iife.js'), '(function(){})()');

    state = createState();
    state.plugins.set('test-plugin', makePlugin({ sourcePath: pluginDir }));

    // Start file watching (generation becomes 1)
    startFileWatching(state, noopCallbacks);
    const currentGen = state.fileWatcherGeneration;
    expect(currentGen).toBe(1);

    // Manually insert a timer that captured the current generation
    let currentCallbackRan = false;
    const key = `${pluginDir}:test-current`;
    state.fileWatcherTimers.set(
      key,
      setTimeout(() => {
        state.fileWatcherTimers.delete(key);
        if (state.fileWatcherGeneration !== currentGen) return;
        currentCallbackRan = true;
      }, 10),
    );

    // Wait for the timer to fire
    await new Promise(r => setTimeout(r, 50));

    // The current-generation callback should have executed
    expect(currentCallbackRan).toBe(true);
    expect(state.fileWatcherTimers.has(key)).toBe(false);
  });
});
