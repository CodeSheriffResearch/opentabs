import { ToolError } from '@opentabs-dev/plugin-sdk';

/**
 * Type-safe wrapper for E2E test server API calls.
 * Validates the response structure and throws ToolError on failure.
 *
 * @typeParam T - Expected shape of the successful response (excluding `ok` and `error`)
 * @param endpoint - API endpoint path (e.g., `/api/echo`, `/api/greet`)
 * @param body - Request body as a JSON-serializable object
 * @returns The parsed JSON response, typed as `T & { ok: true }`
 * @throws {ToolError} If the API returns `ok: false` or an invalid response
 */
const testApi = async <T extends Record<string, unknown>>(
  endpoint: string,
  body: Record<string, unknown> = {},
): Promise<T & { ok: true }> => {
  const signal = AbortSignal.timeout(30_000);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw ToolError.timeout(`testApi: request timed out after 30000ms for ${endpoint}`);
    }
    if (signal.aborted) {
      throw new ToolError(`testApi: request aborted for ${endpoint}`, 'aborted');
    }
    throw new ToolError(
      `testApi: network error for ${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
      'network_error',
      { category: 'internal', retryable: true },
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new ToolError(`Test server HTTP ${response.status}: ${errorText}`, 'http_error');
  }

  const data: unknown = await response.json();

  if (typeof data !== 'object' || data === null) {
    throw new ToolError('Invalid API response format', 'invalid_response');
  }

  const record = data as Record<string, unknown>;
  if (record.ok !== true) {
    const errorCode = typeof record.error_code === 'string' ? record.error_code : 'unknown_error';
    const errorMessage =
      typeof record.error_message === 'string'
        ? record.error_message
        : typeof record.error === 'string'
          ? record.error
          : errorCode;
    throw new ToolError(errorMessage, errorCode);
  }

  return data as T & { ok: true };
};

export { testApi };
