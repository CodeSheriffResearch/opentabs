import { parseRetryAfterMs, ToolError } from '@opentabs-dev/plugin-sdk';

// ---------------------------------------------------------------------------
// MSAL token discovery
// ---------------------------------------------------------------------------

const MSAL_CLIENT_ID = '4b3e8f46-56d3-427f-b1e2-d239b2ea6bca';

/**
 * Scope suffix for the Skype API MSAL token. MSAL stores access tokens in
 * localStorage under long composite keys containing the tenant ID, home
 * account ID, client ID, and target scope separated by dashes. We search
 * for keys that end with a known scope suffix to locate the token.
 */
const SKYPE_API_SCOPE = 'service::api.fl.spaces.skype.com::mbi_ssl--';

interface MsalAccessToken {
  secret: string;
  expiresOn: string;
  cachedAt: string;
}

/**
 * Find an MSAL access token in localStorage by matching the client ID and
 * scope suffix in the key.
 */
const findMsalToken = (scopeSuffix: string): MsalAccessToken | null => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.includes(MSAL_CLIENT_ID) && key.endsWith(scopeSuffix)) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (typeof parsed.secret === 'string' && parsed.secret.length > 0) {
          return parsed as unknown as MsalAccessToken;
        }
      } catch {
        // Malformed entry — skip
      }
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Skype JWT exchange
// ---------------------------------------------------------------------------

/** Cached Skype JWT and its expiration time in milliseconds. */
let cachedSkypeJwt: { token: string; expiresAt: number } | null = null;

/**
 * Exchange the MSAL Skype API token for a Skype JWT via the consumer authz
 * endpoint. The JWT is cached until 60 seconds before expiration.
 */
const getSkypeJwt = async (): Promise<string> => {
  if (cachedSkypeJwt && Date.now() < cachedSkypeJwt.expiresAt - 60_000) {
    return cachedSkypeJwt.token;
  }

  const msalToken = findMsalToken(SKYPE_API_SCOPE);
  if (!msalToken) {
    throw ToolError.auth('Not authenticated — no MSAL Skype API token found. Please log in to Microsoft Teams.');
  }

  let response: Response;
  try {
    response = await fetch('https://teams.live.com/api/auth/v1.0/authz/consumer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${msalToken.secret}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw ToolError.timeout('Skype JWT exchange timed out');
    }
    throw ToolError.internal(`Skype JWT exchange failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      cachedSkypeJwt = null;
      throw ToolError.auth(`Skype JWT exchange auth error (${String(response.status)}): ${body.substring(0, 256)}`);
    }
    throw ToolError.internal(`Skype JWT exchange error (${String(response.status)}): ${body.substring(0, 256)}`);
  }

  const data = (await response.json()) as { skypeToken?: { skypetoken?: string; expiresIn?: number } };
  const jwt = data.skypeToken?.skypetoken;
  if (!jwt) {
    throw ToolError.internal('Skype JWT exchange returned empty token');
  }

  const expiresIn = data.skypeToken?.expiresIn ?? 3600;
  cachedSkypeJwt = { token: jwt, expiresAt: Date.now() + expiresIn * 1000 };
  return jwt;
};

// ---------------------------------------------------------------------------
// Authentication detection
// ---------------------------------------------------------------------------

export const isTeamsAuthenticated = (): boolean => findMsalToken(SKYPE_API_SCOPE) !== null;

/**
 * Wait for MSAL to populate the auth tokens after SPA hydration.
 * Polls at 500ms intervals for up to 8 seconds (Teams is a heavy SPA).
 */
export const waitForTeamsAuth = (): Promise<boolean> =>
  new Promise(resolve => {
    let elapsed = 0;
    const interval = 500;
    const maxWait = 8000;
    const timer = setInterval(() => {
      elapsed += interval;
      if (isTeamsAuthenticated()) {
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

// ---------------------------------------------------------------------------
// Chat Service API
// ---------------------------------------------------------------------------

const CHAT_SERVICE_BASE = 'https://teams.live.com/api/chatsvc/consumer';

/**
 * Make an authenticated request to the Teams Chat Service (Skype-based API).
 * Uses the Skype JWT obtained via MSAL token exchange.
 */
export const chatApi = async <T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> => {
  const skypeJwt = await getSkypeJwt();
  const { method = 'GET', body, query } = options;

  let url = `${CHAT_SERVICE_BASE}${endpoint}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    Authentication: `skypetoken=${skypeJwt}`,
    'Content-Type': 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw ToolError.timeout(`Teams Chat API timed out: ${method} ${endpoint}`);
    }
    throw ToolError.internal(
      `Network error calling Teams Chat API: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return handleApiResponse<T>(response, method, endpoint);
};

/**
 * Create a chat thread via the Chat Service. Returns the thread ID extracted
 * from the Location response header.
 */
export const createThread = async (
  members: Array<{ id: string; role: string }>,
  properties?: Record<string, unknown>,
): Promise<string> => {
  const skypeJwt = await getSkypeJwt();

  const body: Record<string, unknown> = { members };
  if (properties) body.properties = properties;

  let response: Response;
  try {
    response = await fetch(`${CHAT_SERVICE_BASE}/v1/threads`, {
      method: 'POST',
      headers: {
        Authentication: `skypetoken=${skypeJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw ToolError.timeout('Teams create thread timed out');
    }
    throw ToolError.internal(`Network error creating thread: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    classifyHttpError(response.status, errorText, 'POST', '/v1/threads', response.headers);
  }

  const location = response.headers.get('Location') ?? '';
  const threadId = location.split('/threads/').pop() ?? '';
  if (!threadId) {
    throw ToolError.internal('Thread created but no thread ID returned in Location header');
  }
  return threadId;
};

// ---------------------------------------------------------------------------
// Shared response handling
// ---------------------------------------------------------------------------

const handleApiResponse = async <T>(response: Response, method: string, endpoint: string): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    classifyHttpError(response.status, errorText, method, endpoint, response.headers);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw ToolError.internal(`Teams API returned invalid JSON: ${method} ${endpoint}`);
  }

  return data as T;
};

/** Classify HTTP errors into ToolError categories. Always throws. */
const classifyHttpError = (
  status: number,
  errorText: string,
  method: string,
  endpoint: string,
  headers: Headers,
): never => {
  const errorBody = errorText.substring(0, 512);

  if (status === 429) {
    const retryAfterHeader = headers.get('Retry-After');
    const retryMs = retryAfterHeader !== null ? parseRetryAfterMs(retryAfterHeader) : undefined;
    throw ToolError.rateLimited(`Teams API rate limited: ${method} ${endpoint} — ${errorBody}`, retryMs);
  }
  if (status === 401 || status === 403) {
    cachedSkypeJwt = null;
    throw ToolError.auth(`Teams API auth error (${String(status)}): ${errorBody}`);
  }
  if (status === 404) {
    throw ToolError.notFound(`Teams API not found: ${method} ${endpoint} — ${errorBody}`);
  }
  if (status === 400) {
    throw ToolError.validation(`Teams API bad request: ${method} ${endpoint} — ${errorBody}`);
  }
  throw ToolError.internal(`Teams API error (${String(status)}): ${method} ${endpoint} — ${errorBody}`);
};
