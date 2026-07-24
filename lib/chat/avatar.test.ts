import { describe, it, expect } from "vitest";
import { initials, colorFor } from "./avatar";

describe("initials", () => {
  it("uses first + last initial for a full name", () => {
    expect(initials("Sameer Prasad")).toBe("SP");
  });
  it("uses the first two letters of a single name", () => {
    expect(initials("Sameer")).toBe("SA");
  });
  it("collapses extra whitespace", () => {
    expect(initials("  Sameer   Kumar Prasad ")).toBe("SP");
  });
  it("falls back to ? for an empty name", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});

describe("colorFor", () => {
  it("is deterministic for the same seed", () => {
    expect(colorFor("abc")).toBe(colorFor("abc"));
  });
  it("returns a tailwind bg class from the palette", () => {
    expect(colorFor("anything")).toMatch(/^bg-[a-z]+-500$/);
  });
});
