# City Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the 95 legacy city landing pages (`/delhi`, `/mumbai`, …) at their existing root-level URLs so the migration from the legacy PHP site does not 404 them, with content that is honest and genuinely varies by city.

**Architecture:** A single dynamic route `app/[city]/page.tsx` with a closed `generateStaticParams` list and `dynamicParams = false`, driven by a new `data/cities.ts` data module (mirroring the existing `data/useCaseCombos.ts` convention). Middleware gains a city pass-through guard; the legacy `/our-presence` page is repointed to a new `/locations` index. No change to the 7,125 city×product redirects — they already work.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, Vitest (node env, `@/*` alias), `next/og` (Satori).

## Global Constraints

- **Canonical host:** `https://www.aplustechsol.com` (the `SITE` export in `lib/jsonLd.ts`). All canonicals/sitemap/JSON-LD use it, no trailing slash.
- **Schema:** city pages use `Service` + `areaServed: City`. **Never** emit a second `LocalBusiness`/`Organization` with a city address — there is no local office there. The one `LocalBusiness` node lives in `organizationLd()` (Noida HQ) and is referenced by `@id` only.
- **Honesty gate:** every factual claim on a city page must be true for a company with ONE HQ (Noida) and ONE regional office (Kolkata) that ships and services nationwide. No fabricated local address, phone, or "office in {city}". Lead-time claims stay qualitative unless the client supplies specifics.
- **`dynamicParams = false`** on every dynamic route (repo-wide convention — prevents soft-404s; see `data/../memory/soft-404-dynamicparams-fix.md`).
- **Office → region mapping (load-bearing):** `servedFrom: "kolkata"` for the 14 eastern cities; `"noida"` for the other 81. This drives serve-block and FAQ copy.
- **95 city slugs are fixed** — they must equal the legacy URL segments exactly (they are the indexed URLs). The canonical list is in Task 1's `cities` array; a committed test fixture guards it.
- **Quality gate (from spec):** if 95 genuinely distinct intros cannot be written honestly, cut the list rather than pad it. Ship 30 strong pages over 95 thin ones. Task 8 is the client review of intro copy.

---

## File Structure

| File | Responsibility | Task |
| --- | --- | --- |
| `data/cities.ts` (create) | `City` interface, 95-entry `cities` array, `CITY_SLUGS`, `getCityBySlug`, `SERVING_OFFICES`, `cityFaqs()` | 1 |
| `data/cities.test.ts` (create) | slug uniqueness, count/fixture regression, collision with all routes + redirect-map keys, `cityServiceLd` shape | 1, 2 |
| `lib/jsonLd.ts` (modify) | add `cityServiceLd(city, products)` | 2 |
| `middleware.ts` (modify) | add `CITY_SLUGS` pass-through guard; add `"locations"` to `RESERVED_ROOTS` | 3 |
| `lib/redirects.ts` (modify) | `our-presence` → `/locations` | 3 |
| `lib/redirects.test.ts` (modify) | add `"locations"` to the test's `RESERVED_ROOTS` mirror | 3 |
| `app/[city]/page.tsx` (create) | the city landing page | 4 |
| `app/[city]/loading.tsx` (create) | skeleton | 4 |
| `app/[city]/error.tsx` (create) | error boundary | 4 |
| `app/[city]/opengraph-image.tsx` (create) | per-city OG image | 5 |
| `app/locations/page.tsx` (create) | `/locations` index of all cities | 6 |
| `components/Footer.tsx` (modify) | add `Locations` link to `COMPANY_LINKS` | 6 |
| `app/sitemap.ts` (modify) | add 95 city URLs + `/locations` | 7 |

---

### Task 1: City data model + guards

**Files:**
- Create: `data/cities.ts`
- Test: `data/cities.test.ts`

**Interfaces:**
- Consumes: `CategorySlug` from `data/categories.ts`; product/category/solution/blog id sets and the four redirect maps (test only).
- Produces:
  - `interface City { slug; name; state; region; servedFrom; intro }`
  - `type Region = "north" | "south" | "east" | "west" | "central"`
  - `const cities: City[]` (95 entries)
  - `const CITY_SLUGS: ReadonlySet<string>`
  - `function getCityBySlug(slug: string): City | undefined`
  - `const SERVING_OFFICES: Record<"noida" | "kolkata", { city: string; label: string; addressRegion: string }>`
  - `function cityFaqs(city: City): Array<{ q: string; a: string }>`

- [ ] **Step 1: Write the failing test** — `data/cities.test.ts`

```ts
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

// The 95 legacy city hub slugs, harvested from the live sitemaps. This fixture
// is the regression guard: dropping or renaming a city must fail this test,
// because each slug is an indexed, ranking URL.
const EXPECTED_SLUGS = [
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
  it("has exactly the 95 expected legacy slugs", () => {
    expect(cities.map((c) => c.slug).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("has no duplicate slugs", () => {
    expect(new Set(cities.map((c) => c.slug)).size).toBe(cities.length);
  });

  it("CITY_SLUGS matches the cities array", () => {
    expect([...CITY_SLUGS].sort()).toEqual(cities.map((c) => c.slug).sort());
  });

  it("every city has non-empty name, state and intro", () => {
    const bad = cities.filter((c) => !c.name.trim() || !c.state.trim() || c.intro.trim().length < 40);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- cities`
Expected: FAIL — `Failed to resolve import "@/data/cities"`.

- [ ] **Step 3: Create `data/cities.ts`**

> **Note on `intro` copy:** the entries below are honest first drafts. Metro cities carry a
> richer two-sentence intro to set the quality bar; tier-2 cities carry a solid one-sentence
> draft. All are true for a Noida-HQ / Kolkata-branch / nationwide-service company. **Task 8 is
> the client review that refines them** — do not invent local offices, addresses, or day-count
> SLAs here.

```ts
export type Region = "north" | "south" | "east" | "west" | "central";

/**
 * One programmatic city landing page is generated per entry below.
 * URL: /{slug}  (root-level — these are the exact legacy URLs, preserved so the
 * indexed pages keep working instead of 404ing after the migration.)
 *
 * `servedFrom` encodes a real operational fact: eastern India is served from the
 * Kolkata regional office, the rest from the Noida HQ. It drives honest copy
 * about dispatch and on-site service — NOT a fabricated local presence.
 */
export interface City {
  /** Must equal the legacy URL segment exactly. */
  slug: string;
  name: string;
  state: string;
  region: Region;
  servedFrom: "noida" | "kolkata";
  /** 1–2 hand-written, city-specific sentences. Reviewed by the client (see plan Task 8). */
  intro: string;
}

/** The two real Aplus locations. No third office exists — do not add city offices. */
export const SERVING_OFFICES: Record<
  "noida" | "kolkata",
  { city: string; label: string; addressRegion: string }
> = {
  noida: { city: "Noida", label: "headquarters", addressRegion: "Uttar Pradesh" },
  kolkata: { city: "Kolkata", label: "regional office", addressRegion: "West Bengal" },
};

export const cities: City[] = [
  // ── NORTH (served from Noida) ──────────────────────────────────────────────
  { slug: "delhi", name: "Delhi", state: "Delhi", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Delhi — from Connaught Place retail and Nehru Place IT offices to corporate campuses in Aerocity. As an authorized Samsung distributor operating from adjacent Noida, we deliver, install, and service the full signage, video-wall, interactive and hospitality-TV range across the capital." },
  { slug: "noida", name: "Noida", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Noida is home to the Aplus Technology Solutions headquarters, so businesses across Sectors 62, 63, 94 and the Expressway get the fastest access to our full Samsung commercial-display range — supply, certified installation, demos and AMC support, all coordinated locally." },
  { slug: "greater-noida", name: "Greater Noida", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Greater Noida — for its universities, manufacturing units and Knowledge Park offices — dispatched and service-backed from our nearby Noida headquarters." },
  { slug: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ghaziabad, Uttar Pradesh, dispatched and service-backed from our neighbouring Noida headquarters." },
  { slug: "faridabad", name: "Faridabad", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for offices, showrooms and industrial units across Faridabad, Haryana, dispatched and service-backed from our Noida headquarters." },
  { slug: "gurgaon", name: "Gurgaon", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Gurgaon (Gurugram) — for its Cyber City corporate towers, retail malls and hospitality venues — with delivery, certified installation and AMC coordinated from our Noida headquarters." },
  { slug: "chandigarh", name: "Chandigarh", state: "Chandigarh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and education clients across Chandigarh, dispatched and service-backed from our Noida headquarters." },
  { slug: "jammu", name: "Jammu", state: "Jammu & Kashmir", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses and institutions across Jammu, dispatched and service-backed from our Noida headquarters." },
  { slug: "srinagar", name: "Srinagar", state: "Jammu & Kashmir", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality, retail and government clients across Srinagar, dispatched and service-backed from our Noida headquarters." },
  { slug: "dehradun", name: "Dehradun", state: "Uttarakhand", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for schools, hotels and offices across Dehradun, Uttarakhand, dispatched and service-backed from our Noida headquarters." },
  { slug: "meerut", name: "Meerut", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Meerut, Uttar Pradesh, dispatched and service-backed from our nearby Noida headquarters." },
  { slug: "agra", name: "Agra", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality, retail and education clients across Agra, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "aligarh", name: "Aligarh", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for institutions and businesses across Aligarh, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "allahabad", name: "Prayagraj (Allahabad)", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Prayagraj (Allahabad), Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "bareilly", name: "Bareilly", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bareilly, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "firozabad", name: "Firozabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Firozabad, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "gorakhpur", name: "Gorakhpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Gorakhpur, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "jhansi", name: "Jhansi", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jhansi, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "kanpur", name: "Kanpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for industry, retail and offices across Kanpur, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and retail clients across Lucknow, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "moradabad", name: "Moradabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Moradabad, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "saharanpur", name: "Saharanpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Saharanpur, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality, retail and education clients across Varanasi, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "amritsar", name: "Amritsar", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality and retail clients across Amritsar, Punjab, dispatched and service-backed from our Noida headquarters." },
  { slug: "jalandhar", name: "Jalandhar", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jalandhar, Punjab, dispatched and service-backed from our Noida headquarters." },
  { slug: "ludhiana", name: "Ludhiana", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for industry, retail and offices across Ludhiana, Punjab, dispatched and service-backed from our Noida headquarters." },
  { slug: "ajmer", name: "Ajmer", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ajmer, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "bikaner", name: "Bikaner", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bikaner, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Jaipur, Rajasthan — for its hospitality, retail and corporate sectors — with delivery, certified installation and AMC coordinated from our Noida headquarters." },
  { slug: "jodhpur", name: "Jodhpur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality and retail clients across Jodhpur, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "kota", name: "Kota", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the coaching institutes, schools and offices of Kota, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "udaipur", name: "Udaipur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality and retail clients across Udaipur, Rajasthan, dispatched and service-backed from our Noida headquarters." },

  // ── WEST (served from Noida) ───────────────────────────────────────────────
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Mumbai — from BKC corporate headquarters and Nariman Point offices to retail flagships and five-star hospitality. As an authorized Samsung distributor, we deliver, install and service the full signage, video-wall, interactive and hospitality-TV range citywide." },
  { slug: "navi-mumbai", name: "Navi Mumbai", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Navi Mumbai — for its Vashi and Airoli IT parks, retail and education clients — with certified installation and AMC support." },
  { slug: "thane", name: "Thane", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for offices, malls and institutions across Thane, Maharashtra, with certified installation and AMC support." },
  { slug: "pune", name: "Pune", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Pune — for its Hinjewadi IT campuses, automotive industry, education hubs and retail — delivering the full Samsung B2B display range with certified installation and AMC support." },
  { slug: "pimpri-and-chinchwad", name: "Pimpri-Chinchwad", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the manufacturing and corporate clients of Pimpri-Chinchwad, Maharashtra, with certified installation and AMC support." },
  { slug: "nashik", name: "Nashik", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nashik, Maharashtra, with certified installation and AMC support." },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Nagpur, Maharashtra, with certified installation and AMC support." },
  { slug: "aurangabad", name: "Aurangabad (Chhatrapati Sambhajinagar)", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Aurangabad (Chhatrapati Sambhajinagar), Maharashtra, with certified installation and AMC support." },
  { slug: "amravati", name: "Amravati", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Amravati, Maharashtra, with certified installation and AMC support." },
  { slug: "solapur", name: "Solapur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Solapur, Maharashtra, with certified installation and AMC support." },
  { slug: "kolapur", name: "Kolhapur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kolhapur, Maharashtra, with certified installation and AMC support." },
  { slug: "sangli", name: "Sangli", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Sangli, Maharashtra, with certified installation and AMC support." },
  { slug: "jalgaon", name: "Jalgaon", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jalgaon, Maharashtra, with certified installation and AMC support." },
  { slug: "nanded-waghala", name: "Nanded-Waghala", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nanded-Waghala, Maharashtra, with certified installation and AMC support." },
  { slug: "bhiwandi", name: "Bhiwandi", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the warehousing and retail businesses of Bhiwandi, Maharashtra, with certified installation and AMC support." },
  { slug: "kalyan", name: "Kalyan-Dombivli", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kalyan-Dombivli, Maharashtra, with certified installation and AMC support." },
  { slug: "ulhasnagar", name: "Ulhasnagar", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ulhasnagar, Maharashtra, with certified installation and AMC support." },
  { slug: "mira-and-bhayander", name: "Mira-Bhayandar", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Mira-Bhayandar, Maharashtra, with certified installation and AMC support." },
  { slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Ahmedabad — for its corporate offices, textile and retail businesses and education institutions — delivering the full Samsung B2B range with certified installation and AMC support." },
  { slug: "surat", name: "Surat", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the diamond, textile and retail businesses of Surat, Gujarat, with certified installation and AMC support." },
  { slug: "vadodara", name: "Vadodara", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate and industrial clients across Vadodara, Gujarat, with certified installation and AMC support." },
  { slug: "rajkot", name: "Rajkot", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Rajkot, Gujarat, with certified installation and AMC support." },
  { slug: "bhavnagar", name: "Bhavnagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bhavnagar, Gujarat, with certified installation and AMC support." },
  { slug: "jamnagar", name: "Jamnagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jamnagar, Gujarat, with certified installation and AMC support." },

  // ── CENTRAL (served from Noida) ────────────────────────────────────────────
  { slug: "bhopal", name: "Bhopal", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and education clients across Bhopal, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "indore", name: "Indore", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Indore — Madhya Pradesh's commercial hub — for its retail, corporate and education sectors, with certified installation and AMC support." },
  { slug: "gwalior", name: "Gwalior", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Gwalior, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jabalpur, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "ujjain", name: "Ujjain", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ujjain, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "raipur", name: "Raipur", state: "Chhattisgarh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate and government clients across Raipur, Chhattisgarh, with certified installation and AMC support." },
  { slug: "bhilai-nagar", name: "Bhilai", state: "Chhattisgarh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial and institutional clients of Bhilai, Chhattisgarh, with certified installation and AMC support." },

  // ── SOUTH (served from Noida) ──────────────────────────────────────────────
  { slug: "bangalore", name: "Bengaluru", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Bengaluru — from Whitefield and ORR tech campuses to retail, hospitality and education — delivering the full Samsung B2B signage, video-wall and interactive range with certified installation and AMC support." },
  { slug: "chennai", name: "Chennai", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Chennai — for its IT corridor offices, manufacturing, retail and hospitality clients — with certified installation and AMC support statewide." },
  { slug: "ambattur", name: "Ambattur", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial estate and businesses of Ambattur, Chennai, with certified installation and AMC support." },
  { slug: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for industry, education and retail clients across Coimbatore, Tamil Nadu, with certified installation and AMC support." },
  { slug: "madurai", name: "Madurai", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Madurai, Tamil Nadu, with certified installation and AMC support." },
  { slug: "salem", name: "Salem", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Salem, Tamil Nadu, with certified installation and AMC support." },
  { slug: "tiruchirappalli", name: "Tiruchirappalli (Trichy)", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Tiruchirappalli (Trichy), Tamil Nadu, with certified installation and AMC support." },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Hyderabad — from HITEC City corporate campuses to retail, hospitality and government — delivering the full Samsung B2B display range with certified installation and AMC support." },
  { slug: "warangal", name: "Warangal", state: "Telangana", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Warangal, Telangana, with certified installation and AMC support." },
  { slug: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Vijayawada, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the port, industrial and corporate clients of Visakhapatnam, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "guntur", name: "Guntur", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Guntur, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "nellore", name: "Nellore", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nellore, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "belgaum", name: "Belagavi (Belgaum)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Belagavi (Belgaum), Karnataka, with certified installation and AMC support." },
  { slug: "gulbarga", name: "Kalaburagi (Gulbarga)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kalaburagi (Gulbarga), Karnataka, with certified installation and AMC support." },
  { slug: "mangalore", name: "Mangaluru (Mangalore)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the port, education and retail clients of Mangaluru (Mangalore), Karnataka, with certified installation and AMC support." },
  { slug: "kochi", name: "Kochi", state: "Kerala", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the IT, hospitality and retail clients of Kochi, Kerala, with certified installation and AMC support." },
  { slug: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, IT and education clients across Thiruvananthapuram, Kerala, with certified installation and AMC support." },

  // ── EAST (served from Kolkata) ─────────────────────────────────────────────
  { slug: "kolkata", name: "Kolkata", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions serves Kolkata directly from our regional office in the city — supplying, installing and servicing the full Samsung commercial-display range for corporate, retail, hospitality and education clients across greater Kolkata with the fastest turnaround in eastern India." },
  { slug: "haora", name: "Howrah", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Howrah, West Bengal, served directly from our nearby Kolkata regional office with fast delivery, certified installation and AMC support." },
  { slug: "maheshtala", name: "Maheshtala", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Maheshtala, West Bengal, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "asansol", name: "Asansol", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Asansol, West Bengal, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "durgapur", name: "Durgapur", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial and institutional clients of Durgapur, West Bengal, served from our Kolkata regional office." },
  { slug: "siliguri", name: "Siliguri", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Siliguri, West Bengal, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, IT and education clients across Bhubaneswar, Odisha, served from our Kolkata regional office." },
  { slug: "cuttack", name: "Cuttack", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Cuttack, Odisha, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "guwahati", name: "Guwahati", state: "Assam", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Guwahati, Assam — the gateway to the North-East — served from our Kolkata regional office." },
  { slug: "patna", name: "Patna", state: "Bihar", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, education and retail clients across Patna, Bihar, served from our Kolkata regional office." },
  { slug: "gaya", name: "Gaya", state: "Bihar", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality and institutional clients of Gaya, Bihar, served from our Kolkata regional office." },
  { slug: "ranchi", name: "Ranchi", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and education clients across Ranchi, Jharkhand, served from our Kolkata regional office." },
  { slug: "dhanbad", name: "Dhanbad", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial and institutional clients of Dhanbad, Jharkhand, served from our Kolkata regional office." },
  { slug: "jamshedpur", name: "Jamshedpur", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the corporate and industrial clients of Jamshedpur, Jharkhand, served from our Kolkata regional office." },
];

/** Set of city slugs — used by middleware and tests. */
export const CITY_SLUGS: ReadonlySet<string> = new Set(cities.map((c) => c.slug));

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

/**
 * Honest, city-named FAQ. Every answer is true for a Noida-HQ / Kolkata-branch
 * company that ships and services nationwide — no fabricated local office.
 */
export function cityFaqs(city: City): Array<{ q: string; a: string }> {
  const office = SERVING_OFFICES[city.servedFrom];
  return [
    {
      q: `Do you deliver Samsung commercial displays to ${city.name}?`,
      a: `Yes. As an authorized Samsung distributor we dispatch to ${city.name} and across ${city.state} from our ${office.city} ${office.label}, with GST invoicing and pan-India logistics.`,
    },
    {
      q: `Do you provide installation and setup in ${city.name}?`,
      a: `Yes. We coordinate certified on-site installation and commissioning for ${city.name} projects — including video-wall mounting, alignment and MagicINFO/content setup.`,
    },
    {
      q: `Is service and AMC support available in ${city.name}?`,
      a: `Yes. On-site service and Annual Maintenance Contracts for ${city.name} are coordinated from our ${office.city} ${office.label} so your displays stay covered after installation.`,
    },
    {
      q: `Can a ${city.name} business get bulk or project pricing?`,
      a: `Yes. We quote B2B and project volumes with GST invoicing. Request a quote or call us and we'll price your ${city.name} requirement.`,
    },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- cities`
Expected: PASS (all describe blocks green). If "has exactly the 95 expected legacy slugs" fails, a slug is mistyped — reconcile against `EXPECTED_SLUGS`.

- [ ] **Step 5: Commit**

```bash
git add data/cities.ts data/cities.test.ts
git commit -m "feat(cities): add city data model + collision/regression tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: City Service JSON-LD helper

**Files:**
- Modify: `lib/jsonLd.ts` (add one export near `solutionServiceLd`)
- Test: `data/cities.test.ts` (append a describe block)

**Interfaces:**
- Consumes: `City` from `data/cities.ts`; `SITE`, `ORG_ID`, `Product`.
- Produces: `cityServiceLd(city: City, productsOnPage: Product[]): object`

- [ ] **Step 1: Append the failing test** to `data/cities.test.ts`

```ts
import { cityServiceLd } from "@/lib/jsonLd";

describe("cityServiceLd", () => {
  const city = getCityBySlug("kolkata")!;
  const ld = cityServiceLd(city, products.slice(0, 3)) as Record<string, any>;

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
    expect(ld.hasOfferCatalog.itemListElement).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- cities`
Expected: FAIL — `cityServiceLd is not exported` / `is not a function`.

- [ ] **Step 3: Add `cityServiceLd` to `lib/jsonLd.ts`**

At the top of `lib/jsonLd.ts`, add to the imports:

```ts
import type { City } from "@/data/cities";
```

Then add this export immediately after the `solutionServiceLd` function:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- cities`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/jsonLd.ts data/cities.test.ts
git commit -m "feat(cities): add cityServiceLd (Service + areaServed, no LocalBusiness)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Middleware guard + redirect repoint

**Files:**
- Modify: `middleware.ts`
- Modify: `lib/redirects.ts`
- Modify: `lib/redirects.test.ts` (add `"locations"` to the local `RESERVED_ROOTS` mirror)

**Interfaces:**
- Consumes: `CITY_SLUGS` from `data/cities.ts`.
- Produces: no new exports; behavioral guarantee that single-segment city paths pass through and `our-presence` → `/locations`.

- [ ] **Step 1: Update the redirects test mirror first** (`lib/redirects.test.ts`)

The existing loop-guard test builds a local `RESERVED_ROOTS` mirroring middleware. Once `our-presence` maps to `/locations`, that target's first segment (`locations`) must be recognized as reserved or the loop test fails. Add `"locations"`:

```ts
const RESERVED_ROOTS = new Set([
  "products", "categories", "solutions", "blogs", "product-finder",
  "compare", "quote", "about", "contact", "privacy", "terms", "api", "locations",
]);
```

- [ ] **Step 2: Repoint `our-presence` in `lib/redirects.ts`**

```ts
  "our-presence": "/locations",
```

(Change the existing `"our-presence": "/contact",` line. The legacy `/our-presence` page IS the
locations page, so `/locations` is its true successor.)

- [ ] **Step 3: Run the redirects test — expect PASS**

Run: `npm test -- redirects`
Expected: PASS. (If "no redirect target lands somewhere the middleware would redirect again"
fails, `"locations"` was not added to the mirror in Step 1.)

- [ ] **Step 4: Add the city guard + reserved root to `middleware.ts`**

Add the import beside the existing redirects import:

```ts
import { CITY_SLUGS } from "@/data/cities";
```

Add `"locations"` to `RESERVED_ROOTS`:

```ts
const RESERVED_ROOTS = new Set([
  "products",
  "categories",
  "solutions",
  "blogs",
  "product-finder",
  "compare",
  "quote",
  "about",
  "contact",
  "privacy",
  "terms",
  "api",
  "locations",
]);
```

Add the city guard immediately after `const first = segments[0];` (before the merged-product
block):

```ts
  // Legacy city landing pages (/delhi, /mumbai, …) are real routes now. Guard
  // them BEFORE the product-slug fallthrough below, which matches on the last
  // path segment and would otherwise 301 a single-segment city path away if a
  // product slug ever shared its name. Today no collision exists (asserted in
  // data/cities.test.ts); this keeps it safe as the catalog grows.
  if (segments.length === 1 && CITY_SLUGS.has(first)) {
    return NextResponse.next();
  }
```

- [ ] **Step 5: Add a middleware behavior test** — create `middleware.test.ts` at repo root

```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function run(path: string) {
  return middleware(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));
}

describe("middleware city handling", () => {
  it("passes a city root through untouched (no redirect)", () => {
    const res = run("/delhi");
    // NextResponse.next() has no Location header; a redirect would be 307/308/301.
    expect(res.headers.get("location")).toBeNull();
  });

  it("still 301s a city×product URL to the product page", () => {
    const res = run("/delhi/samsung-interactive-display-flip-3");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      "https://www.aplustechsol.com/products/samsung-interactive-flip-3"
    );
  });

  it("301s the legacy locations page to /locations", () => {
    const res = run("/our-presence");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.aplustechsol.com/locations");
  });
});
```

> If `NextRequest` cannot be constructed under the vitest `node` environment in this Next
> version, delete this file and rely on the `data/cities.test.ts` collision invariants plus the
> `redirects.test.ts` loop guard, which together prove the guard's correctness. Do not spend more
> than a few minutes here.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS (all suites). Confirm the flip-3 product id in the assertion matches
`OLD_PRODUCT_SLUG_TO_ID["samsung-interactive-display-flip-3"]` in `lib/redirects.ts` — if the map
uses a different canonical id, update the expected `location`.

- [ ] **Step 7: Commit**

```bash
git add middleware.ts middleware.test.ts lib/redirects.ts lib/redirects.test.ts
git commit -m "feat(cities): middleware city guard + repoint /our-presence to /locations

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: City landing page

**Files:**
- Create: `app/[city]/page.tsx`
- Create: `app/[city]/loading.tsx`
- Create: `app/[city]/error.tsx`

**Interfaces:**
- Consumes: `cities`, `getCityBySlug`, `cityFaqs`, `SERVING_OFFICES` (Task 1); `cityServiceLd` (Task 2); `products`, `byLatestThenPopularity`, `ProductCard`, `PHONE_*`, jsonLd helpers.
- Produces: static routes for all 95 city slugs.

- [ ] **Step 1: Create `app/[city]/loading.tsx`**

```tsx
export default function CityLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="h-3 w-24 bg-blue-100 rounded-full mx-auto" />
          <div className="h-10 w-80 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-full max-w-lg bg-gray-100 rounded mx-auto" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-100 rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/[city]/error.tsx`**

```tsx
"use client";

import ErrorCard from "@/components/ErrorCard";

export default function CityError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load this location"
      message="There was a problem loading this page. Please try again or browse the product catalog."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
```

- [ ] **Step 3: Create `app/[city]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone, Check, Truck, Wrench, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { cities, getCityBySlug, cityFaqs, SERVING_OFFICES } from "@/data/cities";
import { products } from "@/data/products";
import { byLatestThenPopularity } from "@/lib/productSort";
import ProductCard from "@/components/ProductCard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import {
  SITE,
  breadcrumbLd,
  cityServiceLd,
  faqPageLd,
  jsonLdString,
} from "@/lib/jsonLd";

export const revalidate = 3600;

// Only the 95 enumerated city slugs render; any other single-segment path must
// hard-404 at the routing layer (see memory: soft-404-dynamicparams-fix).
export const dynamicParams = false;

interface PageParams {
  city: string;
}

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Location Not Found | Aplus Technology Solutions" };

  const url = `${SITE}/${city.slug}`;
  const title = `Samsung Commercial Displays in ${city.name} | Aplus Technology Solutions`;
  return {
    title,
    description: city.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description: city.intro,
      images: [{ url: `/${city.slug}/opengraph-image`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: city.intro,
      images: [`/${city.slug}/opengraph-image`],
    },
  };
}

// Top of the catalog, shown on every city page (same distributor, same catalog
// everywhere — the city-specific value is the intro, serve block and FAQ).
const FEATURED = [...products].sort(byLatestThenPopularity).slice(0, 8);

export default async function CityPage({ params }: { params: Promise<PageParams> }) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const office = SERVING_OFFICES[city.servedFrom];
  const faqs = cityFaqs(city);

  // A few other cities in the same region, for internal linking (crawlability).
  const nearby = cities.filter((c) => c.region === city.region && c.slug !== city.slug).slice(0, 6);

  const jsonLd = [
    cityServiceLd(city, FEATURED),
    faqPageLd(faqs.map((f) => ({ question: f.q, answer: f.a }))),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Locations", url: "/locations" },
      { name: city.name, url: `/${city.slug}` },
    ]),
  ];

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <nav className="flex items-center gap-1.5 text-xs text-blue-100/70 mb-10 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href="/locations" className="hover:text-white transition-colors">Locations</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-white/90 font-medium">{city.name}</span>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">
            {city.state} · Authorized Samsung Distributor
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
            Samsung Commercial Displays in {city.name}
          </h1>
          <p className="text-base md:text-lg text-blue-100/90 mt-5 max-w-3xl leading-relaxed">
            {city.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/30"
            >
              Request a Quote <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW WE SERVE {CITY} ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              How we serve {city.name}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Supply, installation &amp; service across {city.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Truck, title: "Delivery to " + city.name,
                body: `Dispatched from our ${office.city} ${office.label} with GST invoicing and pan-India logistics to ${city.name} and across ${city.state}.` },
              { icon: Wrench, title: "Certified installation",
                body: `On-site mounting, alignment and MagicINFO/content setup for signage, video walls and interactive displays in ${city.name}.` },
              { icon: ShieldCheck, title: "Service & AMC",
                body: `On-site service and Annual Maintenance Contracts for ${city.name}, coordinated from our ${office.city} ${office.label}.` },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                Available in {city.name}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Popular Samsung displays
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
            >
              View all products
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURED.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Buying Samsung displays in {city.name}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-50 border border-gray-200 rounded-2xl p-6 open:shadow-md transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-base list-none">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight size={20} className="shrink-0 text-blue-600 transition-transform duration-300 group-open:rotate-90" aria-hidden="true" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── OTHER CITIES ─────────────────────────────────────────────────── */}
      {nearby.length > 0 && (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-4">
              We also serve
            </p>
            <div className="flex flex-wrap gap-2.5">
              {nearby.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/locations"
                className="inline-flex items-center gap-1 bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                All locations <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Verify the build prerenders all 95 cities**

Run: `npm run build`
Expected: build succeeds; output lists `● /[city]` with 95 prerendered paths (`/delhi`,
`/mumbai`, … `[+92 more paths]`). No "missing generateStaticParams" or type errors.

- [ ] **Step 5: Commit**

```bash
git add "app/[city]/page.tsx" "app/[city]/loading.tsx" "app/[city]/error.tsx"
git commit -m "feat(cities): city landing page route (/[city]) with serve block + FAQ

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Per-city OG image

**Files:**
- Create: `app/[city]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `getCityBySlug` (Task 1).

- [ ] **Step 1: Create `app/[city]/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { getCityBySlug } from "@/data/cities";

export const alt = "Samsung Commercial Displays | Aplus Technology Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1526", color: "white", fontSize: 32, fontFamily: "sans-serif" }}>
          Location Not Found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #050b15 0%, #0d1f40 60%, #0a1628 100%)", padding: "56px 64px", fontFamily: "system-ui, sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "rgba(37, 99, 235, 0.18)", filter: "blur(80px)" }} />
        <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
          <div style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", color: "#93c5fd", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
            Authorized Samsung Distributor
          </div>
        </div>
        {/* single-child div needs no explicit display, but keep it for Satori safety */}
        <div style={{ display: "flex", color: "#60a5fa", fontSize: 15, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
          {city.state}
        </div>
        <div style={{ color: "#ffffff", fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 28, maxWidth: 900, display: "flex" }}>
          Samsung Commercial Displays in {city.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 22 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, fontWeight: 500 }}>aplustechsol.com</div>
          <div style={{ background: "rgba(37,99,235,0.9)", color: "white", padding: "10px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center" }}>
            Get a Quote →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds; output shows `ƒ /[city]/opengraph-image`. (Satori: any element with
>1 child must set `display`. Each multi-text div above has an explicit `display: "flex"` — see
memory: og-image-satori-constraints.)

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/opengraph-image.tsx"
git commit -m "feat(cities): per-city OG image

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Locations index + footer link

**Files:**
- Create: `app/locations/page.tsx`
- Modify: `components/Footer.tsx`

**Interfaces:**
- Consumes: `cities`, `Region` (Task 1); jsonLd helpers.

- [ ] **Step 1: Create `app/locations/page.tsx`**

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { cities, type Region } from "@/data/cities";
import { SITE, breadcrumbLd, jsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Locations We Serve | Aplus Technology Solutions",
  description:
    "Aplus Technology Solutions supplies and installs Samsung commercial displays across India — from our Noida headquarters and Kolkata regional office. Find your city.",
  alternates: { canonical: `${SITE}/locations` },
};

const REGION_LABELS: Record<Region, string> = {
  north: "North India",
  west: "West India",
  south: "South India",
  east: "East India",
  central: "Central India",
};
const REGION_ORDER: Region[] = ["north", "west", "south", "east", "central"];

export default function LocationsPage() {
  const jsonLd = breadcrumbLd([
    { name: "Home", url: "/" },
    { name: "Locations", url: "/locations" },
  ]);

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">Pan-India Delivery &amp; Service</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
            Locations we serve
          </h1>
          <p className="text-base md:text-lg text-blue-100/90 mt-5 max-w-3xl leading-relaxed">
            As an authorized Samsung commercial-display distributor, we deliver, install and service
            across India — coordinated from our Noida headquarters and Kolkata regional office.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {REGION_ORDER.map((region) => {
            const group = cities.filter((c) => c.region === region);
            if (group.length === 0) return null;
            return (
              <div key={region}>
                <h2 className="text-xl font-bold text-gray-900 mb-5">{REGION_LABELS[region]}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {group.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      className="block bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Add the footer link** in `components/Footer.tsx`

Change the `COMPANY_LINKS` array to include Locations:

```ts
const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Locations", href: "/locations" },
  { label: "Blogs & Insights", href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
  { label: "Request a Quote", href: "/quote" },
];
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds; output lists `○ /locations` (static). Footer renders the Locations link
site-wide.

- [ ] **Step 4: Commit**

```bash
git add app/locations/page.tsx components/Footer.tsx
git commit -m "feat(cities): /locations index page + footer link

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Sitemap entries

**Files:**
- Modify: `app/sitemap.ts`
- Test: `app/sitemap.test.ts` (create)

**Interfaces:**
- Consumes: `cities` (Task 1); existing `sitemap()` default export.

- [ ] **Step 1: Write the failing test** — `app/sitemap.test.ts`

```ts
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { cities } from "@/data/cities";
import { SITE } from "@/lib/jsonLd";

describe("sitemap city coverage", () => {
  const urls = new Set(sitemap().map((e) => e.url));

  it("includes every city landing page", () => {
    const missing = cities.filter((c) => !urls.has(`${SITE}/${c.slug}`)).map((c) => c.slug);
    expect(missing).toEqual([]);
  });

  it("includes the /locations index", () => {
    expect(urls.has(`${SITE}/locations`)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- sitemap`
Expected: FAIL — city URLs missing.

- [ ] **Step 3: Update `app/sitemap.ts`**

Add the import beside the other data imports:

```ts
import { cities } from "@/data/cities";
```

Add `/locations` to the `staticPages` array (after the `about`/`contact` entries):

```ts
    { url: `${SITE}/locations`,       lastModified: CATALOG_LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
```

Add a `cityUrls` array before the `return`:

```ts
  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE}/${c.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
```

And spread it into the returned array:

```ts
  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
    ...solutionUrls,
    ...comboUrls,
    ...blogUrls,
    ...cityUrls,
  ];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- sitemap`
Expected: PASS.

- [ ] **Step 5: Full test + build**

Run: `npm test && npm run build`
Expected: all suites PASS; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts app/sitemap.test.ts
git commit -m "feat(cities): add city + locations URLs to sitemap

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Client review of city copy (gate — not code)

**Files:** `data/cities.ts` (`intro` fields only)

This is the honesty/quality gate from the spec. It is not an engineering task — it is a review
checkpoint the client owns.

- [ ] **Step 1:** Hand the rendered `/locations` list and a sample of city pages (`/delhi`,
  `/kolkata`, `/agra`) to the client.
- [ ] **Step 2:** Client confirms each `intro` is TRUE (no implied local office, no invented
  district if we don't serve it) and reads as genuinely city-specific.
- [ ] **Step 3:** If any city cannot carry an honest, distinct intro, **remove it** from
  `data/cities.ts` and its `EXPECTED_SLUGS` fixture entry, and add an explicit redirect for that
  slug in `lib/redirects.ts` (`OLD_EXACT_PATH_TO_NEW[slug] = "/locations"`) so the URL still
  resolves. Prefer fewer strong pages over many thin ones.
- [ ] **Step 4:** Re-run `npm test && npm run build`; commit the edited copy.

---

## Out of scope (tracked on the migration checklist, not this plan)

- 4 legacy blog posts (`/blog/{slug}`) that 301 into non-existent new slugs — need an explicit
  old→new blog-slug map; `/blog/samsung-hospitality-tv-hgbu800` → `/products/samsung-hotel-tv-hgbu800`.
- 3 legacy `/sitemap/sitemap-N.xml` paths — need a `next.config` redirect (middleware skips
  dotted paths).
- Hosting cutover (Vercel), DNS A-record repoint (keep Zoho MX untouched), env vars, Resend domain
  verification, `NEXT_PUBLIC_GA_ID`.

## Self-Review

**Spec coverage** — every spec section maps to a task: routing + `dynamicParams=false` (T4),
`data/cities.ts` model (T1), `Service`+`areaServed` / no-`LocalBusiness` schema (T2), middleware
guard + `locations` reserved root (T3), `our-presence`→`/locations` (T3), `/locations` index +
footer link + "other cities" block (T4/T6), sitemap entries (T7), OG image (T5), and the full
test set — collision against reserved/ids/**redirect-map keys**, 95-slug fixture, middleware
pass-through + still-301s product URLs, sitemap coverage (T1/T3/T7). Trailing-slash decision needs
no code (accepted). Client copy gate is T8.

**Placeholder scan** — no `TBD`/`TODO`/"handle edge cases" in code. All 95 `intro` strings are
real drafts, not placeholders; T8 is an explicit non-code review gate.

**Type consistency** — `City`/`Region`/`SERVING_OFFICES`/`cityFaqs`/`getCityBySlug`/`CITY_SLUGS`
used identically across tasks; `cityServiceLd(city, Product[])` signature matches T2↔T4;
`cityFaqs` `{q,a}` mapped to `faqPageLd`'s `{question,answer}`; `ProductCard` takes `product`.
Middleware flip-3 assertion target `samsung-interactive-flip-3` verified against
`OLD_PRODUCT_SLUG_TO_ID`.

**Fixes applied inline:** removed the unused `focusCategories` field (and its now-orphaned
`CategorySlug` import) — the product grid uses a global top-8, so the field was dead interface
surface (YAGNI).
