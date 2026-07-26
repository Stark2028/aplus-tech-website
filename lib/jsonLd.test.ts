import { describe, it, expect } from "vitest";
import { productLd, categoryCollectionLd, industryCategoryServiceLd, classSaathiProductLd, itemListLd } from "./jsonLd";
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import { getCategoryById } from "@/data/categories";
import { solutions } from "@/data/solutions";
import type { UseCaseCombo } from "@/data/useCaseCombos";

const samsung: Product = {
  id: "samsung-qet-series", name: "Samsung QET", category: "Digital Signage",
  series: "QET", description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "300 nit", screenSizes: ["43"], operationTime: "16/7" },
  images: ["/x.avif"],
};
const logitech: Product = {
  id: "logitech-rally-bar", brand: "Logitech", name: "Logitech Rally Bar",
  category: "Video Conferencing", series: "Rally", subCategory: "Video Bars & Systems",
  description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: ["/y.avif"],
};

describe("productLd brand fields", () => {
  it("keeps Samsung brand/manufacturer for Samsung products", () => {
    const ld = productLd(samsung) as any;
    expect(ld.brand.name).toBe("Samsung");
    expect(ld.manufacturer.name).toMatch(/Samsung/);
    expect(ld.manufacturer.url).toBe("https://www.samsung.com");
  });

  it("uses Logitech brand/manufacturer for Logitech products", () => {
    const ld = productLd(logitech) as any;
    expect(ld.brand.name).toBe("Logitech");
    expect(ld.manufacturer.name).toMatch(/Logitech/);
    expect(ld.manufacturer.url).toBe("https://www.logitech.com");
    expect(JSON.stringify(ld)).not.toMatch(/samsung/i);
  });
});

describe("categoryCollectionLd naming", () => {
  it("suffixes Samsung categories with '— Samsung B2B Displays'", () => {
    const cat: ProductCategory = {
      id: "digital-signage", name: "Digital Signage", navLabel: "Digital Signage",
      tagline: "t", subtitle: "s", description: "d", overview: "o", useCases: [],
    };
    const ld = categoryCollectionLd(cat, []) as any;
    expect(ld.name).toBe("Digital Signage — Samsung B2B Displays");
  });

  it("names the VC category without Samsung", () => {
    const cat: ProductCategory = {
      id: "video-conferencing", name: "Video Conferencing", navLabel: "Video Conferencing",
      tagline: "t", subtitle: "s", description: "d", overview: "o", useCases: [],
    };
    const ld = categoryCollectionLd(cat, []) as any;
    expect(ld.name).not.toMatch(/samsung/i);
    expect(ld.name).toMatch(/Logitech|Video Conferencing/);
  });
});

const BANNED = /authoriz|partner|certif|samsung/i;

describe("classSaathiProductLd", () => {
  const ld = classSaathiProductLd();

  it("is a TagHive-branded Product with no offers node", () => {
    expect(ld["@type"]).toBe("Product");
    expect(ld.brand).toEqual({ "@type": "Brand", name: "TagHive" });
    expect("offers" in ld).toBe(false);
  });

  it("carries no partnership language and no bare Samsung mention", () => {
    const blob = JSON.stringify(ld);
    expect(blob).not.toMatch(/authori[sz]ed|official|certified|partner/i);
    expect(blob.match(/Samsung(?! C-Lab)/g) ?? []).toHaveLength(0);
  });
});

describe("itemListLd", () => {
  it("numbers items from 1 and absolutises urls", () => {
    const ld = itemListLd("Segments", [{ name: "A", url: "/categories/education/a" }]);
    expect(ld.numberOfItems).toBe(1);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[0].url).toBe(
      "https://www.aplustechsol.com/categories/education/a"
    );
  });
});

function fakeCombo(category: "digital-signage" | "video-conferencing"): UseCaseCombo {
  return {
    industry: "corporate",
    category,
    title: "T",
    subtitle: "S",
    intro: "I",
    useCases: [],
    faqs: [],
    ctaHeading: "C",
  };
}

describe("industryCategoryServiceLd brand awareness", () => {
  it("keeps Samsung wording for a Samsung category", () => {
    const ld = industryCategoryServiceLd(
      fakeCombo("digital-signage"),
      solutions.find((s) => s.slug === "corporate")!,
      getCategoryById("digital-signage")!,
      []
    );
    expect(ld.hasOfferCatalog.name).toBe(
      "Samsung Digital Signage recommended for Corporate & Workplace"
    );
  });

  it("emits zero Samsung wording for the video conferencing category", () => {
    const ld = industryCategoryServiceLd(
      fakeCombo("video-conferencing"),
      solutions.find((s) => s.slug === "corporate")!,
      getCategoryById("video-conferencing")!,
      []
    );
    expect(ld.hasOfferCatalog.name).toBe(
      "Logitech Video Conferencing recommended for Corporate & Workplace"
    );
    expect(BANNED.test(JSON.stringify(ld))).toBe(false);
  });
});
