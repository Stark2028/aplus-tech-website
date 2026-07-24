import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { Solution } from "@/data/solutions";
import type { City } from "@/data/cities";
import type { UseCaseCombo } from "@/data/useCaseCombos";
import { formatSize } from "@/lib/formatSize";
import { PHONE_SCHEMA } from "@/lib/contact";
import { modelCodeFor } from "@/lib/modelCodes";
import { brandOf, BRAND_JSONLD_NAME, BRAND_MANUFACTURER } from "@/lib/brand";

export const SITE = "https://www.aplustechsol.com";

const ORG_ID = `${SITE}/#organization`;

/** Absolute URL helper — leaves http(s) urls untouched, prefixes relative paths with SITE. */
function abs(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Serialize a JSON-LD object for injection via dangerouslySetInnerHTML.
 * Escapes `<` so a `</script>` substring in any (future, dynamic) field
 * cannot break out of the surrounding <script> tag. Inert for today's
 * static data, but removes the latent XSS sink permanently.
 */
export function jsonLdString(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/** Canonical Organization / LocalBusiness node. Referenced by @id from other nodes. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID,
    name: "Aplus Technology Solutions Pvt. Ltd.",
    url: SITE,
    logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    image: `${SITE}/og-default.png`,
    telephone: PHONE_SCHEMA,
    email: "info@aplustechsol.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Supernova Astralis, Sector-94",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      postalCode: "201301",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE_SCHEMA,
      contactType: "sales",
      areaServed: "IN",
      availableLanguage: "en",
    },
    openingHours: "Mo-Sa 10:00-18:00",
    sameAs: [
      "https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd",
    ],
  };
}

export interface Crumb {
  name: string;
  /** Relative path or absolute URL. */
  url: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}

/**
 * Product JSON-LD for a B2B distributor where pricing is by quote.
 *
 * Deliberately omits the `offers` field: Google's structured-data validator
 * rejects AggregateOffer without lowPrice/highPrice and rejects Offer without
 * price. Shipping an offer with a placeholder price would be misleading. Per
 * Google's docs, Product structured data is valid without offers; it loses
 * merchant-listing rich results but retains product-snippet enhancements
 * (image carousel, brand, identifier).
 */
export function productLd(product: Product) {
  const url = `${SITE}/products/${product.id}`;
  const images = (product.images ?? []).map(abs);

  // Build additionalProperty from specs + additionalSpecs.
  // PropertyValue is the schema.org-recommended way to expose technical specs.
  const baseProps: Array<[string, string]> = [
    ["Resolution", product.specs.resolution],
    ["Brightness", product.specs.brightness],
    ["Operation Hours", product.specs.operationTime],
    ["Available Sizes", product.specs.screenSizes.map(formatSize).join(", ")],
    ["Series", product.series],
  ];
  const extraProps: Array<[string, string]> = product.specGroups
    ? Object.values(product.specGroups).flatMap((group) => Object.entries(group))
    : product.additionalSpecs
    ? Object.entries(product.additionalSpecs)
    : [];
  const additionalProperty = [...baseProps, ...extraProps]
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([name, value]) => ({ "@type": "PropertyValue", name, value }));

  // Real Samsung model code where known — a meaningful mpn helps this page rank
  // for exact model-number searches. Omit entirely rather than fabricate one.
  const modelCode = modelCodeFor(product.id);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description,
    url,
    sku: modelCode ?? product.id,
    ...(modelCode ? { mpn: modelCode } : {}),
    category: product.category,
    brand: { "@type": "Brand", name: BRAND_JSONLD_NAME[brandOf(product)] },
    manufacturer: {
      "@type": "Organization",
      name: BRAND_MANUFACTURER[brandOf(product)].name,
      url: BRAND_MANUFACTURER[brandOf(product)].url,
    },
    model: product.series,
    image: images,
    audience: { "@type": "BusinessAudience", audienceType: "Business" },
    isRelatedTo: { "@id": ORG_ID },
    additionalProperty,
  };
}

/**
 * CollectionPage + nested ItemList for a category listing.
 * ItemList helps Google understand this is a curated set of products.
 */
export function categoryCollectionLd(
  category: ProductCategory,
  productsInCategory: Product[]
) {
  const url = `${SITE}/categories/${category.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name:
      category.id === "video-conferencing"
        ? `${category.navLabel} — Logitech Systems`
        : `${category.navLabel} — Samsung B2B Displays`,
    description: category.description,
    isPartOf: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productsInCategory.length,
      itemListElement: productsInCategory.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/products/${p.id}`,
        name: p.name,
      })),
    },
  };
}

/**
 * Service JSON-LD for an industry / solution page.
 * Provider points to the canonical Organization node via @id.
 */
export function solutionServiceLd(solution: Solution, featuredProducts: Product[]) {
  const url = `${SITE}/solutions/${solution.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name: `${solution.title} — Samsung B2B Display Solutions`,
    description: solution.description,
    serviceType: solution.title,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "India" },
    audience: { "@type": "BusinessAudience", audienceType: "Business" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Recommended products for ${solution.title}`,
      itemListElement: featuredProducts.map((product) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: product.name,
          brand: { "@type": "Brand", name: brandOf(product) },
        },
      })),
    },
  };
}

/**
 * Service JSON-LD for a city landing page. `areaServed` is the City (nested in
 * its State); `provider` points to the single canonical Organization node by
 * @id. Deliberately NOT a LocalBusiness — Aplus has no office in this city, and
 * marking up a local address there would be false.
 */
export function cityServiceLd(city: City, productsOnPage: Product[]) {
  const url = `${SITE}/${city.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name: `Samsung Commercial Displays in ${city.name}`,
    description: city.intro,
    serviceType: "Samsung commercial display supply, installation & AMC",
    provider: { "@id": ORG_ID },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: city.state },
    },
    audience: { "@type": "BusinessAudience", audienceType: "Business" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Samsung displays available in ${city.name}`,
      itemListElement: productsOnPage.map((p) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          "@id": `${SITE}/products/${p.id}#product`,
          name: p.name,
          url: `${SITE}/products/${p.id}`,
        },
      })),
    },
  };
}

/**
 * Service JSON-LD for an industry+category programmatic landing page.
 * Combines solution context with a specific product category, and references
 * the parent Solution and the Organization by @id so Google understands the
 * page hierarchy.
 */
export function industryCategoryServiceLd(
  combo: UseCaseCombo,
  solution: Solution,
  category: ProductCategory,
  productsOnPage: Product[]
) {
  const url = `${SITE}/solutions/${combo.industry}/${combo.category}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name: combo.title,
    description: combo.intro,
    serviceType: `${category.navLabel} for ${solution.title}`,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "India" },
    audience: { "@type": "BusinessAudience", audienceType: "Business" },
    isPartOf: { "@id": `${SITE}/solutions/${combo.industry}#service` },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Samsung ${category.navLabel} recommended for ${solution.title}`,
      itemListElement: productsOnPage.map((p) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          "@id": `${SITE}/products/${p.id}#product`,
          name: p.name,
          url: `${SITE}/products/${p.id}`,
        },
      })),
    },
  };
}

/**
 * AboutPage JSON-LD. References the canonical Organization node by @id so the
 * page reinforces the entity Google associates with the brand, rather than
 * declaring a second, competing organization.
 */
export function aboutPageLd() {
  const url = `${SITE}/about`;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${url}#about`,
    url,
    name: "About Aplus Technology Solutions",
    description:
      "Authorized Samsung Business Display distributor serving enterprises across India — supply, certified installation, and AMC support.",
    mainEntity: { "@id": ORG_ID },
    isPartOf: { "@id": ORG_ID },
  };
}

/** FAQPage JSON-LD. Pass {question, answer} pairs. */
export function faqPageLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
