import { afterEach, describe, expect, it, vi } from "vitest";
import { C, fetchPngBytes } from "./helpers";

describe("palette", () => {
  it("exposes navy and blueLight tokens", () => {
    expect(C.navy).toBeDefined();
    expect(C.blueLight).toBeDefined();
  });
});

describe("fetchPngBytes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns bytes on a successful fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
      })
    );
    expect(await fetchPngBytes("/logo.png")).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("returns null on an HTTP error response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchPngBytes("/logo.png")).toBeNull();
  });

  it("returns null when fetch throws (Node relative URL, offline)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    expect(await fetchPngBytes("/logo.png")).toBeNull();
  });
});
