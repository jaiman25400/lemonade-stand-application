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

function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    error.name === "TypeError" ||
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("econnrefused") ||
    message.includes("internet connection")
  );
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
