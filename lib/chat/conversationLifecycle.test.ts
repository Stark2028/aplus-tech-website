import { describe, it, expect } from "vitest";
import { isConversationDeleted } from "./conversationLifecycle";

describe("isConversationDeleted", () => {
  it("is true when the server confirms the doc is gone", () => {
    expect(isConversationDeleted({ exists: false, fromCache: false })).toBe(true);
  });

  it("is false while the doc still exists", () => {
    expect(isConversationDeleted({ exists: true, fromCache: false })).toBe(false);
  });

  it("ignores a cache-only miss — an uncached returning visitor or an offline blip", () => {
    // The critical case: a false here would boot a valid visitor to the pre-chat
    // form on first attach, before the server has confirmed the doc exists.
    expect(isConversationDeleted({ exists: false, fromCache: true })).toBe(false);
  });

  it("is false for an existing doc served from cache", () => {
    expect(isConversationDeleted({ exists: true, fromCache: true })).toBe(false);
  });
});
