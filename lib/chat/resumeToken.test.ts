import { describe, it, expect } from "vitest";
import { signResumeToken, verifyResumeToken, buildResumeUrl } from "./resumeToken";

const SECRET = "test-secret-do-not-use-in-production";
const CONV = "conv_abc123";

describe("signResumeToken", () => {
  it("produces a 64-char hex digest", () => {
    expect(signResumeToken(CONV, SECRET)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(signResumeToken(CONV, SECRET)).toBe(signResumeToken(CONV, SECRET));
  });

  it("differs per conversation and per secret", () => {
    expect(signResumeToken(CONV, SECRET)).not.toBe(signResumeToken("conv_other", SECRET));
    expect(signResumeToken(CONV, SECRET)).not.toBe(signResumeToken(CONV, "other-secret"));
  });
});

describe("verifyResumeToken", () => {
  it("accepts a token it just signed", () => {
    expect(verifyResumeToken(CONV, signResumeToken(CONV, SECRET), SECRET)).toBe(true);
  });

  it("rejects a tampered token", () => {
    const token = signResumeToken(CONV, SECRET);
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    expect(verifyResumeToken(CONV, tampered, SECRET)).toBe(false);
  });

  it("rejects a token minted for a DIFFERENT conversation — no cross-thread access", () => {
    const token = signResumeToken("conv_other", SECRET);
    expect(verifyResumeToken(CONV, token, SECRET)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    expect(verifyResumeToken(CONV, signResumeToken(CONV, "wrong"), SECRET)).toBe(false);
  });

  it("rejects malformed input without throwing", () => {
    expect(verifyResumeToken(CONV, "", SECRET)).toBe(false);
    expect(verifyResumeToken(CONV, "not-hex", SECRET)).toBe(false);
    expect(verifyResumeToken(CONV, "abc", SECRET)).toBe(false);
    expect(verifyResumeToken(CONV, "A".repeat(64), SECRET)).toBe(false);
  });
});

describe("buildResumeUrl", () => {
  it("builds an absolute URL carrying the conversation id and its token", () => {
    const url = new URL(buildResumeUrl(CONV, SECRET));
    expect(url.pathname).toBe("/api/chat/resume");
    expect(url.searchParams.get("c")).toBe(CONV);
    expect(verifyResumeToken(CONV, url.searchParams.get("token")!, SECRET)).toBe(true);
  });
});
