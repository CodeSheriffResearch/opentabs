// ---------------------------------------------------------------------------
// Shared error types for the SDK
// ---------------------------------------------------------------------------

/** Standard error categories for structured error metadata. */
export type ErrorCategory = 'auth' | 'rate_limit' | 'not_found' | 'validation' | 'internal' | 'timeout';

/** Optional structured metadata for ToolError. */
export interface ToolErrorOptions {
  retryable?: boolean;
  retryAfterMs?: number;
  category?: ErrorCategory;
}

/**
 * Typed error for tool handlers — the platform catches these
 * and returns structured MCP error responses.
 */
export class ToolError extends Error {
  /** Whether this error is retryable (defaults to false). */
  readonly retryable: boolean;
  /** Suggested delay before retrying, in milliseconds. */
  readonly retryAfterMs: number | undefined;
  /** Error category for structured error classification. */
  readonly category: ErrorCategory | undefined;

  constructor(
    message: string,
    /** Machine-readable error code (e.g., 'CHANNEL_NOT_FOUND') */
    public readonly code: string,
    opts?: ToolErrorOptions,
  ) {
    super(message);
    this.name = 'ToolError';
    this.retryable = opts?.retryable ?? false;
    this.retryAfterMs = opts?.retryAfterMs;
    this.category = opts?.category;
  }

  /** Authentication or authorization error (not retryable). */
  static auth(message: string): ToolError {
    return new ToolError(message, 'AUTH_ERROR', { category: 'auth', retryable: false });
  }

  /** Resource not found (not retryable). Accepts an optional domain-specific code. */
  static notFound(message: string, code?: string): ToolError {
    return new ToolError(message, code ?? 'NOT_FOUND', { category: 'not_found', retryable: false });
  }

  /** Rate limited (retryable). Accepts an optional retry delay in milliseconds. */
  static rateLimited(message: string, retryAfterMs?: number): ToolError {
    return new ToolError(message, 'RATE_LIMITED', { category: 'rate_limit', retryable: true, retryAfterMs });
  }

  /** Input validation error (not retryable). */
  static validation(message: string): ToolError {
    return new ToolError(message, 'VALIDATION_ERROR', { category: 'validation', retryable: false });
  }

  /** Operation timed out (retryable). */
  static timeout(message: string): ToolError {
    return new ToolError(message, 'TIMEOUT', { category: 'timeout', retryable: true });
  }

  /** Internal/unexpected error (not retryable). */
  static internal(message: string): ToolError {
    return new ToolError(message, 'INTERNAL_ERROR', { category: 'internal', retryable: false });
  }
}
