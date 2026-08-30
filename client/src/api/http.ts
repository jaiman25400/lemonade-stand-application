const REQUEST_TIMEOUT_MS = 10_000;

function timeoutReason(): Error {
  const error = new Error("Request timed out");
  error.name = "AbortError";
  return error;
}

/**
 * Caller cancellation (TanStack Query) plus a request deadline.
 *
 * Combined by hand rather than with `AbortSignal.any`, which is missing on some
 * React Native runtimes. Falling back to the caller's signal there would drop
 * the deadline silently and let a dead API hang until the socket gives up.
 */
export function requestSignal(external?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(timeoutReason()),
    REQUEST_TIMEOUT_MS,
  );

  controller.signal.addEventListener("abort", () => clearTimeout(timer), {
    once: true,
  });

  if (external) {
    if (external.aborted) {
      controller.abort(external.reason);
    } else {
      external.addEventListener(
        "abort",
        () => controller.abort(external.reason),
        { once: true },
      );
    }
  }

  return controller.signal;
}
