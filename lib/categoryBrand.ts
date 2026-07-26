import type { ProductCategory } from "@/data/categories";
import type { Product } from "@/data/products";
import { categorySizeRange } from "@/lib/categoryFaq";

/**
 * Per-category "brand profile" for the category hero. The hero used to hardcode
 * "Samsung" everywhere, which is wrong for the Logitech video-conferencing
 * category (and for anything non-Samsung we add later). This derives the brand
 * word, the eyebrow, and the correct noun for the product count from the
 * category itself.
 *
 * Positioning rules (see project memory):
 *  - Video Conferencing is Logitech — NO "authorized/distributor/certified"
 *    wording on that surface.
 *  - Software (VXT / LYNK Cloud) is genuinely Samsung → keeps the authorized
 *    eyebrow, but its items are cloud "platforms", not hardware "models".
 */
export interface CategoryBrand {
  /** Brand name to prefix the H1 with, or "" for none (e.g. Software). */
  brand: string;
  /**
   * Full H1 text, overriding the default `${brand} ${navLabel}` composition.
   * Used when the hero heading should read differently from the (short) nav
   * label — e.g. Software's nav says "Software" but the hero says
   * "Content Management Software".
   */
  h1?: string;
  /** Small uppercase eyebrow above the H1. */
  eyebrow: string;
  /** Noun for the product count, singular + plural (e.g. "model"/"models"). */
  unitNoun: { one: string; many: string };
  /**
   * Noun for this category's products in running copy — "display" for Samsung
   * panels, "room system" for Logitech VC, "platform" for cloud software. Lets
   * shared chrome say "Other display categories" vs "Other room-system
   * categories" without a per-category branch at the call site.
   */
  hardwareNoun: string;
  /** Whether the "Size Range" stat is meaningful for this category. */
  showSizeRange: boolean;
}

export function categoryBrand(category: ProductCategory): CategoryBrand {
  if (category.id === "video-conferencing") {
    return {
      brand: "Logitech",
      eyebrow: "Enterprise Video Conferencing",
      unitNoun: { one: "model", many: "models" },
      hardwareNoun: "room system",
      // VC products carry stray/max-display screenSizes (e.g. a Tap controller's
      // 10.1" touchscreen, a bar's max 65" panel) that produce a nonsense
      // "10.1″ to 65″" range for hardware that has no screen of its own.
      showSizeRange: false,
    };
  }

  if (category.id === "software") {
    return {
      brand: "Samsung",
      // Hero reads "Content Management Software" even though the nav label is
      // just "Software" — the H1 override keeps them independent.
      h1: "Content Management Software",
      eyebrow: "Samsung Authorized Distributor",
      unitNoun: { one: "platform", many: "platforms" },
      hardwareNoun: "platform",
      showSizeRange: false, // cloud software has no screen sizes
    };
  }

  // Education is Class Saathi (TagHive), not Samsung. Without this branch the
  // category falls through to the Samsung default and returns an "Authorized
  // Samsung Distributor" eyebrow — a content-truth violation the moment any
  // education surface calls this helper.
  if (category.id === "education") {
    return {
      brand: "Class Saathi",
      h1: "Class Saathi Smart Classrooms",
      eyebrow: "Education · Class Saathi by TagHive",
      unitNoun: { one: "solution", many: "solutions" },
      hardwareNoun: "classroom solution",
      showSizeRange: false,
    };
  }

  // Default: Samsung hardware category.
  return {
    brand: "Samsung",
    eyebrow: "Samsung Authorized Distributor",
    unitNoun: { one: "model", many: "models" },
    hardwareNoun: "display",
    showSizeRange: true,
  };
}

/**
 * The count label shown in the hero stat strip, e.g. "23 models" / "1 platform".
 */
export function categoryCountLabel(
  category: ProductCategory,
  count: number
): string {
  const { unitNoun } = categoryBrand(category);
  return `${count} ${count === 1 ? unitNoun.one : unitNoun.many}`;
}

/**
 * The size range to display in the hero, or "" when it shouldn't be shown for
 * this category (VC / Software) or when no real size data exists.
 */
export function categoryHeroSizeRange(
  category: ProductCategory,
  productsInCategory: Product[]
): string {
  if (!categoryBrand(category).showSizeRange) return "";
  return categorySizeRange(productsInCategory);
}
