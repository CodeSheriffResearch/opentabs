/** Browser Tools Reference resource content. */

export const BROWSER_TOOLS_CONTENT = `# Browser Tools Reference

41 built-in tools organized by category. All browser tools are always available regardless of installed plugins.

## Tabs (6 tools)

| Tool | Description |
|------|-------------|
| \`browser_open_tab\` | Open a new browser tab with a URL. Returns the new tab ID |
| \`browser_list_tabs\` | List all open tabs with IDs, titles, URLs, and active status |
| \`browser_close_tab\` | Close a tab by ID |
| \`browser_navigate_tab\` | Navigate a tab to a new URL |
| \`browser_focus_tab\` | Focus a tab and bring its window to the foreground |
| \`browser_get_tab_info\` | Get tab details: loading status, URL, title, favicon, incognito |

## Page Interaction (7 tools)

| Tool | Description |
|------|-------------|
| \`browser_click_element\` | Click an element by CSS selector. Dispatches trusted mouse events via CDP |
| \`browser_type_text\` | Type text into an input/textarea. Focuses, optionally clears, sets value, dispatches events |
| \`browser_select_option\` | Select a \`<select>\` dropdown option by value or label |
| \`browser_press_key\` | Press a keyboard key (Enter, Escape, Tab, arrows, Ctrl+K, etc.) via CDP |
| \`browser_scroll\` | Scroll by selector (into view), direction (up/down/left/right), or absolute position |
| \`browser_hover_element\` | Hover over an element to trigger dropdowns, tooltips, and hover states |
| \`browser_handle_dialog\` | Handle JS dialogs (alert, confirm, prompt) that block page execution |

## Page Inspection (10 tools)

| Tool | Description |
|------|-------------|
| \`browser_get_tab_content\` | Extract visible text content from a page or element |
| \`browser_get_page_html\` | Get raw HTML (outerHTML) of a page or element |
| \`browser_screenshot_tab\` | Capture a screenshot as base64 PNG |
| \`browser_query_elements\` | Query elements by CSS selector, return tags, text, and attributes |
| \`browser_execute_script\` | Execute JavaScript in a tab's MAIN world with full DOM/window access |
| \`browser_get_console_logs\` | Get console messages (requires network capture active) |
| \`browser_clear_console_logs\` | Clear console log buffer without disabling capture |
| \`browser_list_resources\` | List all resources loaded by a page (scripts, CSS, images, fonts) |
| \`browser_get_resource_content\` | Read a resource's content from browser cache |
| \`browser_wait_for_element\` | Wait for an element to appear in the DOM (polls until found or timeout) |

## Storage & Cookies (5 tools)

| Tool | Description |
|------|-------------|
| \`browser_get_storage\` | Read localStorage or sessionStorage entries |
| \`browser_get_cookies\` | Get cookies for a URL (including HttpOnly) |
| \`browser_set_cookie\` | Set or overwrite a cookie |
| \`browser_delete_cookies\` | Delete a cookie by URL and name |

**Security note:** Storage and cookie tools expose sensitive auth data. Only use when the user directly requests it.

## Network (5 tools)

| Tool | Description |
|------|-------------|
| \`browser_enable_network_capture\` | Start capturing HTTP requests, responses, and WebSocket frames via CDP |
| \`browser_get_network_requests\` | Get captured requests with URLs, methods, headers, bodies, timing |
| \`browser_get_websocket_frames\` | Get captured WebSocket frames with direction, data, and timestamps |
| \`browser_export_har\` | Export captured traffic as a HAR 1.2 JSON file |
| \`browser_disable_network_capture\` | Stop capturing and release the CDP debugger |

Use \`urlFilter\` on \`browser_enable_network_capture\` to focus on API calls (e.g., "/api") and reduce noise.

**Security note:** Network capture records authorization headers and sensitive API traffic. Only use when the user directly requests it.

## Extension (6 tools)

| Tool | Description |
|------|-------------|
| \`extension_reload\` | Reload the Chrome extension (briefly disconnects) |
| \`extension_get_state\` | Get WebSocket status, registered plugins, active captures |
| \`extension_get_logs\` | Get extension background script and offscreen document logs |
| \`extension_get_side_panel\` | Get side panel React state and rendered HTML |
| \`extension_check_adapter\` | Diagnose adapter injection for a plugin across matching tabs |
| \`extension_force_reconnect\` | Force WebSocket disconnect and immediate reconnection |

## Plugins (2 tools)

| Tool | Description |
|------|-------------|
| \`plugin_list_tabs\` | List tabs matching a plugin's URL patterns with readiness status |
| \`plugin_analyze_site\` | Comprehensive site analysis for plugin development: auth, APIs, frameworks, storage, tool suggestions |

\`plugin_list_tabs\` reads from server-side state (no extension round-trip). Use it to discover tab IDs before targeting with \`tabId\`.

\`plugin_analyze_site\` opens the URL, captures network traffic, probes for frameworks/auth/APIs/storage, and returns concrete tool suggestions with implementation approaches.

## Platform Tools (always available, hidden from side panel)

| Tool | Description |
|------|-------------|
| \`plugin_inspect\` | Retrieve a plugin's adapter source code for security review + review token |
| \`plugin_mark_reviewed\` | Mark a plugin as reviewed and set its permission |

These bypass permission checks and are used in the plugin review flow.
`;
