import { describe, it, expect } from "vitest";
import { isAiReferrer, AI_REFERRER_HOSTS } from "./aiReferrers";

describe("isAiReferrer", () => {
  it("matches the major answer engines", () => {
    expect(isAiReferrer("https://chatgpt.com/")).toBe(true);
    expect(isAiReferrer("https://www.perplexity.ai/search?q=x")).toBe(true);
    expect(isAiReferrer("https://claude.ai/chat/1")).toBe(true);
    expect(isAiReferrer("https://gemini.google.com/app")).toBe(true);
  });

  it("does not match ordinary search or social", () => {
    expect(isAiReferrer("https://www.google.com/search?q=x")).toBe(false);
    expect(isAiReferrer("https://in.linkedin.com/company/x")).toBe(false);
  });

  it("does not match a lookalike domain", () => {
    expect(isAiReferrer("https://notchatgpt.com.evil.test/")).toBe(false);
  });

  it("tolerates junk input", () => {
    expect(isAiReferrer("")).toBe(false);
    expect(isAiReferrer("not a url")).toBe(false);
  });

  it("exposes the host list for dashboards", () => {
    expect(AI_REFERRER_HOSTS.length).toBeGreaterThan(4);
  });
});
