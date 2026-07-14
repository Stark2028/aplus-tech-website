import { describe, it, expect } from "vitest";
import {
  validateAttachment,
  isImageMime,
  formatBytes,
  MAX_ATTACHMENT_BYTES,
} from "./attachments";

const pdf = { name: "qb65.pdf", size: 1_000, type: "application/pdf" };

describe("validateAttachment", () => {
  it.each(["application/pdf", "image/png", "image/jpeg", "image/webp"])(
    "accepts an allowed type: %s",
    (type) => {
      expect(validateAttachment({ ...pdf, type })).toEqual({ ok: true });
    }
  );

  it("accepts a file exactly at the size limit", () => {
    expect(validateAttachment({ ...pdf, size: MAX_ATTACHMENT_BYTES })).toEqual({ ok: true });
  });

  it("rejects a file over 10 MB", () => {
    const result = validateAttachment({ ...pdf, size: MAX_ATTACHMENT_BYTES + 1 });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toContain("10 MB");
  });

  it("rejects a disallowed type — zip", () => {
    const result = validateAttachment({ name: "a.zip", size: 10, type: "application/zip" });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toContain("PDF");
  });

  it("rejects SVG — it is an XSS vector, not a safe image", () => {
    expect(validateAttachment({ name: "a.svg", size: 10, type: "image/svg+xml" }).ok).toBe(false);
  });

  it("rejects an empty file", () => {
    expect(validateAttachment({ ...pdf, size: 0 }).ok).toBe(false);
  });

  it("rejects a file with no MIME type at all", () => {
    expect(validateAttachment({ ...pdf, type: "" }).ok).toBe(false);
  });

  it("ignores a charset parameter on the content type", () => {
    expect(validateAttachment({ ...pdf, type: "application/pdf; charset=binary" })).toEqual({ ok: true });
  });

  it("matches the type case-insensitively", () => {
    expect(validateAttachment({ ...pdf, type: "IMAGE/PNG" })).toEqual({ ok: true });
  });
});

describe("isImageMime", () => {
  it("is true for the allowed image types (rendered inline)", () => {
    expect(isImageMime("image/png")).toBe(true);
    expect(isImageMime("image/webp")).toBe(true);
  });

  it("is false for PDF (rendered as a download card)", () => {
    expect(isImageMime("application/pdf")).toBe(false);
  });

  it("is false for SVG even though it starts with image/", () => {
    expect(isImageMime("image/svg+xml")).toBe(false);
  });
});

describe("formatBytes", () => {
  it("formats KB and MB", () => {
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(1_572_864)).toBe("1.5 MB");
  });

  it("formats bytes under 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });
});
