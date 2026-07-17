# Premium Product Card — bezel display with hover theatre

**Date:** 2026-07-17 (finalized after re-verification pass)
**Status:** Approved by user — direction, slimmer bezel, no stock label, and panel strategy A (uniform light mat) all confirmed
**Mockups of record:** `.superpowers/brainstorm/1481-1784283839/content/card-image-placement.html` (treatment) and `card-panel-choice.html` (panel decision, real images)
**Scope ruling by user:** This card treatment is the ONLY approved piece of the phase-2 "system board". Explicitly rejected: site-wide Space Grotesk swap, mono eyebrow/section-header system, category-tile restyle, theatre CTA sections, wizard-as-channels, solutions channel tabs. Do not propose them again unless the user reopens the topic.

## 1. What changes

`components/ProductCard.tsx` only — the image area and the small text rows around it. Every page that renders ProductCard inherits it automatically. No other component changes. One new tiny shared module for fonts (see §4).

## 2. Visual spec

### Image area (replaces the current plain light box)

1. **Bezel frame** — thin metal-gradient border wrapping the image area:
   - `padding: 1.5px` (user: mockup's 2.5px was too much bezel), `border-radius: 8px`, margin `~10px 10px 0`
   - background `linear-gradient(160deg, #4b5563, #182131 35%, #2a3648)` — lightened per the same feedback
2. **Panel — uniform light mat (strategy A, user-selected)**, `border-radius: 6.5px`:
   - `linear-gradient(160deg, #f6f8fb, #eef2f7 60%, #f2f5fa)`
   - **Verified constraint behind this choice:** 27 of 50 primary images are opaque white-background JPEG/WebP (audited every `images[0]`; only 23 have alpha). A dark panel would show white boxes on those 27; mixed panels would make the grid a patchwork. Light mat works for all 50 today with zero image editing.
   - Keep the existing `mix-blend-multiply` on the image wrapper — it's what melts white backgrounds into the mat ([ProductCard.tsx:98](../../components/ProductCard.tsx)).
   - Panel content height stays `170px` (current `h-[170px]`) — no runtime layout shift; the frame + margin add a few uniform pixels to card height, applied to every card equally.
3. **Product photo** — the existing `next/image`, unchanged src/alt/sizes/priority:
   - `object-contain`, centered ~82% of panel; keep the existing `group-hover:scale-105` (500ms) behavior
4. **Hover / focus-within theatre** (CSS-only; transform/opacity/box-shadow transitions):
   - Backlight glow tuned for light surface: radial `rgba(37,99,235,.16)` fades in (500ms)
   - Sheen sweep tinted for light surface: `rgba(37,99,235,.08)` band, one pass (700ms)
   - Frame rim light `box-shadow: 0 0 30px -6px rgba(37,99,235,.45)`
   - Existing SpotlightCard lift/shadow on the card shell stays as-is
   - **Future option (not in scope):** if the 27 opaque images are ever converted to cut-outs, the dark "display" panel can be revisited as a follow-up.

### Text rows

- **SKU line** (new, between frame and name), IBM Plex Mono, letter-spaced, slate:
  - Content from real fields only: `series` + screen-size range from `specs.screenSizes` (e.g. `QET SERIES · 43–82″`); if no series, fall back to `subCategory`, then `category`.
  - **No availability/stock label** (user ruling; no such data field exists).
- **Product name**: Space Grotesk 700, card-scoped.
- Meta line, price/CTA row, quote/compare logic, router behavior: untouched.

### Chrome that must not move

- Badge (top-left) and compare button (top-right) keep exact positions/z-index above the frame. The light mat is close to today's background, so no contrast risk expected — verify visually anyway.

## 3. Verified data facts (from the re-verification pass)

- Primary-image alpha audit: 23 alpha cut-outs / 27 opaque / 0 missing, across 50 products.
- `Product` has NO model-code or availability fields; it has `series`, `subCategory`, `specs.screenSizes`.
- Current image box: `relative w-full h-[170px] mix-blend-multiply` with `object-contain` + `group-hover:scale-105` already present.

## 4. Fonts (wiring verified)

- Space Grotesk and IBM Plex Mono are currently module-level `next/font` instances inside `HeroSection.tsx`, where `--font-display` deliberately shadows Plus Jakarta Sans (which owns that variable at the layout level).
- Extract the two instances into a shared module (e.g. `app/fonts-accent.ts`), imported by both `HeroSection.tsx` and `ProductCard.tsx`.
- In the card, apply `spaceGrotesk.className` / `plexMono.className` **directly on the name/SKU elements** — no CSS-variable scoping, no collision with Jakarta's `--font-display`. Caveat stays hero-only.
- No new font downloads (both families already ship for the hero).

## 5. Accessibility & motion

- All hover effects also trigger on `:focus-within`.
- `prefers-reduced-motion: reduce` → no scale, no sheen; glow appears without transition.
- Visual treatment is decorative; image `alt`, link semantics, aria labels unchanged.

## 6. Performance

- Pure CSS; no new JS, images, or font downloads. GPU-friendly properties only.
- Sanity-check listing-page Lighthouse (mobile) before/after; expect no measurable change.

## 7. Testing / verification

- `npx tsc --noEmit`; existing vitest suite green.
- Runtime verify (verify skill): products listing at 1440 + 390 — rest, hover, focus-within, reduced-motion; screenshot evidence. Spot-check one alpha product (QET) and one opaque product (Small QBC) side by side for mat consistency.
- Touch devices get no hover: rest state (bezel + mat + SKU row) must read complete on its own.

## 8. Build notes

- Branch: `feat/premium-product-card` from master. Commit this spec as the first commit.
- Mockup CSS (`card-panel-choice.html`, card #3) is the visual reference; translate into the component's existing Tailwind/inline-style idiom.
