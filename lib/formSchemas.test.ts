import { describe, expect, it } from "vitest";
import { contactFormSchema } from "./formSchemas";

// `phone` is a single shared field reused across every form schema, so testing
// it through contactFormSchema covers quote / lead-gate / Class Saathi too.
const phone = (v: string) => contactFormSchema.shape.phone.safeParse(v).success;

describe("phone validation", () => {
  it("rejects input with no digits", () => {
    expect(phone("--------")).toBe(false);
    expect(phone("(  )  -  ")).toBe(false);
  });

  it("accepts standard Indian mobile numbers", () => {
    expect(phone("9876543210")).toBe(true); // bare 10 digits
    expect(phone("+91 98765 43210")).toBe(true); // +91 country code
    expect(phone("+919876543210")).toBe(true); // +91, no spaces
    expect(phone("098765 43210")).toBe(true); // leading 0 trunk prefix
    expect(phone("6000000000")).toBe(true); // 6-prefix boundary
  });

  it("rejects non-Indian and malformed numbers", () => {
    expect(phone("+1 (555) 123-4567")).toBe(false); // international
    expect(phone("5876543210")).toBe(false); // invalid 5-prefix
    expect(phone("1234567890")).toBe(false); // invalid 1-prefix
  });

  it("rejects too-few and too-many digits", () => {
    expect(phone("12345")).toBe(false);
    expect(phone("98765432101")).toBe(false); // 11 digits, no trunk 0
    expect(phone("1234567890123456789")).toBe(false);
  });

  it("rejects letters and other junk characters", () => {
    expect(phone("call me maybe")).toBe(false);
    expect(phone("98765abcde")).toBe(false);
  });
});
