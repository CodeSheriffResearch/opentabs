#!/bin/bash
# perfect-cli-plugin-developer.sh — Invoke Claude to perform a plugin-developer CLI experience test and create PRD(s) for frictions found.
#
# Usage: bash .ralph/perfect-cli-plugin-developer.sh
#
# This script launches a single Claude session (default model) that:
#   1. Spins up a Docker container simulating a brand-new plugin developer
#   2. Installs the CLI, scaffolds a plugin, builds it, and exercises all SDK features
#   3. Identifies DX frictions: broken scaffolding, confusing errors, missing guidance
#   4. Uses the ralph skill to generate PRD(s) targeting the root monorepo
#
# Prerequisites:
#   - Docker running (Docker Desktop or OrbStack)
#   - ~/.npmrc with valid auth token for @opentabs-dev packages
#
# The ralph daemon (.ralph/ralph.sh) must be running to pick up the PRDs.
# This script does NOT start ralph — it only creates the PRD files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are a QA engineer performing a first-time plugin developer experience test for the OpenTabs platform. Your job is to go through the entire plugin development workflow exactly as a new developer would — scaffold, build, use every SDK feature, exercise every CLI command — and identify every friction point. Then use the ralph skill to create PRD(s) to fix them.

## Important context

- The @opentabs-dev packages are published to the public npm registry. Treat them as public.
- Lack of mock/unit testing for plugin tool handlers is NOT an issue — plugins must be tested in a real browser with real auth. Do not report this as friction.
- The Chrome extension cannot be tested inside Docker (no GUI). That is expected. Focus on CLI and build toolchain friction only.

## Step 1: Read the rules and understand the project

Read these files to understand the intended developer experience:

1. CLAUDE.md (root) — overall platform architecture, key concepts
2. platform/cli/CLAUDE.md — CLI commands
3. platform/plugin-sdk/CLAUDE.md — SDK API surface, what's available to plugin developers
4. platform/plugin-tools/CLAUDE.md — plugin build toolchain
5. platform/create-plugin/CLAUDE.md — scaffolding CLI (may not exist — note if missing)
6. platform/cli/src/scaffold.ts — the actual scaffold code that generates plugin files
7. platform/plugin-sdk/src/index.ts — the actual SDK exports (OpenTabsPlugin base class, type definitions)
8. docs/content/docs/quick-start.mdx — the documented quick-start flow
9. docs/content/docs/first-plugin.mdx — the documented first-plugin tutorial
10. docs/content/docs/guides/plugin-development.mdx — comprehensive plugin dev guide
11. docs/content/docs/guides/resources-prompts.mdx — resources and prompts guide

Understanding the source is critical — you need to know the intended behavior to evaluate whether the actual behavior matches developer expectations.

## Step 2: Set up a clean Docker environment

### Prerequisites check

Before launching the container, verify prerequisites are met:

```bash
# 1. Verify Docker is running
docker info > /dev/null 2>&1 || { echo "Docker is not running"; exit 1; }

# 2. Verify ~/.npmrc exists (needed for private @opentabs-dev packages)
test -f "$HOME/.npmrc" || { echo "~/.npmrc not found"; exit 1; }

# 3. Kill any leftover container from a previous run
docker rm -f opentabs-plugin-dev-test 2>/dev/null || true
```

### Launch the container

```bash
docker run --rm -d \
  --name opentabs-plugin-dev-test \
  --network host \
  -v "$HOME/.npmrc:/root/.npmrc:ro" \
  node:22 \
  tail -f /dev/null
```

### Verify the environment

```bash
docker exec opentabs-plugin-dev-test node --version   # Must be 22+
docker exec opentabs-plugin-dev-test npm --version
```

All subsequent commands run via `docker exec`. Use `docker exec -w <dir>` to set the working directory — never `cd && command`.

IMPORTANT: Clean up the container when done: `docker stop opentabs-plugin-dev-test`

## Step 3: Walk through the COMPLETE plugin developer journey

Act as a first-time plugin developer. Be thorough and methodical.

### Phase 1: Install and start the platform

1. `npm install -g @opentabs-dev/cli` — install the CLI
2. `opentabs --version` and `opentabs --help`
3. `opentabs plugin --help` — check plugin subcommand help
4. `opentabs config --help` — check config subcommand help
5. Start the server in the background:
   ```bash
   docker exec -d opentabs-plugin-dev-test bash -c "opentabs start > /tmp/start.log 2>&1"
   sleep 5
   docker exec opentabs-plugin-dev-test cat /tmp/start.log
   ```
6. Verify with `opentabs status`
7. `opentabs doctor` — run diagnostics (expect some warnings in Docker — no browser, no extension)

### Phase 2: Test the scaffolding CLI — all invocation paths

Test every documented way to create a plugin:

1. **`npx create-opentabs-plugin`** — test the unscoped binary name:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npx create-opentabs-plugin test-a --domain example.com
   ```
   This may fail (404) because the package is scoped as @opentabs-dev/create-plugin but npx resolves the binary name as an npm package. Document the result.

2. **`npx @opentabs-dev/create-plugin`** — test the scoped invocation:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npx @opentabs-dev/create-plugin test-b --domain example.com
   ```

3. **`npm create @opentabs-dev/plugin`** — test the npm create convention:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npm create @opentabs-dev/plugin test-c -- --domain example.com
   ```

4. **`opentabs plugin create`** — test the CLI subcommand:
   ```bash
   docker exec -w /root opentabs-plugin-dev-test opentabs plugin create my-plugin --domain example.com --display "My Plugin"
   ```

5. **Non-interactive mode without required args** (stdin is not a TTY in Docker):
   ```bash
   docker exec opentabs-plugin-dev-test opentabs plugin create
   ```

6. **Validation edge cases**:
   - Reserved name: `opentabs plugin create system --domain example.com`
   - Invalid name: `opentabs plugin create MyPlugin --domain example.com`
   - Overly broad domain: `opentabs plugin create test --domain "*.com"`
   - Duplicate directory: create the same plugin name twice
   - Empty name: `opentabs plugin create "" --domain example.com`
   - Name with special characters: `opentabs plugin create my_plugin --domain example.com`
   - Domain with leading dot (subdomain match): `opentabs plugin create dot-test --domain .example.com`

### Phase 3: Build the scaffolded plugin and check quality

For the plugin created in Phase 2 step 4 (`my-plugin`):

1. `npm install`
2. `npm run build` — should compile and bundle
3. **Run ALL quality checks on the freshly scaffolded code** (this is critical):
   - `npm run type-check`
   - `npm run lint` — CHECK IF THIS PASSES. The scaffolder may generate code that violates the project's own lint rules.
   - `npm run format:check` — CHECK IF THIS PASSES.
   - If lint/format fails, run `npm run lint:fix` and `npm run format` to verify they auto-fix, then document the friction.
4. `npx opentabs-plugin inspect` — verify manifest (human-readable output)
5. `npx opentabs-plugin inspect --json` — verify manifest (machine-readable output)
6. `opentabs plugin list` — verify the plugin appears
7. `opentabs plugin list -v` — verify verbose output shows tool names
8. `opentabs plugin list --json` — verify JSON output format
9. `opentabs status` — verify tool count reflects the new plugin

### Phase 4: Build a real plugin using ALL SDK features

Modify the scaffolded plugin to exercise every SDK capability. IMPORTANT: Write all tool/resource/prompt code using single quotes (the scaffolded .prettierrc uses `singleQuote: true`). This ensures the code passes format:check without needing a format run.

Create a plugin for example.com with:

1. **Multiple tools** using `defineTool`:
   - A tool using DOM utilities: `getCurrentUrl`, `getPageTitle`, `querySelectorAll`, `getTextContent`
   - A tool using fetch utilities: `fetchJSON`, `retry`, `ToolError`
   - A tool using progress reporting: `context.reportProgress()`
   - A tool using storage: `getCookie`, `getLocalStorage`
   - A tool using page state: `getPageGlobal`
   - A tool using timing: `sleep`, `waitUntil`

2. **A resource** using `defineResource` — note whether `override` is needed on the `resources` property

3. **A prompt** using `definePrompt` with typed `args` (Zod schema)

4. **All lifecycle hooks**: `onActivate`, `onDeactivate`, `onNavigate`, `onToolInvocationStart`, `onToolInvocationEnd`

5. **Logging**: `log.info`, `log.debug`, `log.warn`, `log.error`

6. **Error handling**: `ToolError.auth()`, `ToolError.notFound()`, `ToolError.rateLimited()`, `ToolError.validation()`, `ToolError.timeout()`, `ToolError.internal()`

7. **isReady() implementation**: a real readiness check (e.g., `document.readyState`)

After writing all the code:
- `npm run build` — must succeed
- `npm run type-check` — must succeed
- `npm run lint` — check for errors
- `npm run format:check` — check for formatting violations
- `npx opentabs-plugin inspect` — verify all tools, resources, prompts appear

Document any TypeScript errors, confusing error messages, or missing documentation you encounter while writing the plugin (e.g., needing `override` on `resources`/`prompts` but not knowing it).

### Phase 5: Test the dev workflow and iterative changes

1. Test watch mode briefly: `timeout 15 npm run dev` — verify it starts and does an initial build
2. Test `opentabs-plugin build --watch` separately
3. **Iterative rebuild test** — make a small change to a tool file (e.g., update a description string), run `npm run build` again, and verify:
   - The rebuild succeeds
   - `npx opentabs-plugin inspect` reflects the change
   - The server was notified (check build output for "Notified MCP server")

### Phase 6: Test ALL plugin management CLI commands

Test every CLI command and subcommand. For each, document the output and any errors.

#### Plugin commands
1. `opentabs plugin search` — list available plugins
2. `opentabs plugin search slack`
3. `opentabs plugin search nonexistent-xyz-12345` — verify graceful empty result
4. `opentabs plugin install slack` — install from npm
5. `opentabs plugin list` — verify both local and npm plugins appear
6. `opentabs plugin list -v` — verbose output with tool names
7. `opentabs plugin list --json` — JSON output format
8. `opentabs plugin remove slack` (without --confirm) — verify it prompts
9. `opentabs plugin remove slack --confirm` — verify it removes

#### Config commands
10. `opentabs config show` — verify config contents
11. `opentabs config show --json` — JSON output format
12. `opentabs config show --show-secret` — verify secret is shown
13. `opentabs config path` — verify it prints the config file path
14. `opentabs config set tool.<plugin>_<tool> disabled` — disable a specific tool
15. `opentabs config set tool.<plugin>_<tool> enabled` — re-enable the tool
16. `opentabs config set localPlugins.add /nonexistent/path` — check error for bad path
17. `opentabs config set port 9999` — change port (may affect running server)

#### Server lifecycle commands
18. `opentabs start --show-config` — verify it shows MCP client config blocks
19. `opentabs logs` — verify log output
20. `opentabs logs --plugin my-plugin` — verify plugin-filtered logs
21. `opentabs audit` — verify audit log output (may be empty if no tool calls)
22. `opentabs stop` — stop the server
23. `opentabs status` — verify it shows "not running" after stop
24. Restart the server: `opentabs start` in background, verify it comes back up

### Phase 7: Test npx binary name resolution

Test what happens when a developer runs build tools using npx without having them installed locally:

1. **`npx opentabs-plugin build`** from outside a plugin directory:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npx opentabs-plugin build
   ```
   The binary name `opentabs-plugin` doesn't match the package name `@opentabs-dev/plugin-tools`, which may cause a confusing 404 error.

2. **`npx @opentabs-dev/plugin-tools build`** from outside a plugin directory:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npx @opentabs-dev/plugin-tools build
   ```
   Should give a clear "not a plugin directory" error instead of a 404.

3. **`npx opentabs-plugin inspect`** from outside a plugin directory — test the same pattern for inspect.

### Phase 8: Test error recovery and edge cases

1. **Inspect before build**: Remove the `dist/` directory from the plugin and run `npx opentabs-plugin inspect` — verify it gives a helpful error.
2. **Build with syntax error**: Introduce a deliberate TypeScript syntax error in a tool file, run `npm run build`, verify the error message is clear and points to the right file/line. Then fix it and rebuild.
3. **Build with missing import**: Remove an import that's used in the code, run `npm run build`, verify the type error is clear.
4. **Multiple plugins coexistence**: With the locally built plugin AND an npm-installed plugin both registered, verify `opentabs plugin list` and `opentabs status` show correct counts for both.

### Phase 9: Compile and test documentation code examples

This phase verifies that code snippets from the docs actually compile when copied into a real plugin project.

1. **First-plugin tutorial**: Create a fresh plugin (`tutorial-test`), copy the exact code from `docs/content/docs/first-plugin.mdx` steps 2 and 3 into it, run `npm run build`, `npm run type-check`, `npm run lint`, `npm run format:check`. ALL must pass.

2. **Resources-prompts full example**: Copy the "Full Plugin Example" code block from `docs/content/docs/guides/resources-prompts.mdx` (the complete TrackerPlugin) into a fresh plugin, build it, and check if it compiles. Pay attention to:
   - Does `fetchJSON<T>(url)` return `T` or `T | undefined`? If the latter, do the doc examples handle it?
   - Are `as const` assertions needed for prompt message roles/types?

3. **SDK utility patterns**: Verify that the documented patterns from `docs/content/docs/guides/plugin-development.mdx` (fetchJSON, retry, waitForSelector, getPageGlobal, etc.) compile without modification.

Document any doc code example that fails to compile and the exact error message.

### Phase 10: Cleanup

```bash
docker stop opentabs-plugin-dev-test
```

## Step 4: Evaluate every interaction for friction

For each step, evaluate from a first-time plugin developer's perspective:

1. **Scaffolding quality**: Does the generated code pass its own lint/format rules?
2. **Build toolchain**: Are errors clear? Does the build pipeline guide the developer?
3. **SDK discoverability**: Can the developer figure out how to use resources, prompts, lifecycle hooks from the scaffolded comments and types alone?
4. **TypeScript experience**: Are type errors clear? Is `override` documented? Do SDK function signatures produce confusing overload resolution errors?
5. **Documentation accuracy**: Do the documented commands actually work? Do code examples compile?
6. **Error messages**: Do errors tell the developer what to do next?
7. **CLI consistency**: Are patterns consistent across `opentabs` and `opentabs-plugin`?
8. **Iterative workflow**: Does modify-rebuild-test cycle work smoothly?
9. **Multi-plugin experience**: Do local and npm plugins coexist correctly?

## Step 5: Create PRD(s) using the ralph skill

After completing all testing, compile your findings and use the skill tool to load the "ralph" skill, then create PRD(s).

Key parameters:
- Determine the target project for each PRD based on which files need to change (see ralph skill instructions for project identification rules)
- If fixes span both platform code and docs, create SEPARATE PRDs for each target project
- Group related fixes into the same PRD to avoid merge conflicts (fixes to the same file go together)
- All stories: e2eCheckpoint: false (CLI/scaffold changes are not browser-observable)
- Always use small stories (1-3 files per story)
- Include repo-root-relative file paths and approximate line numbers in the notes field
- Every story must have concrete, verifiable acceptance criteria
- Skip clarifying questions — this prompt provides all the context needed

Severity triage (for prioritization, not for filtering):
- **HIGH**: Scaffolded code that fails its own quality checks, documented commands that don't work, doc code examples that don't compile
- **MEDIUM**: Missing guidance, confusing errors, poor discoverability, SDK type signature surprises
- **LOW**: Minor inconsistencies, edge case polish

Create PRDs for ALL severity levels — HIGH, MEDIUM, and LOW. Every genuine issue deserves a fix. Use severity to order stories (HIGH first) and to decide model (opus for complex HIGH issues, sonnet for straightforward fixes).

However, ruthlessly distinguish genuine issues from style preferences. Before filing any issue, ask: "Is this a real problem with a concrete consequence, or just a different way to write the same thing?" A different-but-equivalent approach is NOT an issue. Only file issues where you can articulate a specific harm: broken scaffolding, developer confusion, wasted time, misleading documentation, or incorrect behavior.

Do NOT create stories for:
- Lack of unit/mock testing (by design — plugins must test in a real browser)
- Chrome extension not working in Docker (expected — no GUI)
- Stylistic preferences about CLI output formatting
- Features that work correctly but you would design differently
- Zod version migration issues (e.g., z.record() signature changes in Zod 4) — these are upstream library changes, not platform bugs

DO create stories for:
- Scaffolded code that fails lint/format/type-check out of the box
- Documented commands that return errors
- Doc code examples that don't compile under the scaffolded tsconfig
- Missing TypeScript guidance that causes confusing compiler errors
- SDK function signatures that produce surprising types (e.g., returning T | undefined when docs show T)
- Error messages that don't help the developer fix the problem
- Documentation inaccuracies or inconsistencies between pages
PROMPT_EOF

echo "=== perfect-cli-plugin-developer.sh ==="
echo "Launching Claude to test plugin developer experience and create PRD(s)..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
