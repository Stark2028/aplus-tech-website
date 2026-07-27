import { describe, it, expect } from "vitest";
import {
  shouldRetryStream,
  streamRetryDelayMs,
  MAX_STREAM_RETRIES,
  STREAM_RETRY_MAX_MS,
} from "./streamRetry";

describe("shouldRetryStream", () => {
  it("retries the first failure — a dead stream must not wait for a page reload", () => {
    expect(shouldRetryStream(1)).toBe(true);
  });

  it("keeps retrying while under the cap", () => {
    expect(shouldRetryStream(MAX_STREAM_RETRIES - 1)).toBe(true);
  });

  it("gives up once the cap is reached, so a hard failure surfaces instead of looping", () => {
    expect(shouldRetryStream(MAX_STREAM_RETRIES)).toBe(false);
    expect(shouldRetryStream(MAX_STREAM_RETRIES + 1)).toBe(false);
  });
});

describe("streamRetryDelayMs", () => {
  it("re-attaches the first retry quickly — the customer is staring at an empty thread", () => {
    expect(streamRetryDelayMs(1)).toBe(1_000);
  });

  it("backs off exponentially so a persistent outage is not hammered", () => {
    expect(streamRetryDelayMs(2)).toBe(2_000);
    expect(streamRetryDelayMs(3)).toBe(4_000);
    expect(streamRetryDelayMs(4)).toBe(8_000);
  });

  it("caps the backoff so the last retry is never absurdly far away", () => {
    expect(streamRetryDelayMs(10)).toBe(STREAM_RETRY_MAX_MS);
    expect(streamRetryDelayMs(MAX_STREAM_RETRIES)).toBeLessThanOrEqual(STREAM_RETRY_MAX_MS);
  });
});
