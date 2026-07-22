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

  it("accepts real Indian and international numbers", () => {
    expect(phone("9876543210")).toBe(true);
    expect(phone("+91 98765 43210")).toBe(true);
    expect(phone("+1 (555) 123-4567")).toBe(true);
  });

  it("rejects too-few and too-many digits", () => {
    expect(phone("12345")).toBe(false);
    expect(phone("1234567890123456789")).toBe(false);
  });

  it("rejects letters and other junk characters", () => {
    expect(phone("call me maybe")).toBe(false);
    expect(phone("98765abcde")).toBe(false);
  });
});
