import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { Faq } from "@/lib/productFaq";
import { formatSize } from "@/lib/formatSize";
import { PHONE_DISPLAY } from "@/lib/contact";

/** Min/max screen size across a category's products, formatted (e.g. "13″ to 115″"). */
export function categorySizeRange(productsInCategory: Product[]): string {
  const nums = productsInCategory
    .flatMap((p) => p.specs.screenSizes)
    .map((s) => parseFloat(s))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return "";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max
    ? formatSize(String(min))
    : `${formatSize(String(min))} to ${formatSize(String(max))}`;
}

/**
 * Category-level FAQs generated from live category + product data. Rendered
 * visibly on the page and emitted as FAQPage structured data (the two must
 * match). Targets the commercial-intent queries a buyer types before a quote.
 */
export function buildCategoryFaqs(
  category: ProductCategory,
  productsInCategory: Product[]
): Faq[] {
  const uc = category.useCases;
  const ucList =
    uc.length > 1
      ? `${uc.slice(0, -1).join(", ")} and ${uc[uc.length - 1]}`
      : uc.join("");
  const sizeRange = categorySizeRange(productsInCategory);
  const count = productsInCategory.length;

  const faqs: Faq[] = [
    {
      q: `What is Samsung ${category.navLabel} used for?`,
      a: `Samsung ${category.navLabel} is used across ${ucList.toLowerCase()}. ${category.description}`,
    },
  ];

  if (sizeRange) {
    faqs.push({
      q: `What screen sizes are available in Samsung ${category.navLabel}?`,
      a: `Aplus supplies Samsung ${category.navLabel} in sizes from ${sizeRange}, across ${count} ${
        count === 1 ? "series" : "series"
      }. Contact us and we'll match the right size and model to your space and viewing distance.`,
    });
  }

  faqs.push(
    {
      q: `How do I get pricing for Samsung ${category.navLabel} in India?`,
      a: `Aplus Technology Solutions is an authorized Samsung B2B distributor offering project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for pricing within 24 hours — GST invoice included.`,
    },
    {
      q: `Does Aplus provide installation and warranty for ${category.navLabel} across India?`,
      a: `Yes. We supply 100% genuine Samsung units with manufacturer warranty, certified installation, and AMC support across India, including a free site assessment for every order.`,
    }
  );

  return faqs;
}
