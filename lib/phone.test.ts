import { describe, expect, it } from "vitest";
import { extractIndianMobile, sanitizeIndianPhoneInput } from "./phone";

describe("extractIndianMobile", () => {
  it("canonicalises accepted Indian formats to 10 digits", () => {
    expect(extractIndianMobile("9876543210")).toBe("9876543210");
    expect(extractIndianMobile("+91 98765 43210")).toBe("9876543210");
    expect(extractIndianMobile("+919876543210")).toBe("9876543210");
    expect(extractIndianMobile("098765 43210")).toBe("9876543210"); // trunk 0
    expect(extractIndianMobile("(987) 654-3210")).toBe("9876543210");
  });

  it("accepts every valid mobile prefix (6-9)", () => {
    for (const first of ["6", "7", "8", "9"]) {
      expect(extractIndianMobile(`${first}000000000`)).toBe(`${first}000000000`);
    }
  });

  it("rejects invalid prefixes (0-5)", () => {
    for (const first of ["0", "1", "2", "3", "4", "5"]) {
      expect(extractIndianMobile(`${first}000000000`)).toBeNull();
    }
  });

  it("rejects wrong-length and non-Indian numbers", () => {
    expect(extractIndianMobile("12345")).toBeNull();
    expect(extractIndianMobile("98765432101")).toBeNull(); // 11 digits, no trunk 0
    expect(extractIndianMobile("+1 (555) 123-4567")).toBeNull(); // US number
    expect(extractIndianMobile("")).toBeNull();
    expect(extractIndianMobile("no digits here")).toBeNull();
  });
});

describe("sanitizeIndianPhoneInput", () => {
  it("keeps digits and readable separators", () => {
    expect(sanitizeIndianPhoneInput("+91 98765-43210")).toBe("+91 98765-43210");
    expect(sanitizeIndianPhoneInput("(987) 654 3210")).toBe("(987) 654 3210");
  });

  it("drops letters and stray symbols immediately", () => {
    expect(sanitizeIndianPhoneInput("98765abc43210")).toBe("9876543210");
    expect(sanitizeIndianPhoneInput("98765#43210!")).toBe("9876543210");
  });

  it("only keeps a leading +", () => {
    expect(sanitizeIndianPhoneInput("98+765")).toBe("98765");
    expect(sanitizeIndianPhoneInput("+98765")).toBe("+98765");
  });

  it("caps the digit count at 12 (+91 plus a 10-digit mobile)", () => {
    expect(sanitizeIndianPhoneInput("+919876543210999")).toBe("+919876543210");
    expect(sanitizeIndianPhoneInput("1234567890123456789")).toBe("123456789012");
  });
});
