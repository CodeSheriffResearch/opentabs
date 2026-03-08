import { ToolError, getCookie, parseRetryAfterMs, waitUntil } from '@opentabs-dev/plugin-sdk';

/** Extract XSRF token from the `xsrfToken` cookie. */
const getXsrfToken = (): string | null => getCookie('xsrfToken');

/** Retool uses HttpOnly session cookies. Auth is detected by the xsrfToken cookie. */
export const isAuthenticated = (): boolean => getXsrfToken() !== null;

/** Poll for authentication readiness (SPA hydration). */
export const waitForAuth = (): Promise<boolean> =>
  waitUntil(() => isAuthenticated(), { interval: 500, timeout: 5000 }).then(
    () => true,
    () => false,
  );

/** Generic API caller for Retool's internal cookie-based API. */
export const api = async <T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> => {
  const xsrf = getXsrfToken();
  if (!xsrf) throw ToolError.auth('Not authenticated — please log in to Retool.');

  let url = endpoint;
  if (options.query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined) params.append(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Xsrf-Token': xsrf,
  };

  let fetchBody: string | undefined;
  if (options.body) {
    fetchBody = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: fetchBody,
      credentials: 'include',
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError') throw ToolError.timeout(`Timed out: ${endpoint}`);
    throw new ToolError(`Network error: ${err instanceof Error ? err.message : String(err)}`, 'network_error', {
      category: 'internal',
      retryable: true,
    });
  }

  if (!response.ok) {
    const body = (await response.text().catch(() => '')).substring(0, 512);
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw ToolError.rateLimited(`Rate limited: ${endpoint}`, retryAfter ? parseRetryAfterMs(retryAfter) : undefined);
    }
    if (response.status === 401 || response.status === 403)
      throw ToolError.auth(`Auth error (${response.status}): ${body}`);
    if (response.status === 404) throw ToolError.notFound(`Not found: ${endpoint}`);
    if (response.status === 422) throw ToolError.validation(`Validation error: ${body}`);
    throw ToolError.internal(`API error (${response.status}): ${endpoint} — ${body}`);
  }

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
};
