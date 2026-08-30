import { ResponseError } from "@/src/gen/.kubb/client";
import {
  ApiError,
  shouldRetryQuery,
  toApiError,
  userErrorMessage,
} from "@/src/api/errors";

function abortError(): Error {
  const error = new Error("Aborted");
  error.name = "AbortError";
  return error;
}

function httpError(status: number, data: unknown): ResponseError {
  return new ResponseError({
    data,
    status,
    statusText: "Error",
    request: {} as Request,
    response: {} as Response,
  });
}

describe("toApiError", () => {
  it("maps a timeout to an actionable message", () => {
    const error = toApiError(abortError());

    expect(error.kind).toBe("timeout");
    expect(error.message).toMatch(/timed out/i);
  });

  it("maps a disconnected API to a network message", () => {
    const error = toApiError(new TypeError("Network request failed"));

    expect(error.kind).toBe("network");
    expect(error.message).toMatch(/can't reach the api/i);
  });

  it("does not disguise a genuine TypeError as an outage", () => {
    const error = toApiError(
      new TypeError("Cannot read properties of undefined (reading 'sizes')"),
    );

    expect(error.kind).toBe("unknown");
    expect(error.message).toMatch(/reading 'sizes'/);
  });

  it("surfaces Nest validation text on 4xx", () => {
    const error = toApiError(
      httpError(400, { message: "phone must be a valid phone number" }),
    );

    expect(error.kind).toBe("http");
    expect(error.status).toBe(400);
    expect(error.message).toBe("phone must be a valid phone number");
  });

  it("joins Nest validation arrays", () => {
    const error = toApiError(
      httpError(400, { message: ["customerName should not be empty"] }),
    );

    expect(error.message).toBe("customerName should not be empty");
  });

  it("hides 5xx internals behind a generic server message", () => {
    const error = toApiError(httpError(500, { message: "query failed" }));

    expect(error.kind).toBe("http");
    expect(error.message).toMatch(/server had a problem/i);
  });
});

describe("shouldRetryQuery", () => {
  it("retries a network failure once", () => {
    const error = new ApiError("down", "network");

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  it("does not retry timeouts or HTTP errors", () => {
    expect(shouldRetryQuery(0, new ApiError("timeout", "timeout"))).toBe(
      false,
    );
    expect(shouldRetryQuery(0, new ApiError("bad request", "http", 400))).toBe(
      false,
    );
  });
});

describe("userErrorMessage", () => {
  it("uses the Error message when present", () => {
    expect(userErrorMessage(new Error("Can't reach the API"), "fallback")).toBe(
      "Can't reach the API",
    );
  });

  it("falls back when the value is not an Error", () => {
    expect(userErrorMessage(null, "Could not load beverages")).toBe(
      "Could not load beverages",
    );
  });
});
