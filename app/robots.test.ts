import { describe, it, expect } from "vitest";
import robots, { AI_CRAWLERS } from "./robots";

describe("robots.txt AI crawler policy", () => {
  const rules = () => {
    const r = robots().rules;
    return Array.isArray(r) ? r : [r];
  };

  it("names every AI crawler we intend to allow", () => {
    const agents = rules().flatMap((r) =>
      Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent ?? ""],
    );
    for (const bot of AI_CRAWLERS) {
      expect(agents, `${bot} missing from robots.txt`).toContain(bot);
    }
  });

  it("allows crawling for every AI agent", () => {
    for (const rule of rules()) {
      expect(rule.allow).toBe("/");
    }
  });

  it("applies the identical disallow list to every rule", () => {
    const lists = rules().map((r) => JSON.stringify(r.disallow));
    expect(new Set(lists).size, "disallow lists diverged between rules").toBe(1);
  });

  it("still blocks the private surfaces", () => {
    const d = rules()[0].disallow as string[];
    expect(d).toEqual(
      expect.arrayContaining(["/api/", "/compare", "/quote", "/admin/", "/private/"]),
    );
  });

  it("keeps the sitemap reference", () => {
    expect(robots().sitemap).toBe("https://www.aplustechsol.com/sitemap.xml");
  });
});
