# Phase 2c — Crystal UHD Hospitality TVs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the 2 web-verified 2026 Crystal UHD hospitality TVs (HU8000F, HU7010F) into Commercial TV / Hotel TV with real images, each `catalog2026: true` so they lead the Hotel TV group.

**Architecture:** Pure data addition — append 2 product objects to `data/products.ts`, reusing existing `Product` fields (hospitality features in `specGroups`; no `ProductCard`/type change). Real Samsung images downloaded into `public/products/commercial-tv/<id>/` and validated. Match the existing hotel-TV entries' field conventions (`brightness: "300 nit"`, `operationTime: "16/7"`, `subCategory: "Hotel TV"`). No component/logic changes — no new tests; verification is `tsc` + `build` + runtime checks.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript. `curl` for image downloads; WebSearch/WebFetch to resolve real image URLs. Existing Vitest suite (22 tests) must stay green.

## Global Constraints

- **No changes to `ProductCard` or the `Product` interface.** Reuse existing fields.
- **Both products:** `catalog2026: true`, `category: "Commercial TV"`, `subCategory: "Hotel TV"`.
- **Match existing hotel-TV convention:** `brightness: "300 nit"`, `operationTime: "16/7"`, `resolution: "3,840 × 2,160 (4K UHD)"`.
- **Images:** real Samsung imagery, downloaded into `public/products/commercial-tv/<id>/` as `1.<ext>`, `2.<ext>`, … Target ~10, **minimum 3**. `images[]` lists only files that downloaded, hero first. Report actual counts. If <3 real images after honest effort, STOP and surface to the user (as with Stretched/Small in 2b).
- **Reliable static image sources:** Samsung Global Newsroom (HITEC 2025 HU8000F launch), knitec.com, B&H, other Shopify/Magento resellers. Samsung.com galleries are JS-rendered — resolve URLs from static-HTML sources or embedded JSON.
- **Popularity:** HU8000F = 97, HU7010F = 93 (both `catalog2026`, so they lead the Hotel TV group; these values tiebreak within the latest group and sit at/above the older hotel TVs).
- **Append** before the closing `];` of the `products` array (currently `data/products.ts:3604` — re-confirm the line before editing, the file has grown).
- **Verify** from `c:\Users\samee\b2b-website`: `npx tsc --noEmit`, `npm test`, `npm run build`.

---

## Task 1: Research & download images for both TVs

**Files:**
- Create: image folders `public/products/commercial-tv/samsung-hotel-tv-hu8000f/` and `.../samsung-hotel-tv-hu7010f/`
- Create: `docs/superpowers/crystal-uhd-research.md` (fact sheet + downloaded-file list)

**Interfaces:**
- Produces: per-product fact sheet (final spec values + exact downloaded image filenames) consumed by Tasks 2–3.

- [ ] **Step 1: Resolve + download HU8000F images.**

The Samsung Global Newsroom HITEC 2025 launch is the best source (worked for
Phase 2b). Extract real image URLs, validate each is an image, download hero-first:
```bash
# find press-image URLs
curl -sL --max-time 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  "https://news.samsung.com/global/samsung-to-unveil-hu8000f-hotel-tv-series-at-hitec-2025" \
  | grep -oE 'https://img[^" ]+\.(jpg|jpeg|png)' | grep -ivE '\-[0-9]+x[0-9]+\.|thumb|citizen|banner|logo' | sort -u
# also try knitec / B&H product pages if newsroom is thin
mkdir -p public/products/commercial-tv/samsung-hotel-tv-hu8000f
cd public/products/commercial-tv/samsung-hotel-tv-hu8000f
i=1; for url in <verified-urls>; do
  ext="${url##*.}"; case "$ext" in jpg|jpeg|png|webp) : ;; *) ext=jpg ;; esac
  curl -sL --max-time 30 -A "Mozilla/5.0" "$url" -o "$i.$ext" -w "$i.$ext %{http_code} %{content_type}\n"; i=$((i+1))
done; cd - >/dev/null
# drop non-images
for f in public/products/commercial-tv/samsung-hotel-tv-hu8000f/*; do file "$f" | grep -qiE 'JPEG|PNG|WebP|image' || rm -f "$f"; done
```
Search terms if newsroom is thin: "Samsung HU8000F hospitality TV" (B&H `HG43U800FNFXZA`, knitec `HU800F`).

- [ ] **Step 2: Resolve + download HU7010F images.**

HU7010F is India-only and lower-profile → likely fewer sources. Try Samsung India
newsroom/product pages, knitec, and reseller Shopify stores. Same
download+validate flow into `public/products/commercial-tv/samsung-hotel-tv-hu7010f/`.
If <3 clean images, note it (HU7010F may need backfill — acceptable, surface it).

- [ ] **Step 3: Record fact sheet + commit.**

Create `docs/superpowers/crystal-uhd-research.md` with final specs (from the spec's
verified anchors) + exact image counts per product. Then:
```bash
git add public/products/commercial-tv/samsung-hotel-tv-hu8000f public/products/commercial-tv/samsung-hotel-tv-hu7010f docs/superpowers/crystal-uhd-research.md
git commit -m "assets: Crystal UHD hotel TV images + research (Phase 2c)"
```

---

## Task 2: Add "Crystal UHD Hotel TV (HU8000F)"

**Files:** Modify `data/products.ts` (append one object before `];`).

**Interfaces:** Consumes HU8000F fact sheet. Produces product `samsung-hotel-tv-hu8000f`.

- [ ] **Step 1: Append the product object.**

```ts
  {
    id: "samsung-hotel-tv-hu8000f",
    popularity: 97,
    catalog2026: true,
    name: "Samsung Crystal UHD Hotel TV (HU8000F)",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HU8000F",
    description:
      "The 2026 Crystal UHD hospitality flagship — AirSlim 4K with LYNK Cloud management, Google Cast, Apple AirPlay, and Samsung Knox for a premium, home-like guest experience.",
    longDescription: `The Samsung Crystal UHD Hotel TV (HU8000F) is the 2026 flagship of Samsung's hospitality lineup, giving guests a familiar, home-like 4K experience while giving hotel managers powerful centralized control. Powered by the Crystal Processor 4K with AI-driven 4K upscaling, HDR10+, and Dynamic Crystal Color, it renders content in over a billion shades with lifelike clarity, while adaptive sound tunes 20W stereo audio to whatever is on screen.

Its AirSlim design creates an elegant, nearly bezel-free profile that complements any guest room. Guests can cast directly from their own devices via Google Cast and Apple AirPlay, or browse built-in apps — Netflix, Prime Video, and Samsung TV Plus — straight from the Tizen home screen, with no dongles or logins required.

For operators, Samsung LYNK Cloud delivers remote, multi-property display management and guest-usage analytics that surface marketing insights and drive incremental revenue, while the Tizen Enterprise Platform, SmartThings Pro, and Samsung Knox provide enterprise-grade integration and security. Available from 43" to 85".`,
    features: [
      "AirSlim nearly bezel-free 4K design",
      "Crystal Processor 4K with AI 4K upscaling, HDR10+, Dynamic Crystal Color",
      "Google Cast + Apple AirPlay device casting",
      "LYNK Cloud remote management & guest analytics",
      "Built-in Netflix, Prime Video, Samsung TV Plus (Tizen)",
      "Samsung Knox security, SmartThings Pro",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\" / 85\"",
        "Panel Type": "4K VA, direct backlight",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "HDR": "HDR10 / HDR10+",
        "Processor": "Crystal Processor 4K",
        "Picture": "AI 4K upscaling, Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer",
        "Refresh Rate": "60 Hz",
        "Design": "AirSlim",
      },
      "Hospitality Features": {
        "Management": "LYNK Cloud, Tizen Enterprise Platform",
        "Casting": "Google Cast, Apple AirPlay",
        "Apps": "Smart Hub, Samsung TV Plus, Netflix, Prime Video",
        "Control": "Multi-Code Remote, SmartThings Pro",
        "Security": "Samsung Knox",
      },
      "Audio & Connectivity": {
        "Speakers": "20 W stereo + adaptive sound",
        "Wireless": "Wi-Fi 5, Bluetooth 5.2",
        "HDMI": "3 × HDMI",
        "USB": "2 × USB-A",
      },
      "Model": {
        "Model Codes": "HG43U800FNFXZA … HG85U800FNFXZA",
      },
    },
    images: [
      // ONLY files that actually downloaded, hero first
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/1.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/2.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/3.jpg",
    ],
  },
```

- [ ] **Step 2: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build includes `/products/samsung-hotel-tv-hu8000f`.

- [ ] **Step 3: Commit.**

```bash
git add data/products.ts
git commit -m "feat: add Crystal UHD Hotel TV (HU8000F) product"
```

---

## Task 3: Add "Crystal UHD Hotel TV (HU7010F)"

**Files:** Modify `data/products.ts` (append one object before `];`).

**Interfaces:** Consumes HU7010F fact sheet. Produces product `samsung-hotel-tv-hu7010f`.

- [ ] **Step 1: Append the product object.**

```ts
  {
    id: "samsung-hotel-tv-hu7010f",
    popularity: 93,
    catalog2026: true,
    name: "Samsung Crystal UHD Hotel TV (HU7010F)",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HU7010F",
    description:
      "2026 Crystal UHD hospitality TV for India — 4K with LYNK Cloud management, Google Cast, Apple AirPlay, and Samsung Knox, delivering a home-like guest experience at a smart price point.",
    longDescription: `The Samsung Crystal UHD Hotel TV (HU7010F) brings the 2026 Crystal UHD guest experience to hotels across India. Driven by the Crystal Processor 4K with AI 4K upscaling, HDR, and Dynamic Crystal Color, it delivers crisp, vibrant 4K content that makes every guest room feel like home, complemented by Motion Xcelerator for smooth motion and a Contrast Enhancer for depth.

Guests can cast their own content via Google Cast and Apple AirPlay or use built-in apps and Samsung TV Plus from the Tizen home screen. For operators, Samsung LYNK Cloud enables remote, centralized management across properties along with guest-usage analytics, while the Tizen Enterprise Platform, SmartThings Pro, and Samsung Knox provide secure integration into hotel systems.

Positioned just below the AirSlim HU8000F flagship, the HU7010F focuses on core hospitality value and is launched in India. Available from 43" to 75".`,
    features: [
      "Crystal Processor 4K with AI 4K upscaling & HDR",
      "Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer",
      "Google Cast + Apple AirPlay device casting",
      "LYNK Cloud remote management & guest analytics",
      "Samsung TV Plus & Smart Hub (Tizen)",
      "Samsung Knox security, SmartThings Pro — launched in India",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "65", "75"],
      operationTime: "16/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\"",
        "Panel Type": "4K VA, direct backlight",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "HDR": "HDR",
        "Processor": "Crystal Processor 4K",
        "Picture": "AI 4K upscaling, Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer",
        "Refresh Rate": "60 Hz",
      },
      "Hospitality Features": {
        "Management": "LYNK Cloud, Tizen Enterprise Platform",
        "Casting": "Google Cast, Apple AirPlay",
        "Apps": "Smart Hub, Samsung TV Plus",
        "Control": "Multi-Code Remote, SmartThings Pro",
        "Security": "Samsung Knox",
      },
      "Connectivity": {
        "Wireless": "Wi-Fi 5, Bluetooth 5.2",
        "HDMI": "2 × HDMI",
        "USB": "2 × USB-A",
      },
      "Availability": {
        "Region": "Launched in India only",
      },
    },
    images: [
      // ONLY files that actually downloaded, hero first
      "/products/commercial-tv/samsung-hotel-tv-hu7010f/1.jpg",
    ],
  },
```

- [ ] **Step 2: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build includes `/products/samsung-hotel-tv-hu7010f`.

- [ ] **Step 3: Commit.**

```bash
git add data/products.ts
git commit -m "feat: add Crystal UHD Hotel TV (HU7010F) product"
```

---

## Task 4: Full verification — both TVs live, grouped, leading

**Files:** none — verification only.

- [ ] **Step 1: Type-check, test, build.**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors; existing tests still pass (no logic changed); build succeeds.
`grep -c 'id: "' data/products.ts` → **54**.

- [ ] **Step 2: Commercial TV category page shows both leading the Hotel TV group.**

`npm run dev`, then:
```bash
curl -s http://localhost:3000/categories/commercial-tv -o "$SCRATCH/ctv.html"
grep -oE 'samsung-hotel-tv-hu8000f|samsung-hotel-tv-hu7010f' "$SCRATCH/ctv.html" | sort -u
```
Expected: both ids present, in the "Hotel TV" grouped section, ahead of the older
HGU/AU hotel TVs (both are `catalog2026`, popularity 97/93).

- [ ] **Step 3: Images serve + counts.**

```bash
for id in samsung-hotel-tv-hu8000f samsung-hotel-tv-hu7010f; do
  echo "$id: $(ls public/products/commercial-tv/$id | wc -l) imgs"; done
```
Expected: HU8000F ≥3; HU7010F ≥1 (backfill-flagged if <3). Spot-check hero images
return HTTP 200 image/* via the dev server.

- [ ] **Step 4: Report actual image counts + any flagged specs.** No code change.

---

## Notes on scope boundaries

- **This completes the Phase 2 catalog expansion** (LED, Smart Signage, Crystal UHD).
- **No new tests** — data-only change; the existing Vitest suite is the regression guard.
- **Onyx, Virtual Production IVC, Solutions/VXT/LYNK** remain out of scope.
- If HU7010F yields <3 images, ship with what's available (min 1 hero) and flag for
  backfill — consistent with the Stretched/Small decision in Phase 2b.
