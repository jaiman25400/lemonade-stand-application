import { ResponseError } from "@/src/gen/.kubb/client";

const REQUEST_TIMEOUT_MS = 10_000;

function timeoutSignal(): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return controller.signal;
}

export function requestSignal(external?: AbortSignal): AbortSignal {
  const timeout = timeoutSignal();
  if (!external) {
    return timeout;
  }
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([external, timeout]);
  }
  return external;
}

export function readKubbError(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") {
    return "Request timed out. Is the API running?";
  }

  if (error instanceof ResponseError) {
    const data = error.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message: unknown }).message;
      if (Array.isArray(message)) {
        return message.map(String).join("\n");
      }
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
    return `Request failed (${error.status})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed";
}
