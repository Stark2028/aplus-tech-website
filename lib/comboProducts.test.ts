import { describe, it, expect } from "vitest";
import { resolveComboProducts } from "./comboProducts";
import { getCategoryById } from "@/data/categories";
import { solutions } from "@/data/solutions";
import type { UseCaseCombo } from "@/data/useCaseCombos";

const corporate = solutions.find((s) => s.slug === "corporate")!;

function combo(over: Partial<UseCaseCombo>): UseCaseCombo {
  return {
    industry: "corporate",
    category: "video-conferencing",
    title: "T",
    subtitle: "S",
    intro: "I",
    useCases: [],
    faqs: [],
    ctaHeading: "C",
    ...over,
  } as UseCaseCombo;
}

describe("resolveComboProducts", () => {
  it("honours curated productIds in the given order", () => {
    const { products, usedFallback } = resolveComboProducts(
      combo({ productIds: ["logitech-rally-bar", "logitech-tap"] }),
      getCategoryById("video-conferencing")!,
      corporate
    );
    expect(products.map((p) => p.id)).toEqual(["logitech-rally-bar", "logitech-tap"]);
    expect(usedFallback).toBe(false);
  });

  it("ignores curated ids that are not in the combo's category", () => {
    const { products } = resolveComboProducts(
      combo({ productIds: ["logitech-rally-bar", "does-not-exist"] }),
      getCategoryById("video-conferencing")!,
      corporate
    );
    expect(products.map((p) => p.id)).toEqual(["logitech-rally-bar"]);
  });

  it("drops a curated id that resolves to a product outside the combo's category", () => {
    // samsung-signage-qbc is a real, non-discontinued product — but it's in
    // Digital Signage, not Video Conferencing. If the resolver ever built its
    // id map from all of showcaseProducts instead of the category-filtered
    // list, this id would wrongly resolve and leak a Samsung panel onto a
    // Logitech page.
    const { products } = resolveComboProducts(
      combo({ productIds: ["logitech-rally-bar", "samsung-signage-qbc"] }),
      getCategoryById("video-conferencing")!,
      corporate
    );
    expect(products.map((p) => p.id)).toEqual(["logitech-rally-bar"]);
  });

  it("falls back to the series match when no ids are curated", () => {
    const { products, usedFallback } = resolveComboProducts(
      combo({ category: "digital-signage" }),
      getCategoryById("digital-signage")!,
      corporate
    );
    expect(products.length).toBeGreaterThan(0);
    expect(usedFallback).toBe(false);
  });

  it("falls back to the category's top products, capped at 4, when neither ids nor series match", () => {
    // corporate.recommendedSeries (Flip, WAC, QHC, BE, ...) has no overlap
    // with any Logitech series (Rally, MeetUp, Tap, ...), and this combo has
    // no productIds — so this must hit tier 3, not tier 2.
    const { products, usedFallback } = resolveComboProducts(
      combo({ category: "video-conferencing" }),
      getCategoryById("video-conferencing")!,
      corporate
    );
    expect(usedFallback).toBe(true);
    expect(products.length).toBe(4);
  });
});
