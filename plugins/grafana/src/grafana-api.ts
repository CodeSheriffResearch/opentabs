import {
  type FetchFromPageOptions,
  ToolError,
  buildQueryString,
  fetchJSON,
  getPageGlobal,
  waitUntil,
} from '@opentabs-dev/plugin-sdk';

interface GrafanaBootUser {
  isSignedIn?: boolean;
  id?: number;
}

const getBootUser = (): GrafanaBootUser | null => {
  const user = getPageGlobal('grafanaBootData.user') as GrafanaBootUser | undefined;
  return user ?? null;
};

export const isAuthenticated = (): boolean => {
  const user = getBootUser();
  return user?.isSignedIn === true;
};

export const waitForAuth = async (): Promise<boolean> => {
  try {
    await waitUntil(() => isAuthenticated(), {
      interval: 500,
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
};

export const api = async <T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> => {
  if (!isAuthenticated()) {
    throw ToolError.auth('Not authenticated — please log in to Grafana.');
  }

  const qs = options.query ? buildQueryString(options.query) : '';
  const url = qs ? `/api${endpoint}?${qs}` : `/api${endpoint}`;

  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const init: FetchFromPageOptions = { method, headers };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  const data = await fetchJSON<T>(url, init);
  return data as T;
};
