import { describe, it, expect } from "vitest";
import { isNearBottom } from "./scroll";

describe("isNearBottom", () => {
  it("is true when pinned exactly to the bottom", () => {
    expect(isNearBottom({ scrollTop: 900, scrollHeight: 1000, clientHeight: 100 })).toBe(true);
  });

  it("is true within the default 120px threshold", () => {
    expect(isNearBottom({ scrollTop: 800, scrollHeight: 1000, clientHeight: 100 })).toBe(true);
  });

  it("is false when scrolled up beyond the threshold", () => {
    expect(isNearBottom({ scrollTop: 500, scrollHeight: 1000, clientHeight: 100 })).toBe(false);
  });

  it("honors a custom threshold", () => {
    expect(isNearBottom({ scrollTop: 500, scrollHeight: 1000, clientHeight: 100 }, 400)).toBe(true);
  });

  it("is true for content shorter than the viewport", () => {
    expect(isNearBottom({ scrollTop: 0, scrollHeight: 80, clientHeight: 100 })).toBe(true);
  });
});
