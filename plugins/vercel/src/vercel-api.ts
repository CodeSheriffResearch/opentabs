import { ToolError, parseRetryAfterMs } from '@opentabs-dev/plugin-sdk';

// --- Auth ---

interface VercelAuth {
  /** Team slug extracted from the current URL (e.g., "my-teams-projects-691c04ab") */
  teamSlug: string | null;
}

/**
 * Vercel uses an HttpOnly `authorization` cookie containing a Bearer token.
 * The browser sends it automatically with `credentials: 'include'`.
 * Auth status is detected from the non-HttpOnly `isLoggedIn` cookie.
 * The API is same-origin at `/api/`.
 */
const getAuth = (): VercelAuth | null => {
  const persisted = getPersistedAuth();
  if (persisted) return persisted;

  if (!detectAuthentication()) return null;

  const auth: VercelAuth = { teamSlug: extractTeamSlug() };
  setPersistedAuth(auth);
  return auth;
};

const extractTeamSlug = (): string | null => {
  // URL pattern: /[teamSlug]/[project]/...
  const match = window.location.pathname.match(/^\/([a-z0-9][a-z0-9-]+)\//);
  if (match?.[1]) {
    // Exclude known non-team paths
    const excluded = new Set(['account', 'login', 'signup', 'new', 'api', 'docs', 'blog', 'import', 'integrations']);
    if (!excluded.has(match[1])) return match[1];
  }
  return null;
};

const detectAuthentication = (): boolean => {
  // Check the non-HttpOnly `isLoggedIn` cookie
  if (document.cookie.includes('isLoggedIn=1')) return true;

  return false;
};

// --- Token persistence on globalThis ---

const getPersistedAuth = (): VercelAuth | null => {
  try {
    const ns = (globalThis as Record<string, unknown>).__openTabs as Record<string, unknown> | undefined;
    const cache = ns?.tokenCache as Record<string, VercelAuth | undefined> | undefined;
    return cache?.vercel ?? null;
  } catch {
    return null;
  }
};

const setPersistedAuth = (auth: VercelAuth): void => {
  try {
    const g = globalThis as Record<string, unknown>;
    if (!g.__openTabs) g.__openTabs = {};
    const ns = g.__openTabs as Record<string, unknown>;
    if (!ns.tokenCache) ns.tokenCache = {};
    const cache = ns.tokenCache as Record<string, VercelAuth | undefined>;
    cache.vercel = auth;
  } catch {
    // Silently ignore
  }
};

const clearPersistedAuth = (): void => {
  try {
    const ns = (globalThis as Record<string, unknown>).__openTabs as Record<string, unknown> | undefined;
    const cache = ns?.tokenCache as Record<string, VercelAuth | undefined> | undefined;
    if (cache) cache.vercel = undefined;
  } catch {
    // Silently ignore
  }
};

// --- Public auth helpers ---

export const isVercelAuthenticated = (): boolean => getAuth() !== null;

export const waitForVercelAuth = (): Promise<boolean> =>
  new Promise(resolve => {
    let elapsed = 0;
    const interval = 500;
    const maxWait = 5000;
    const timer = setInterval(() => {
      elapsed += interval;
      if (isVercelAuthenticated()) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (elapsed >= maxWait) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });

/** Get the team slug from the current URL, if present */
export const getTeamSlug = (): string | null => {
  const auth = getAuth();
  return auth?.teamSlug ?? extractTeamSlug();
};

// --- API caller ---

type QueryValue = string | number | boolean | undefined;

export const vercelApi = async <T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    query?: Record<string, QueryValue | QueryValue[]>;
  } = {},
): Promise<T> => {
  const auth = getAuth();
  if (!auth) throw ToolError.auth('Not authenticated — please log in to Vercel.');

  // Build URL — Vercel API is same-origin at /api/
  let url = `/api${endpoint}`;
  const mergedQuery: Record<string, QueryValue | QueryValue[]> = { ...options.query };

  // Auto-inject teamId/slug for team-scoped requests
  if (auth.teamSlug && !mergedQuery.teamId && !mergedQuery.slug) {
    mergedQuery.slug = auth.teamSlug;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(mergedQuery)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined) params.append(key, String(v));
      }
    } else if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  if (qs) url += `?${qs}`;

  const headers: Record<string, string> = {};
  let fetchBody: string | undefined;

  if (options.body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(options.body);
  }

  const method = options.method ?? 'GET';
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: fetchBody,
      credentials: 'include',
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw ToolError.timeout(`API request timed out: ${endpoint}`);
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ToolError('Request was aborted', 'aborted');
    }
    throw new ToolError(`Network error: ${err instanceof Error ? err.message : String(err)}`, 'network_error', {
      category: 'internal',
      retryable: true,
    });
  }

  if (!response.ok) {
    const errorBody = (await response.text().catch(() => '')).substring(0, 512);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retryMs = retryAfter !== null ? parseRetryAfterMs(retryAfter) : undefined;
      throw ToolError.rateLimited(`Rate limited: ${endpoint} — ${errorBody}`, retryMs);
    }
    if (response.status === 401 || response.status === 403) {
      clearPersistedAuth();
      throw ToolError.auth(`Auth error (${response.status}): ${errorBody}`);
    }
    if (response.status === 404) {
      throw ToolError.notFound(`Not found: ${endpoint} — ${errorBody}`);
    }
    throw ToolError.internal(`API error (${response.status}): ${endpoint} — ${errorBody}`);
  }

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
};
