# Phase 2b — Smart Signage Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 web-verified Samsung Smart Signage products (Spatial, Color E-Paper, Outdoor, Window, Stretched, Small → Digital Signage; Flip WMFX → Interactive) with real images, each `catalog2026: true` so they lead their category.

**Architecture:** Pure data addition — append 7 product objects to `data/products.ts`, reusing existing `Product` fields (unusual specs mapped into `specs` + `specGroups`; no `ProductCard`/type change). Real Samsung images downloaded into `public/products/<category-slug>/<id>/` and validated. Only the new Digital Signage products get `subCategory` chips; existing signage stays untagged (the category page already renders an ungrouped trailing section). No component or logic changes — so no new tests; verification is `tsc` + `build` + runtime checks.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript. `curl` for image downloads; WebSearch/WebFetch to resolve real image URLs. Vitest suite (from 2a) must stay green (no logic touched).

## Global Constraints

- **No changes to `ProductCard` or the `Product` interface.** Reuse existing fields.
- **All 7 products:** `catalog2026: true`. Six use `category: "Digital Signage"`; Flip WMFX uses `category: "Interactive Display"`.
- **subCategory on the new products only** — do NOT add subCategories to existing products. Values: `Spatial`, `Color E-Paper`, `Outdoor`, `Window`, `Stretched`, `Small Signage`, `Flip`.
- **Images:** real Samsung imagery, downloaded into `public/products/<slug>/<id>/` as `1.<ext>`, `2.<ext>`, … Digital Signage → `digital-signage/`; Flip → `interactive/`. Target ~10, **minimum 3**. `images[]` lists only files that downloaded, hero first. Report actual counts. If <3 real images after honest effort, STOP and surface to the user.
- **Reliable static image sources:** bluesquare.digital (Magento), knitec.com / creationnetworks.net (Shopify), other Shopify/Magento resellers. Samsung.com and B&H galleries are JS-rendered / bot-blocked — resolve URLs from static-HTML resellers or embedded JSON.
- **Excluded:** Onyx, Virtual Production IVC, Crystal UHD (2c), Solutions/VXT/LYNK.
- **Verify** from `c:\Users\samee\b2b-website`: `npx tsc --noEmit`, `npm test`, `npm run build`.
- Product objects are appended before the closing `];` of the `products` array (currently `data/products.ts:3192`).

---

## Task 1: Research & download images + finalize specs for all 7 products

**Files:**
- Create: image folders under `public/products/digital-signage/<id>/` and `public/products/interactive/samsung-flip-wmfx/`
- Append: `docs/superpowers/led-research.md` is 2a's; create `docs/superpowers/smart-signage-research.md` for 2b notes.

**Interfaces:**
- Produces: per-product fact sheet (final spec values + the exact downloaded image filenames) consumed by Tasks 2–8.

- [ ] **Step 1: For each of the 7 products, resolve + download real images.**

Use the 2a helper approach: fetch a static-HTML reseller product page, extract
image URLs, validate each is a real image, download hero-first. Per product:
```bash
# 1. find a source page (WebSearch "Samsung <model> specifications reseller")
# 2. extract candidate URLs:
curl -sL --max-time 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "<page>" \
 | grep -oE 'https?://[^"'"'"' ]+\.(jpg|jpeg|png|webp)' \
 | grep -ivE 'logo|icon|favicon|sprite|placeholder|badge|flag|_(16|24|32|48|50|64|100|150)x' \
 | sed -E 's/_[0-9]+x[0-9]*//; s/\?.*$//' | sort -u
# 3. validate + download (keep only 200 + image/*):
mkdir -p public/products/<slug>/<id> && cd public/products/<slug>/<id>
i=1; for url in <verified-urls>; do
  ext="${url##*.}"; case "$ext" in jpg|jpeg|png|webp|avif) : ;; *) ext=jpg ;; esac
  curl -sL --max-time 30 -A "Mozilla/5.0" "$url" -o "$i.$ext" -w "$i.$ext %{http_code} %{content_type}\n"; i=$((i+1))
done
cd - >/dev/null
```
Then drop non-images and dupes:
```bash
for f in public/products/<slug>/<id>/*; do file "$f" | grep -qiE 'JPEG|PNG|WebP|image' || rm -f "$f"; done
```

Candidate model codes / search terms per product (verified during design):
- **Spatial** `samsung-spatial-smhx` (digital-signage): SM85HX-P / LH85SMHPBGCXZA, "Samsung Spatial Signage SMHX 85 3D".
- **Color E-Paper** `samsung-color-epaper-emdx` (digital-signage): EM32DX / LH32EMDIBGBXZA, "Samsung Color E-Paper EMDX 32".
- **Outdoor** `samsung-outdoor-oh` (digital-signage): OH75A / OHDX / OHB, "Samsung Outdoor Signage OHDX".
- **Window** `samsung-window-om` (digital-signage): OM75A / OMN / OMB, "Samsung Window Signage OMB high brightness".
- **Stretched** `samsung-stretched-shc` (digital-signage): SH37C / SHC, "Samsung Stretched Signage SHC 16:4.5".
- **Small** `samsung-small-qbc` (digital-signage): QB13C / QB24C, "Samsung Small Signage QB13C QB24C".
- **Flip WMFX** `samsung-flip-wmfx` (interactive): WM55FX / LH55WMFWBGCX, "Samsung Flip WMFX 55 interactive".

- [ ] **Step 2: Record the per-product fact sheet.**

Create `docs/superpowers/smart-signage-research.md` capturing, per product: final
`specs` values, `specGroups` values, model codes, and the exact list of image
files downloaded (with counts). Use the "Verified spec anchors" from the spec as
the baseline; fill any gap from one authoritative web source; flag uncertain
cells.

- [ ] **Step 3: Commit images + research.**

```bash
git add public/products/digital-signage public/products/interactive docs/superpowers/smart-signage-research.md
git commit -m "assets: web-sourced Smart Signage images + research (Phase 2b)"
```

---

## Tasks 2–8: Add each product (one task per product)

Each task appends ONE product object to `data/products.ts` before the closing
`];`, using that product's fact sheet, then verifies. Task 2 shows the full
structure; Tasks 3–8 repeat it with their own data (no abbreviation — fill every
value, list only real downloaded images).

### Task 2: Add "Samsung Spatial Signage (SMHX)"

**Files:** Modify `data/products.ts` (append one object).

**Interfaces:** Consumes Spatial fact sheet. Produces product `samsung-spatial-smhx`.

- [ ] **Step 1: Append the product object** before `];`:

```ts
  {
    id: "samsung-spatial-smhx",
    popularity: 95,
    catalog2026: true,
    name: "Samsung Spatial Signage (SMHX)",
    category: "Digital Signage",
    subCategory: "Spatial",
    series: "SMHX",
    description:
      "Glasses-free 3D signage powered by patented 3D Plate technology — turns ordinary content into striking, lifelike depth in a slim 5.2 cm profile.",
    longDescription: `The Samsung Spatial Signage (SMHX) delivers an immersive glasses-free 3D experience using Samsung's patented 3D Plate technology, which applies binocular parallax to send a different image to each eye — creating cinematic depth and 360° product rotation without special glasses or separately authored 3D content.

At 85 inches with 4K UHD clarity (a compact 32-inch 9:16 portrait model is also available), Spatial Signage combines a striking visual with an UltraThin 5.2 cm profile that integrates cleanly into retail, lobby, and experience-centre environments. A 500-nit panel with anti-glare treatment keeps content vivid under commercial lighting.

Samsung VXT with the AI Studio app makes 3D content creation simple: upload an image and write a prompt to generate dynamic 3D video, then manage and monitor devices remotely. Recognised as a CES 2026 Innovation Award honoree, Spatial Signage redefines attention-grabbing display for premium commercial spaces.`,
    features: [
      "Glasses-free Virtual 3D via patented 3D Plate technology",
      "UltraThin 5.2 cm profile",
      "4K UHD (85\") / FHD 9:16 (32\")",
      "AI Studio 3D content generation in Samsung VXT",
      "Quantum Processor, anti-glare",
      "24/7 operation",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "500 nit",
      screenSizes: ["32", "85"],
      operationTime: "24/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "85\" (4K UHD) / 32\" (FHD, 9:16 portrait)",
        "Resolution": "3,840 × 2,160 (85\") / 1,080 × 1,920 (32\")",
        "Brightness (Type)": "500 nit",
        "3D Technology": "Patented 3D Plate (glasses-free binocular parallax)",
        "Depth": "52 mm (UltraThin)",
        "Operation Time Support": "24/7",
      },
      "Processing & Software": {
        "Processor": "Quantum Processor",
        "Panel": "Anti-glare",
        "Content": "Samsung VXT with AI Studio (image-to-3D-video)",
        "Platform": "Tizen 7.0",
      },
      "Recognition": {
        "Award": "CES 2026 Innovation Award honoree",
        "Model Code": "LH85SMHPBGCXZA (SM85HX-P)",
      },
    },
    images: [
      // ONLY the files that actually downloaded, hero first, e.g.:
      "/products/digital-signage/samsung-spatial-smhx/1.jpg",
      "/products/digital-signage/samsung-spatial-smhx/2.jpg",
      "/products/digital-signage/samsung-spatial-smhx/3.jpg",
    ],
  },
```

- [ ] **Step 2: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build includes `/products/samsung-spatial-smhx`.

- [ ] **Step 3: Commit.**

```bash
git add data/products.ts
git commit -m "feat: add Spatial Signage (SMHX) product"
```

### Task 3: Add "Samsung Color E-Paper (EMDX)"

Same 3 steps, `samsung-color-epaper-emdx` (`category: "Digital Signage"`,
`subCategory: "Color E-Paper"`, `series: "EMDX"`, `popularity: 90`).
`specs`: `resolution: "2,560 × 1,440 (WQHD)"`, `brightness: "Reflective e-paper (0 W on static image)"`,
`screenSizes: ["13", "32"]`, `operationTime: "Always-on (battery)"`.
`specGroups` — Display: E-Ink Spectra 6, 32"/13", up to 77K colours, 178°/178°;
Power & Battery: 4,600 mAh built-in, ~200 days at 1 update/day, 0 W static;
Connectivity: Wi-Fi, Bluetooth, USB-C; Platform: Tizen 8.0, Samsung VXT + E-Paper app;
Eco: recycled materials, IP5X; Model Code LH32EMDIBGBXZA (EM32DX).
Features: paper-thin design, embedded battery, energy-efficient (0W static),
colour imaging algorithm, Samsung VXT. Commit: `feat: add Color E-Paper (EMDX) product`.

### Task 4: Add "Samsung Outdoor Signage (OH Series)"

Same 3 steps, `samsung-outdoor-oh` (`Digital Signage`, `subCategory: "Outdoor"`,
`series: "OHA/OHDX/OHB"`, `popularity: 87`).
`specs`: `resolution: "3,840 × 2,160 (4K UHD) / FHD by model"`, `brightness: "3,500 nit (peak 4,000)"`,
`screenSizes: ["55", "75"]` (OHB 24" → include `"24"` if listing OHB), `operationTime: "24/7"`.
`specGroups` — Display: OHA 75" 4K 3,500 nit (peak 4,000); OHDX 46"/55" FHD 3,500 nit (peak 4,000), 6,000:1, UL-verified outdoor visibility; OHB 24" 1,500 nit;
Durability: IP56, IK10, heat-dissipation structure, auto brightness sensor, additional-glass-installable;
Software: Samsung VXT; Operation 24/7.
Features: UL-verified outdoor visibility, IP56, IK10, heat dissipation, auto brightness, Samsung VXT.
Commit: `feat: add Outdoor Signage (OH series) product`.

### Task 5: Add "Samsung Window Signage (OM Series)"

Same 3 steps, `samsung-window-om` (`Digital Signage`, `subCategory: "Window"`,
`series: "OMA/OMN/OMB/OMDX"`, `popularity: 86`).
`specs`: `resolution: "4K UHD / FHD by model"`, `brightness: "up to 4,000 nit"`,
`screenSizes: ["32", "46", "55", "75"]`, `operationTime: "24/7"`.
`specGroups` — Display: OMA 75" 4K; OMB 46"(FHD 4,000 nit)/55"(4K 3,000 nit), 6,000:1;
OMN/OMN-D FHD 4,000 nit (OMN-D dual-sided 3,000/1,000 nit); OMDX 32" FHD 2,000 nit, 4.56 cm depth;
Features: high brightness, polarized-sunglass support, auto brightness control, IP5X, overheating mitigation, clean cable management, built-in Wi-Fi, dual-sided (OMN-D); Operation 24/7.
Commit: `feat: add Window Signage (OM series) product`.

### Task 6: Add "Samsung Stretched Signage (SHC)"

Same 3 steps, `samsung-stretched-shc` (`Digital Signage`, `subCategory: "Stretched"`,
`series: "SHC"`, `popularity: 82`).
`specs`: `resolution: "1,920 × 540 (16:4.5)"`, `brightness: "700 nit"`,
`screenSizes: ["37"]` (94 cm), `operationTime: "24/7"`.
`specGroups` — Display: 94 cm, 16:4.5 stretched ratio, 1,920×540, 700 nit, 4,000:1, anti-glare;
Features: embedded media player, vertical installation, 24/7; Platform Tizen 7.0.
Commit: `feat: add Stretched Signage (SHC) product`.

### Task 7: Add "Samsung Small Signage (QBC)"

Same 3 steps, `samsung-small-qbc` (`Digital Signage`, `subCategory: "Small Signage"`,
`series: "QB13C/QB24C"`, `popularity: 84`).
`specs`: `resolution: "1,920 × 1,080 (FHD)"`, `brightness: "500 nit (13\") / 250 nit (24\")"`,
`screenSizes: ["13", "24"]`, `operationTime: "16/7"`.
`specGroups` — Display: 13" (33cm) / 24" (61cm), FHD, 500 nit (13") / 250 nit (24"),
800:1 (13") / 1,000:1 (24"), slim 19.9 mm (13");
Features: compact size, Home UI, Dual Wi-Fi (2.4GHz + 5GHz), Samsung VXT; Platform Tizen 7.0.
NOTE: distinct from `samsung-qbc-t` (the touch small signage) — this is the non-touch QBC small signage.
Commit: `feat: add Small Signage (QBC) product`.

### Task 8: Add "Samsung Flip (WMFX)"

Same 3 steps, `samsung-flip-wmfx` (`category: "Interactive Display"`,
`subCategory: "Flip"`, `series: "WMFX"`, `popularity: 98`; images into
`public/products/interactive/samsung-flip-wmfx/`).
`specs`: `resolution: "3,840 × 2,160 (4K UHD)"`, `brightness: "450 nit"`,
`screenSizes: ["55", "65", "75", "85"]`, `operationTime: "16/7"`.
`specGroups` — Display: 55/65/75/85", 4K UHD, 450 nit, anti-glare;
Writing: 26 ms response, 2,048 pressure levels, dual pen;
Features: Enhanced Whiteboard, Flip Home, rotatable design (Flexible 55/65, Slim 76/85),
Workspace, Samsung Knox Security, SMARTVIEW+, Samsung VXT, USB-C Hub / HDMI Out / OPS;
Platform Tizen 9.0. Model LH55WMFWBGCX.
Commit: `feat: add Samsung Flip (WMFX) product`.

---

## Task 9: Full verification — new products live, grouped, ordered

**Files:** none — verification only.

- [ ] **Step 1: Type-check, test, build.**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors; 11 tests still pass (no logic changed); build succeeds.
Confirm total product count: `grep -c 'id: "' data/products.ts` → **52**.

- [ ] **Step 2: Digital Signage category page shows the 6 new grouped sections.**

`npm run dev`, then:
```bash
curl -s http://localhost:3000/categories/digital-signage -o /tmp/ds.html || \
  curl -s http://localhost:3000/categories/digital-signage -o "$SCRATCH/ds.html"
grep -oE '>(Spatial|Color E-Paper|Outdoor|Window|Stretched|Small Signage)<' "<saved>" | sort -u
grep -oE 'samsung-(spatial-smhx|color-epaper-emdx|outdoor-oh|window-om|stretched-shc|small-qbc)' "<saved>" | sort -u
```
Expected: all 6 subCategory headers + product ids present. Existing untagged
signage (QBC/QHC/QMC/QET…) still appears in the trailing ungrouped section.

- [ ] **Step 3: Interactive page shows Flip WMFX leading.**

On `/products` Interactive section (or `/categories/interactive`), confirm
`samsung-flip-wmfx` appears and, being `catalog2026` with popularity 98, leads
the Interactive group ahead of the older Flip 2/3/Pro.

- [ ] **Step 4: Images serve + counts.**

```bash
for id in samsung-spatial-smhx samsung-color-epaper-emdx samsung-outdoor-oh samsung-window-om samsung-stretched-shc samsung-small-qbc; do
  echo "$id: $(ls public/products/digital-signage/$id | wc -l) imgs"; done
echo "samsung-flip-wmfx: $(ls public/products/interactive/samsung-flip-wmfx | wc -l) imgs"
```
Expected: each ≥3. Spot-check hero images return HTTP 200 image/* via the dev server.

- [ ] **Step 5: Report actual image counts + any flagged specs.** No code change.

---

## Notes on scope boundaries

- **Phase 2c** = Crystal UHD hospitality TV (HU8000F/HU7010F) — separate spec/plan.
- **Existing products untouched** except by natural re-sort; older Flips remain.
- **No new tests** — Phase 2b changes only data; the Phase 2a Vitest suite must
  stay green as a regression guard.
- If any product yields <3 real images, STOP and surface to the user.
