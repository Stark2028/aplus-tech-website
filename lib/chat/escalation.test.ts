import { describe, it, expect } from "vitest";
import { shouldEscalate, UNANSWERED_TIMEOUT_MS } from "./escalation";

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

  it("does not escalate twice — an already-flagged conversation is left alone", () => {
    expect(shouldEscalate({ ...base, needsFollowUp: true })).toBe(false);
  });

  it("does not escalate when the customer has never sent anything", () => {
    expect(shouldEscalate({ ...base, lastCustomerMessageAt: null })).toBe(false);
  });
});
