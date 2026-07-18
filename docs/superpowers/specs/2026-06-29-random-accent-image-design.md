# Random Accent Image on Refresh — Design

**Date:** 2026-06-29
**Status:** Approved

## Goal

The accent image in the "Why Choose Us" / "The Aplus Advantage" section
(`components/sections/WhyChooseUs.tsx`) should show a different image on each
page load/refresh, on both laptop and mobile.

## Approach

Client-side random selection. The page stays statically rendered and fast
(consistent with this site's static-first setup, which disables `dynamicParams`
and prerenders routes). A small client component picks a random image in the
browser after mount, so the image reliably changes on every refresh without
any caching changes or server cost.

A pure server-side random pick was rejected because the page is statically
cached and the pick would be frozen at build time. Forcing dynamic rendering
was rejected as too invasive for a decorative image.

## Changes

### 1. Optimize & add the new image

- Source: `C:\Users\samee\Downloads\pexels-walls-io-440716388-17713947.jpg`
  (1.46 MB).
- Convert to optimized `.webp` (~100–150 KB target, matching the existing
  `collaboration.webp` at 85 KB) and place in `public/images/` as
  `collaboration-2.webp`.
- The existing `public/images/collaboration.webp` stays as-is and is image #1
  in the rotation.

### 2. New client component: `components/RandomAccentImage.tsx`

- `"use client"` component.
- Holds an array of image paths:
  `["/images/collaboration.webp", "/images/collaboration-2.webp"]`.
- Renders via Next's `<Image fill>` with the same `object-cover`, `sizes`,
  `alt`, and loading behavior as the current image.
- **Hydration safety:** renders image #1 (deterministic) on the server and
  during first client render, then swaps to a random pick inside a `useEffect`
  after mount. This avoids server/client hydration mismatch warnings.
- Adding more images later = add one entry to the array.

### 3. Wire into `WhyChooseUs.tsx`

- Replace the hardcoded `<Image>` inside the existing
  `AnimatedSection` wrapper (lines ~42-51) with `<RandomAccentImage />`.
- The wrapper, `aspect-3/2`, rounding, overflow, and shadow stay exactly as-is.
- No changes to the advantages grid or mobile marquee.

## Trade-offs

- On a fresh load, the server renders image #1; on random-pick loads the client
  swaps it after mount, so there may be a brief flash of image #1 before the
  swap. Acceptable for a decorative accent image.

## Verification

- Visual component — no test infrastructure added.
- Verify the component renders and `next build` (or lint/typecheck) passes.
