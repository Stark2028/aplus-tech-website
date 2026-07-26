import { describe, it, expect } from "vitest";
import { educationSegments, getEducationSegment } from "./educationSegments";
import * as education from "./education";

const BANNED = /authori[sz]ed|official|certified|partner/i;
const DROPPED = /CS-25|CS-40|CS-80|500,?000|500k|5,?000\+ schools|CR2032|12%/i;

const allText = JSON.stringify(educationSegments);

describe("educationSegments content truth policy", () => {
  it("contains zero partnership language", () => {
    expect(allText).not.toMatch(BANNED);
  });

  it("mentions Samsung only as 'Samsung C-Lab'", () => {
    expect(allText.match(/Samsung(?! C-Lab)/g) ?? []).toHaveLength(0);
  });

  it("reintroduces none of the dropped fabricated claims", () => {
    expect(allText).not.toMatch(DROPPED);
  });

  it("introduces no numeric claim absent from data/education.ts", () => {
    const known = new Set(
      (JSON.stringify(education).match(/\d[\d,.]*%?/g) ?? []).map((s) => s.replace(/[.,]$/, ""))
    );
    const used = (allText.match(/\d[\d,.]*%?/g) ?? []).map((s) => s.replace(/[.,]$/, ""));
    const novel = used.filter((n) => !known.has(n) && !/^(1|2|3|4|5|6|7|8|9|10|12)$/.test(n));
    expect(novel, `unverified numbers: ${novel.join(", ")}`).toEqual([]);
  });
});

describe("educationSegments shape", () => {
  it("has 3 segments with unique slugs", () => {
    expect(educationSegments).toHaveLength(3);
    expect(educationSegments.map((s) => s.slug).sort()).toEqual([
      "clickers-vs-alternatives",
      "coaching-institutes",
      "k-12-schools",
    ]);
  });

  it("exposes every segment through getEducationSegment", () => {
    for (const s of educationSegments) expect(getEducationSegment(s.slug)).toBe(s);
    expect(getEducationSegment("nope")).toBeUndefined();
  });

  it("every segment has a navLabel, 3+ points and 3+ faqs", () => {
    for (const s of educationSegments) {
      expect(s.navLabel.length).toBeGreaterThan(0);
      expect(s.points.length).toBeGreaterThanOrEqual(3);
      expect(s.faqs.length).toBeGreaterThanOrEqual(3);
      for (const f of s.faqs) expect(f.q.endsWith("?")).toBe(true);
    }
  });

  it("the comparison page names no leading stakeholder", () => {
    expect(getEducationSegment("clickers-vs-alternatives")!.leadStakeholder).toBeNull();
  });
});
