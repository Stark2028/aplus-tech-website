# Logitech Video Conferencing Integration — Design

**Date:** 2026-07-18
**Status:** Approved (brainstorm complete)
**Approach:** A — brand field + scoped copy sweep

## Goal

Add a curated Logitech video conferencing catalog to the site as a sixth top-level
category, with full feature parity with Samsung product pages (compare, spec-sheet
download, call, WhatsApp, add-to-quote, FAQs, structured data, OG images) — while
never claiming Logitech authorization anywhere.

## Positioning rules (the constraint that drives everything)

Aplus is an **authorized Samsung distributor** but sources Logitech informally from
the open market. Therefore:

1. Selling genuine Logitech products and using the Logitech name/product imagery to
   describe them is nominative fair use — allowed.
2. The words **"authorized" / "partner" / "certified"** must never appear near
   Logitech, in any surface: page copy, metadata, PDFs, JSON-LD, OG images, FAQs,
   WhatsApp templates.
3. No claims about sourcing channel or Logitech India warranty. The trust story for
   Logitech is Aplus's own **supply, installation, and AMC support**.
4. Samsung "authorized" claims stay everywhere they are true, but blanket site-wide
   wording must be **scoped to Samsung** so Logitech pages don't inherit it.
5. Footer gains a small-print line:
   *"Logitech® is a trademark of Logitech. Aplus Technology Solutions is an
   independent reseller of Logitech products and is not affiliated with or endorsed
   by Logitech."*
6. Site identity ([app/layout.tsx](../../../app/layout.tsx) metadata) stays
   Samsung-led; the meta description gains "…and Logitech video conferencing".
   Homepage hero unchanged.
7. Optional future upgrade: Logitech Partner Connect registration would legitimize
   partner claims later; out of scope now.

## Catalog content

New category in [data/categories.ts](../../../data/categories.ts):

- `id: "video-conferencing"`, name "Video Conferencing", nav label "Video Conferencing"
- Brand-neutral overview naming Logitech descriptively (no "authorized")
- Use-case chips: Boardrooms, Huddle Rooms, Microsoft Teams Rooms, Zoom Rooms,
  Training Rooms

Sixteen products in [data/products.ts](../../../data/products.ts), grouped by
`subCategory`:

| subCategory | Products |
|---|---|
| Video Bars & Systems | Rally Board 65, Rally Bar, Rally Bar Mini, Rally Bar Huddle, Rally Plus, MeetUp 2 |
| Cameras | Rally AI Camera, Rally AI Camera Pro, Rally Camera, PTZ Pro 2, Sight, Scribe |
| Controllers & Scheduling | Tap, Tap IP, Tap Scheduler |
| Room Compute | RoomMate |

Explicitly excluded: legacy models (GROUP, CONNECT, BCC950, original MeetUp),
cables/mounts/charging stands, personal gear (Brio webcams, Zone headsets, Logi
Dock), Barco/Select service bundles.

Each product gets the full existing treatment: `longDescription`, `features`,
`specGroups` sourced from Logitech's official spec pages, and official product
images downloaded to `/public/products/video-conferencing/<slug>/` in the existing
avif/webp pattern. `catalog2026` stays unset (it means "2026 **Samsung** catalog"
and drives latest-first sorting).

## Data model

`Product` gains `brand?: "Samsung" | "Logitech"` — optional, **absent means
Samsung**, so no existing entry changes. All brand-branching below reads this
field; nothing may infer brand from category.

### Display-shaped specs fields (verified issue)

`Product.specs` (resolution / brightness / screenSizes / operationTime) is
required and display-centric. VC products keep the same four fields, filled with
the most meaningful value per product type:

| Product type | resolution | brightness | screenSizes | operationTime |
|---|---|---|---|---|
| Bars & cameras (Rally family, MeetUp 2, PTZ Pro 2, Sight, Scribe) | video resolution ("4K UHD") | field of view ("113° FOV") | `[]` | room rating ("Medium Rooms") |
| Touch panels (Rally Board 65, Tap, Tap IP, Tap Scheduler) | panel resolution | real panel brightness (nits) | panel size (`["65"]`, `["10.1"]`) | room/duty rating |
| Compute (RoomMate) | max video out ("4K UHD") | platform ("CollabOS") | `[]` | room rating |

[components/ProductCard.tsx:168–182](../../../components/ProductCard.tsx) and the
catalog listing tiles swap their **labels** for the VC category, driven by
`subCategory` (e.g. Video / Field of View / "Designed for … rooms" for cameras;
real Brightness for touch panels). Same card layout, same components — labels
only. Label mapping is finalized in the implementation plan.

### Filters

[lib/productFilters.ts:51](../../../lib/productFilters.ts) parses the first number
from `brightness`, so "113° FOV" would false-match nit bands. The VC category page
uses its own filter set (room size, platform/subCategory) instead of nit-band
brightness filters. Exact mechanics decided in the implementation plan.

## Feature parity map (verified line-by-line)

**No changes needed** (data-driven): Compare button/floating bar/compare table
(fed by `specGroups`), Add to Quote + quote flow, `tel:` call buttons, gallery,
search, sitemap, `generateStaticParams` (site-wide `dynamicParams=false` is
satisfied automatically), card SKU line
([lib/productSku.ts](../../../lib/productSku.ts) already handles empty sizes).

**Brand-parametrized** (same button/feature, brand-aware content):

| Surface | Verified location | Change |
|---|---|---|
| Spec-sheet PDF trust bullet | [lib/pdf/specSheet.ts:63](../../../lib/pdf/specSheet.ts) | "Samsung Authorized …" → brand-scoped bullet; Logitech: supply/installation/AMC |
| Spec-sheet PDF footer | [lib/pdf/specSheet.ts:184](../../../lib/pdf/specSheet.ts) | "Authorized Samsung Commercial Display Distributor" → brand-scoped |
| Quote PDF footer | [lib/pdf/quote.ts](../../../lib/pdf/quote.ts) | Neutral company line **always** (quotes can mix brands) |
| WhatsApp templates | [lib/whatsapp.ts](../../../lib/whatsapp.ts) | Parametrize brand; add video-conferencing category message |
| Product FAQs | [lib/productFaq.ts:42,62,67](../../../lib/productFaq.ts) | Brand-branch; Logitech drops "authorized"/"genuine Samsung" claims; model-code Q only when a model code exists |
| Category FAQs | [lib/categoryFaq.ts](../../../lib/categoryFaq.ts) | New video-conferencing FAQ set |
| Product JSON-LD | [lib/jsonLd.ts:127–131](../../../lib/jsonLd.ts) | `brand`/`manufacturer` from `product.brand` (logitech.com for Logitech) |
| Category JSON-LD | [lib/jsonLd.ts:155](../../../lib/jsonLd.ts) | "— Samsung B2B Displays" naming made brand/category-aware |
| OG share image | [app/products/[slug]/opengraph-image.tsx:90](../../../app/products/%5Bslug%5D/opengraph-image.tsx) | "Authorized Samsung Partner" badge brand-conditional (respect Satori flex constraints) |
| Footer | [components/Footer.tsx](../../../components/Footer.tsx) | Scope Samsung claim; add Logitech trademark/independent-reseller small print |
| Model codes | [lib/modelCodes.ts](../../../lib/modelCodes.ts) | Samsung-only lookup simply has no Logitech entries; dependent copy must degrade gracefully |

**Untouched by this project:** product badges (parked decision), homepage hero,
`ProductFinderSection` Samsung copy (Samsung-only finder is still true — VC
category excluded from finder for now), city landing pages, taxonomy redesign,
Solutions category (VXT/LYNK), middleware redirects (new URLs need none).

## SEO & routing

- New slugs flow through existing `generateStaticParams`; `dynamicParams=false`
  stays intact.
- Sitemap picks up new routes automatically.
- No redirect-map changes — these are brand-new URLs.
- Root metadata: description broadened per positioning rule 6; title unchanged.

## Testing & verification

1. Unit tests (existing `lib/*.test.ts` pattern) for each parametrized helper:
   brand-branched FAQ output, WhatsApp templates (incl. new VC message), JSON-LD
   brand fields, spec-sheet/quote footer lines per brand.
2. Full production build (catches static-params/soft-404 regressions).
3. Runtime pass via the verify skill on a Logitech product page: exercise every
   button — compare with a mixed Samsung+Logitech selection, download the spec
   PDF and read its footer, check WhatsApp prefill text, add to quote and render
   the quote PDF.
4. Hard check: grep built HTML output of all Logitech routes for
   `authoriz` — zero matches allowed.

## Success criteria

- 16 Logitech products live with identical page capabilities to Samsung products.
- No Logitech surface (HTML, PDF, JSON-LD, OG image, WhatsApp text) contains
  authorization/partner/certification claims or sourcing-channel promises.
- All Samsung surfaces unchanged in meaning; "authorized" claims still present and
  now explicitly scoped.
- Build green, existing tests green, new helper tests green.
