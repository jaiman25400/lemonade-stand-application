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
