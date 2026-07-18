import { describe, it, expect } from "vitest";
import { shouldEmailReply, REPLY_EMAIL_DEBOUNCE_MS } from "./replyEmail";
import { PRESENCE_WINDOW_MS } from "./presence";

const NOW = 1_700_000_000_000;
const OFFLINE = NOW - PRESENCE_WINDOW_MS - 1;

const base = {
  customerEmail: "buyer@acme.com",
  customerLastSeenAt: OFFLINE,
  lastEmailedAt: null as number | null,
  now: NOW,
};

describe("shouldEmailReply", () => {
  it("emails when the customer is offline and we have not emailed yet", () => {
    expect(shouldEmailReply(base)).toBe(true);
  });

  it("does NOT email while the customer is still watching — they can see the reply", () => {
    expect(shouldEmailReply({ ...base, customerLastSeenAt: NOW - 1_000 })).toBe(false);
  });

  it("does not email inside the debounce window — consecutive replies collapse into one", () => {
    expect(
      shouldEmailReply({ ...base, lastEmailedAt: NOW - (REPLY_EMAIL_DEBOUNCE_MS - 1) })
    ).toBe(false);
  });

  it("emails again once the debounce window has elapsed", () => {
    expect(shouldEmailReply({ ...base, lastEmailedAt: NOW - REPLY_EMAIL_DEBOUNCE_MS })).toBe(true);
  });

  it("does not email when there is no address to email", () => {
    expect(shouldEmailReply({ ...base, customerEmail: "" })).toBe(false);
    expect(shouldEmailReply({ ...base, customerEmail: "   " })).toBe(false);
  });

  it("emails a customer who has never heart-beat at all", () => {
    expect(shouldEmailReply({ ...base, customerLastSeenAt: null })).toBe(true);
  });
});
