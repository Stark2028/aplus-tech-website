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

  if (category.id === "video-conferencing") {
    return buildVideoConferencingCategoryFaqs(category, ucList, count);
  }

  if (category.id === "software") {
    return buildSoftwareCategoryFaqs(category, ucList, count);
  }

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

/** VC category FAQs — Logitech naming, Aplus supply/install/AMC trust story,
 *  no Samsung/authorized/partner/certified wording. Size-band questions don't
 *  apply (VC products carry no screen-size diagonals). */
function buildVideoConferencingCategoryFaqs(
  category: ProductCategory,
  ucList: string,
  count: number
): Faq[] {
  return [
    {
      q: `What is Logitech ${category.navLabel} used for?`,
      a: `Logitech ${category.navLabel} equips ${ucList.toLowerCase()} with video bars, PTZ cameras, tap controllers and room compute for Microsoft Teams Rooms and Zoom Rooms. ${category.description}`,
    },
    {
      q: `Which Logitech ${category.navLabel} system fits my room size?`,
      a: `Aplus supplies the full Logitech range across ${count} product families — from huddle-room bars to modular boardroom systems. Tell us your room size and platform (Teams or Zoom) and we'll recommend the right bar, camera and controller.`,
    },
    {
      q: `How do I get pricing for Logitech ${category.navLabel} in India?`,
      a: `Aplus Technology Solutions supplies Logitech ${category.navLabel} with project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for pricing within 24 hours — GST invoice included.`,
    },
    {
      q: `Does Aplus provide installation and support for Logitech ${category.navLabel} across India?`,
      a: `Yes. Aplus supplies, installs and maintains Logitech room systems across India, with professional installation and AMC support, including a free site assessment for every order.`,
    },
  ];
}

/** Software Solutions category FAQs — Samsung cloud platforms (VXT, LYNK Cloud).
 *  Samsung-positive (unlike VC), but software-shaped: no screen sizes, and the
 *  trust story is licensing / provisioning / onboarding, not panel installation. */
function buildSoftwareCategoryFaqs(
  category: ProductCategory,
  ucList: string,
  count: number
): Faq[] {
  return [
    {
      q: `What is Samsung ${category.navLabel} used for?`,
      a: `Samsung ${category.navLabel} are cloud platforms for ${ucList.toLowerCase()}. ${category.description}`,
    },
    {
      q: `What is the difference between Samsung VXT and LYNK Cloud?`,
      a: `Samsung VXT is the cloud content-management platform (the successor to MagicINFO) for designing, scheduling and publishing content across Samsung signage. Samsung LYNK Cloud is the hospitality platform for managing in-room hotel TV content and guest experiences remotely. Aplus supplies and provisions both across ${count} platforms.`,
    },
    {
      q: `How do I get pricing and licensing for Samsung ${category.navLabel} in India?`,
      a: `Aplus Technology Solutions is an authorized Samsung B2B distributor offering project and volume licensing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for pricing within 24 hours — GST invoice included.`,
    },
    {
      q: `Does Aplus help with onboarding and support for Samsung ${category.navLabel}?`,
      a: `Yes. We supply genuine Samsung licenses and help with provisioning, onboarding, and ongoing support across India, so your team can manage content and devices from day one — with AMC support available.`,
    },
  ];
}
