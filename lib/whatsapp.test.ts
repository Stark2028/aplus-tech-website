import { describe, it, expect } from "vitest";
import { buildWhatsAppWebUrl, buildWhatsAppUrl } from "./whatsapp";
import { WHATSAPP_NUMBER } from "./contact";
import { normalizeE164, buildWhatsAppUrlTo } from "./whatsapp";

describe("buildWhatsAppWebUrl", () => {
  it("builds a web.whatsapp.com/send URL with the canonical number", () => {
    const url = buildWhatsAppWebUrl("Hi there");
    expect(url).toBe(
      `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Hi%20there`
    );
  });

  it("URL-encodes special characters in the message", () => {
    const url = buildWhatsAppWebUrl("Q&A: pricing?");
    expect(url).toContain("text=Q%26A%3A%20pricing%3F");
    expect(url.startsWith("https://web.whatsapp.com/send?")).toBe(true);
  });

  it("still exposes wa.me via buildWhatsAppUrl (used for the QR payload)", () => {
    expect(buildWhatsAppUrl("Hi")).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi`);
  });
});

describe("normalizeE164", () => {
  it("prepends the default +91 to a bare 10-digit Indian number", () => {
    expect(normalizeE164("9310509909")).toBe("+919310509909");
  });

  it("strips separators and spaces", () => {
    expect(normalizeE164("93105 09909")).toBe("+919310509909");
    expect(normalizeE164("93105-099-09")).toBe("+919310509909");
    expect(normalizeE164("(931) 050-9909")).toBe("+919310509909");
  });

  it("drops a leading trunk zero before applying the country code", () => {
    expect(normalizeE164("09310509909")).toBe("+919310509909");
  });

  it("keeps an explicit + prefix as-is", () => {
    expect(normalizeE164("+919310509909")).toBe("+919310509909");
    expect(normalizeE164("+1 415 555 2671")).toBe("+14155552671");
  });

  it("treats a 12-digit number starting with 91 as already country-coded", () => {
    expect(normalizeE164("919310509909")).toBe("+919310509909");
  });

  it("honours a non-default country code", () => {
    expect(normalizeE164("4155552671", "1")).toBe("+14155552671");
  });

  it("returns null for anything unusable", () => {
    expect(normalizeE164("")).toBeNull();
    expect(normalizeE164("   ")).toBeNull();
    expect(normalizeE164("12345")).toBeNull();
    expect(normalizeE164("not a phone")).toBeNull();
    expect(normalizeE164("+9999999999999999999")).toBeNull();
  });
});

describe("buildWhatsAppUrlTo", () => {
  it("targets the CUSTOMER's number, not the business number", () => {
    const url = buildWhatsAppUrlTo("9310509909", "Hi Rahul");
    expect(url).toBe("https://wa.me/919310509909?text=Hi%20Rahul");
  });

  it("URL-encodes the pre-filled context line", () => {
    const url = buildWhatsAppUrlTo("+919999999999", "Following up on the QB65 — pricing?");
    expect(url).toContain("text=Following%20up%20on%20the%20QB65%20%E2%80%94%20pricing%3F");
  });

  it("returns null for an unusable phone so the console can hide the button", () => {
    expect(buildWhatsAppUrlTo("nope", "Hi")).toBeNull();
  });
});
