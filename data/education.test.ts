import { describe, it, expect } from "vitest";
import * as education from "./education";
import {
  educationAwards,
  educationFaqs,
  ecosystemTabs,
  simulatorQuestions,
  howItWorksSteps,
} from "./education";
import { productCategories, getCategoryById } from "./categories";
import { categoriesWithProducts } from "@/lib/nonEmptyCategories";

/** Flatten every string in the module for content-policy scans. */
function allText(): string {
  return JSON.stringify(education);
}

describe("education content truth policy", () => {
  it("contains zero partnership language", () => {
    expect(allText()).not.toMatch(/authori[sz]ed|official|certified|partner/i);
  });

  it("mentions Samsung only as 'Samsung C-Lab' attribution", () => {
    const text = allText();
    const samsungHits = text.match(/Samsung(?! C-Lab)/g) ?? [];
    expect(samsungHits).toHaveLength(0);
  });

  it("contains none of the dropped fabricated claims", () => {
    expect(allText()).not.toMatch(/CS-25|CS-40|CS-80|500,?000|500k|5,?000\+ schools|CR2032|12%/i);
  });
});

describe("education content shape", () => {
  it("has exactly 8 awards, all with title/issuer/year", () => {
    expect(educationAwards).toHaveLength(8);
    for (const a of educationAwards) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.issuer.length).toBeGreaterThan(0);
      expect(a.year).toMatch(/^\d{4}$/);
    }
  });

  it("has exactly 6 FAQs with non-empty answers", () => {
    expect(educationFaqs).toHaveLength(6);
    for (const f of educationFaqs) {
      expect(f.q.endsWith("?")).toBe(true);
      expect(f.a.length).toBeGreaterThan(40);
    }
  });

  it("has the 4 stakeholder tabs in order", () => {
    expect(ecosystemTabs.map((t) => t.id)).toEqual(["teacher", "student", "parent", "admin"]);
    for (const t of ecosystemTabs) {
      expect(t.features.length).toBeGreaterThanOrEqual(3);
      expect(t.image).toMatch(/^\/education\/class-saathi\/.+\.webp$/);
    }
  });

  it("has 4 how-it-works steps (brochure p.9)", () => {
    expect(howItWorksSteps).toHaveLength(4);
  });

  it("simulator questions are well-formed and answerable", () => {
    expect(simulatorQuestions.length).toBeGreaterThanOrEqual(4);
    for (const q of simulatorQuestions) {
      expect(["A", "B", "C", "D"]).toContain(q.correct);
      expect(Object.keys(q.options)).toEqual(["A", "B", "C", "D"]);
      const total = Object.values(q.classAnswers).reduce((s, n) => s + n, 0);
      expect(total).toBe(23); // fixed simulated class size
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });
});

describe("education category taxonomy", () => {
  it("registers the education category", () => {
    const cat = getCategoryById("education");
    expect(cat?.name).toBe("Education");
    expect(cat?.navLabel).toBe("Education");
  });

  it("education copy obeys the truth policy", () => {
    const text = JSON.stringify(getCategoryById("education"));
    expect(text).not.toMatch(/authori[sz]ed|official|certified|partner/i);
    expect(text.match(/Samsung(?! C-Lab)/g) ?? []).toHaveLength(0);
  });

  it("zero-product categories are excluded from product-listing surfaces", () => {
    const ids = categoriesWithProducts.map((c) => c.id);
    expect(ids).not.toContain("education");
    // every other current category has products and must stay
    for (const cat of productCategories.filter((c) => c.id !== "education")) {
      expect(ids).toContain(cat.id);
    }
  });
});
