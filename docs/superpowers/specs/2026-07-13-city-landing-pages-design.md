# City Landing Pages — Design

**Date:** 2026-07-13
**Status:** Approved (design), pending implementation plan
**Context:** Migration of `aplustechsol.com` from the legacy PHP site to this Next.js site.

---

## Problem

The legacy site publishes **7,507 URLs**. Simulating [`middleware.ts`](../../../middleware.ts) against the live
sitemaps shows **7,405 are handled** by the existing redirect maps and **102 would 404**:

| Bucket | Count | Status |
| --- | --- | --- |
| `/{city}/{product}` (95 cities × 75 products) | 7,125 | ✅ 301 → `/products/{id}` (already works) |
| `/{role}/{product}` (`distributor`/`suppliers`/`exporters`) | 225 | ✅ 301 → `/products/{id}` |
| `/{category-root}/{product}` | 38 | ✅ 301 → `/products/{id}` |
| Other single-segment pages (`/about-us`, `/our-presence`, …) | 17 | ✅ 301 (exact-path map) |
| **City hub pages** (`/delhi`, `/mumbai`, …) | **95** | ❌ **404 — this spec** |
| Blog posts (`/blog/{slug}`) | 4 | ❌ 301 → a slug that does not exist (out of scope, tracked) |
| Old sitemap files (`/sitemap/sitemap-N.xml`) | 3 | ❌ 404 (out of scope, tracked) |
| **Total** | **7,507** | 7,405 handled · 102 broken |

The 95 city hubs are the **only** legacy pages that target local intent — their titles read
*"Supplier and Distributer of Samsung Interactive Displays in Delhi"*. They are also the ones
that would break. This spec restores them.

## Why we are NOT rebuilding the 7,125 city×product pages

Evidence gathered by diffing the live pages:

- `/delhi/samsung-interactive-display-flip-3/` and `/mumbai/samsung-interactive-display-flip-3/`
  are **byte-identical apart from the canonical URL, breadcrumb JSON-LD, and the city name
  substituted ~8 times** into boilerplate. ~711 words.
- Their `<title>` and `<h1>` are just `Samsung Interactive Display Flip 3` — **the city name does
  not appear**. So they never targeted local queries; they are ~104 clones (95 cities + 3 role
  roots + 6 category roots) cannibalising each other for one product term.

Consolidating them ~104 → 1 via the existing 301s is therefore a **net SEO gain**, not a loss.
Rebuilding 7,125 name-swapped pages on a fresh domain would be scaled-content abuse under
Google's spam policies, and — with one HQ (Noida) and one regional office (Kolkata) — could not
be honestly differentiated anyway.

## Approach

Build **95 city hub pages at their existing root-level URLs**, with content that is true and
genuinely varies by city. Leave the 7,125 product redirects exactly as they are.

### Routing

- Route: `app/[city]/page.tsx` — **root-level**, preserving the indexed URL (`/delhi`) exactly.
  No redirect, no equity transfer.
- `generateStaticParams()` over a closed 95-entry list + **`dynamicParams = false`**, matching
  every other dynamic route in this repo (prevents soft-404s; unknown roots still hard-404).
- `revalidate = 3600`, consistent with existing routes.

**Collision safety (verified, not assumed):** none of the 95 slugs collide with any reserved
root, product id, category id, solution slug, blog slug, **or any key in the four redirect maps**
(`OLD_PRODUCT_SLUG_TO_ID`, `OLD_CATEGORY_ROOT_TO_ID`, `OLD_EXACT_PATH_TO_NEW`,
`MERGED_PRODUCT_TO_CANONICAL`) — proven by the fact that all 95 fell through every map in the
simulation. Static routes take precedence over the dynamic segment in Next, so the root
namespace is safe. A test locks this invariant in.

**Middleware:** requires no functional change — `/delhi` already falls through to the router.
We add an explicit city-slug pass-through guard so a future product slug can never hijack a
city page.

**Trailing slashes:** 7,581 of 7,584 indexed legacy URLs end in `/`. Next's default
(`trailingSlash: false`) 308-redirects `/delhi/` → `/delhi`. We **accept this one hop**.
Flipping `trailingSlash: true` would desync every canonical / sitemap / JSON-LD URL in the
codebase (all built as `${SITE}/path`, no trailing slash) — a site-wide canonical mismatch to
save one hop on 95 pages. Bad trade. The 7,125 product redirects are unaffected: middleware
strips the slash itself and 301s in a single hop.

### Data model — `data/cities.ts`

Follows the `data/useCaseCombos.ts` convention already in the repo.

```ts
export interface City {
  slug: string;                    // "agra" — MUST equal the legacy URL segment
  name: string;                    // "Agra"
  state: string;                   // "Uttar Pradesh"
  region: "north" | "south" | "east" | "west" | "central";
  servedFrom: "noida" | "kolkata"; // office that actually dispatches & services
  /** 2–3 hand-written, city-specific sentences. The anti-doorway insurance. */
  intro: string;
  /** Real business districts / sectors served, if any. Optional. */
  areas?: string[];
  /** Categories that genuinely lead in this market. Drives the product grid. */
  focusCategories?: CategorySlug[];
}
```

`servedFrom` encodes a fact that is true and genuinely varies (Kolkata serves the east; Noida
serves the rest), driving honest copy about lead times and on-site service instead of fabricated
local presence.

**`intro` is the load-bearing field.** Everything else is derivable; this is what separates the
page from the template it replaces. All 95 will be drafted, but **the client must review them** —
local facts cannot be invented.

> **Quality gate:** if 95 genuinely distinct intros cannot be written, cut the list to the cities
> where real business happens. **Ship 30 strong pages, never 95 thin ones.**

### Page content

- **H1 / title:** `Samsung Commercial Displays in {City}` — city in the title, which the legacy
  product pages never did.
- Hand-written `intro`.
- **"How we serve {City}"** — dispatched/installed from {office}, realistic regional lead time,
  on-site service + AMC coverage, site-survey offer.
- Product grid → canonical `/products/{id}` links.
- Short city-relevant FAQ.
- Quote CTA.

### Schema

`Service` + `areaServed: City`, plus `FAQPage` and breadcrumbs.
**Explicitly NOT `LocalBusiness`** — there is no local address, and marking one up would be false.
Self-canonical to `https://www.aplustechsol.com/{city}`.
`opengraph-image.tsx` per the existing per-route pattern (Satori: `display:flex`, no `inline-flex`).

### Integration

- **`/locations` index page** listing all 95 cities; linked from the footer (95 orphan pages
  would crawl badly).
- **Repoint the legacy locations page.** `OLD_EXACT_PATH_TO_NEW` currently maps
  `"our-presence": "/contact"`. The legacy `/our-presence` page *is* the locations page, so it
  should 301 to **`/locations`** — its natural successor — not to `/contact`. One-line change in
  `lib/redirects.ts`.
- Modest "other cities we serve" block per page.
- Cities added to `app/sitemap.ts` (95 city URLs + `/locations`).

## Testing

1. Every city slug is unique and collides with **nothing** — reserved roots, product / category /
   solution / blog ids, and all four redirect-map key sets.
2. All 95 city slugs harvested from the legacy sitemap have a `data/cities.ts` entry
   (regression guard against silently dropping one).
3. Middleware passes city roots through un-redirected, **and still 301s `/{city}/{product}`**.
4. `app/sitemap.ts` contains all 95 city URLs plus `/locations`.
5. `our-presence` resolves to `/locations`.

The 95-slug list and the live-URL corpus used to derive it are reproducible from the legacy
sitemaps (`/sitemap/sitemap-{1,2,3}.xml`); test 2 should assert against a committed fixture of
that list so a future catalog edit cannot silently drop a ranking city.

## Out of scope (tracked on the migration list)

- 4 legacy blog posts 301'ing into non-existent slugs (needs an explicit old→new slug map;
  `/blog/samsung-hospitality-tv-hgbu800` should point at `/products/samsung-hotel-tv-hgbu800`).
- 3 legacy `/sitemap/sitemap-N.xml` paths (need a `next.config` redirect — middleware skips
  dotted paths).
- Hosting cutover, DNS, env vars, Resend domain verification.

## Note on local search

For *"Samsung display dealer near me"* queries, a **Google Business Profile** for the Noida HQ and
the Kolkata office will outperform any number of city pages. These hubs support that; they do not
substitute for it.

## Appendix — the 95 city slugs

```
agra ahmedabad ajmer aligarh allahabad ambattur amravati amritsar asansol aurangabad
bangalore bareilly belgaum bhavnagar bhilai-nagar bhiwandi bhopal bhubaneswar bikaner
chandigarh chennai coimbatore cuttack dehradun delhi dhanbad durgapur faridabad firozabad
gaya ghaziabad gorakhpur greater-noida gulbarga guntur gurgaon guwahati gwalior haora
hyderabad indore jabalpur jaipur jalandhar jalgaon jammu jamnagar jamshedpur jhansi jodhpur
kalyan kanpur kochi kolapur kolkata kota lucknow ludhiana madurai maheshtala mangalore
meerut mira-and-bhayander moradabad mumbai nagpur nanded-waghala nashik navi-mumbai nellore
noida patna pimpri-and-chinchwad pune raipur rajkot ranchi saharanpur salem sangli siliguri
solapur srinagar surat thane thiruvananthapuram tiruchirappalli udaipur ujjain ulhasnagar
vadodara varanasi vijayawada visakhapatnam warangal
```
