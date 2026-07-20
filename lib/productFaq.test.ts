import { describe, it, expect } from "vitest";
import { buildProductFaqs } from "./productFaq";
import type { Product } from "@/data/products";

const samsung: Product = {
  id: "samsung-qet-series",
  name: "Samsung Smart Signage QET Series",
  category: "Digital Signage",
  series: "QET Series",
  description: "desc",
  features: ["f1"],
  specs: { resolution: "4K UHD", brightness: "300 nit", screenSizes: ["43", "55"], operationTime: "16/7" },
  images: [],
};

const logitech: Product = {
  id: "logitech-rally-bar",
  brand: "Logitech",
  name: "Logitech Rally Bar",
  category: "Video Conferencing",
  series: "Rally",
  subCategory: "Video Bars & Systems",
  description: "desc",
  features: ["f1"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: [],
};

describe("buildProductFaqs — Samsung (unchanged)", () => {
  it("still says 'authorized Samsung' in the pricing answer", () => {
    const faqs = buildProductFaqs(samsung);
    const pricing = faqs.find((f) => /pricing/i.test(f.q));
    expect(pricing?.a).toMatch(/authorized Samsung/i);
  });

  it("promises genuine Samsung units with manufacturer warranty", () => {
    const faqs = buildProductFaqs(samsung);
    const warranty = faqs.find((f) => /installation and warranty/i.test(f.q));
    expect(warranty?.a).toMatch(/genuine Samsung/i);
  });
});

describe("buildProductFaqs — Logitech (no banned wording)", () => {
  it("emits no authorized/partner/certified/genuine-Samsung/Samsung wording", () => {
    const faqs = buildProductFaqs(logitech);
    for (const f of faqs) {
      expect(f.q + " " + f.a).not.toMatch(/authoriz|partner|certif|samsung/i);
    }
  });

  it("still answers pricing and install/AMC, naming Logitech safely", () => {
    const faqs = buildProductFaqs(logitech);
    expect(faqs.some((f) => /pricing/i.test(f.q))).toBe(true);
    expect(faqs.some((f) => /installation|amc|support/i.test(f.q + f.a))).toBe(true);
    expect(faqs.some((f) => /Logitech/.test(f.a))).toBe(true);
  });

  it("omits the size question when a product has no screen sizes", () => {
    const faqs = buildProductFaqs(logitech);
    expect(faqs.some((f) => /screen sizes/i.test(f.q))).toBe(false);
  });

  it("emits no model-number FAQ even if a Logitech product had a model code", () => {
    // The model-code FAQ is Samsung-worded; a Logitech product must never show it.
    // (No Logitech code exists today; this guards against one being added later.)
    const faqs = buildProductFaqs(logitech);
    expect(faqs.some((f) => /model number/i.test(f.q))).toBe(false);
  });
});
