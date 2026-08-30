import { requestSignal } from "@/src/api/http";

describe("requestSignal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("aborts on its own deadline when no caller signal is given", () => {
    const signal = requestSignal();

    expect(signal.aborted).toBe(false);
    jest.advanceTimersByTime(10_000);
    expect(signal.aborted).toBe(true);
  });

  it("keeps the deadline even when a caller signal is combined", () => {
    const caller = new AbortController();
    const signal = requestSignal(caller.signal);

    jest.advanceTimersByTime(10_000);

    expect(signal.aborted).toBe(true);
    expect(caller.signal.aborted).toBe(false);
  });

  it("aborts immediately when the caller signal is already aborted", () => {
    const caller = new AbortController();
    caller.abort();

    expect(requestSignal(caller.signal).aborted).toBe(true);
  });

  it("follows a caller cancellation", () => {
    const caller = new AbortController();
    const signal = requestSignal(caller.signal);

    caller.abort();

    expect(signal.aborted).toBe(true);
  });
});
