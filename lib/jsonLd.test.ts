import { describe, it, expect } from "vitest";
import { productLd, categoryCollectionLd } from "./jsonLd";
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";

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
