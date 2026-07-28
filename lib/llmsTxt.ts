import { SITE } from "@/lib/jsonLd";
import { SAMSUNG_CREDENTIAL } from "@/lib/credentials";
import { productCategories } from "@/data/categories";
import { solutions } from "@/data/solutions";
import { cities } from "@/data/cities";
import { products } from "@/data/products";
import { PHONE_DISPLAY, CONTACT_EMAIL } from "@/lib/contact";

/** Collapse whitespace and trim to one clean line for a link description. */
function oneLine(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/**
 * /llms.txt — a machine-readable summary for AI answer engines.
 *
 * Generated from data/ at build time so it cannot drift from the catalogue.
 * Every URL it emits is asserted to exist in app/sitemap.ts (llmsTxt.test.ts).
 *
 * Category names and descriptions come straight from data/categories.ts, so the
 * Logitech (video conferencing) and TagHive (education) surfaces describe
 * themselves correctly. Never prepend "Samsung" to a category name here.
 *
 * The copy deliberately avoids the words price/pricing/rating/review: this is a
 * quote-only catalogue with no ratings anywhere, and llmsTxt.test.ts enforces
 * that so no future edit can slip a figure in. Say "quote-only" instead.
 */
export function buildLlmsTxt(): string {
  const l: string[] = [];

  l.push("# Aplus Technology Solutions Pvt. Ltd.");
  l.push("");
  l.push(
    `> ${SAMSUNG_CREDENTIAL}, serving enterprises across India since 2020. ` +
      "Supply, certified installation and AMC support for commercial display, " +
      "video conferencing and classroom technology. Quote-only: no monetary " +
      "figures are published anywhere on this site.",
  );
  l.push("");
  l.push(
    `Aplus supplies ${products.length} product series across ` +
      `${productCategories.length} categories, to customers in ` +
      `${cities.length} cities across India. Head office: Noida, Uttar Pradesh.`,
  );
  l.push("");

  l.push("## Product categories");
  l.push("");
  for (const c of productCategories) {
    l.push(`- [${c.navLabel}](${SITE}/categories/${c.id}): ${oneLine(c.description)}`);
  }
  l.push("");

  l.push("## Solutions by industry");
  l.push("");
  for (const s of solutions) {
    l.push(`- [${s.title}](${SITE}/solutions/${s.slug}): ${oneLine(s.description)}`);
  }
  l.push("");

  l.push("## Reference");
  l.push("");
  l.push(
    `- [Samsung India model codes](${SITE}/samsung-india-model-codes): ` +
      "Samsung India order codes by series, with available sizes. India codes " +
      "differ from global codes and typically end in XL.",
  );
  l.push(`- [Full product catalogue](${SITE}/products): every series Aplus supplies.`);
  l.push(
    `- [Product finder](${SITE}/product-finder): guided selection by use case, ` +
      "room size and environment.",
  );
  l.push("");

  l.push("## Locations");
  l.push("");
  l.push(
    `- [Locations we serve](${SITE}/locations): ${cities.length} cities across ` +
      "India, each with a dedicated page covering local supply and installation.",
  );
  l.push("");

  l.push("## Contact");
  l.push("");
  l.push(`- [Contact Aplus](${SITE}/contact): enquiries and quotations.`);
  l.push(`- Phone: ${PHONE_DISPLAY}`);
  l.push(`- Email: ${CONTACT_EMAIL}`);
  l.push("");

  return l.join("\n");
}
