import { describe, it, expect } from "vitest";
import { buildLlmsTxt } from "./llmsTxt";
import sitemap from "@/app/sitemap";
import { SAMSUNG_CREDENTIAL } from "./credentials";

const body = buildLlmsTxt();

describe("buildLlmsTxt", () => {
  it("opens with an H1 and a blockquote summary", () => {
    const lines = body.split("\n");
    expect(lines[0]).toMatch(/^# /);
    expect(body).toMatch(/\n> /);
  });

  it("states the Samsung credential", () => {
    expect(body).toContain(SAMSUNG_CREDENTIAL);
  });

  it("links the model-code reference page", () => {
    expect(body).toContain("/samsung-india-model-codes");
  });

  it("only emits URLs that exist in the sitemap", () => {
    const known = new Set(sitemap().map((e) => e.url));
    const urls = body.match(/https:\/\/www\.aplustechsol\.com[^\s)]*/g) ?? [];
    const orphans = [...new Set(urls)].filter((u) => !known.has(u));
    expect(orphans, `llms.txt references URLs absent from the sitemap`).toEqual([]);
  });

  it("never invents ratings or prices", () => {
    // Word-anchored: an unanchored /rating/ also matches "operating".
    expect(body).not.toMatch(/\b(rating|ratings|review|reviews|price|pricing)\b/i);
    expect(body).not.toContain("₹");
  });
});
