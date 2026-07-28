# GEO / AEO — Generative & Answer Engine Optimization

**Date:** 2026-07-28
**Status:** Approved (design), pending implementation plan
**Prerequisite:** Phase 0 shipped in `39105b3` (see below)

## Goal

Get Aplus **named as the supplier** when a buyer asks an AI engine "who supplies Samsung
commercial displays in India / Delhi NCR", and **cited as the spec authority** when the
question is about a model, size or room fit.

Weighted to the supplier outcome: it is directly lead-generating. The spec-authority work
is what earns the citations that make the supplier claim credible.

## Measured baseline (Search Console, 2025-07-26 → 2026-07-25)

| Metric | Value |
|---|---|
| Clicks / impressions | 3,852 / 167,855 |
| Brand navigational share of **query-attributed** clicks | **66.1%** (788 of 1,193) |
| Homepage share of site clicks | 36.5% (1,406 of 3,852) |
| `hg55u701f` (bare model code, no brand or city) | **84 clicks, position 2.63** |

Read the brand figure carefully: `Queries.csv` is capped at the top 1,000 queries and
accounts for 1,193 of the site's 3,852 clicks. So 66.1% is the brand share *of the queries
Google disclosed*, which is 20.5% of total site clicks — not 66% of all traffic. The
directional conclusion (discovery is brand-led) holds either way; the precise figure does
not generalise to the whole site.

Two conclusions drive this spec:

1. Discovery is almost entirely **brand navigational** — people who already know the name.
   Non-brand discovery is the weak spot, and that is precisely what AI answers influence.
2. **Model-code intent converts.** A bare India order code ranks at position 2.6 and
   out-earns nearly every city page. This is the evidence base for Phase 4.

## Verified current state

Checked against the live site with a `GPTBot` user-agent on 2026-07-28.

| Surface | State |
|---|---|
| Rendering | Static (`dynamicParams=false` + `generateStaticParams`, `revalidate=3600`) across all dynamic routes |
| Product / category / solution / city / blog pages | 1 JSON-LD block, 1 `h1`, 3.7k–14.2k chars of crawlable text |
| `/products` listing | **0 JSON-LD** (renders text and `h1`, but emits no structured data) |
| JSON-LD types in use | Organization+LocalBusiness, Product, CollectionPage+ItemList, Service, FAQPage, BreadcrumbList, AboutPage, Article |
| Blog posts | Already carry Article + author + publisher → Organization |
| FAQs | Generated from live data, visible on page **and** in FAQPage schema |
| `robots.txt` | `User-Agent: *` only — no explicit AI-crawler policy |
| `llms.txt` | Does not exist |
| Organization `sameAs` | LinkedIn only |
| Samsung Service Partner credential | Present **only** in `lib/pdf/specSheet.ts`; absent from every web surface |
| GA4 (`components/Analytics.tsx`) | **Consent-gated** — returns `null` until `aplus_cookie_consent === "accepted"` |
| Vercel Analytics | Unconditional and cookieless |

### Phase 0 — already shipped (`39105b3`)

`useSearchParams()` in `components/SpecSheetButton.tsx` bailed the static prerender out to
client-side rendering. Because the route has a `loading.tsx`, the nearest Suspense boundary
was the **entire page**, so all product detail pages served an empty shell: 0 `h1`,
0 JSON-LD, ~1.1k chars of chrome. AI crawlers do not run JS, so every spec, FAQ and Product
node on the catalogue was invisible to them.

Fixed by confining the hook to its own `<Suspense>` boundary. Verified live:
**0 → 1 JSON-LD, 0 → 2 `h1`, 1,116 → 8,711 chars.** `prerender.test.ts` guards it.

**Everything below assumes Phase 0 is live. It is.**

## Truth policy (non-negotiable)

Carried forward from `lib/jsonLd.ts` and the spec-sheet work:

- **No `aggregateRating`, no `Review`** — Aplus has no review corpus; emitting one is fabrication.

  **Known false alarm.** Search Console's *Review snippets* report shows **71 invalid / 0 valid**
  with "Missing field `ratingValue`", "Missing field `name` (in `<parent_node>`)" and
  "Either `ratingCount` or `reviewCount` should be specified". **Do not fix this by adding
  rating fields.** Verified 2026-07-28: no rating or review markup exists in `app/`,
  `components/`, `lib/` or `data/`; none appears on live product, category, city or home
  pages; there is zero microdata/RDFa sitewide; and the live Product node has no rating keys.
  The site also has 53 products, not 71, and every hostname variant resolves to Vercel — the
  old Apache/PHP host is gone. These are legacy WordPress URLs Google has not finished
  reprocessing, and the count is already declining (~120 → 71). It will clear itself.
  Inventing ratings to clear the report would breach both this policy and Google's
  fake-review policy.
- **No `Offer` with a price.** Quote-only B2B. The resulting "Missing field 'offers'"
  Search Console warning is accepted site-wide and is already documented in `productLd`.
- **No `sameAs` URL that has not been fetched and confirmed 200.**
- **"Samsung Service Partner"**, never "Service Center". Wording must match `lib/pdf/specSheet.ts`.
- Brand accuracy: Video Conferencing is **Logitech**, Education is **TagHive**. Never let
  Samsung wording leak onto those surfaces (`lib/categoryBrand.ts` already enforces this).

## Phase 1 — Machine-readable foundation

### 1.1 AI crawler policy — `app/robots.ts`

Add explicit `allow: "/"` rules for the AI crawlers below, keeping the existing
`disallow` list (`/api/`, `/compare`, `/quote`, `/admin/`, `/private/`) on each.

**Policy: allow everything.** For a distributor whose goal is discovery, training exposure
is a feature — it is how a model learns Aplus exists when nobody is browsing.

Retrieval / citation: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`,
`Claude-User`, `Claude-SearchBot`, `DuckAssistBot`.
Training / index: `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`,
`meta-externalagent`, `Amazonbot`, `Bytespider`, `cohere-ai`, `YouBot`, `Timpibot`, `Diffbot`.

These are already permitted by the `*` rule. Making them explicit means the policy is
deliberate and auditable, some crawlers check for their own UA specifically, and it survives
future edits to the wildcard.

**Test:** extend `app/sitemap.test.ts` conventions — assert every named UA appears and that
the disallow list is identical across all rules.

### 1.2 `/llms.txt`

`app/llms.txt/route.ts`, a route handler with `export const dynamic = "force-static"`.
(Next.js has no metadata-route convention for this file; `public/` would work but could not
be generated from `data/`.)

**Generated at build time** from `data/categories`, `data/products`, `data/cities`,
`data/solutions` — never hand-maintained, so it cannot drift from the catalogue.

Structure follows the llms.txt convention: `# Title`, a `>` blockquote summary, then
sectioned link lists. Content: what Aplus is, credentials, brands carried
(Samsung / Logitech / TagHive), category index with URLs, solution index, city coverage,
the India model-code reference (Phase 4), and contact details.

Note `proxy.ts`'s matcher `/((?!_next/|.*\..*).*)` excludes dotted paths, so `/llms.txt`
bypasses middleware. That is correct and needs no change.

**Test:** every URL emitted must exist in `app/sitemap.ts` output. This is the guard against
the file drifting into 404s.

### 1.3 `/products` structured-data gap

`app/products/page.tsx` emits no JSON-LD despite sitemap priority 0.9 and ~10.5k chars of
content. Add `CollectionPage` + `ItemList` + `BreadcrumbList`, reusing
`categoryCollectionLd`'s shape from `lib/jsonLd.ts`.

## Phase 2 — Entity hardening (the "named as supplier" lever)

### 2.1 Organization node — `lib/jsonLd.ts:organizationLd()`

Add:

- **`knowsAbout`** — digital signage, video walls, interactive displays, hotel/hospitality TV,
  LED displays, video conferencing, commercial display installation, AMC. Derive from
  `productCategories` where possible so it tracks the catalogue.
- **`hasCredential`** — `EducationalOccupationalCredential` nodes for Samsung authorized
  distributor **and** Samsung Service Partner.
- **`areaServed`** — India, plus the `data/cities.ts` set.
- **`sameAs`** — expand to the verified set (below).
- **`foundingDate`, `numberOfEmployees`** — pending input (see Inputs Required).

### 2.2 Verified `sameAs` set

Confirmed HTTP 200 on 2026-07-28:

- `https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd`
- `https://www.instagram.com/aplus_tech_sol/`
- `https://tracxn.com/d/companies/aplus-technology-solutions/__X0jfs978sJ_zMaSRtjyU_qU725oQEJuIEa77TUJnqP0`

Google Business Profile, Facebook and the India B2B directory listings are confirmed to
exist but their URLs have not been supplied. **Each must be fetched and confirmed 200 before
inclusion** — a dead `sameAs` weakens the entity signal rather than helping it.

### 2.3 Service Partner credential in on-page prose

The credential currently exists only inside generated PDFs. AI engines read prose, not PDFs.

Add to the About page and the footer, wording matching `lib/pdf/specSheet.ts` exactly.
This is the single strongest entity fact Aplus owns and it is invisible on the web today.

## Phase 3 — Answer shape

### 3.1 Fix the duplicate `h1` on product pages (defect)

Verified live on 2026-07-28: every product detail page renders **two `<h1>` elements with
identical text**. On `/products/samsung-signage-qmc` both read
`Samsung Crystal UHD Signage QMC Series`, differing only in one Tailwind class
(`mb-2` vs `mb-3`) — almost certainly a mobile/desktop responsive pair where both are in the
DOM and one is hidden by CSS. Confirmed on `samsung-qet-series` and `logitech-rally-bar` too,
so it is the shared product template, not one page.

Crawlers see both. A duplicated top-level heading weakens the page's primary topic signal and
gives chunkers two competing anchors for the same content. Fix so exactly one `h1` reaches the
HTML — render the responsive variant as a non-heading element, or render one `h1` and style it
responsively.

This surfaced only because Phase 0 made the page render at all; it was invisible while the
body was an empty shell.

**Test:** extend `app/products/[slug]/prerender.test.ts` to assert exactly one `h1` per
product page.

### 3.2 "Key facts" block on product and category pages

AI engines retrieve **chunks**, not pages. A short, dense, factual block near the top of the
page is the most extractable unit available — model code, screen sizes, brightness,
resolution, primary use case, availability.

Generated from existing `product.specs` / `modelCodeFor()` data, so it introduces **no new
claims**. Must be real rendered text, not `aria-hidden` or visually-hidden markup.

Risk to manage: generated copy reads templated if written carelessly. Vary sentence shape by
category; do not emit a fixed sentence skeleton with slot-filled nouns.

### 3.3 FAQ heading semantics (optional, low priority)

Audited live: FAQ questions render inside `<details>/<summary>`, e.g.
`<summary>What is the model number of the Samsung Crystal UHD Signage QMC Series...`.

**This is not broken.** `<details>` content is present in the served HTML (unlike a
JS-toggled accordion), so it is fully crawlable, and `faqPageLd()` already emits the same
Q&A as FAQPage structured data. Both Google and AI crawlers get the questions and answers
today.

The only gain from nesting an `<h3>` inside each `<summary>` is a cleaner document outline
for chunk anchoring — marginal. Do this **only if** Phase 3.2 already requires touching the
FAQ component. Do not open the accordion markup for this reason alone; the risk of breaking
working disclosure UI outweighs the benefit.

## Phase 4 — The citation magnet (India model codes)

`lib/modelCodes.ts` holds **48 Samsung India order codes**, verified against
samsung.com/in/business, with an explicit never-fabricate rule and a `// ~` marker for
codes whose India page could not be confirmed.

**Nobody else publishes an India-specific Samsung B2B model-code index.** Unique facts are
cited disproportionately by AI engines because there is no alternative source — and
`hg55u701f`'s 84 clicks at position 2.6 prove the demand is real.

Build the reference page at **`/samsung-india-model-codes`** (decided; do not substitute
another path — `/llms.txt`, the sitemap and internal links all reference it). A table of
series → India order code → available sizes → category → link to the product page, plus a
short explanation of why India codes differ from global ones (the `XL` suffix pattern).

Verified 2026-07-28: `REPRESENTATIVE_MODEL_CODE` holds **48 entries, 4 of which carry the
`// ~` pending marker** (valid Samsung SKUs whose India page could not be confirmed). Either
omit those 4 or label them explicitly as unconfirmed — never present them as verified.
Add the page to `app/sitemap.ts` and to `/llms.txt`.

## Phase 5 — Measurement

**Referral tracking via Vercel Analytics**, not GA4. `components/Analytics.tsx` is
consent-gated and would undercount; `<VercelAnalytics />` is unconditional and cookieless.
Track referrers from `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`,
`copilot.microsoft.com`.

**Crawler-hit logging is explicitly out of scope** (decided 2026-07-28). Neither analytics
tool can see crawler hits, since bots do not run JS; that would require server-side logging
in `proxy.ts`. Revisit only if referral numbers suggest it is worth knowing.

## Phase 6 — Off-site checklist (executed by Aplus, not in code)

Delivered as a prioritised document. AI engines corroborate supplier claims against
third-party sources, so on-site work alone under-delivers on the supplier goal.

1. Google Business Profile — verified, correct category, NAP matching `lib/contact.ts` exactly
2. Samsung partner locator listing
3. LinkedIn company page completeness
4. India B2B directories (IndiaMART / Justdial / TradeIndia)
5. NAP consistency audit across every listing

## Out of scope

- Fabricated ratings, reviews, or awards
- `Offer` nodes with invented prices
- `llms-full.txt` — unproven convention, and the catalogue is small enough that `llms.txt`
  plus a crawlable site covers it
- Rebuilding the 7,650 legacy city × SKU pages. Search Console shows they earned **969 clicks
  across twelve months** (~1.24 per URL per year, best single page 14). Rebuilding them
  matches Google's scaled-content-abuse and doorway-page definitions. A separate, targeted
  set of 30–60 differentiated city × category pages is the defensible alternative and is
  **not** part of this spec.
- AI-generated content volume plays

## Inputs required before implementation

| Input | Blocks | Fallback if unavailable |
|---|---|---|
| Google Business Profile URL | 2.2 | Omit from `sameAs`; keep as Phase 6 item 1 |
| Facebook page URL | 2.2 | Omit |
| IndiaMART / Justdial / TradeIndia URLs | 2.2 | Omit |
| Founding year | 2.1 `foundingDate` | Omit the field |
| Employee count (band) | 2.1 `numberOfEmployees` | Omit the field |

Every URL must be fetched and confirmed 200 before it goes in.

## Verification

Per the existing `prerender.test.ts` pattern, correctness is measured **over real HTTP with
JS disabled**, not from source inspection:

1. `npm run build && npx next start`, then fetch each changed route with a `GPTBot` UA
2. Assert: `h1` present, JSON-LD present and parseable, expected node `@type`s, no drop in
   rendered text length
3. `/llms.txt` returns 200 with `text/plain`, and every URL in it appears in the sitemap
4. `robots.txt` contains every named AI user-agent
5. `npx tsc --noEmit`, eslint, and the full vitest suite clean
6. Re-probe production after deploy — do not trust a local `next start` as evidence of live state
