import { ResponseError } from "@/src/gen/.kubb/client";

export type ApiErrorKind = "timeout" | "network" | "http" | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(
    message: string,
    kind: ApiErrorKind = "unknown",
    status?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export function userErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

function nestMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return undefined;
  }
  const message = (data as { message: unknown }).message;
  if (Array.isArray(message)) {
    return message.map(String).join("\n");
  }
  if (typeof message === "string" && message.length > 0) {
    return message;
  }
  return undefined;
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Fetch rejects with a TypeError when the host is unreachable, but so does
 * ordinary broken code. Match the message, not the constructor, so a genuine
 * bug is not disguised as an outage.
 */
const NETWORK_MESSAGES = [
  "network request failed",
  "failed to fetch",
  "network error",
  "econnrefused",
  "internet connection",
  "load failed",
];

function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return NETWORK_MESSAGES.some((fragment) => message.includes(fragment));
}

/** Maps transport / Nest failures to a message the customer can act on. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAbort(error)) {
    return new ApiError(
      "Request timed out. Check that the API is running.",
      "timeout",
    );
  }

  if (error instanceof ResponseError) {
    if (error.status >= 500) {
      return new ApiError(
        "The server had a problem. Try again in a moment.",
        "http",
        error.status,
      );
    }
    return new ApiError(
      nestMessage(error.data) ?? `Request failed (${error.status})`,
      "http",
      error.status,
    );
  }

  if (isNetworkFailure(error)) {
    return new ApiError(
      "Can't reach the API. Start Nest on your PC and stay on the same Wi-Fi.",
      "network",
    );
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return new ApiError(error.message, "unknown");
  }

  return new ApiError("Something went wrong. Try again.", "unknown");
}

/** Retry GET once on network failure only. Never retry 4xx/5xx or timeouts. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.kind !== "network") {
    return false;
  }
  return failureCount < 1;
}
