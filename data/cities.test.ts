import { describe, it, expect } from "vitest";
import { cities, CITY_SLUGS, getCityBySlug, cityFaqs, SERVING_OFFICES } from "@/data/cities";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import { solutions } from "@/data/solutions";
import { blogPosts } from "@/data/blogs";
import {
  OLD_PRODUCT_SLUG_TO_ID,
  OLD_CATEGORY_ROOT_TO_ID,
  OLD_EXACT_PATH_TO_NEW,
  MERGED_PRODUCT_TO_CANONICAL,
} from "@/lib/redirects";
import { cityServiceLd } from "@/lib/jsonLd";

// The 95 legacy city hub slugs, harvested from the live sitemaps. These are
// INDEXED, ranking URLs — every one must always be present, or the migration
// 404s a page Google already ranks. The list is therefore a REQUIRED SUBSET,
// not an exact match: net-new tier-2 cities (added 2026-07-24) are additive
// growth pages and legitimately push the total above 95. Dropping or renaming
// any legacy slug must still fail this test.
const LEGACY_SLUGS = [
  "agra","ahmedabad","ajmer","aligarh","allahabad","ambattur","amravati","amritsar","asansol","aurangabad",
  "bangalore","bareilly","belgaum","bhavnagar","bhilai-nagar","bhiwandi","bhopal","bhubaneswar","bikaner",
  "chandigarh","chennai","coimbatore","cuttack","dehradun","delhi","dhanbad","durgapur","faridabad","firozabad",
  "gaya","ghaziabad","gorakhpur","greater-noida","gulbarga","guntur","gurgaon","guwahati","gwalior","haora",
  "hyderabad","indore","jabalpur","jaipur","jalandhar","jalgaon","jammu","jamnagar","jamshedpur","jhansi","jodhpur",
  "kalyan","kanpur","kochi","kolapur","kolkata","kota","lucknow","ludhiana","madurai","maheshtala","mangalore",
  "meerut","mira-and-bhayander","moradabad","mumbai","nagpur","nanded-waghala","nashik","navi-mumbai","nellore",
  "noida","patna","pimpri-and-chinchwad","pune","raipur","rajkot","ranchi","saharanpur","salem","sangli","siliguri",
  "solapur","srinagar","surat","thane","thiruvananthapuram","tiruchirappalli","udaipur","ujjain","ulhasnagar",
  "vadodara","varanasi","vijayawada","visakhapatnam","warangal",
];

describe("city data integrity", () => {
  const slugSet = new Set(cities.map((c) => c.slug));

  it("keeps every legacy ranking slug (required subset — never drop one)", () => {
    const missing = LEGACY_SLUGS.filter((s) => !slugSet.has(s));
    expect(missing).toEqual([]);
  });

  it("has at least the 95 legacy cities (expansion is additive)", () => {
    expect(cities.length).toBeGreaterThanOrEqual(LEGACY_SLUGS.length);
  });

  it("has no duplicate slugs", () => {
    expect(slugSet.size).toBe(cities.length);
  });

  it("CITY_SLUGS matches the cities array", () => {
    expect([...CITY_SLUGS].sort()).toEqual(cities.map((c) => c.slug).sort());
  });

  it("every city has non-empty name, state and a real (>=40 char) intro", () => {
    const bad = cities.filter((c) => !c.name.trim() || !c.state.trim() || c.intro.trim().length < 40);
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  it("every slug is a clean URL segment (lowercase, hyphenated)", () => {
    const bad = cities.filter((c) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug));
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  it("every servedFrom points to a real office", () => {
    const bad = cities.filter((c) => !SERVING_OFFICES[c.servedFrom]);
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  it("getCityBySlug resolves a known slug and rejects an unknown one", () => {
    expect(getCityBySlug("delhi")?.name).toBe("Delhi");
    expect(getCityBySlug("atlantis")).toBeUndefined();
  });

  it("cityFaqs returns city-named Q&A", () => {
    const faqs = cityFaqs(getCityBySlug("mumbai")!);
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    expect(faqs.some((f) => f.q.includes("Mumbai") || f.a.includes("Mumbai"))).toBe(true);
  });
});

describe("city slugs never collide with existing routes or redirects", () => {
  const productIds = new Set(products.map((p) => p.id));
  const categoryIds = new Set(productCategories.map((c) => c.id));
  const solutionSlugs = new Set(solutions.map((s) => s.slug));
  const blogSlugs = new Set(blogPosts.map((b) => b.slug));
  const RESERVED = new Set([
    "products","categories","solutions","blogs","product-finder",
    "compare","quote","about","contact","privacy","terms","api","locations",
  ]);

  it("no city slug is a reserved root", () => {
    expect(cities.filter((c) => RESERVED.has(c.slug)).map((c) => c.slug)).toEqual([]);
  });

  it("no city slug equals a product / category / solution / blog id", () => {
    const clash = cities.filter(
      (c) => productIds.has(c.slug) || categoryIds.has(c.slug as never) ||
             solutionSlugs.has(c.slug) || blogSlugs.has(c.slug)
    );
    expect(clash.map((c) => c.slug)).toEqual([]);
  });

  // This is the invariant behind the middleware city guard: if a city slug were
  // ALSO a redirect-map key, the product-slug fallthrough (matched on the last
  // path segment) would 301 the city page away before the router ever saw it.
  it("no city slug is a key in any redirect map", () => {
    const keys = new Set([
      ...Object.keys(OLD_PRODUCT_SLUG_TO_ID),
      ...Object.keys(OLD_CATEGORY_ROOT_TO_ID),
      ...Object.keys(OLD_EXACT_PATH_TO_NEW),
      ...Object.keys(MERGED_PRODUCT_TO_CANONICAL),
    ]);
    expect(cities.filter((c) => keys.has(c.slug)).map((c) => c.slug)).toEqual([]);
  });
});

describe("cityServiceLd", () => {
  const city = getCityBySlug("kolkata")!;
  const ld = cityServiceLd(city, products.slice(0, 3)) as Record<string, unknown>;

  it("is a Service that references the org by @id and never declares a city address", () => {
    expect(ld["@type"]).toBe("Service");
    expect(ld.provider).toEqual({ "@id": "https://www.aplustechsol.com/#organization" });
    // No PostalAddress anywhere — a city page must not claim a local address.
    expect(JSON.stringify(ld)).not.toContain("PostalAddress");
  });

  it("areaServed is the City containing its State", () => {
    expect(ld.areaServed).toMatchObject({
      "@type": "City",
      name: "Kolkata",
      containedInPlace: { "@type": "State", name: "West Bengal" },
    });
  });

  it("self-canonical url is root-level and offer catalog lists the products", () => {
    expect(ld.url).toBe("https://www.aplustechsol.com/kolkata");
    expect((ld.hasOfferCatalog as { itemListElement: unknown[] }).itemListElement).toHaveLength(3);
  });
});
