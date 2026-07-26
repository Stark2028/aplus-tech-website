import { describe, it, expect } from "vitest";
import {
  categoryBrand,
  categoryCountLabel,
  categoryHeroSizeRange,
} from "./categoryBrand";
import type { ProductCategory } from "@/data/categories";
import type { Product } from "@/data/products";
import { getCategoryById } from "@/data/categories";

const BANNED = /authoriz|partner|certif|samsung/i;

const base = { tagline: "t", subtitle: "s", overview: "o" };

const signage: ProductCategory = {
  ...base,
  id: "digital-signage",
  name: "Digital Signage",
  navLabel: "Digital Signage",
  description: "Commercial signage.",
  useCases: ["Lobbies", "Retail"],
};

const vc: ProductCategory = {
  ...base,
  id: "video-conferencing",
  name: "Video Conferencing",
  navLabel: "Video Conferencing",
  description: "Logitech video conferencing systems.",
  useCases: ["Boardrooms", "Huddle Rooms", "Zoom Rooms"],
};

const software: ProductCategory = {
  ...base,
  id: "software",
  name: "Software Solutions",
  navLabel: "Software",
  description: "Samsung cloud platforms.",
  useCases: ["Signage Networks", "Hotels & Resorts"],
};

const signageProduct: Product = {
  id: "qmc", brand: "Samsung", name: "QMC", category: "Digital Signage",
  series: "QMC", description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "500", screenSizes: ["43", "75"], operationTime: "16/7" },
  images: [],
};

// A Logitech bar that carries a stray screen-size (a max supported display /
// controller diagonal) — the source of the old "10.1″ to 65″" nonsense.
const vcProduct: Product = {
  id: "logitech-rally-bar", brand: "Logitech", name: "Logitech Rally Bar",
  category: "Video Conferencing", series: "Rally", subCategory: "Video Bars & Systems",
  description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: ["65"], operationTime: "Large Rooms" },
  images: [],
};

describe("categoryBrand — Samsung hardware categories", () => {
  it("uses Samsung + authorized eyebrow + 'models' + size range", () => {
    const b = categoryBrand(signage);
    expect(b.brand).toBe("Samsung");
    expect(b.eyebrow).toMatch(/authorized/i);
    expect(b.unitNoun.many).toBe("models");
    expect(b.showSizeRange).toBe(true);
  });
});

describe("categoryBrand — Video Conferencing (Logitech)", () => {
  it("uses Logitech, never authorized/distributor/Samsung wording", () => {
    const b = categoryBrand(vc);
    expect(b.brand).toBe("Logitech");
    expect(b.eyebrow).not.toMatch(/authoriz|distributor|certif|partner|samsung/i);
  });

  it("counts 'models' but hides the (nonsense) size range", () => {
    const b = categoryBrand(vc);
    expect(b.unitNoun.many).toBe("models");
    expect(b.showSizeRange).toBe(false);
    expect(categoryHeroSizeRange(vc, [vcProduct])).toBe("");
  });
});

describe("categoryBrand — Software (Samsung cloud)", () => {
  it("stays Samsung/authorized but counts 'platforms' with no sizes", () => {
    const b = categoryBrand(software);
    expect(b.brand).toBe("Samsung");
    expect(b.eyebrow).toMatch(/authorized/i);
    expect(b.unitNoun.many).toBe("platforms");
    expect(b.showSizeRange).toBe(false);
    expect(categoryHeroSizeRange(software, [])).toBe("");
  });
});

describe("categoryCountLabel", () => {
  it("pluralizes by count", () => {
    expect(categoryCountLabel(signage, 1)).toBe("1 model");
    expect(categoryCountLabel(signage, 23)).toBe("23 models");
    expect(categoryCountLabel(software, 1)).toBe("1 platform");
    expect(categoryCountLabel(software, 2)).toBe("2 platforms");
  });
});

describe("categoryHeroSizeRange — display categories", () => {
  it("returns a real formatted range for signage", () => {
    expect(categoryHeroSizeRange(signage, [signageProduct])).toBe("43″ to 75″");
  });
});

describe("categoryBrand hardwareNoun", () => {
  it("gives Samsung hardware categories the display noun", () => {
    expect(categoryBrand(getCategoryById("digital-signage")!).hardwareNoun).toBe("display");
    expect(categoryBrand(getCategoryById("video-walls")!).hardwareNoun).toBe("display");
  });

  it("gives video conferencing the room-system noun", () => {
    expect(categoryBrand(getCategoryById("video-conferencing")!).hardwareNoun).toBe("room system");
  });

  it("gives software the platform noun", () => {
    expect(categoryBrand(getCategoryById("software")!).hardwareNoun).toBe("platform");
  });
});

describe("categoryBrand non-Samsung branches", () => {
  it("never returns Samsung wording for video conferencing", () => {
    const blob = JSON.stringify(categoryBrand(getCategoryById("video-conferencing")!));
    expect(BANNED.test(blob)).toBe(false);
  });

  it("never returns Samsung wording for education", () => {
    const blob = JSON.stringify(categoryBrand(getCategoryById("education")!));
    expect(BANNED.test(blob)).toBe(false);
  });

  it("gives education a Class Saathi brand and no size range", () => {
    const b = categoryBrand(getCategoryById("education")!);
    expect(b.brand).toBe("Class Saathi");
    expect(b.showSizeRange).toBe(false);
    expect(b.hardwareNoun).toBe("classroom solution");
  });
});
