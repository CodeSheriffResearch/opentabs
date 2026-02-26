#!/bin/bash
# perfect-extension.sh — Invoke Claude to audit the Chrome extension and create PRD(s) to fix bugs and improve code quality.
#
# Usage: bash .ralph/perfect-extension.sh
#
# This script launches a single Claude session (default model) that:
#   1. Reads the Chrome extension source code thoroughly
#   2. Identifies bugs, resource leaks, missing error handling, and code quality issues
#   3. Uses the ralph skill to generate PRD(s) targeting the root monorepo
#
# The ralph daemon (.ralph/ralph.sh) must be running to pick up the PRDs.
# This script does NOT start ralph — it only creates the PRD files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are auditing the OpenTabs Chrome extension (platform/browser-extension/) to find and fix bugs, resource leaks, missing error handling, and code quality issues. Your job is to identify real, concrete problems and use the ralph skill to create PRDs to fix them.

## Step 1: Read the rules and understand the codebase

1. Read CLAUDE.md (root) — overall platform architecture, key concepts, commands
2. Read platform/browser-extension/CLAUDE.md — extension-specific conventions, React rules, theme system, component guidelines

These CLAUDE.md files define the project's conventions and quality standards. Issues must violate these or have concrete runtime consequences.

## Step 2: Thoroughly read all extension source code

Read every file in the Chrome extension source. The key areas are:

### Background service worker
- platform/browser-extension/src/background.ts — main service worker entry point
- platform/browser-extension/src/background-message-handlers.ts — message routing handlers
- platform/browser-extension/src/side-panel-toggle.ts — side panel open/close toggle
- platform/browser-extension/src/confirmation-badge.ts — notification badge management
- platform/browser-extension/src/tab-state.ts — plugin tab state machine
- platform/browser-extension/src/iife-injection.ts — adapter injection into tabs
- platform/browser-extension/src/network-capture.ts — CDP network capture
- platform/browser-extension/src/rate-limiter.ts — WebSocket message rate limiting
- platform/browser-extension/src/message-router.ts — WebSocket message dispatch
- platform/browser-extension/src/plugin-storage.ts — plugin metadata storage

### Offscreen document (persistent WebSocket)
- platform/browser-extension/src/offscreen/index.ts — WebSocket lifecycle, reconnection, ping/pong

### Side panel React UI
- platform/browser-extension/src/side-panel/App.tsx — root component
- platform/browser-extension/src/side-panel/bridge.ts — Chrome messaging bridge
- platform/browser-extension/src/side-panel/hooks/useServerNotifications.ts — server notification handler
- platform/browser-extension/src/side-panel/hooks/useTheme.ts — theme toggle
- platform/browser-extension/src/side-panel/components/*.tsx — all UI components
- platform/browser-extension/src/side-panel/constants.ts — shared constants

### Shared types and constants
- platform/browser-extension/src/extension-messages.ts — internal message types
- platform/browser-extension/src/constants.ts — shared constants

### Build and manifest
- platform/browser-extension/build-extension.ts — esbuild script for background + offscreen
- platform/browser-extension/build-side-panel.ts — esbuild script for side panel
- platform/browser-extension/manifest.json — extension manifest

## Step 3: Identify real issues

For each file, analyze for these categories of concrete problems:

### Bugs and race conditions
- Race conditions between async operations
- Incorrect logic that produces wrong results under specific conditions
- State desynchronization between UI and server
- Missing null/undefined checks that cause crashes

### Resource leaks
- Maps/Sets/caches that grow unboundedly without cleanup
- Timers (setInterval/setTimeout) that are not cleared
- Event listeners that are not removed on cleanup
- WebSocket connections that can become orphaned

### Missing error handling
- Unhandled promise rejections
- Silent error swallowing that hides real failures (empty .catch())
- Missing .catch() on promise chains
- Missing defensive guards on Chrome API calls

### Missing cleanup
- useEffect hooks without cleanup returns
- Chrome message listeners not removed
- Intervals/timeouts not cleared on component unmount

### React anti-patterns
- Stale closures in useCallback/useEffect
- Missing dependencies in hooks
- State that should be derived instead of synced
- Optimistic updates with incorrect revert logic

### Dead code
- Unreachable code paths
- Unused functions, variables, imports

## Step 4: Validate each finding (CRITICAL)

Before including any finding in a PRD, verify it meets ALL of these criteria:

- **Concrete consequence**: Can you name a specific observable outcome? (crash, leak, wrong UI state, lost message, stale data)
- **Not a style preference**: The existing code is functionally incorrect or has a demonstrable hazard — not just a different-but-equivalent approach
- **Not already handled**: Check if a guard, catch, or cleanup already addresses the issue elsewhere in the code
- **Reproducible path**: There exists a sequence of events that triggers the issue (even if unlikely)

Discard any finding that is purely stylistic, already mitigated, or has no concrete consequence.

## Step 5: Create PRD(s) using the ralph skill

After completing the audit, use the skill tool to load the "ralph" skill, then follow its instructions to create PRD(s).

Key parameters for extension PRDs:
- Target project: "OpenTabs Platform" (browser-extension is part of the root monorepo workspace)
- Do NOT set workingDirectory or qualityChecks (root monorepo defaults apply)
- Set e2eCheckpoint: true on the final story if any story touches browser-observable behavior
- Set e2eCheckpoint: false for purely internal fixes (error handling, resource leaks, dead code)
- Always use small stories (1-3 files per story)
- Include repo-root-relative file paths and line numbers in the notes field
- Every story must have concrete, verifiable acceptance criteria
- Skip clarifying questions — this prompt provides all the context needed

Do NOT create stories for:
- Cosmetic preferences or stylistic rewording
- Code that is correct and well-handled even if you would write it differently
- Theoretical issues with no reachable execution path
- Issues already mitigated by existing guards or cleanup handlers

DO create stories for:
- Real bugs with observable consequences
- Resource leaks (unbounded maps, uncleaned timers, leaked listeners)
- Missing error handling that causes silent failures or stuck UI states
- Race conditions with concrete desynchronization outcomes
- Dead code that is genuinely unreachable
- Missing defensive guards that cause crashes on edge cases
PROMPT_EOF

echo "=== perfect-extension.sh ==="
echo "Launching Claude to audit browser extension and create PRD(s)..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
