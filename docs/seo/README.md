# Search & AI Visibility — Master Reference

**Last verified:** 2026-07-29
**Scope:** SEO, GEO (generative engine optimization), AEO (answer engine optimization),
URL architecture, redirect mapping, `robots.txt`, `llms.txt`, structured data.

Every figure here was measured, not estimated. Where something is a decision rather than a
fact, it says so and gives the reasoning. **Re-verify before quoting anything to a client —
the verification recipes are in §12.**

---

## 1. Where things stand

| | |
|---|---|
| Live host | Vercel (Next.js 16 App Router). Old Apache/PHP host is gone. |
| Rendering | Fully static — `dynamicParams=false` + `generateStaticParams` on all 7 dynamic routes, `revalidate=3600` |
| URLs in sitemap | **248** |
| Legacy URLs redirected | ~7,507 |
| Google's index | **0 new URLs indexed as of 2026-07-28** — migration not yet processed |
| Test suite | 524 passing / 66 files |
| Lint | 8 errors, 3 warnings — **all pre-existing**, unrelated to search work |

**The single most important fact on this page:** Google has not yet indexed one new URL.
Every metric in §3 describes the **old** WordPress site. It is a baseline, not a result.
Do not judge the migration on it.

---

## 2. URL architecture

### Current structure (248 URLs)

| Count | Pattern | Notes |
|---|---|---|
| 120 | `/{city}` | City hubs — e.g. `/delhi`, `/bangalore` |
| 71 | `/products/{id}` | One page per product series |
| 23 | `/solutions/{industry}` and `/solutions/{industry}/{category}` | Hand-written combos |
| 16 | `/categories/{slug}` and `/categories/{slug}/{sub}` | Includes VC room guides, education segments |
| 8 | `/blogs/{slug}` | |
| 10 | Static | `/`, `/products`, `/about`, `/contact`, `/locations`, `/product-finder`, `/samsung-india-model-codes`, `/blogs`, `/privacy`, `/terms` |

### Old structure (~7,507 URLs)

| Count | Pattern | Fate |
|---|---|---|
| 7,125 | `/{city}/{product}` | 301 → `/products/{id}` |
| 225 | `/{role}/{product}` — `distributor`, `suppliers`, `exporters` | 301 → `/products/{id}` |
| 38 | `/{category-root}/{product}` | 301 → `/products/{id}` |
| 95 | `/{city}` | **Rebuilt** and expanded to 120 |
| 17 | Static (`/about-us`, `/our-presence`, …) | 301 → new equivalents |
| 4 | `/blog/{slug}` | 301 → real posts |

**Net: 97% fewer URLs, but more genuinely distinct pages** — more city hubs (120 vs 95),
double the blog posts, plus 23 solution and 16 category surfaces that did not exist before.
What went away was a clone matrix, not content.

### Why the 7,125 city×product pages were not rebuilt

This is the most-challenged decision. The evidence, gathered by diffing the live pages
*before* they came down (`docs/superpowers/specs/2026-07-13-city-landing-pages-design.md`):

- `/delhi/samsung-interactive-display-flip-3/` and `/mumbai/...` were **byte-identical apart
  from the canonical URL, breadcrumb JSON-LD, and the city name substituted ~8 times** into
  ~711 words of boilerplate.
- Their `<title>` and `<h1>` were just `Samsung Interactive Display Flip 3` — **the city name
  did not appear**. They never targeted local queries.

Corroborated independently by Search Console: city-prefixed URLs earned **969 clicks** while
queries *containing a city name* earned **5**. The traffic came from product and model
queries, where ~104 clones competed against each other for one term.

Rebuilding them one-to-one would match Google's scaled-content-abuse and doorway-page
definitions. **Do not do it**, whatever any external report recommends.

The legitimate gap it leaves is covered in §11.

---

## 3. Baseline metrics (the "before" line)

Search Console, Web, **2025-07-26 → 2026-07-25** (365 days). Source: `Chart.csv`, which
agrees exactly with `Devices.csv`.

| Metric | Value |
|---|---|
| Clicks | **3,852** |
| Impressions | **167,855** |
| Brand share of *query-attributed* clicks | 66.1% (788 of 1,193) |
| Homepage share of site clicks | 36.5% (1,406 of 3,852) |
| Average position | improved 27 → ~9 over the year |

> **Denominator warning.** `Pages.csv` sums to 3,962 — 110 more than the property total.
> That is normal GSC dimension-table behaviour, not a parsing error. Always compute
> percentages against **3,852**, and say "approximately".

> **Truncation warning.** `Queries.csv` covers only 1,193 of 3,852 clicks. The 66.1% brand
> figure is a share *of disclosed queries*, which is 20.5% of site total. The directional
> conclusion (discovery is brand-led) holds; the precise figure does not generalise.

### City page performance

| Bucket | URLs | Clicks/yr | Clicks per URL/yr |
|---|---|---|---|
| City × product (redirected) | 784 | 969 | **1.24** |
| City hubs (retained) | 47 | 379 | **8.06** |

Best single city×product URL: **14 clicks in twelve months.** 89% earned ≤2. 28% earned none.
City hubs are **6.5× more click-efficient per URL**.

`Pages.csv` is sorted by clicks descending and reaches zero-click rows before its 1,000-row
cap, so the ~6,900 URLs below the cutoff contributed **0 clicks**. The 969 figure is
effectively complete, not a sample.

### The signal that drives Phase 4

`hg55u701f` — a bare Samsung India model code, no brand or city term — earned **84 clicks at
position 2.63**. Model-code intent converts, and it out-earned every city page.

---

## 4. Redirect mapping

Implemented in **`proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`), driven by
maps in `lib/redirects.ts` (218 legacy product slugs).

Resolution order:

1. Single-segment city slug → pass through (city hubs are real routes)
2. Case-folded city root (`/Noida` → `/noida`)
3. Merged/duplicate products → canonical twin
4. Reserved roots → pass through untouched
5. `/blog/*` → `/blogs/*` (4 bespoke slug mappings, else the index)
6. **Any old product page, matched on the LAST path segment** — this is what resolves every
   city, role and category prefix at once
7. Old category roots → `/categories/{id}`

Verified working:

```
/samsung-signage-display-qbc-series          301 → /products/samsung-signage-qbc
/delhi/samsung-signage-display-qbc-series    301 → /products/samsung-signage-qbc
/digital-signage/delhi/samsung-...-qbc-...   301 → /products/samsung-signage-qbc
```

### Redirect hop counts

| Entry point | Hops |
|---|---|
| `https://www.` + no trailing slash | **1** |
| `https://www.` + trailing slash (how the old site linked everything) | **1** (was 2) |
| `http://` or non-www | **2** (was 3) |

**Collapsed to 1 hop on 2026-07-29**: `skipTrailingSlashRedirect` in `next.config.ts` hands
trailing-slash normalisation to `proxy.ts`, which resolves the legacy redirect BEFORE
stripping the slash. `https://www.` legacy URLs now cost exactly 1 hop; only the
`http://`/non-www entry hops remain (Vercel platform level, not collapsible in app code).

Any path the proxy does *not* redirect still gets a **308** to its slash-less canonical form —
that normalisation is now ours to own, and dropping it would serve every page at two URLs.
`proxy.test.ts` guards it.

### 4b. Legacy sitemaps (temporary migration aid)

`/sitemap/sitemap-{1,2,3}.xml` — the OLD WordPress sitemap URLs, still submitted in GSC —
serve the full 18,934-URL legacy inventory (generated from the redirect maps by
`lib/legacySitemaps.ts`; every emitted URL is proven to 301 to a live page by its test).
Purpose: force Google to recrawl the ~5.3k indexed legacy URLs and discover the 301s fast.
**Delete the three routes in `app/sitemap/` once GSC shows the wave is done** — exit
criterion: "Page with redirect" > 5,000 in the Pages report, or 10 weeks post-deploy,
whichever first.

---

## 5. `robots.txt` — AI crawler policy

Generated by `app/robots.ts`. Guarded by `app/robots.test.ts`.

**Policy: allow everything.** For a distributor whose goal is discovery, training exposure is
a feature — it is how a model learns Aplus exists when nobody is browsing.

19 crawlers named explicitly:

- **Retrieval / live citation:** `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`,
  `Perplexity-User`, `Claude-User`, `Claude-SearchBot`, `DuckAssistBot`
- **Training / index:** `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`,
  `Applebot-Extended`, `meta-externalagent`, `Amazonbot`, `Bytespider`, `cohere-ai`,
  `YouBot`, `Timpibot`, `Diffbot`

All are already permitted by the `*` rule. Naming them makes the policy deliberate and
auditable, and keeps it intact if the wildcard is ever tightened. Every rule carries the same
disallow list: `/api/`, `/compare`, `/quote`, `/admin/`, `/private/`.

---

## 6. `llms.txt`

Served at **`/llms.txt`** by `app/llms.txt/route.ts` (`dynamic = "force-static"`), built by
`lib/llmsTxt.ts`.

**Generated at build time from `data/`** — never hand-maintained, so it cannot drift from the
catalogue. Sections: summary blockquote, product categories, solutions by industry, reference
(model codes, catalogue, finder), locations, contact.

**The critical invariant**, enforced by `lib/llmsTxt.test.ts`: every URL it emits must exist
in `app/sitemap.ts` output. This is what stops the file rotting into 404s. If that test fails,
**fix the URL, not the test.**

`proxy.ts`'s matcher `/((?!_next/|.*\..*).*)` excludes dotted paths, so `/llms.txt` bypasses
middleware by design. No change needed there.

---

## 7. Structured data (JSON-LD)

All builders live in `lib/jsonLd.ts`. Single canonical Organization node at
`https://www.aplustechsol.com/#organization`; everything else references it by `@id` rather
than redeclaring a competing entity.

| Surface | Nodes emitted |
|---|---|
| Product page | `Product` + `BreadcrumbList` + `FAQPage` |
| Category page | `CollectionPage` + `ItemList` + `BreadcrumbList` + `FAQPage` |
| `/products` listing | `CollectionPage` + `BreadcrumbList` |
| Solution / city / industry×category | `Service` (with `areaServed`, `hasOfferCatalog`) |
| Blog post | `Article` + author/publisher → Organization |
| About | `AboutPage` |
| Model codes | `BreadcrumbList` |

**Deliberate omission: no `offers`.** Google rejects `Offer` without a numeric price and
`AggregateOffer` without low/high. This is a quote-only B2B catalogue, so `productLd` emits no
`offers`, `review` or `aggregateRating`.

⚠️ **This surfaces in Search Console as red, not amber. Expect it and do not "fix" it.**
Verified 2026-07-30, Product snippets report:

> **Invalid 136 · Valid 0 · "1 critical issue"** — `Either "offers", "review", or
> "aggregateRating" should be specified`

`Valid 0` is the only achievable outcome: Google requires one of those three fields for rich-result
eligibility and all three are unavailable to us. **The cost is product rich results only** — no
effect on indexing, crawling or ranking. Leave *Validation* as **Not Started**; there is nothing
to validate.

The only two remedies are (a) real prices, a business decision against the quote-only model, or
(b) fabricated ratings — which breaches §10 *and* Google's fake-review policy, risking a manual
action far worse than a missing snippet. **Do not confuse this with the review-snippet false
alarm in §10** — that one is `Missing field ratingValue` on legacy URLs. Two different reports,
both leave-alone, for different reasons.

---

## 8. GEO — entity signals

The "named as supplier" lever. `organizationLd()` carries:

- `knowsAbout` — 8 competence areas
- `hasCredential` — `EducationalOccupationalCredential`, recognised by Samsung
- `areaServed` — India
- `foundingDate` — `2020` (from the About timeline)
- `sameAs` — **only URLs fetched and confirmed 200:**
  - `https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd`
  - `https://www.instagram.com/aplus_tech_sol/`
  - `https://tracxn.com/d/companies/aplus-technology-solutions/__X0jfs978sJ_zMaSRtjyU_qU725oQEJuIEa77TUJnqP0`

### The credential

Canonical wording lives in `lib/credentials.ts`, mirrored from `lib/pdf/specSheet.ts`:

> **Authorized Samsung Commercial Display Distributor & Service Partner**

Aplus is authorized for **both** distribution and service. It is **"Service Partner"**, never
"Service Center". Rendered as prose on `/about` and in the footer — AI engines read prose,
not PDFs.

⚠️ **Unresolved:** `/about` still carries three competing phrasings — "Authorized Samsung
Platinum Partner", "Authorized Samsung B2B Partner", and "authorized Samsung Business Display
distributor". Competing claims weaken entity resolution. Reconciling them needs Samsung's word
on which are current.

### Off-site

On-site entity work is done; **corroboration is not**. Answer engines check a supplier's
self-description against third parties before naming it. See
[`docs/geo/off-site-checklist.md`](../geo/off-site-checklist.md) — every item unstarted.
Priority: Google Business Profile → Samsung partner locator → LinkedIn → India B2B
directories. Search Maps first; if the previous agency claimed the GBP, request transfer
rather than creating a duplicate.

---

## 9. AEO — answer shape

AI engines retrieve **chunks**, not pages. Structure decides what gets extracted.

- **Key facts block** (`components/KeyFacts.tsx`) — label/value pairs at the top of product
  pages: India model code, category, series, resolution, brightness, sizes, rated operation.
  Server component, so it lands in static HTML. Generated from existing data — no new claims.
- **FAQs** — `lib/categoryFaq.ts` and `lib/productFaq.ts` generate question-form FAQs from
  live data, rendered as visible text **and** `FAQPage` schema. The two must always match.
- **FAQ markup** uses `<details>/<summary>`. Content is in the served HTML and schema'd, so it
  is fully crawlable. Wrapping questions in headings is a marginal gain — **do not open the
  accordion markup for it.**
- **Exactly one `h1` per page.** Product pages previously shipped two (a mobile/desktop
  responsive pair, both in the DOM). Guarded by `app/products/[slug]/prerender.test.ts`.

### The India model-code page

`/samsung-india-model-codes` — built from `lib/modelCodeTable.ts`, joining
`REPRESENTATIVE_MODEL_CODE` (**48 entries, 4 carrying a `// ~` unconfirmed marker**) to the
live catalogue.

This is the highest-value GEO asset on the site: **nobody else publishes an India-specific
Samsung B2B model-code index.** Unique facts get cited disproportionately because there is no
alternative source. Never present the 4 marked codes as verified.

---

## 10. Truth policy — non-negotiable

1. **No `aggregateRating`, no `Review`.** Aplus has no review corpus; emitting one is
   fabrication and breaches Google's fake-review policy.
2. **No `Offer` with a price.** Quote-only.
3. **No `sameAs` URL that has not been fetched and confirmed 200.** A dead link weakens the
   entity rather than helping it.
4. **"Service Partner", never "Service Center".**
5. **Brand accuracy** — Video Conferencing is **Logitech**, Education is **TagHive**. Never
   let Samsung wording leak onto those surfaces. `lib/categoryBrand.ts` is the arbiter.
6. **Model codes are never invented.** `// ~` marks unconfirmed; keep it that way.

### Known false alarm: "Review snippets — 71 invalid, 0 valid"

Search Console reports 71 invalid review items: *Missing field `ratingValue`*, *Missing field
`name` (in `<parent_node>`)*, *Either `ratingCount` or `reviewCount` should be specified*.

**Do not "fix" this by adding rating fields.** Verified 2026-07-28:

- No rating markup in `app/`, `components/`, `lib/` or `data/`
- None on any live page; **zero microdata/RDFa sitewide**
- Live `Product` node has no rating keys
- **Google has indexed zero new URLs**, so it cannot be reporting errors on new pages
- Count is already declining (~120 → 71) as legacy URLs are reprocessed

⚠️ The site has **71 products** and the report shows **71 invalid items**. That coincidence
will get raised. It is not causal — see the zero-indexed-URLs point above. (An earlier note
claiming "53 products" was wrong; `products.length` is 71.)

---

## 11. Open items

| Item | Owner | Notes |
|---|---|---|
| Off-site checklist — all items | Aplus | §8. Biggest remaining lever. GBP first. |
| GBP / Facebook / directory URLs for `sameAs` | Aplus | Each needs a 200 check first |
| Reconcile `/about` credential phrasings | Aplus + Samsung | §8 |
| Close the measurement loop | Aplus | `lib/aiReferrers.ts` is a host list for segmenting Vercel Analytics referrers. **Nothing calls it** — that is by design (bots don't run JS). Someone must do the segmenting. |
| Monitor reindexing weekly | Aplus | §12 |
| 30–60 city×category pages | Not scoped | The legitimate gap left by consolidation: 47,000 city-intent impressions/yr at positions 6–10. Differentiated pages placed where impressions cluster — **not** a rebuilt clone matrix. |
| Remove legacy sitemaps when wave completes | Aplus | §4b exit criterion |

Unrelated but open: `/api/contact` 500 on production, mobile LCP (3.5s → <2.5s),
`CLASS_SAATHI_TO_EMAIL` missing in Vercel, the 2026-07-22 codebase audit.

---

## 12. Verification recipes

**Never trust source inspection alone.** A page can look correct in the codebase and serve an
empty shell. Always measure over real HTTP with JS disabled.

### Is a page actually crawlable?

```bash
curl -s -A "GPTBot/1.0" https://www.aplustechsol.com/products/samsung-signage-qmc > p.html
grep -o '<h1' p.html | wc -l            # expect exactly 1
grep -c 'application/ld+json' p.html    # expect >= 1
```

⚠️ **Do not grep the raw HTML for body text and conclude it is crawlable.** Next.js embeds the
whole page in the RSC flight payload inside `<script>` tags. A naive `grep` for spec text
matches that payload and gives a false pass. **Strip `<script>` blocks first, then count
headings** — that is the honest signal. This exact mistake was made and caught this session.

### Redirect health

```bash
curl -sIL -A "Googlebot/2.1" https://www.aplustechsol.com/delhi/samsung-signage-display-qbc-series \
  | grep -E "HTTP/|location:"
```

Expect one `301` to `/products/samsung-signage-qbc`, then `200`.

### Truth-policy guard

```bash
grep -rn "aggregateRating\|ratingValue\|reviewCount\|ratingCount" \
  app components lib data --include=*.ts --include=*.tsx
```

Expect **no matches**. Any hit is a policy violation.

### Full local check

```bash
npm test          # expect 524 passing
npx tsc --noEmit  # expect clean
npm run lint      # expect 8 errors / 3 warnings — pre-existing, do not treat as a regression
```

### Monitoring the migration

Watch **Search Console → Indexing → Pages**, weekly, not clicks:

- New URLs moving to **Indexed** — this is the number that matters
- Old URLs moving to **Page with redirect** — expected and healthy
- Clicks are lagging and noisy during transition. **Judge at week 8+, against 3,852.**

Expect a dip in weeks 2–6. That is normal, not failure. **Do not change URL structure again
mid-transition** — it is the one genuinely destructive move available.

---

## 13. Traps

| Trap | Why it's wrong |
|---|---|
| "Add ratings to fix the Review snippet errors" | Fabrication. §10. |
| "Product snippets shows Invalid 136 / Valid 0 with a *critical* issue — something broke" | Nothing broke. It is the quote-only catalogue having no `offers`/`review`/`aggregateRating`, and `Valid 0` is the only reachable value. Costs rich results only, never rankings. §7. |
| "Rebuild the 7,650 city pages" | Doorway pages. 969 clicks/yr across all of them. §2. |
| "Grep the HTML for the text — it's there, so it's crawlable" | Matches the RSC payload, not rendered HTML. §12. |
| "`npm run lint` should be green" | It never has been. 8 pre-existing errors. §1. |
| "Percentages against the `Pages.csv` sum" | That is 3,962, not 3,852. §3. |
| "`/rating/` regex to check for rating language" | Also matches "ope**rating**". Use `\b(rating\|review\|price)\b`. |
| "Add a `sameAs` we're fairly sure exists" | Fetch it first. §10. |
| "Trust `grep -c` on a data file for a count" | It undercounted products 53 vs the true 71. Use the runtime value. |
