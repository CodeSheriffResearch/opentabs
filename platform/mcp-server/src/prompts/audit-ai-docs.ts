/**
 * audit_ai_docs prompt — workflow for auditing and improving the AI-facing
 * documentation served by the MCP server (instructions, resources, prompts).
 */

export const auditAiDocsPromptText =
  (): string => `Audit and improve the AI-facing documentation that the OpenTabs MCP server serves to connected AI clients.

---

## Core Philosophy

OpenTabs is a platform for AI clients. The MCP server is the primary documentation layer for AI; the docs/ site is the secondary layer for humans. Three MCP mechanisms serve AI clients:

| Mechanism | Delivery | Purpose |
|---|---|---|
| **Instructions** | Push (initialize) | System prompt. Concise rules, security, capability overview. Always present. |
| **Resources** | Pull (resources/read) | Detailed guides, API references, live state. Fetched on demand. |
| **Prompts** | Pull (prompts/get) | Task-oriented workflows invoked by the user. |

**Placement rules:** Instructions are expensive (always in context — keep under 120 lines / 6000 chars). Resources are cheap (fetched when needed — can be long). Prompts are workflows (user-triggered — include specific tool calls).

---

## Phase 1: Audit What Exists

Read the current AI-facing documentation layer:

1. **Instructions** — read \`platform/mcp-server/src/mcp-setup.ts\`, find the \`SERVER_INSTRUCTIONS\` constant. Assess: concise? covers security? mentions resources and prompts? under 120-line budget?

2. **Resources** — read \`platform/mcp-server/src/mcp-resources.ts\` and the files in \`platform/mcp-server/src/resources/\`. List every resource URI, check if content is populated.

3. **Prompts** — read \`platform/mcp-server/src/mcp-prompts.ts\` and the files in \`platform/mcp-server/src/prompts/\`. List every prompt, its arguments, and assess quality.

4. **Tool descriptions** — sample 5-10 browser tools from \`platform/mcp-server/src/browser-tools/\`. Are descriptions informative enough for AI?

5. **Capabilities** — check the \`capabilities\` object in \`createMcpServer\`. What's declared? What's missing?

---

## Phase 2: Verify Accuracy Against Source Code

Every fact in the AI docs must match the actual codebase. Cross-reference:

| AI doc claim | Verify against |
|---|---|
| CLI command formats | \`platform/cli/src/commands/*.ts\` |
| Config key formats | \`platform/cli/src/commands/config.ts\` (SUPPORTED_KEYS) |
| SDK utility functions | \`platform/plugin-sdk/src/sdk.ts\` |
| ToolError factories | \`platform/plugin-sdk/src/errors.ts\` |
| Lifecycle hooks | \`platform/plugin-sdk/src/plugin.ts\` |
| WebSocket methods | \`platform/mcp-server/src/extension-protocol.ts\` |
| Health endpoint fields | \`platform/mcp-server/src/http-routes.ts\` |
| Permission model | \`platform/mcp-server/src/state.ts\` |
| Browser tool count | \`platform/mcp-server/src/browser-tools/index.ts\` |
| ToolDefinition interface | \`platform/plugin-sdk/src/index.ts\` |
| PluginPermissionConfig | \`platform/shared/src/index.ts\` |

**Common drift patterns:**
- Permission terminology (enabled/disabled → off/ask/auto)
- Config key formats (tool.X → tool-permission.X)
- Health endpoint renames (confirmationBypassed → skipPermissions)
- WebSocket method renames (setToolEnabled → setToolPermission)
- New SDK utilities not documented
- New ToolDefinition fields (summary, group) missing

---

## Phase 3: Identify Gaps

For each actor type, ask: if an AI client connected now and the user asked X, would the AI have enough information?

**Normal user:**
- "Install OpenTabs and set it up" — quick-start resource?
- "What plugins are available?" — knows about \`opentabs plugin search\`?
- "This tool isn't working" — troubleshooting resource?

**Plugin developer:**
- "Build a plugin for X" — build_plugin prompt + plugin-development resource?
- "What SDK utilities exist?" — SDK reference resource?
- "How do I handle auth?" — plugin-development resource?

**Platform contributor:**
- "How is the codebase structured?" — architecture resource?
- "How do I run the dev server?" — dev setup covered?

---

## Phase 4: Write or Update Content

**Where content lives:**

| Content type | File |
|---|---|
| Instructions | \`platform/mcp-server/src/mcp-setup.ts\` (\`SERVER_INSTRUCTIONS\`) |
| Quick start guide | \`platform/mcp-server/src/resources/quick-start.ts\` |
| Plugin dev guide | \`platform/mcp-server/src/resources/plugin-development.ts\` |
| Troubleshooting | \`platform/mcp-server/src/resources/troubleshooting.ts\` |
| SDK API reference | \`platform/mcp-server/src/resources/sdk-api.ts\` |
| CLI reference | \`platform/mcp-server/src/resources/cli.ts\` |
| Browser tools ref | \`platform/mcp-server/src/resources/browser-tools.ts\` |
| Dynamic status | \`platform/mcp-server/src/resources/status.ts\` |
| Build plugin prompt | \`platform/mcp-server/src/prompts/build-plugin.ts\` |
| Troubleshoot prompt | \`platform/mcp-server/src/prompts/troubleshoot.ts\` |
| Setup plugin prompt | \`platform/mcp-server/src/prompts/setup-plugin.ts\` |
| This prompt | \`platform/mcp-server/src/prompts/audit-ai-docs.ts\` |

**Writing for AI consumption (not humans):**

| Human docs | AI docs |
|---|---|
| Friendly tone | Direct, information-dense |
| Progressive disclosure | All facts upfront |
| Narrative | Structured tables and lists |
| Screenshots | Code blocks and exact commands |
| Conceptual overview first | Working example first |

**Size guidelines:**
- Instructions: ≤120 lines / 6000 chars
- Guides: 150-400 lines
- References: 100-250 lines

---

## Phase 5: Verify

After making changes:

\`\`\`bash
npm run build         # Server must compile
npm run type-check    # TypeScript check
npm run lint          # Biome lint
npm run knip          # Unused code detection
npm run test          # Unit tests
\`\`\`

---

## Phase 6: Write Learnings Back

If the audit reveals new drift patterns or common issues, add them to the Common Issues section at the bottom of this prompt (\`platform/mcp-server/src/prompts/audit-ai-docs.ts\`).

---

## Common Issues to Check

1. **Stale permission terminology** — codebase uses \`off/ask/auto\`. Search for \`enabled/disabled\` or \`allow_once/allow_always/deny\`.
2. **Config key format drift** — actual: \`tool-permission.<plugin>.<tool>\` and \`plugin-permission.<plugin>\`. Search for \`tool.<plugin>_<tool>\`.
3. **Health endpoint field renames** — \`skipPermissions\` not \`confirmationBypassed\`.
4. **Missing ToolDefinition fields** — \`summary\`, \`group\`, \`icon\` often omitted.
5. **WebSocket method renames** — actual: \`config.setToolPermission\`, \`config.setPluginPermission\`, \`config.setSkipPermissions\`.
6. **SDK utility additions** — new functions in \`plugin-sdk/src/sdk.ts\` not in resource.
7. **Browser tool count** — currently 40. Check \`browser-tools/index.ts\`.
8. **\`reviewedVersion\` field** — part of \`PluginPermissionConfig\`, often missing from docs.
9. **Confirmation response** — \`{ id, decision: 'allow' | 'deny', alwaysAllow?: boolean }\`.
10. **Resource content accuracy** — resource content drifts just like human docs.`;
