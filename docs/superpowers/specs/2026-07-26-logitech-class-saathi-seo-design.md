# Logitech Video Conferencing & Class Saathi — SEO Surface Design

**Date:** 2026-07-26
**Status:** Approved (design), pending implementation plan

## Goal

Bring the Logitech Video Conferencing and Class Saathi (Education) categories up to
the SEO surface area the Samsung categories already have. Today both have solid
on-page scaffolding but almost no *content* surface: Samsung's four core categories
carry 16 programmatic `/solutions/{industry}/{category}` landing pages and 4 blog
posts between them; Logitech VC and Class Saathi carry zero of each.

## Current state

| Surface | Samsung (4 core cats) | Logitech VC | Class Saathi |
|---|---|---|---|
| Category page, overview copy, FAQs | yes | yes | yes (standalone landing) |
| Category metadata / canonical / OG image | yes | yes | yes |
| Category JSON-LD | CollectionPage + ItemList + Breadcrumb + FAQPage | same | **Breadcrumb + FAQPage only** |
| Product detail pages (FAQ + Product LD + OG) | yes | yes (16 products) | n/a (zero catalog products) |
| `/solutions/{industry}/{category}` pages | **16** | **0** | **0** |
| Blog posts | 4 | **0** | **0** |
| Footer link to the category page | yes | yes | **no** (navbar dropdowns only) |
| Home CategoryGrid tile | yes | yes | **no** |

Note the CategoryGrid tiles link to `/products?category={id}`, not `/categories/{id}`
(`components/sections/CategoryGrid.tsx`, `CategoryTile`), so they are catalog-filter
entry points rather than links to the category landing pages. This matters for
Fix 7 below.

The Class Saathi JSON-LD gap has a specific cause: the education branch returns at
`app/categories/[slug]/page.tsx:125` before the `jsonLd` array is constructed, so
the landing emits only what `EducationLanding.tsx` adds itself.

## Decisions

### Scale: differentiated axes only

Mechanical keyword permutation (16 products x 95 cities x N query templates) is
rejected. It is what Google's scaled-content-abuse policy targets, it is the same
trap the city-pages spec avoided by going hubs-only, and `data/useCaseCombos.ts`
already documents the rule: *"Each combo is intentionally hand-written (not
template-derived) so each page carries unique value and avoids Google's
doorway-page penalty."* The domain is also mid-migration, which raises the cost of
a sitewide quality signal problem.

Permutation is used only along axes where cells differ in substance — different
products recommended, different objections, different specs. For Logitech that is
**room size** and **platform**, which is how Logitech segments its own catalog and
how buyers search. City x product cells do not differ in substance; room x platform
cells do.

### URL shape: nested under the existing category pages

Child segments under the already-ranking category parents. Parent/child is
unambiguous to Google, breadcrumbs are natural, and no new top-level namespace is
introduced.

Rejected: brand-led top-level routes (`/logitech/...`, `/class-saathi/...`) — no
crawl path from a ranking parent. Rejected: extending `/solutions` with new
industries — `education` is *already* both a solution slug and a category slug, so
a Class Saathi combo would land at `/solutions/education/education`.

### Class Saathi: 2 segments + 1 comparison, not 3 segments

`data/education.test.ts:18-32` enforces a strict content-truth policy: every claim
must trace to the Class Saathi brochure or tag-hive.com, no partnership language,
"Samsung" only as "Samsung C-Lab", and a blocklist of previously-fabricated claims.
All verified Class Saathi facts come from one brochure and four stakeholder feature
sets. Three parallel audience pages drawn from that single pool would read as
templated — the exact thin-content failure this spec rejects at scale.

So the third page is a category-education comparison whose claims are about
clicker-based response systems generally, not new Class Saathi assertions. It is
policy-safe by construction and targets high-intent research queries.

### VC industry combos: corporate, education, hospitality

Retail is excluded — five genuinely distinct retail video-conferencing use cases
cannot be written without padding.

## Page inventory: 11 pages + 4 posts (15 new URLs)

### Logitech VC — 3 industry combos (existing route, data only)

- `/solutions/corporate/video-conferencing`
- `/solutions/education/video-conferencing`
- `/solutions/hospitality/video-conferencing`

### Logitech VC — 5 room and platform guides (new route)

Product sets are derived from the room band each product already declares in
`specs.operationTime`, so no room claim is invented:

| Slug | Kind | Products (by id) |
|---|---|---|
| `huddle-rooms` | room | `logitech-rally-bar-huddle`, `logitech-meetup-2`, `logitech-tap-ip`, `logitech-tap-scheduler` |
| `medium-meeting-rooms` | room | `logitech-rally-bar-mini`, `logitech-rally-bar`, `logitech-ptz-pro-2`, `logitech-rally-camera`, `logitech-tap`, `logitech-roommate` |
| `boardrooms` | room | `logitech-rally-plus`, `logitech-rally-board-65`, `logitech-rally-ai-camera-pro`, `logitech-sight`, `logitech-scribe`, `logitech-tap` |
| `microsoft-teams-rooms` | platform | `logitech-rally-bar-huddle`, `logitech-rally-bar-mini`, `logitech-rally-bar`, `logitech-rally-board-65`, `logitech-tap-ip`, `logitech-roommate`, `logitech-tap-scheduler` |
| `zoom-rooms` | platform | `logitech-rally-bar-huddle`, `logitech-rally-bar-mini`, `logitech-rally-bar`, `logitech-rally-plus`, `logitech-rally-board-65`, `logitech-tap`, `logitech-roommate` |

The three room guides have disjoint primary products; only the Tap controller
recurs across two, as an any-room accessory rather than a primary recommendation.
The two platform guides share
products by necessity (most Logitech bars run both platforms) and therefore
differentiate on body content: deployment modes (on-device appliance vs. room
compute vs. network-only controller), the room ladder for that platform, and
platform-specific FAQs. This is enforced by test, see T1.

All URLs are `/categories/video-conferencing/{slug}`.

### Class Saathi — 3 pages (new route)

All URLs are `/categories/education/{slug}`.

| Slug | Lead stakeholder | Angle |
|---|---|---|
| `k-12-schools` | admin + parent | Whole-school dashboard, monthly LMS reports, parent progress visibility, no-internet operation, 40%-to-100% participation |
| `coaching-institutes` | student + teacher | Daily quizzes, subject-centric practice, Saathi Tutor, AI quiz generation from the institute's own material, live participation and score visibility across batches |
| `clickers-vs-alternatives` | n/a | Clicker-based response systems vs. phone/app quizzing vs. interactive panels vs. paper. Claims are category-level; Class Saathi statements limited to verified facts (Bluetooth, no internet required, no per-student screen, runs on the teacher's device) |

### Blog — 4 posts

| Slug | Title |
|---|---|
| `sizing-a-video-conferencing-system-to-your-room` | How to Size a Video Conferencing System to Your Meeting Room |
| `microsoft-teams-rooms-vs-zoom-rooms-hardware` | Microsoft Teams Rooms vs Zoom Rooms: Choosing Meeting Room Hardware |
| `what-is-a-student-response-system` | What Is a Student Response System? |
| `formative-assessment-without-internet` | Formative Assessment Without Internet: How Clicker Classrooms Work |

Each follows the existing `data/blogs.ts` shape and links to the relevant category,
guide, or segment pages.

## Architecture

### One new route, dispatching to two components

`app/categories/[slug]/[sub]/page.tsx` — a thin route file holding only params,
`generateMetadata`, `generateStaticParams`, `dynamicParams = false`, JSON-LD
assembly, and a dispatch to one of two page components:

- `components/vc/VcRoomGuide.tsx`
- `components/education/EducationSegmentPage.tsx`

`generateStaticParams` enumerates only valid `(slug, sub)` pairs from the two new
data files. `dynamicParams = false` is required by the project's soft-404 rule:
without it an unknown pair streams through `loading.tsx` and ISR, and `notFound()`
returns a soft 200 instead of a real 404.

This mirrors `/solutions/[industry]/[category]` and avoids introducing a literal
`app/categories/video-conferencing/` directory, which would raise the question of
whether `/categories/video-conferencing` itself still resolves to `[slug]`.

**Breadcrumbs are 4 levels, not 3.** Both existing parents put `/products` at level
two — `app/categories/[slug]/page.tsx:145-149` and
`components/education/EducationLanding.tsx:20-24` each emit
`Home -> Products -> {Category}`. A child page must extend that trail rather than
invent a shorter one, or its `BreadcrumbList` will contradict its own parent's:

```text
Home (/) -> Products (/products) -> Video Conferencing (/categories/video-conferencing)
  -> Huddle Rooms (/categories/video-conferencing/huddle-rooms)
```

The same 4-level shape applies to the education segments. The visible breadcrumb nav
and the `BreadcrumbList` JSON-LD must match.

Each new route also gets an `opengraph-image.tsx`. Satori constraints apply: every
container needs an explicit `display: flex`, and `inline-flex` is unsupported.

### Data model — curation by explicit id

Three data changes, all curating products by id rather than by string match:

**`data/vcRoomGuides.ts`** (new)
```ts
export interface VcRoomGuide {
  slug: string;
  kind: "room" | "platform";
  /** SEO H1, ~50-65 chars. */
  title: string;
  subtitle: string;
  /** ~50-word intro, used for meta description and hero body. */
  intro: string;
  /**
   * For kind "room": the exact `specs.operationTime` values this guide claims to
   * cover, e.g. ["Huddle Rooms", "Huddle-Small Rooms"]. Makes the room claim
   * machine-checkable against product data (see T1). Omitted for platform guides.
   */
  roomBands?: string[];
  /** Curated product ids, in display order. */
  productIds: string[];
  /** 3-4 body sections unique to this guide. */
  sections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
}
```

**`data/educationSegments.ts`** (new)
```ts
export interface EducationSegment {
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  /** Which ecosystemTabs stakeholder this page leads with. */
  leadStakeholder: "teacher" | "student" | "parent" | "admin" | null;
  points: { title: string; detail: string }[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
}
```

**`data/useCaseCombos.ts`** — 3 new entries, plus a new optional field:
```ts
  /** Curated product ids. Takes precedence over the recommendedSeries match. */
  productIds?: string[];
```

That field is required, not cosmetic. `app/solutions/[industry]/[category]/page.tsx:97`
picks products via `solution.recommendedSeries.some(s => p.series.includes(s))`, and
no Logitech series appears in any `recommendedSeries` — so a VC combo would silently
fall through to the `showingFallback` branch and label its products "From this
category" instead of "Recommended for you". The tempting fix, adding "Rally", "Tap"
etc. to `recommendedSeries`, is wrong: `app/solutions/[industry]/page.tsx:80` reads
the same array and would surface Logitech products under its "Samsung displays used
in..." heading. Explicit `productIds` on the combo keeps the hub clean.

## Prerequisite: brand-aware combo chrome

Adding VC to the existing combo route emits policy-violating copy today. Five sites
hardcode "Samsung" and must become brand-aware before any VC combo ships:

| Location | Current | Problem |
|---|---|---|
| `app/solutions/[industry]/[category]/page.tsx:217` | `Samsung {navLabel} for {solution}` | Renders "Samsung video conferencing for corporate & workplace" |
| `...page.tsx:282` | "Other **display** categories used in..." | VC is not a display category |
| `...page.tsx:324` | "the right **Samsung** hardware" | Policy violation on a Logitech page |
| `...[category]/opengraph-image.tsx:4,96` | `alt` string and "Samsung Displays" label | Policy violation in OG metadata |
| `lib/jsonLd.ts:234` | `Samsung {navLabel} recommended for {solution}` | Policy violation in structured data |

Fix by extending `lib/categoryBrand.ts` — which exists for exactly this reason and
already knows VC is Logitech and Software is Samsung — with a `hardwareNoun` field
(`"display"` / `"room system"` / `"platform"`), then threading
`categoryBrand(category)` through all five sites. No new ad-hoc special-case branch.

## On-page fixes

1. **VC category title is missing its best keyword.** `app/categories/[slug]/page.tsx:74-76`
   gives Samsung categories `"Samsung {label} — Price, Models & Specs"` but the VC
   branch produces bare `"Video Conferencing — Price, Models & Specs"`. Change to
   `"Logitech Video Conferencing — Price, Models & Specs"` and tighten the keywords
   array.
2. **`/products` metadata and H1 claim Samsung-only while rendering Logitech products.**
   `app/products/page.tsx:12-30` describes five Samsung categories, omitting Video
   Conferencing, LED Signage, and Software; the H1 is "Samsung Commercial Display
   Portfolio" under an "Authorized Samsung Distributor" eyebrow, above a grid that
   includes 16 Logitech products. Rewrite the description to name every category
   present, and make the H1 and eyebrow accurate for a mixed-brand catalog.
3. **Class Saathi JSON-LD.** Add to `EducationLanding.tsx` a `Product` node (name
   "Class Saathi", brand TagHive, no `offers`) plus an `ItemList` of the three
   segment pages, alongside the existing Breadcrumb and FAQPage.

   This will raise a "Missing field 'offers'" **warning** (not an error) in Search
   Console. That is an accepted, site-wide tradeoff already documented at
   `lib/jsonLd.ts:82-91` and already true of every existing Samsung product node:
   Google rejects `Offer` without a numeric price and rejects `AggregateOffer`
   without `lowPrice`/`highPrice`, so a quote-only B2B catalog either omits offers
   or invents a price. Do **not** "fix" the warning by adding
   `priceSpecification: "Contact for pricing"` — `Offer.price` requires a number and
   `priceSpecification` expects a `PriceSpecification` object, so that turns a
   warning into a hard error. Do not use `@type: "EducationalApplication"` either;
   that string is a schema.org `applicationCategory` *value*, not a type.
4. **Footer.** `components/Footer.tsx:29` points "Education" at `/solutions/education`
   (Samsung interactive displays). Add a distinct entry for `/categories/education`.
5. **Logitech product pages link to their room guide.** Each product's
   `specs.operationTime` already holds its room band, so a "Rooms this fits" link
   into the matching guide is derivable — 16 product pages gaining internal links
   into the 3 room guides with no new copy.
6. **Home FAQ breadth.** `data/faqs.ts` has 7 entries, all Samsung/display-centric,
   and feeds both the visible `FAQSection` and the home page's FAQPage structured
   data via `components/sections/HomeJsonLd.tsx:1`. Add one Logitech VC FAQ and one
   Class Saathi FAQ.
7. **Home CategoryGrid (needs a visual check, and a special-cased href).** The grid
   is exactly 7 category tiles plus a synthetic "View all products" tile — a clean
   2x4 at `lg`. Adding an Education tile makes 9 and breaks the grid.
   Recommendation: replace the synthetic tile with the Education tile, preserving
   2x4 (the `/products` link already exists in the navbar and footer).

   Two constraints the implementer must not miss:

   - **The href must differ from every other tile.** `CategoryTile` links to
     `/products?category={id}`, but `/products?category=education` is a no-op:
     `education` is excluded from `categoriesWithProducts`, and
     `components/ProductsCategoryNav.tsx:21` ignores any category param failing that
     check, so there is no section to scroll to. The Education tile must link
     directly to `/categories/education`. That means `CategoryCard` needs an
     optional `href` override rather than a hardcoded template.
   - **The tile needs a two-word `title` array.** `CategoryTile` renders
     `title[0]<br/>title[1]` and reconstructs the accessible name via
     `aria-label={`${title[0]} ${title[1]}`}`; a single-element title would produce a
     broken label. Use `["Class Saathi", "Education"]` or similar.

   Removing `ViewAllTile` is safe from an accessibility standpoint — it is a plain
   `<Link>` wrapping `<span>`s, with no ARIA roles or keyboard hooks the grid
   depends on. Still verify the layout visually before committing; if the tradeoff
   is unacceptable, skip this item entirely — `/categories/education` is already
   linked sitewide from the navbar dropdowns, so the home tile is an improvement,
   not a fix.
8. **Sitemap.** Add all 15 new URLs (11 pages + 4 blog posts) and bump
   `CATALOG_LAST_UPDATED` in `app/sitemap.ts`. The 3 combos are picked up
   automatically by the existing `useCaseCombos` mapping; the 5 guides and 3
   segments need new entries at priority 0.75, `changeFrequency: "monthly"`
   (matching the combo entries); blog posts follow the existing blog entry shape.
9. **Cross-link strips.** A "By room size / By platform" section on the VC category
   page linking the 5 guides; a segment strip on the education landing linking the
   3 segments. Both also give the new pages a crawl path from a ranking parent.
10. **Sibling cross-link between the two platform guides.** Each of
    `microsoft-teams-rooms` and `zoom-rooms` carries an explicit inline link to the
    other ("Deploying Zoom Rooms instead? See the Zoom Rooms hardware guide"). Since
    these two pages necessarily share most of their products, a user-visible pointer
    declaring them complementary rather than interchangeable is the strongest
    available signal that each serves a distinct intent — and it is a real
    navigational aid, not a markup trick. Complements the T1 identical-string guard.

## Content policy

Two policies apply and both are test-enforced.

**Logitech** (`data/videoConferencing.test.ts:46`): the strings `authorized`,
`partner`, `certified`, and `Samsung` must not appear anywhere in Logitech data.
Aplus resells genuine Logitech product under nominative fair use but is not an
authorized Logitech partner; the trust story is Aplus's own supply, installation,
and AMC support. Note this bans "Certified for Microsoft Teams" as a phrase even
though it is a true Logitech claim — write "runs Microsoft Teams Rooms out of the
box" instead.

**Class Saathi** (`data/education.test.ts:18-32`): every claim traces to the Class
Saathi brochure or tag-hive.com; no partnership language; "Samsung" only as
"Samsung C-Lab"; the existing blocklist of fabricated claims stays blocked. New
segment pages introduce no new numeric or product claims.

`/solutions/education/video-conferencing` deliberately mixes brands: the parent hub
is Samsung-interactive-display-led and the combo page is Logitech. This is
acceptable because the page is scoped to video conferencing, but every piece of
chrome on it must come from the brand-aware helper rather than a hardcoded string.

## Tests

- **T1 `data/vcRoomGuides.test.ts`** — banned-word scan (`authorized|partner|certified|Samsung`);
  every `productId` resolves to a Logitech product in the Video Conferencing
  category; every `kind: "room"` guide's products have a `specs.operationTime` that
  is either listed in that guide's `roomBands` or is an any-room accessory
  (`"Any Room"`, `"Companion Camera"`, `"Outside-room Scheduling"`); slugs are
  unique; and the `microsoft-teams-rooms` and
  `zoom-rooms` guides share no identical `sections` or `faqs` strings (the
  near-duplicate guard).
- **T2 `data/educationSegments.test.ts`** — mirrors the `education.test.ts` truth
  policy scan, and asserts no segment introduces a numeric claim absent from
  `data/education.ts`.
- **T3 `data/useCaseCombos.test.ts`** (new file — none exists today) — every combo's
  industry resolves in `data/solutions.ts` and category in `data/categories.ts`;
  `productIds` resolve to products in the combo's category; VC combos pass the
  Logitech banned-word scan.
- **T4 `lib/jsonLd.test.ts`** — `industryCategoryServiceLd` produces a brand-correct
  `OfferCatalog` name for a VC combo and is unchanged for Samsung combos.
- **T5 sitemap** — all 15 new URLs are present and unique.
- **T6 breadcrumbs** — the sub-page crumb trail is built by a small pure helper
  (e.g. `subPageCrumbs(category, sub)`) rather than inline JSX, so it can be
  asserted: 4 entries, in order, `Home -> Products -> {Category} -> {Sub}`, with the
  category URL matching the parent page's own trail. Guards against a child whose
  `BreadcrumbList` contradicts its parent.

Run with `npm test` (vitest). A runtime pass with the `verify` skill covers the OG
images, the new routes returning 200, an unknown `(slug, sub)` pair returning a real
404, and the CategoryGrid layout decision.

## Out of scope

- City x product x query permutation pages (rejected above; the separate city-hub
  spec covers city pages hubs-only).
- The retail VC combo.
- WordPress 301 redirects — the old site had no Logitech or Class Saathi pages, so
  there is nothing to preserve.
- Making Class Saathi a catalog product. It would unlock Product JSON-LD, the spec
  sheet, and the quote flow, but it would also surface Class Saathi in the product
  grid, finder, and compare surfaces, reversing the deliberate zero-product design
  in `lib/nonEmptyCategories.ts`. The landing page already serves this role.
- `/solutions` hub copy for Samsung categories, beyond the five brand-aware fixes
  named above.
- Rotating the anchor text on the 16 product-page links from Fix 5. The anchors
  already vary by room band ("Huddle Rooms" / "Medium Meeting Rooms" /
  "Boardrooms"), and consistent descriptive internal anchor text aids topical
  clarity rather than harming it. Artificial variation adds maintenance cost and
  loses signal.

## Risks

1. **Platform-page duplication.** `microsoft-teams-rooms` and `zoom-rooms` share
   most products. Mitigated by hand-written per-platform deployment content and the
   T1 identical-string guard.
2. **CategoryGrid layout churn.** Fix 7 changes the home page's visual rhythm.
   Gated on a visual check and droppable without affecting the rest of the work.
3. **Brand-aware refactor touches Samsung pages.** The five chrome fixes run through
   code that all 16 existing Samsung combos render. T4 pins the Samsung output as
   unchanged.
4. **Satori OG constraints.** New `opengraph-image.tsx` files need explicit
   `display: flex` on every container; `inline-flex` silently fails.

## Success criteria

- All 11 new pages render, are in the sitemap alongside the 4 new blog posts, carry
  canonical + OG + breadcrumb + page-appropriate JSON-LD, and an unknown
  `(slug, sub)` pair returns a hard 404.
- Zero banned-word occurrences across all Logitech and Class Saathi data, enforced
  by T1-T3.
- `/categories/video-conferencing` has "Logitech" in its title tag.
- `/products` metadata names every category it actually renders.
- `/categories/education` emits a Product node and links to its 3 segments.
- All 16 existing Samsung combo pages render byte-identically apart from
  intentional brand-aware chrome changes.
