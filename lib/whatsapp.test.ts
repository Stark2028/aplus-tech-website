import { describe, it, expect } from "vitest";
import { buildWhatsAppWebUrl, buildWhatsAppUrl } from "./whatsapp";
import { WHATSAPP_NUMBER } from "./contact";

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
