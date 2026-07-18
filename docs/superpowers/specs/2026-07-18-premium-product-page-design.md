# Premium Product Detail Page — "Showroom" (2026-07-18)

## Decision record

Brainstormed with visual mockups (browser companion). Three directions shown:
A "Showroom" (bezel-card language scaled up, light page), B "Technical Dossier"
(Manufacturer Pro PDF as a web page), C "Stage Hero" (dark navy hero band).
**User picked A.** Spec-table sub-question (soft refined vs dossier bands):
**user picked soft refined.** Design approved in terminal 2026-07-18.

## Principle

The bezel-display language from the approved premium ProductCard
(`docs/superpowers/specs/2026-07-17-premium-product-card-design.md`), scaled up
to `app/products/[slug]/page.tsx`. Light page throughout. **Presentation only:**
every word of copy, all CTAs, the quote form, FAQ content, JSON-LD, metadata,
and URLs are unchanged (SEO migration copy freeze).

## Changes

1. **Top bar** — blue-600 banner → slim navy `#0f172a` strip; small tracked
   lettering; distributor line left, phone right. Same copy and tel: link.

2. **Gallery (`components/ProductGallery.tsx`)** — main image area becomes the
   bezel display: ~2px `#26324a` frame, rounded, light-mat gradient
   (`linear-gradient(160deg,#f6f8fb,#eef2f7 60%,#f2f5fa)`), images
   `mix-blend-multiply` (white-bg JPEGs melt into the mat), soft blue backlight
   glow. Zoom / arrows / swipe behavior unchanged; controls restyled minimally.
   Thumbnails = mini bezel chips: light mat, thin border; active = `#26324a`
   border + soft blue ring (replaces thick blue-600 border). Keep `priority` on
   the main image (LCP).

3. **Buy box (desktop card + mobile header)** — blue series pill →
   IBM Plex Mono SKU line: `formatSkuLine(product)` + ` · ${modelCode}` when
   `modelCodeFor(slug)` is non-null. The separate "MODEL" pill row is removed
   (code lives in the SKU line). H1 in Space Grotesk via `--font-card-display`.
   Quick-spec tiles: white, hairline `slate-200` border, mono uppercase labels
   (`--font-card-mono`). Size chips stay neutral outline — informational, not
   selectors. CTA hierarchy unchanged (`ProductActions` already slate-900).

4. **Content cards** — Key Highlights / Product Overview / Technical
   Specifications headers set in Space Grotesk; blue accent-bar motif stays.
   Spec table = soft refined: current structure, cleaner group bands
   (`slate-50` band, tracked blue label), existing hover rows.

5. **Trust badges + "Why buy from Aplus"** — hairline-border white cards; the
   blue tint box becomes navy-on-light. Copy unchanged.

6. **Related products** — delete the hand-rolled inline card markup; render the
   shared premium `ProductCard` instead.

7. **FAQ** — hairline borders only; behavior unchanged.

## Constraints

- **Never import `next/font` from client files** (Turbopack + .browserslistrc,
  vercel/next.js #86792). Client components consume `--font-card-*` vars
  already set on `<body>` by `app/layout.tsx`; the server page may too.
- Copy freeze: no text/heading/meta changes anywhere on the page.
- LCP: gallery image keeps `priority`; treatment is CSS-only.
- Size chips must not imply selectability.

## Out of scope

QuoteForm fields/styling beyond container coherence, SpecSheetButton flow,
chat widget, category pages, homepage.
