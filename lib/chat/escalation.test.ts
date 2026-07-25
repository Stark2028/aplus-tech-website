import { describe, it, expect } from "vitest";
import {
  shouldEscalate,
  shouldStopEscalating,
  MAX_ESCALATE_ATTEMPTS,
  UNANSWERED_TIMEOUT_MS,
} from "./escalation";

const NOW = 1_700_000_000_000;
const base = {
  lastCustomerMessageAt: NOW - UNANSWERED_TIMEOUT_MS,
  lastAgentMessageAt: null as number | null,
  needsFollowUp: false,
  now: NOW,
};

describe("shouldEscalate", () => {
  it("escalates once the timeout has elapsed with no agent reply", () => {
    expect(shouldEscalate(base)).toBe(true);
  });

  it("does not escalate before the timeout", () => {
    expect(shouldEscalate({ ...base, lastCustomerMessageAt: NOW - (UNANSWERED_TIMEOUT_MS - 1) })).toBe(false);
  });

  it("does not escalate when the agent replied after the customer's message", () => {
    expect(
      shouldEscalate({ ...base, lastAgentMessageAt: base.lastCustomerMessageAt + 1_000 })
    ).toBe(false);
  });

  it("still escalates when the agent's only reply predates the customer's message", () => {
    expect(
      shouldEscalate({ ...base, lastAgentMessageAt: base.lastCustomerMessageAt - 1_000 })
    ).toBe(true);
  });

  it("does NOT treat a same-millisecond agent reply as answered — still escalates", () => {
    expect(
      shouldEscalate({ ...base, lastAgentMessageAt: base.lastCustomerMessageAt })
    ).toBe(true);
  });

  it("does not escalate twice — an already-flagged conversation is left alone", () => {
    expect(shouldEscalate({ ...base, needsFollowUp: true })).toBe(false);
  });

  it("does not escalate when the customer has never sent anything", () => {
    expect(shouldEscalate({ ...base, lastCustomerMessageAt: null })).toBe(false);
  });
});

describe("shouldStopEscalating", () => {
  it("keeps retrying while under the attempt cap on transient failures", () => {
    expect(shouldStopEscalating(1, 500)).toBe(false);
    expect(shouldStopEscalating(MAX_ESCALATE_ATTEMPTS - 1, 500)).toBe(false);
    expect(shouldStopEscalating(1, null)).toBe(false); // network error
  });

  it("gives up once the attempt cap is reached", () => {
    expect(shouldStopEscalating(MAX_ESCALATE_ATTEMPTS, 500)).toBe(true);
    expect(shouldStopEscalating(MAX_ESCALATE_ATTEMPTS + 1, null)).toBe(true);
  });

  it("stops immediately on a 429, regardless of attempt count", () => {
    // Retrying a rate-limited endpoint every 20s only prolongs the storm.
    expect(shouldStopEscalating(0, 429)).toBe(true);
    expect(shouldStopEscalating(1, 429)).toBe(true);
  });
});
