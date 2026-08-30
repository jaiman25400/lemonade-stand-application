import type { ResolvedRequest, TransportResult } from "@/src/gen/.kubb/client";

function contentTypeOf(headers: Headers): string | undefined {
  const value = headers.get("content-type");
  if (!value) {
    return undefined;
  }
  return value.split(";")[0]?.trim().toLowerCase();
}

/**
 * React Native's fetch often leaves `Response.body` unset even when the
 * payload is present. Kubb's default transport treats that as "no data",
 * which TanStack Query then rejects. Parse via text() instead.
 */
export async function reactNativeTransport(
  request: ResolvedRequest,
): Promise<TransportResult> {
  const init: RequestInit = {
    ...request.options,
    method: request.method,
    headers: request.headers,
    body: request.body,
    signal: request.signal,
  };
  if (request.credentials) {
    init.credentials = request.credentials;
  }

  const response = await fetch(request.url, init);
  const status = response.status;
  const emptyStatus = status === 204 || status === 205 || status === 304;
  const text = emptyStatus ? "" : await response.text();

  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return {
    data,
    status,
    statusText: response.statusText,
    headers: response.headers,
    contentType: contentTypeOf(response.headers),
    request: request as unknown as Request,
    response,
  };
}
