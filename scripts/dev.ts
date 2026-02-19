/**
 * Dev orchestrator: runs tsc --build --watch + bun --hot together.
 *
 * 1. Starts `tsc --build --watch` to incrementally recompile all platform
 *    packages via project references.
 * 2. Waits for tsc's initial compilation to finish (detects the
 *    "Watching for file changes" line in tsc output).
 * 3. Starts the MCP server via `bun --hot platform/mcp-server/dist/index.js`.
 * 4. Pipes both processes' stdout/stderr with [tsc] and [mcp] prefixes.
 * 5. Cleans up both child processes on SIGINT/SIGTERM.
 */

import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

type Writable = { write(data: string): boolean };

/**
 * Read a stream line by line, writing each non-empty line with a prefix.
 * Returns a promise that resolves when the stream ends.
 */
const pipeWithPrefix = async (stream: ReadableStream<Uint8Array>, prefix: string, output: Writable): Promise<void> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let partial = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    partial += decoder.decode(value, { stream: true });
    const lines = partial.split('\n');
    partial = lines.pop() ?? '';
    for (const line of lines) {
      if (line.length > 0) {
        output.write(`${prefix} ${line}\n`);
      }
    }
  }

  if (partial.length > 0) {
    output.write(`${prefix} ${partial}\n`);
  }
};

/**
 * Pipe tsc stdout with a prefix, resolving `onReady` when the
 * "Watching for file changes" sentinel is detected. Continues
 * piping after the sentinel for incremental rebuild output.
 */
const pipeTscStdout = async (
  stream: ReadableStream<Uint8Array>,
  prefix: string,
  output: Writable,
  onReady: () => void,
): Promise<void> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let partial = '';
  let ready = false;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    partial += decoder.decode(value, { stream: true });
    const lines = partial.split('\n');
    partial = lines.pop() ?? '';
    for (const line of lines) {
      if (line.length > 0) {
        output.write(`${prefix} ${line}\n`);
      }
      if (!ready && line.includes('Watching for file changes')) {
        ready = true;
        onReady();
      }
    }
  }

  if (partial.length > 0) {
    output.write(`${prefix} ${partial}\n`);
  }
};

// Track child processes for cleanup
const children: Array<ReturnType<typeof Bun.spawn>> = [];

const cleanup = (): void => {
  for (const child of children) {
    child.kill('SIGTERM');
  }
};

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// 1. Start tsc --build --watch
console.log('[dev] Starting tsc --build --watch...');
const tsc = Bun.spawn(['bun', 'run', 'tsc', '--build', '--watch'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});
children.push(tsc);

// 2. Pipe tsc output and wait for initial compilation
const tscReady = new Promise<void>(r => {
  void pipeTscStdout(tsc.stdout, '[tsc]', process.stdout, r);
});
void pipeWithPrefix(tsc.stderr, '[tsc]', process.stderr);

await tscReady;
console.log('[dev] tsc initial compilation complete.');

// 3. Start MCP server with bun --hot
console.log('[dev] Starting MCP server (bun --hot)...');
const mcp = Bun.spawn(['bun', '--hot', 'platform/mcp-server/dist/index.js'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});
children.push(mcp);

// Pipe MCP output
void pipeWithPrefix(mcp.stdout, '[mcp]', process.stdout);
void pipeWithPrefix(mcp.stderr, '[mcp]', process.stderr);

// Wait for either process to exit (shouldn't happen in normal operation)
const tscExit = tsc.exited.then(code => ({ process: 'tsc', code }));
const mcpExit = mcp.exited.then(code => ({ process: 'mcp', code }));
const result = await Promise.race([tscExit, mcpExit]);

console.log(`[dev] ${result.process} exited with code ${result.code}`);
cleanup();
process.exit(result.code);
