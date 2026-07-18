import { describe, it, expect } from "vitest";
import { buildCategoryFaqs } from "./categoryFaq";
import type { ProductCategory } from "@/data/categories";
import type { Product } from "@/data/products";

const signage: ProductCategory = {
  id: "digital-signage",
  name: "Digital Signage",
  navLabel: "Digital Signage",
  tagline: "t",
  subtitle: "s",
  description: "Commercial signage.",
  overview: "o",
  useCases: ["Lobbies", "Retail"],
};

const vc: ProductCategory = {
  id: "video-conferencing",
  name: "Video Conferencing",
  navLabel: "Video Conferencing",
  tagline: "t",
  subtitle: "s",
  description: "Logitech video conferencing systems.",
  overview: "o",
  useCases: ["Boardrooms", "Huddle Rooms", "Zoom Rooms"],
};

const vcProduct: Product = {
  id: "logitech-rally-bar", brand: "Logitech", name: "Logitech Rally Bar",
  category: "Video Conferencing", series: "Rally", subCategory: "Video Bars & Systems",
  description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: [],
};

describe("buildCategoryFaqs — Samsung categories unchanged", () => {
  it("still asks 'What is Samsung Digital Signage used for?'", () => {
    const faqs = buildCategoryFaqs(signage, []);
    expect(faqs[0].q).toBe("What is Samsung Digital Signage used for?");
  });

  it("still says 'authorized Samsung' in the pricing answer", () => {
    const faqs = buildCategoryFaqs(signage, []);
    expect(faqs.find((f) => /pricing/i.test(f.q))?.a).toMatch(/authorized Samsung/i);
  });
});

describe("buildCategoryFaqs — Video Conferencing", () => {
  it("emits no authorized/partner/certified/Samsung wording", () => {
    const faqs = buildCategoryFaqs(vc, [vcProduct]);
    for (const f of faqs) {
      expect(f.q + " " + f.a).not.toMatch(/authoriz|partner|certif|samsung/i);
    }
  });

  it("names Logitech and covers use / pricing / install-AMC", () => {
    const faqs = buildCategoryFaqs(vc, [vcProduct]);
    const blob = faqs.map((f) => f.q + " " + f.a).join(" ");
    expect(blob).toMatch(/Logitech/);
    expect(blob).toMatch(/pricing/i);
    expect(blob).toMatch(/installation|amc|support/i);
  });

  it("does not emit the Samsung-style size-range question for VC", () => {
    const faqs = buildCategoryFaqs(vc, [vcProduct]);
    expect(faqs.some((f) => /screen sizes are available in Samsung/i.test(f.q))).toBe(false);
  });
});
