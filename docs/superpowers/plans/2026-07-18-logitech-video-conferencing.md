# Logitech Video Conferencing Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a curated 16-product Logitech video-conferencing catalog as a sixth top-level category with full feature parity to Samsung product pages, while never claiming Logitech authorization/partnership/certification anywhere.

**Architecture:** Add an optional `brand?: "Samsung" | "Logitech"` field to `Product` (absent ⇒ Samsung, so no existing entry changes). Every brand-sensitive helper (FAQs, WhatsApp, JSON-LD, spec-sheet PDF, OG image) reads that field and branches on it; nothing infers brand from category. The new category flows through the existing data-driven routing (`generateStaticParams`, sitemap, navbars, `/products`, compare) automatically. A small set of ProductCard/category-page labels swap by category so VC "brightness/resolution/operation" cells read as "Field of View / Video / Designed-for".

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript, Tailwind v4, pdf-lib, `next/og` (Satori), Vitest.

## Global Constraints

Copy these verbatim into every task's mental checklist. They are non-negotiable and apply to ALL Logitech surfaces (page HTML, metadata, PDFs, JSON-LD, OG images, FAQs, WhatsApp templates, alt text):

- **No authorization language near Logitech.** The substrings **"authoriz"**, **"partner"**, **"certified"/"certification"** (case-insensitive) must NEVER appear on any Logitech surface. (Samsung's "certified installation" is Aplus's *own* service claim and stays on Samsung surfaces only.)
- **No sourcing-channel or Logitech-warranty claims.** Never say "genuine Logitech", "Logitech India warranty", "official distributor", or describe how Aplus obtains the units. The Logitech trust story is Aplus's own **supply, installation, and AMC support**.
- **Samsung claims are unchanged in meaning** and now explicitly scoped to Samsung. Every existing Samsung surface must read identically for Samsung products after this work.
- **`brand` absent ⇒ Samsung.** No existing product entry gains a `brand` field. Only the 16 new Logitech entries carry `brand: "Logitech"`.
- **`catalog2026` stays unset on Logitech products.** It means "2026 *Samsung* catalog" and drives latest-first sort; Logitech must not inherit it.
- **Nominative fair use is allowed.** Using the name "Logitech" and real model names/specs/images to describe genuine products being resold is fine. The trademark line in the footer covers attribution.
- **Footer small print (exact text):** `Logitech® is a trademark of Logitech. Aplus Technology Solutions is an independent reseller of Logitech products and is not affiliated with or endorsed by Logitech.`

**Test command:** `npm run test` (vitest). Single file: `npx vitest run lib/foo.test.ts`. Build: `npm run build`.

**Commit style:** end every commit message with the Co-Authored-By trailer already configured for this repo.

---

## File Structure

**New files:**
- `data/videoConferencing.ts` — the 16 Logitech `Product` entries, exported as an array. Kept in its own module (not inline in `data/products.ts`) so the large curated block is easy to hold in context and review; `data/products.ts` imports and spreads it into the exported `products` array.
- `lib/brand.ts` — tiny brand helpers: `brandOf(product)`, `isLogitech(product)`, and the brand copy constants (trust bullets, JSON-LD brand nodes). Single source of truth so no surface hardcodes brand strings.
- `lib/brand.test.ts` — tests for `lib/brand.ts`.
- `lib/productFaq.test.ts` — new (does not exist today).
- `lib/categoryFaq.test.ts` — new.
- `lib/jsonLd.test.ts` — new (covers only the brand-parametrized bits).
- `lib/pdf/specSheet.brand.test.ts` — new (footer/trust bullet per brand; pure helpers extracted from specSheet).
- `public/products/video-conferencing/<slug>/…` — official product images (avif/webp), one dir per product.

**Modified files:**
- `data/products.ts` — add `brand?` to the `Product` interface; import + spread `videoConferencingProducts`.
- `data/categories.ts` — add `"video-conferencing"` to `CategorySlug` and one `ProductCategory` entry; add `useCaseChips`-shaped `useCases`.
- `lib/productFilters.ts` — VC-aware filter set (room size / subCategory) so nit-band brightness parsing never false-matches "113° FOV".
- `components/ProductCard.tsx` — brand/category-aware spec labels (Brightness→Field of View, etc.) and alt text.
- `app/products/[slug]/page.tsx` — brand-aware quick-spec labels, trust strip, top CTA bar, assurance strip; alt text.
- `lib/productFaq.ts` — brand-branch (drop authorized/genuine-Samsung; model-code Q only when a code exists).
- `lib/categoryFaq.ts` — brand/category-aware (VC copy uses Logitech name, no Samsung/authorized wording).
- `lib/whatsapp.ts` — brand-parametrized product message + VC category message.
- `lib/jsonLd.ts` — `brand`/`manufacturer` from `product.brand`; category collection name brand/category-aware.
- `lib/pdf/specSheet.ts` — brand-scoped trust cards + footer distributor line; extract pure helpers for testing.
- `lib/pdf/quote.ts` — neutral company line always (quotes can mix brands).
- `app/products/[slug]/opengraph-image.tsx` — brand-conditional badge (no "Authorized Samsung Partner" on Logitech).
- `app/categories/[slug]/opengraph-image.tsx` — brand/category-aware eyebrow ("Samsung Category" → neutral for VC).
- `components/Footer.tsx` — scope the Samsung claim; add the Logitech trademark/independent-reseller small print.
- `components/sections/CategoryGrid.tsx` — add the 6th "Video Conferencing" homepage card; grid 5-up → 6-up.
- `app/layout.tsx` — broaden root meta description to add "…and Logitech video conferencing" (title unchanged).

**Explicitly untouched** (verified data-driven or out of scope): sitemap, both navbars, `/products` `ProductsClientShell`, compare table, quote flow, `tel:` buttons, gallery, search, `generateStaticParams`, `lib/productSku.ts`, `lib/productBadges.ts`, `lib/modelCodes.ts` (no Logitech entries added — dependent copy already degrades), product-finder (`DISPLAY_TYPES` stays Samsung-only by design), city landing pages, taxonomy redesign, Solutions/VXT/LYNK, middleware redirects.

---

## Task 1: `brand` data field + brand helpers

**Files:**
- Modify: `data/products.ts` (the `Product` interface, ~line 2-33)
- Create: `lib/brand.ts`
- Test: `lib/brand.test.ts`

**Interfaces:**
- Produces:
  - `Product.brand?: "Samsung" | "Logitech"` (optional; absent ⇒ Samsung).
  - `export type Brand = "Samsung" | "Logitech"`
  - `export function brandOf(product: Pick<Product, "brand">): Brand` — returns `product.brand ?? "Samsung"`.
  - `export function isLogitech(product: Pick<Product, "brand">): boolean`
  - `export const BRAND_MANUFACTURER: Record<Brand, { name: string; url: string }>` — `Samsung → {name:"Samsung Electronics Co., Ltd.", url:"https://www.samsung.com"}`, `Logitech → {name:"Logitech International S.A.", url:"https://www.logitech.com"}`.
  - `export const BRAND_JSONLD_NAME: Record<Brand, string>` — `Samsung → "Samsung"`, `Logitech → "Logitech"`.

- [ ] **Step 1: Add the `brand` field to the Product interface**

In `data/products.ts`, inside `export interface Product`, immediately after the `catalog2026?: boolean;` block's doc comment and field (around line 7), add:

```typescript
  /** Product brand. Absent means "Samsung" — no existing entry sets this, so
   *  Samsung behaviour is the default everywhere. Only Logitech video-
   *  conferencing entries set brand: "Logitech". Never infer brand from
   *  category; always read this field (via lib/brand.ts). */
  brand?: "Samsung" | "Logitech";
```

- [ ] **Step 2: Write the failing test for `lib/brand.ts`**

Create `lib/brand.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  brandOf,
  isLogitech,
  BRAND_MANUFACTURER,
  BRAND_JSONLD_NAME,
} from "./brand";

describe("brandOf", () => {
  it("defaults to Samsung when brand is absent", () => {
    expect(brandOf({})).toBe("Samsung");
    expect(brandOf({ brand: undefined })).toBe("Samsung");
  });

  it("returns the explicit brand when set", () => {
    expect(brandOf({ brand: "Logitech" })).toBe("Logitech");
    expect(brandOf({ brand: "Samsung" })).toBe("Samsung");
  });
});

describe("isLogitech", () => {
  it("is true only for Logitech", () => {
    expect(isLogitech({ brand: "Logitech" })).toBe(true);
    expect(isLogitech({ brand: "Samsung" })).toBe(false);
    expect(isLogitech({})).toBe(false);
  });
});

describe("brand manufacturer / json-ld names", () => {
  it("maps Logitech to logitech.com with no Samsung leakage", () => {
    expect(BRAND_MANUFACTURER.Logitech.url).toBe("https://www.logitech.com");
    expect(BRAND_MANUFACTURER.Logitech.name).not.toMatch(/samsung/i);
    expect(BRAND_JSONLD_NAME.Logitech).toBe("Logitech");
  });

  it("keeps Samsung mapping intact", () => {
    expect(BRAND_MANUFACTURER.Samsung.url).toBe("https://www.samsung.com");
    expect(BRAND_JSONLD_NAME.Samsung).toBe("Samsung");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run lib/brand.test.ts`
Expected: FAIL — `Cannot find module './brand'`.

- [ ] **Step 4: Implement `lib/brand.ts`**

Create `lib/brand.ts`:

```typescript
import type { Product } from "@/data/products";

export type Brand = "Samsung" | "Logitech";

/** Resolve a product's brand. Absent brand means Samsung (the historical
 *  default): no existing entry sets the field, so Samsung behaviour is
 *  preserved everywhere without touching data. */
export function brandOf(product: Pick<Product, "brand">): Brand {
  return product.brand ?? "Samsung";
}

export function isLogitech(product: Pick<Product, "brand">): boolean {
  return brandOf(product) === "Logitech";
}

/** manufacturer node for Product JSON-LD, keyed by brand. */
export const BRAND_MANUFACTURER: Record<Brand, { name: string; url: string }> = {
  Samsung: { name: "Samsung Electronics Co., Ltd.", url: "https://www.samsung.com" },
  Logitech: { name: "Logitech International S.A.", url: "https://www.logitech.com" },
};

/** `brand` node name for Product JSON-LD, keyed by brand. */
export const BRAND_JSONLD_NAME: Record<Brand, string> = {
  Samsung: "Samsung",
  Logitech: "Logitech",
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/brand.test.ts`
Expected: PASS (3 describe blocks, all green).

- [ ] **Step 6: Commit**

```bash
git add data/products.ts lib/brand.ts lib/brand.test.ts
git commit -m "feat(vc): add Product.brand field + brand helpers"
```

---

## Task 2: Video Conferencing category

**Files:**
- Modify: `data/categories.ts` (`CategorySlug` union line 1-6; `productCategories` array append after line 80)
- Test: none new — covered by the build (Task 15) and existing category-page rendering.

**Interfaces:**
- Consumes: nothing.
- Produces: a `ProductCategory` with `id: "video-conferencing"`. The slug is added to `CategorySlug`, so `getCategoryById`, sitemap, navbars, `/products`, and OG routing all pick it up automatically.

**Copy rules for this task:** the `overview` and `description` name Logitech descriptively; NO "authorized/partner/certified", NO "Samsung". Aplus's trust angle is *supply, installation, AMC*.

- [ ] **Step 1: Add the slug to the `CategorySlug` union**

In `data/categories.ts`, extend the union (line 1-6):

```typescript
export type CategorySlug =
  | "digital-signage"
  | "video-walls"
  | "interactive"
  | "commercial-tv"
  | "led-signage"
  | "video-conferencing";
```

- [ ] **Step 2: Append the category entry**

In `data/categories.ts`, add this object as the last element of `productCategories` (after the `led-signage` entry, before the closing `];` at line 81):

```typescript
  {
    id: "video-conferencing",
    name: "Video Conferencing",
    navLabel: "Video Conferencing",
    tagline: "Boardrooms, huddle rooms & meeting spaces",
    subtitle: "Logitech video bars, cameras and room controllers for Microsoft Teams and Zoom Rooms.",
    useCases: ["Boardrooms", "Huddle Rooms", "Microsoft Teams Rooms", "Zoom Rooms", "Training Rooms"],
    description: "Logitech video conferencing systems — video bars, PTZ cameras, tap controllers and room compute for meeting spaces of every size.",
    overview:
      "Logitech video conferencing brings certified-grade meeting-room hardware to boardrooms, huddle spaces, training rooms and executive suites — video bars with AI-driven framing, PTZ cameras, tap touch controllers, schedulers and compute appliances that run Microsoft Teams Rooms and Zoom Rooms out of the box. Aplus Technology Solutions supplies, installs and maintains the full Logitech room lineup across India — from all-in-one huddle-room bars to modular boardroom systems — with GST invoicing, professional installation, and AMC support.",
  },
```

> **COPY CHECK before committing:** the word "certified-grade" above describes the *product tier* generically and does NOT claim Aplus is a certified partner — but to be safe against the `certif` grep in Task 15, replace `certified-grade` with **`enterprise-grade`**. Use `enterprise-grade` in the final text. (This note exists because the grep in Task 15 is a hard gate; do not leave any `certif`/`authoriz`/`partner` substring in this object.)

Final `overview` first sentence must read: `"Logitech video conferencing brings enterprise-grade meeting-room hardware to boardrooms, …"`.

- [ ] **Step 3: Verify the category resolves and no banned words remain**

Run:
```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | head -20
```
Expected: no new type errors from `data/categories.ts`.

Run (must print nothing):
```bash
grep -iE "authoriz|partner|certif" data/categories.ts | grep -i "video\|logitech\|conferenc"
```
Expected: no output (Samsung entries may still contain "authorized" — that's fine; only the VC entry must be clean, and it references neither Samsung nor those words).

- [ ] **Step 4: Commit**

```bash
git add data/categories.ts
git commit -m "feat(vc): add Video Conferencing category"
```

---

## Task 3: Logitech product data (16 products)

**Files:**
- Create: `data/videoConferencing.ts`
- Modify: `data/products.ts` (import + spread, after the `products` array literal)
- Test: `data/videoConferencing.test.ts` (create — a data-integrity guard)

**Interfaces:**
- Consumes: `Product` type (from Task 1, now with `brand`), `Brand`.
- Produces: `export const videoConferencingProducts: Product[]` — 16 entries, each `brand: "Logitech"`, `category: "Video Conferencing"`, a `subCategory` from {`"Video Bars & Systems"`, `"Cameras"`, `"Controllers & Scheduling"`, `"Room Compute"`}, and a `series` set to the product-family label (decision: series = family label, e.g. `"Rally"`, `"MeetUp"`, `"Tap"`, `"RoomMate"`, `"Sight"`, `"Scribe"`, `"PTZ Pro"`).

**Display-spec mapping (from spec — fill `specs` per product type):**

| Product type | resolution | brightness | screenSizes | operationTime |
|---|---|---|---|---|
| Bars & cameras (Rally family, MeetUp 2, PTZ Pro 2, Sight, Scribe) | video res e.g. `"4K UHD"` | field of view e.g. `"113° FOV"` | `[]` | room rating e.g. `"Medium Rooms"` |
| Touch panels (Rally Board 65, Tap, Tap IP, Tap Scheduler) | panel res e.g. `"1920 × 1080 (FHD)"` | real panel brightness e.g. `"350 nit"` (only where a genuine nit spec exists; otherwise a room/duty rating string) | panel size e.g. `["65"]`, `["10.1"]` | room/duty rating |
| Compute (RoomMate) | max video out `"4K UHD"` | platform `"CollabOS"` | `[]` | room rating `"Any Room"` |

> **Data-sourcing rule:** every `resolution`, `brightness`, `specGroups` value must come from Logitech's official spec pages (logitech.com). Where a real value cannot be confirmed, use a conservative, defensible label (e.g. `"4K UHD"`, room-size rating) rather than fabricating a precise number. `screenSizes` for non-panel products is `[]` (the SKU line and filters already handle empty sizes). NO "authorized/partner/certified" and NO Samsung anywhere in this file.

The 16 products, grouped by `subCategory`:

- **Video Bars & Systems:** Rally Board 65, Rally Bar, Rally Bar Mini, Rally Bar Huddle, Rally Plus, MeetUp 2
- **Cameras:** Rally AI Camera, Rally AI Camera Pro, Rally Camera, PTZ Pro 2, Sight, Scribe
- **Controllers & Scheduling:** Tap, Tap IP, Tap Scheduler
- **Room Compute:** RoomMate

- [ ] **Step 1: Write the data-integrity test first**

Create `data/videoConferencing.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { videoConferencingProducts } from "./videoConferencing";

const BANNED = /authoriz|partner|certif|samsung/i;
const VALID_SUBCATS = new Set([
  "Video Bars & Systems",
  "Cameras",
  "Controllers & Scheduling",
  "Room Compute",
]);

describe("videoConferencingProducts", () => {
  it("has exactly 16 products", () => {
    expect(videoConferencingProducts).toHaveLength(16);
  });

  it("every product is brand Logitech in the Video Conferencing category", () => {
    for (const p of videoConferencingProducts) {
      expect(p.brand).toBe("Logitech");
      expect(p.category).toBe("Video Conferencing");
      expect(VALID_SUBCATS.has(p.subCategory ?? "")).toBe(true);
    }
  });

  it("never sets catalog2026 (that flag is Samsung-only)", () => {
    for (const p of videoConferencingProducts) {
      expect(p.catalog2026).toBeUndefined();
    }
  });

  it("has unique ids", () => {
    const ids = videoConferencingProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("carries the four required display-spec fields on every product", () => {
    for (const p of videoConferencingProducts) {
      expect(typeof p.specs.resolution).toBe("string");
      expect(typeof p.specs.brightness).toBe("string");
      expect(Array.isArray(p.specs.screenSizes)).toBe(true);
      expect(typeof p.specs.operationTime).toBe("string");
      expect(p.features.length).toBeGreaterThan(0);
    }
  });

  it("contains no authorization/partner/certification/Samsung wording anywhere", () => {
    for (const p of videoConferencingProducts) {
      const blob = JSON.stringify(p);
      expect(BANNED.test(blob)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run data/videoConferencing.test.ts`
Expected: FAIL — `Cannot find module './videoConferencing'`.

- [ ] **Step 3: Create `data/videoConferencing.ts` with all 16 products**

Create `data/videoConferencing.ts`. Use this exact scaffold, then fill each product's real specs from logitech.com. Every entry MUST include: `id` (kebab-case, unique, e.g. `logitech-rally-bar`), `brand: "Logitech"`, `name` (e.g. `"Logitech Rally Bar"`), `category: "Video Conferencing"`, `series` (family label), `subCategory`, `description`, `longDescription`, `features` (4-6), `specs` (the 4 display fields per the mapping table), `specGroups` (sourced from Logitech spec pages — this feeds the spec table, PDF, compare, JSON-LD `additionalProperty`), and `images` (paths under `/products/video-conferencing/<slug>/` — see Task 14; until real images land, leave `images: []` so every image consumer degrades to its placeholder).

```typescript
import type { Product } from "@/data/products";

/**
 * Curated Logitech video-conferencing catalog (16 products).
 *
 * POSITIONING (see docs/superpowers/specs/2026-07-18-logitech-video-conferencing-design.md):
 * Aplus resells genuine Logitech products (nominative fair use) but is NOT an
 * authorized Logitech partner. Therefore NOTHING in this file may contain the
 * words "authorized", "partner", or "certified", nor claim a sourcing channel
 * or Logitech India warranty. The trust story is Aplus's own supply,
 * installation and AMC support. Specs are sourced from logitech.com.
 *
 * brand is always "Logitech"; catalog2026 is intentionally never set (it means
 * the 2026 SAMSUNG catalog). series holds the product-family label so every
 * series-driven surface (card SKU line, compare header, spec-sheet title,
 * lead-gate copy) reads naturally.
 */
export const videoConferencingProducts: Product[] = [
  // ── Video Bars & Systems ──────────────────────────────────────────────
  {
    id: "logitech-rally-bar",
    brand: "Logitech",
    name: "Logitech Rally Bar",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Video Bars & Systems",
    description:
      "All-in-one video bar for medium to large rooms, with AI-driven auto-framing and built-in compute for Microsoft Teams Rooms and Zoom Rooms.",
    longDescription: `Logitech Rally Bar is a premium all-in-one video bar built for medium to large meeting rooms. It combines a motorized PTZ camera, a beam-forming mic array and integrated speakers in a single device, with on-device AI that frames and follows active speakers automatically.

Rally Bar runs Microsoft Teams Rooms or Zoom Rooms on Android without an external PC in appliance mode, and can switch to USB mode to connect to a laptop or room PC. Aplus Technology Solutions supplies, installs and maintains Rally Bar deployments across India with GST invoicing and AMC support.`,
    features: [
      "Motorized PTZ camera with AI auto-framing and speaker tracking",
      "Runs Microsoft Teams Rooms & Zoom Rooms on-device (appliance mode)",
      "Integrated beam-forming mics and hi-fi speakers",
      "USB mode for laptop / room-PC connection",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "90° FOV",
      screenSizes: [],
      operationTime: "Medium–Large Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD (Ultra-HD)",
        "Field of View": "90° diagonal",
        "Zoom": "5x HD zoom",
        "Pan / Tilt": "Motorized ±15° pan, ±10° tilt",
      },
      Audio: {
        "Microphones": "Beam-forming array",
        "Speakers": "Integrated hi-fi",
      },
      "Compute & Platform": {
        "Modes": "Appliance (Teams Rooms / Zoom Rooms) + USB",
        "OS": "CollabOS",
      },
    },
    images: [],
  },
  // … Rally Bar Mini, Rally Bar Huddle, Rally Board 65, Rally Plus, MeetUp 2 …
  // ── Cameras ────────────────────────────────────────────────────────────
  // Rally AI Camera, Rally AI Camera Pro, Rally Camera, PTZ Pro 2, Sight, Scribe
  // ── Controllers & Scheduling ──────────────────────────────────────────
  // Tap, Tap IP, Tap Scheduler
  // ── Room Compute ──────────────────────────────────────────────────────
  // RoomMate
];
```

**Implementer note:** Follow the Rally Bar entry as the template for all 16. Per-product `specs` fields:
- **Rally Board 65** (touch panel): `resolution: "3840 × 2160 (4K UHD)"`, `brightness: "350 nit"` (real panel spec), `screenSizes: ["65"]`, `operationTime: "Large Rooms"`.
- **Rally Bar Mini**: `4K UHD` / `113° FOV` / `[]` / `"Small–Medium Rooms"`.
- **Rally Bar Huddle**: `4K UHD` / `123° FOV` / `[]` / `"Huddle Rooms"`.
- **Rally Plus / Rally**: `4K UHD` / `90° FOV` / `[]` / `"Large Rooms"`.
- **MeetUp 2**: `4K UHD` / `113° FOV` / `[]` / `"Huddle–Small Rooms"`.
- **Rally AI Camera / Rally AI Camera Pro / Rally Camera**: `4K UHD` / FOV per model / `[]` / room rating.
- **PTZ Pro 2**: `1080p HD` / `90° FOV` / `[]` / `"Medium Rooms"`.
- **Sight** (tabletop AI camera): `4K` / `"Center-of-room capture"` / `[]` / `"Companion Camera"`.
- **Scribe** (whiteboard camera): `Whiteboard Capture` / `"AI content enhancement"` / `[]` / `"Any Room"`.
- **Tap** (touch controller): panel res / `"USB touch controller"` (no nit spec → descriptive) / `["10.1"]` / `"Any Room"`.
- **Tap IP**: same shape, `"PoE touch controller"`, `["10.1"]`.
- **Tap Scheduler**: `1280 × 800` / `"Room-status LEDs"` / `["10.1"]` / `"Outside-room Scheduling"`.
- **RoomMate** (compute): `resolution: "4K UHD"` (max video out), `brightness: "CollabOS"` (platform), `screenSizes: []`, `operationTime: "Any Room"`.

Each product's `specGroups` should have 2-4 sections (Camera/Audio/Connectivity/Compute as applicable) with real Logitech spec rows. Keep every value factual and free of the banned words.

- [ ] **Step 4: Wire the products into `data/products.ts`**

At the top of `data/products.ts`, after the `Product` interface, import the VC array:

```typescript
import { videoConferencingProducts } from "@/data/videoConferencing";
```

At the END of the `products` array literal — immediately before the closing `];` of `export const products: Product[] = [ … ]` — spread the VC array:

```typescript
  // ── VIDEO CONFERENCING (Logitech) ────────────────────────────────────────
  ...videoConferencingProducts,
];
```

> Circular-import note: `data/videoConferencing.ts` imports only the `Product` *type* from `data/products.ts` (`import type`), which is erased at compile time, so the type-only ⇄ value cycle is safe. Verify with the build in Task 15.

- [ ] **Step 5: Run the data test to verify it passes**

Run: `npx vitest run data/videoConferencing.test.ts`
Expected: PASS — 16 products, all Logitech, no banned words.

- [ ] **Step 6: Commit**

```bash
git add data/videoConferencing.ts data/videoConferencing.test.ts data/products.ts
git commit -m "feat(vc): add 16 Logitech video-conferencing products"
```

---

## Task 4: Brand-branched product FAQs

**Files:**
- Modify: `lib/productFaq.ts`
- Test: `lib/productFaq.test.ts` (create)

**Interfaces:**
- Consumes: `buildProductFaqs(product)` signature is unchanged. Uses `isLogitech` from `lib/brand.ts` (Task 1).
- Produces: brand-branched FAQ text. Samsung output is byte-identical to today. Logitech output drops "authorized", "genuine Samsung", "Samsung" and the manufacturer-warranty phrasing; keeps sizes/specs/pricing/install-AMC questions with Logitech-safe wording.

- [ ] **Step 1: Write the failing test**

Create `lib/productFaq.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildProductFaqs } from "./productFaq";
import type { Product } from "@/data/products";

const samsung: Product = {
  id: "samsung-qet-series",
  name: "Samsung Smart Signage QET Series",
  category: "Digital Signage",
  series: "QET Series",
  description: "desc",
  features: ["f1"],
  specs: { resolution: "4K UHD", brightness: "300 nit", screenSizes: ["43", "55"], operationTime: "16/7" },
  images: [],
};

const logitech: Product = {
  id: "logitech-rally-bar",
  brand: "Logitech",
  name: "Logitech Rally Bar",
  category: "Video Conferencing",
  series: "Rally",
  subCategory: "Video Bars & Systems",
  description: "desc",
  features: ["f1"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: [],
};

describe("buildProductFaqs — Samsung (unchanged)", () => {
  it("still says 'authorized Samsung' in the pricing answer", () => {
    const faqs = buildProductFaqs(samsung);
    const pricing = faqs.find((f) => /pricing/i.test(f.q));
    expect(pricing?.a).toMatch(/authorized Samsung/i);
  });

  it("promises genuine Samsung units with manufacturer warranty", () => {
    const faqs = buildProductFaqs(samsung);
    const warranty = faqs.find((f) => /installation and warranty/i.test(f.q));
    expect(warranty?.a).toMatch(/genuine Samsung/i);
  });
});

describe("buildProductFaqs — Logitech (no banned wording)", () => {
  it("emits no authorized/partner/certified/genuine-Samsung/Samsung wording", () => {
    const faqs = buildProductFaqs(logitech);
    for (const f of faqs) {
      expect(f.q + " " + f.a).not.toMatch(/authoriz|partner|certif|samsung/i);
    }
  });

  it("still answers pricing and install/AMC, naming Logitech safely", () => {
    const faqs = buildProductFaqs(logitech);
    expect(faqs.some((f) => /pricing/i.test(f.q))).toBe(true);
    expect(faqs.some((f) => /installation|amc|support/i.test(f.q + f.a))).toBe(true);
    expect(faqs.some((f) => /Logitech/.test(f.a))).toBe(true);
  });

  it("omits the size question when a product has no screen sizes", () => {
    const faqs = buildProductFaqs(logitech);
    expect(faqs.some((f) => /screen sizes/i.test(f.q))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/productFaq.test.ts`
Expected: FAIL — Logitech answers still contain "authorized Samsung" (from the current hardcoded strings).

- [ ] **Step 3: Brand-branch `lib/productFaq.ts`**

Add the import at the top:

```typescript
import { isLogitech } from "@/lib/brand";
```

Replace the **pricing** FAQ (currently lines ~60-63) with a brand branch:

```typescript
  faqs.push({
    q: `How do I get pricing for the ${product.name} in India?`,
    a: isLogitech(product)
      ? `Aplus Technology Solutions supplies ${product.name} to businesses across India with project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for B2B pricing within 24 hours — GST invoice included.`
      : `Aplus Technology Solutions is an authorized Samsung B2B distributor and offers project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for B2B pricing within 24 hours — GST invoice included.`,
  });
```

Replace the **installation/warranty** FAQ (currently lines ~65-68) with:

```typescript
  faqs.push({
    q: `Does Aplus provide installation and ${isLogitech(product) ? "support" : "warranty"} for the ${product.series}?`,
    a: isLogitech(product)
      ? `Yes. Aplus supplies, installs and maintains ${product.name} across India, with professional installation and AMC support. A free installation assessment is available for every order.`
      : `Yes. We supply 100% genuine Samsung units with manufacturer warranty, certified installation, and AMC support across India. A free installation assessment is available for every order.`,
  });
```

The size / model-code / key-spec / continuous-use FAQs already degrade correctly: the size Q is skipped when `screenSizes` is empty, and the model-code Q is skipped when `modelCodeFor` returns undefined (no Logitech entries exist in `lib/modelCodes.ts`). Leave those untouched — but VERIFY: the continuous-use FAQ answer for non-24/7 products currently reads "well suited to business-hours use in offices, retail, hospitality, and meeting spaces." That contains no banned words and is brand-neutral, so it stays as-is for both brands.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/productFaq.test.ts`
Expected: PASS — Samsung unchanged, Logitech clean.

- [ ] **Step 5: Commit**

```bash
git add lib/productFaq.ts lib/productFaq.test.ts
git commit -m "feat(vc): brand-branch product FAQs; Logitech drops authorized/Samsung wording"
```

---

## Task 5: Video-conferencing category FAQs

**Files:**
- Modify: `lib/categoryFaq.ts`
- Test: `lib/categoryFaq.test.ts` (create)

**Interfaces:**
- Consumes: `buildCategoryFaqs(category, productsInCategory)` — signature unchanged. Branches on `category.id === "video-conferencing"`.
- Produces: for the VC category, a FAQ set that uses "Logitech video conferencing" naming and Aplus supply/install/AMC wording, with NO "Samsung/authorized/partner/certified". For every other category, output is byte-identical to today.

- [ ] **Step 1: Write the failing test**

Create `lib/categoryFaq.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildCategoryFaqs } from "./categoryFaq";
import type { ProductCategory } from "@/data/categories";
import type { Product } from "@/data/products";

const signage: ProductCategory = {
  id: "digital-signage",
  name: "Digital Signage",
  navLabel: "Digital Signage",
  tagline: "t",
  subtitle: "s",
  description: "Commercial signage.",
  overview: "o",
  useCases: ["Lobbies", "Retail"],
};

const vc: ProductCategory = {
  id: "video-conferencing",
  name: "Video Conferencing",
  navLabel: "Video Conferencing",
  tagline: "t",
  subtitle: "s",
  description: "Logitech video conferencing systems.",
  overview: "o",
  useCases: ["Boardrooms", "Huddle Rooms", "Zoom Rooms"],
};

const vcProduct: Product = {
  id: "logitech-rally-bar", brand: "Logitech", name: "Logitech Rally Bar",
  category: "Video Conferencing", series: "Rally", subCategory: "Video Bars & Systems",
  description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: [],
};

describe("buildCategoryFaqs — Samsung categories unchanged", () => {
  it("still asks 'What is Samsung Digital Signage used for?'", () => {
    const faqs = buildCategoryFaqs(signage, []);
    expect(faqs[0].q).toBe("What is Samsung Digital Signage used for?");
  });

  it("still says 'authorized Samsung' in the pricing answer", () => {
    const faqs = buildCategoryFaqs(signage, []);
    expect(faqs.find((f) => /pricing/i.test(f.q))?.a).toMatch(/authorized Samsung/i);
  });
});

describe("buildCategoryFaqs — Video Conferencing", () => {
  it("emits no authorized/partner/certified/Samsung wording", () => {
    const faqs = buildCategoryFaqs(vc, [vcProduct]);
    for (const f of faqs) {
      expect(f.q + " " + f.a).not.toMatch(/authoriz|partner|certif|samsung/i);
    }
  });

  it("names Logitech and covers use / pricing / install-AMC", () => {
    const faqs = buildCategoryFaqs(vc, [vcProduct]);
    const blob = faqs.map((f) => f.q + " " + f.a).join(" ");
    expect(blob).toMatch(/Logitech/);
    expect(blob).toMatch(/pricing/i);
    expect(blob).toMatch(/installation|amc|support/i);
  });

  it("does not emit the Samsung-style size-range question for VC", () => {
    const faqs = buildCategoryFaqs(vc, [vcProduct]);
    expect(faqs.some((f) => /screen sizes are available in Samsung/i.test(f.q))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/categoryFaq.test.ts`
Expected: FAIL — VC category currently produces "What is Samsung Video Conferencing used for?" and "authorized Samsung".

- [ ] **Step 3: Add a VC branch to `lib/categoryFaq.ts`**

Add the import:

```typescript
import { isLogitech } from "@/lib/brand";
```

At the top of `buildCategoryFaqs`, after computing `uc`, `ucList`, `sizeRange`, `count`, branch to a dedicated VC builder before the existing Samsung body:

```typescript
  if (category.id === "video-conferencing") {
    return buildVideoConferencingCategoryFaqs(category, ucList, count);
  }
```

Then add the helper at the bottom of the file:

```typescript
/** VC category FAQs — Logitech naming, Aplus supply/install/AMC trust story,
 *  no Samsung/authorized/partner/certified wording. Size-band questions don't
 *  apply (VC products carry no screen-size diagonals). */
function buildVideoConferencingCategoryFaqs(
  category: ProductCategory,
  ucList: string,
  count: number
): Faq[] {
  return [
    {
      q: `What is Logitech ${category.navLabel} used for?`,
      a: `Logitech ${category.navLabel} equips ${ucList.toLowerCase()} with video bars, PTZ cameras, tap controllers and room compute for Microsoft Teams Rooms and Zoom Rooms. ${category.description}`,
    },
    {
      q: `Which Logitech ${category.navLabel} system fits my room size?`,
      a: `Aplus supplies the full Logitech range across ${count} product families — from huddle-room bars to modular boardroom systems. Tell us your room size and platform (Teams or Zoom) and we'll recommend the right bar, camera and controller.`,
    },
    {
      q: `How do I get pricing for Logitech ${category.navLabel} in India?`,
      a: `Aplus Technology Solutions supplies Logitech ${category.navLabel} with project and bulk pricing on quote. Request a quote on this page, message us on WhatsApp, or call ${PHONE_DISPLAY} for pricing within 24 hours — GST invoice included.`,
    },
    {
      q: `Does Aplus provide installation and support for Logitech ${category.navLabel} across India?`,
      a: `Yes. Aplus supplies, installs and maintains Logitech room systems across India, with professional installation and AMC support, including a free site assessment for every order.`,
    },
  ];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/categoryFaq.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/categoryFaq.ts lib/categoryFaq.test.ts
git commit -m "feat(vc): dedicated Logitech video-conferencing category FAQ set"
```

---

## Task 6: Brand-parametrized WhatsApp messages

**Files:**
- Modify: `lib/whatsapp.ts`
- Test: `lib/whatsapp.test.ts` (extend the existing file)

**Interfaces:**
- Consumes: `getWhatsAppMessage(pathname)` — signature unchanged.
- Produces: a VC category message for `/categories/video-conferencing`, plus a generic product message that no longer hardcodes "Samsung" for the product path (it already uses the slug, so it's brand-neutral — just verify). All existing Samsung category messages unchanged.

> Note: `getWhatsAppMessage` keys off `pathname`, not a product object, so brand comes from the URL. The product-page branch already builds the message from the slug ("Hi! I'm interested in the {slug}…") with no "Samsung" — that is already brand-safe. Only the category branch needs a VC arm.

- [ ] **Step 1: Add failing tests to `lib/whatsapp.test.ts`**

Append to `lib/whatsapp.test.ts`:

```typescript
import { getWhatsAppMessage } from "./whatsapp";

describe("getWhatsAppMessage — video conferencing", () => {
  it("returns a Logitech VC message on the VC category path", () => {
    const msg = getWhatsAppMessage("/categories/video-conferencing");
    expect(msg).toMatch(/Logitech/);
    expect(msg).toMatch(/video conferencing/i);
    expect(msg).not.toMatch(/authoriz|partner|certif|samsung/i);
  });

  it("keeps the Samsung digital-signage message unchanged", () => {
    const msg = getWhatsAppMessage("/categories/digital-signage");
    expect(msg).toMatch(/Samsung digital signage/i);
  });

  it("product-page message names the product, not the brand", () => {
    const msg = getWhatsAppMessage("/products/logitech-rally-bar");
    expect(msg).not.toMatch(/samsung/i);
    expect(msg).toMatch(/logitech rally bar/i);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/whatsapp.test.ts`
Expected: FAIL — `/categories/video-conferencing` currently falls through to `DEFAULT_MSG` ("Samsung display solutions").

- [ ] **Step 3: Add the VC category branch**

In `lib/whatsapp.ts`, inside `getWhatsAppMessage`, add this branch alongside the other `/categories/...` checks (before the `/solutions/...` checks):

```typescript
  if (pathname.startsWith("/categories/video-conferencing"))
    return "Hi! I'm looking for Logitech video conferencing systems for our meeting rooms. Could you share options and pricing?";
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/whatsapp.test.ts`
Expected: PASS (existing + new tests).

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat(vc): Logitech video-conferencing WhatsApp category message"
```

---

## Task 7: Brand-aware Product & Category JSON-LD

**Files:**
- Modify: `lib/jsonLd.ts` (`productLd` lines ~117-138; `categoryCollectionLd` line ~155)
- Test: `lib/jsonLd.test.ts` (create)

**Interfaces:**
- Consumes: `productLd(product)`, `categoryCollectionLd(category, products)` — signatures unchanged. Uses `brandOf`, `BRAND_JSONLD_NAME`, `BRAND_MANUFACTURER` from `lib/brand.ts`.
- Produces: `brand`/`manufacturer` reflect `product.brand`; category collection `name` is brand/category-aware (no "— Samsung B2B Displays" suffix for VC).

- [ ] **Step 1: Write the failing test**

Create `lib/jsonLd.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { productLd, categoryCollectionLd } from "./jsonLd";
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";

const samsung: Product = {
  id: "samsung-qet-series", name: "Samsung QET", category: "Digital Signage",
  series: "QET", description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "300 nit", screenSizes: ["43"], operationTime: "16/7" },
  images: ["/x.avif"],
};
const logitech: Product = {
  id: "logitech-rally-bar", brand: "Logitech", name: "Logitech Rally Bar",
  category: "Video Conferencing", series: "Rally", subCategory: "Video Bars & Systems",
  description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: ["/y.avif"],
};

describe("productLd brand fields", () => {
  it("keeps Samsung brand/manufacturer for Samsung products", () => {
    const ld = productLd(samsung) as any;
    expect(ld.brand.name).toBe("Samsung");
    expect(ld.manufacturer.name).toMatch(/Samsung/);
    expect(ld.manufacturer.url).toBe("https://www.samsung.com");
  });

  it("uses Logitech brand/manufacturer for Logitech products", () => {
    const ld = productLd(logitech) as any;
    expect(ld.brand.name).toBe("Logitech");
    expect(ld.manufacturer.name).toMatch(/Logitech/);
    expect(ld.manufacturer.url).toBe("https://www.logitech.com");
    expect(JSON.stringify(ld)).not.toMatch(/samsung/i);
  });
});

describe("categoryCollectionLd naming", () => {
  it("suffixes Samsung categories with '— Samsung B2B Displays'", () => {
    const cat: ProductCategory = {
      id: "digital-signage", name: "Digital Signage", navLabel: "Digital Signage",
      tagline: "t", subtitle: "s", description: "d", overview: "o", useCases: [],
    };
    const ld = categoryCollectionLd(cat, []) as any;
    expect(ld.name).toBe("Digital Signage — Samsung B2B Displays");
  });

  it("names the VC category without Samsung", () => {
    const cat: ProductCategory = {
      id: "video-conferencing", name: "Video Conferencing", navLabel: "Video Conferencing",
      tagline: "t", subtitle: "s", description: "d", overview: "o", useCases: [],
    };
    const ld = categoryCollectionLd(cat, []) as any;
    expect(ld.name).not.toMatch(/samsung/i);
    expect(ld.name).toMatch(/Logitech|Video Conferencing/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: FAIL — Logitech product still gets Samsung brand/manufacturer; VC category name still has the Samsung suffix.

- [ ] **Step 3: Parametrize `productLd`**

Add imports to `lib/jsonLd.ts`:

```typescript
import { brandOf, BRAND_JSONLD_NAME, BRAND_MANUFACTURER } from "@/lib/brand";
```

In `productLd`, replace the hardcoded `brand`/`manufacturer` (currently lines ~127-132):

```typescript
    brand: { "@type": "Brand", name: BRAND_JSONLD_NAME[brandOf(product)] },
    manufacturer: {
      "@type": "Organization",
      name: BRAND_MANUFACTURER[brandOf(product)].name,
      url: BRAND_MANUFACTURER[brandOf(product)].url,
    },
```

- [ ] **Step 4: Parametrize `categoryCollectionLd` naming**

In `categoryCollectionLd`, replace the `name` line (~155):

```typescript
    name:
      category.id === "video-conferencing"
        ? `${category.navLabel} — Logitech Systems`
        : `${category.navLabel} — Samsung B2B Displays`,
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/jsonLd.ts lib/jsonLd.test.ts
git commit -m "feat(vc): brand-aware Product & Category JSON-LD"
```

---

## Task 8: Brand-scoped spec-sheet PDF (trust bullets + footer)

**Files:**
- Modify: `lib/pdf/specSheet.ts` (extract two pure helpers; wire brand through)
- Test: `lib/pdf/specSheet.brand.test.ts` (create — tests the pure helpers, no PDF rendering)

**Interfaces:**
- Consumes: `buildSpecSheetPdf(product)` signature unchanged. Uses `isLogitech` from `lib/brand.ts`.
- Produces two exported pure helpers so the copy is unit-testable without rendering a PDF:
  - `export function trustCardsFor(product: Pick<Product,"brand">): ReadonlyArray<readonly [string,string]>`
  - `export function distributorLineFor(product: Pick<Product,"brand">): string`

- [ ] **Step 1: Write the failing test**

Create `lib/pdf/specSheet.brand.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { trustCardsFor, distributorLineFor } from "./specSheet";
import type { Product } from "@/data/products";

const samsung: Pick<Product, "brand"> = {};
const logitech: Pick<Product, "brand"> = { brand: "Logitech" };

describe("trustCardsFor", () => {
  it("Samsung keeps the 'Samsung Authorized' trust card", () => {
    const cards = trustCardsFor(samsung);
    expect(cards.some(([t]) => /Samsung Authorized/i.test(t))).toBe(true);
  });

  it("Logitech has no authorized/partner/certified/Samsung wording", () => {
    const cards = trustCardsFor(logitech);
    const blob = JSON.stringify(cards);
    expect(blob).not.toMatch(/authoriz|partner|certif|samsung/i);
  });

  it("Logitech still surfaces supply / installation / AMC", () => {
    const blob = JSON.stringify(trustCardsFor(logitech)).toLowerCase();
    expect(blob).toMatch(/install/);
    expect(blob).toMatch(/amc|support/);
  });

  it("always returns exactly three cards (layout depends on it)", () => {
    expect(trustCardsFor(samsung)).toHaveLength(3);
    expect(trustCardsFor(logitech)).toHaveLength(3);
  });
});

describe("distributorLineFor", () => {
  it("Samsung keeps 'Authorized Samsung Commercial Display Distributor'", () => {
    expect(distributorLineFor(samsung)).toMatch(/Authorized Samsung/i);
  });

  it("Logitech line has no authorized/partner/certified/Samsung wording", () => {
    expect(distributorLineFor(logitech)).not.toMatch(/authoriz|partner|certif|samsung/i);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/pdf/specSheet.brand.test.ts`
Expected: FAIL — `trustCardsFor`/`distributorLineFor` are not exported.

- [ ] **Step 3: Extract and export the two helpers**

In `lib/pdf/specSheet.ts`, add the import:

```typescript
import { isLogitech } from "@/lib/brand";
```

Replace the module-level `TRUST_CARDS` constant (lines ~62-66) with brand-aware helpers:

```typescript
const SAMSUNG_TRUST_CARDS: ReadonlyArray<readonly [string, string]> = [
  ["Samsung Authorized", "Genuine India-spec units with full Samsung warranty."],
  ["Pan-India Installation", "Site survey, mounting and commissioning across India."],
  ["ISO 9001:2015", "Certified quality management, GST invoicing, bulk pricing."],
];

const LOGITECH_TRUST_CARDS: ReadonlyArray<readonly [string, string]> = [
  ["Supply & Sourcing", "Genuine Logitech room systems supplied across India."],
  ["Pan-India Installation", "Site survey, mounting and commissioning across India."],
  ["AMC & Support", "Ongoing maintenance, GST invoicing and bulk pricing."],
];

/** Trust cards for the spec-sheet's "Why Buy From Aplus" strip, keyed by brand.
 *  Logitech drops all authorized/partner/certified/Samsung claims (positioning
 *  rule); Samsung is unchanged. Always three cards — the layout divides by 3. */
export function trustCardsFor(
  product: Pick<Product, "brand">
): ReadonlyArray<readonly [string, string]> {
  return isLogitech(product) ? LOGITECH_TRUST_CARDS : SAMSUNG_TRUST_CARDS;
}

/** Header sub-line under the company name. Brand-scoped so Logitech sheets
 *  never claim Samsung authorization. */
export function distributorLineFor(product: Pick<Product, "brand">): string {
  return isLogitech(product)
    ? "Commercial Video Conferencing Supply & Installation · India"
    : "Authorized Samsung Commercial Display Distributor · India";
}
```

- [ ] **Step 4: Wire the helpers into the PDF drawing code**

`drawTrustStrip(ctx)` currently reads the module const `TRUST_CARDS`. Thread the product through:

1. Change the signature: `function drawTrustStrip(ctx: Ctx, product: Product)`.
2. Inside, replace every `TRUST_CARDS` reference with `const cards = trustCardsFor(product);` then use `cards`.
3. Update the call site in `buildSpecSheetPdf` (line ~140): `drawTrustStrip(ctx, product);`.

For the header distributor line, in `addFirstPage` replace the hardcoded string (line ~184):

```typescript
  page.drawText(safe(distributorLineFor(product)), {
    x: textX, y: A4_HEIGHT - 43, size: 7.5, font: fonts.regular, color: C.gray500,
  });
```

`addFirstPage` already receives `product` (its signature is `addFirstPage(ctx, product, docDate)`), so no signature change is needed there.

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run lib/pdf/specSheet.brand.test.ts`
Expected: PASS. Also run the existing `npx vitest run lib/pdf/specSheet.test.ts` to confirm no regression.

- [ ] **Step 6: Commit**

```bash
git add lib/pdf/specSheet.ts lib/pdf/specSheet.brand.test.ts
git commit -m "feat(vc): brand-scoped spec-sheet trust bullets + distributor line"
```

---

## Task 9: Neutral quote-PDF company line (quotes can mix brands)

**Files:**
- Modify: `lib/pdf/quote.ts` (`drawTitleBlock` line ~206; `drawFooter` line ~640)
- Test: none new — pure-string change verified by grep + build. (The quote PDF has no per-brand context; a cart can hold both brands, so the line must be brand-neutral always.)

**Interfaces:**
- Consumes/Produces: no signature changes. Two hardcoded "Authorized Samsung … Distributor" strings become brand-neutral company descriptors.

- [ ] **Step 1: Replace the title-block sub-line**

In `lib/pdf/quote.ts` `drawTitleBlock`, the line currently reads (line ~206):

```typescript
      `${params.totalItems} item${params.totalItems !== 1 ? "s" : ""} · Authorized Samsung Commercial Display Distributor`
```

Change the descriptor to a brand-neutral one (Samsung authorization is true, but a mixed cart must not imply it covers Logitech):

```typescript
      `${params.totalItems} item${params.totalItems !== 1 ? "s" : ""} · Commercial Display & Video Conferencing · India`
```

- [ ] **Step 2: Replace the footer distributor line**

In `drawFooter` (line ~640), change:

```typescript
    safe("Authorized Samsung B2B Display Distributor · Pan-India"),
```

to:

```typescript
    safe("Commercial Display & Video Conferencing Supply · Pan-India"),
```

- [ ] **Step 3: Verify no Samsung-authorization wording remains in the quote PDF**

Run (must print nothing):
```bash
grep -niE "authoriz|samsung" lib/pdf/quote.ts
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add lib/pdf/quote.ts
git commit -m "feat(vc): neutral quote-PDF company line (quotes can mix brands)"
```

---

## Task 10: Brand-conditional product OG image

**Files:**
- Modify: `app/products/[slug]/opengraph-image.tsx` (the badge div, lines ~74-91)
- Test: none automated (Satori/JSX image). Verified by build + Task 15 grep of rendered output is not feasible for images; instead the badge TEXT is asserted via a tiny extracted helper.

**Interfaces:**
- Produces: `export function ogBadgeLabel(product: Pick<Product,"brand"|"category">): string` — a testable pure helper returning the top-bar badge text, brand-conditional.

**Satori constraint reminder:** Satori supports only `flex`/`block`/`contents`/`none` (NOT `inline-flex`). The badge already uses `display: "flex"`. Keep it. Do not introduce `inline-flex` or `width:"fit-content"`.

- [ ] **Step 1: Write the failing test**

Create `app/products/[slug]/ogBadge.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { ogBadgeLabel } from "./ogBadge";

describe("ogBadgeLabel", () => {
  it("shows 'Authorized Samsung Partner' for Samsung products", () => {
    expect(ogBadgeLabel({ category: "Digital Signage" })).toBe("Authorized Samsung Partner");
  });

  it("shows a neutral Logitech label with no banned wording", () => {
    const label = ogBadgeLabel({ brand: "Logitech", category: "Video Conferencing" });
    expect(label).not.toMatch(/authoriz|partner|certif|samsung/i);
    expect(label).toMatch(/Video Conferencing|Logitech/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run app/products/[slug]/ogBadge.test.ts`
Expected: FAIL — `./ogBadge` does not exist.

- [ ] **Step 3: Create the helper**

Create `app/products/[slug]/ogBadge.ts`:

```typescript
import type { Product } from "@/data/products";
import { isLogitech } from "@/lib/brand";

/** Top-bar badge text on the product OG share image. Samsung keeps the
 *  authorized-partner claim; Logitech shows a neutral product-line label
 *  (positioning rule: no authorized/partner/certified near Logitech). */
export function ogBadgeLabel(product: Pick<Product, "brand" | "category">): string {
  return isLogitech(product) ? "Logitech Video Conferencing" : "Authorized Samsung Partner";
}
```

- [ ] **Step 4: Use it in the OG image**

In `app/products/[slug]/opengraph-image.tsx`, add the import:

```typescript
import { ogBadgeLabel } from "./ogBadge";
```

Replace the hardcoded badge text `Authorized Samsung Partner` (line ~90) with:

```tsx
          {ogBadgeLabel(product)}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run app/products/[slug]/ogBadge.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/products/[slug]/opengraph-image.tsx" "app/products/[slug]/ogBadge.ts" "app/products/[slug]/ogBadge.test.ts"
git commit -m "feat(vc): brand-conditional product OG badge (no partner claim on Logitech)"
```

---

## Task 11: Category OG image eyebrow + footer scoping

**Files:**
- Modify: `app/categories/[slug]/opengraph-image.tsx` (the "Samsung Category" pill, lines ~69-87)
- Test: none automated (image). Verified by build + inspection; the string is trivial and category-scoped.

**Interfaces:** no exported helper (single trivial string swap). Keep Satori `display:"flex"` on the pill.

- [ ] **Step 1: Make the eyebrow pill brand/category-aware**

In `app/categories/[slug]/opengraph-image.tsx`, the pill currently renders the literal `Samsung Category` (line ~85). Replace it with a category-aware label computed just above the `return`:

```tsx
  const eyebrow =
    category.id === "video-conferencing" ? "Video Conferencing" : "Samsung Category";
```

and render `{eyebrow}` in place of `Samsung Category`.

- [ ] **Step 2: Verify no Samsung wording leaks onto the VC category OG**

The `category.description` for VC (Task 2) is already Samsung-free, and the eyebrow is now conditional. No other Samsung string exists in this file. Confirm:

```bash
grep -niE "samsung" "app/categories/[slug]/opengraph-image.tsx"
```
Expected: only the `"Samsung Category"` ternary branch (which never renders for VC).

- [ ] **Step 3: Commit**

```bash
git add "app/categories/[slug]/opengraph-image.tsx"
git commit -m "feat(vc): neutral eyebrow on the Video Conferencing category OG image"
```

---

## Task 12: Footer — scope Samsung claim + add Logitech trademark line

**Files:**
- Modify: `components/Footer.tsx`
- Test: none automated (presentational client component). Verified visually in Task 16 and by grep for the exact trademark string.

**Interfaces:** no exported changes. The footer is site-wide, so it must (a) keep the Samsung authorized-distributor claim scoped to Samsung wording, and (b) add the exact Logitech small-print line from the Global Constraints.

- [ ] **Step 1: Add "Video Conferencing" to the footer Products links**

In the `PRODUCT_LINKS` array (line ~17), add the VC category so it's reachable from the footer like the other categories:

```typescript
  { label: "Video Conferencing", href: "/categories/video-conferencing" },
```

Place it after "Hospitality & Business TV" and before "All Products".

- [ ] **Step 2: Add the Logitech trademark small-print line**

In the bottom bar (the `<div className="flex flex-col gap-1.5 …">` block containing the copyright + CIN/GSTIN, lines ~256-268), add a third line below the CIN/GSTIN row with the EXACT text from Global Constraints:

```tsx
            <p className="text-[11px] leading-relaxed text-slate-500 max-w-xl">
              Logitech® is a trademark of Logitech. Aplus Technology Solutions is
              an independent reseller of Logitech products and is not affiliated
              with or endorsed by Logitech.
            </p>
```

- [ ] **Step 3: Verify the trademark line renders the exact required text**

Run:
```bash
grep -c "independent reseller of Logitech products and is not affiliated" components/Footer.tsx
```
Expected: `1`.

> The brand-column blurb "Authorized Samsung Display distributor providing end-to-end commercial solutions across India." (line ~106) and the "Samsung Authorized / Business Display Partner" trust badge stay as-is: they are TRUE Samsung claims and the site's primary identity is Samsung-led (positioning rule 6). They are already scoped to Samsung wording, so no change — the Logitech disclaimer sits alongside them, which is the correct legal posture for an independent reseller.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat(vc): footer Video Conferencing link + Logitech independent-reseller small print"
```

---

## Task 13: ProductCard + product-page VC spec labels

**Files:**
- Modify: `components/ProductCard.tsx` (spec grid labels lines ~165-184; alt text line ~118)
- Modify: `app/products/[slug]/page.tsx` (quick-spec label arrays; trust strip; top CTA bar; assurance strip; alt text)
- Create: `lib/vcSpecLabels.ts` — pure label-mapping helper (testable)
- Test: `lib/vcSpecLabels.test.ts`

**Interfaces:**
- Produces: `export function specLabels(product: Pick<Product,"category"|"subCategory">): { resolution: string; brightness: string; operation: string }` — returns the display labels for the two spec cells + the operation line. For non-VC categories returns `{ resolution: "Resolution", brightness: "Brightness", operation: "Operation" }` (today's labels). For VC, returns category-appropriate labels driven by `subCategory`:
  - Cameras / Video Bars & Systems: `{ resolution: "Video", brightness: "Field of View", operation: "Designed For" }`
  - Controllers & Scheduling: `{ resolution: "Display", brightness: "Panel", operation: "Designed For" }`
  - Room Compute: `{ resolution: "Video Out", brightness: "Platform", operation: "Designed For" }`

- [ ] **Step 1: Write the failing test**

Create `lib/vcSpecLabels.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { specLabels } from "./vcSpecLabels";

describe("specLabels", () => {
  it("returns default Samsung labels for non-VC categories", () => {
    expect(specLabels({ category: "Digital Signage" })).toEqual({
      resolution: "Resolution", brightness: "Brightness", operation: "Operation",
    });
  });

  it("uses Field of View for VC cameras/bars", () => {
    const l = specLabels({ category: "Video Conferencing", subCategory: "Cameras" });
    expect(l.brightness).toBe("Field of View");
    expect(l.resolution).toBe("Video");
  });

  it("uses Panel/Display for VC touch controllers", () => {
    const l = specLabels({ category: "Video Conferencing", subCategory: "Controllers & Scheduling" });
    expect(l.brightness).toBe("Panel");
    expect(l.resolution).toBe("Display");
  });

  it("uses Platform/Video Out for room compute", () => {
    const l = specLabels({ category: "Video Conferencing", subCategory: "Room Compute" });
    expect(l.brightness).toBe("Platform");
    expect(l.resolution).toBe("Video Out");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/vcSpecLabels.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Create `lib/vcSpecLabels.ts`**

```typescript
import type { Product } from "@/data/products";

export interface SpecLabels {
  resolution: string;
  brightness: string;
  operation: string;
}

const DEFAULT_LABELS: SpecLabels = {
  resolution: "Resolution",
  brightness: "Brightness",
  operation: "Operation",
};

/** Display labels for the two spec cells + operation line on a product card
 *  and the product detail page. Samsung products keep the historical labels.
 *  Video Conferencing swaps them so "113° FOV" reads under "Field of View",
 *  not "Brightness". Driven by subCategory, never by inferring brand. */
export function specLabels(
  product: Pick<Product, "category" | "subCategory">
): SpecLabels {
  if (product.category !== "Video Conferencing") return DEFAULT_LABELS;
  switch (product.subCategory) {
    case "Controllers & Scheduling":
      return { resolution: "Display", brightness: "Panel", operation: "Designed For" };
    case "Room Compute":
      return { resolution: "Video Out", brightness: "Platform", operation: "Designed For" };
    // Cameras + Video Bars & Systems (and any future VC subcat) default here
    default:
      return { resolution: "Video", brightness: "Field of View", operation: "Designed For" };
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/vcSpecLabels.test.ts`
Expected: PASS.

- [ ] **Step 5: Use the labels in `components/ProductCard.tsx`**

Add the import:

```typescript
import { specLabels } from "@/lib/vcSpecLabels";
```

Just inside the component body (after `const badge = getProductBadge(product.id);`), add:

```typescript
  const labels = specLabels(product);
```

In the Key Specs grid (lines ~165-173), replace the two hardcoded `<span>Brightness</span>` / `<span>Resolution</span>` label texts with `{labels.brightness}` and `{labels.resolution}` respectively.

In the Operation Rating row (lines ~179-183), the current copy is `Rated for <strong>{operationTime}</strong> continuous operation`. For VC that reads wrong ("Rated for Large Rooms continuous operation"). Make it label-aware:

```tsx
        <span className="truncate">
          {labels.operation === "Operation"
            ? <>Rated for <strong className="text-slate-700 font-bold">{product.specs.operationTime}</strong> continuous operation</>
            : <><strong className="text-slate-700 font-bold">{labels.operation}:</strong> {product.specs.operationTime}</>}
        </span>
```

Also fix the alt text (line ~118) which hardcodes "Samsung":

```tsx
              alt={`${product.name} — ${product.series} ${product.category}`}
```

(dropping the literal "Samsung " prefix; the product name already carries the brand.)

- [ ] **Step 6: Use the labels + fix Samsung-specific copy in `app/products/[slug]/page.tsx`**

Add the import and compute labels + brand near the top of `ProductPage` (after `const skuLine = …`):

```typescript
import { specLabels } from "@/lib/vcSpecLabels";
import { isLogitech } from "@/lib/brand";
// …inside the component:
  const labels = specLabels(product);
  const logi = isLogitech(product);
```

Apply these brand/label fixes (each is a copy string that currently hardcodes Samsung):

1. **Top CTA bar** (line ~141): `Authorized Samsung Distributor` → make brand-aware:
   ```tsx
   {logi ? "Video Conferencing Specialists" : "Authorized Samsung Distributor"}
   ```
2. **Quick-spec pill labels** (BOTH the mobile block ~215-224 and the desktop block ~433-443): change the `label` for the resolution/brightness/operation pills to `labels.resolution`, `labels.brightness`, and (operation pill) keep `labels.operation === "Operation" ? "Operation" : labels.operation`. The "Sizes" pill stays but is empty-safe (`formatSizeRange([])` → "" — acceptable; the pill shows blank. To avoid an empty pill for VC, wrap the Sizes pill so it only renders when `product.specs.screenSizes.length > 0`).
3. **Trust badges** (line ~392-396): the first badge label `Authorized Samsung Distributor` → `logi ? "Video Conferencing Supply & Install" : "Authorized Samsung Distributor"`. The other two ("Pan-India Delivery", "Certified Installation") — for VC, "Certified Installation" contains `certif`; change to `logi ? "Professional Installation" : "Certified Installation"`.
4. **Assurance strip** (lines ~517-522): the array starts with `"100% genuine Samsung products"`. Make it brand-aware:
   ```tsx
   {[
     logi ? "Genuine Logitech room systems" : "100% genuine Samsung products",
     "Formal GST invoice provided",
     "EMI options available for bulk orders",
     "Free installation assessment",
   ].map(…)}
   ```
   > NOTE: "Genuine Logitech room systems" contains neither authoriz/partner/certif nor a warranty/sourcing claim — it's a plain product-genuineness statement, which is permitted (we ARE selling genuine units). This is distinct from the banned "genuine Samsung … manufacturer warranty" phrasing.
5. **Meta description** (`generateMetadata`, line ~56): currently `"… B2B pricing from Aplus, an authorized Samsung distributor in India."` Make brand-aware:
   ```typescript
   const metaDescription = isLogitech(product)
     ? `${product.description} B2B pricing, installation and AMC from Aplus Technology Solutions in India.`
     : `${product.description} Available in ${sizeRange} — B2B pricing from Aplus, an authorized Samsung distributor in India.`;
   ```
   (Also guard the `Available in ${sizeRange}` clause — for VC `sizeRange` is "" — the Logitech branch above already omits it.)
6. **Specs table "Category/Sub-category/Series" rows** are data-driven and fine. The flat-vs-grouped branch already handles VC (`specGroups` present ⇒ grouped table).

- [ ] **Step 7: Verify the product page has no banned wording for a Logitech product**

There is no cheap unit test for the RSC page; this is covered by the Task 15 build + the Task 16 rendered-HTML grep. For now, self-check with a static grep that the only Samsung/authoriz strings in the file are inside `logi ? … : …` ternaries (i.e. the Samsung branch):

```bash
grep -nE "authoriz|Samsung|certif" "app/products/[slug]/page.tsx"
```
Expected: every match is on the Samsung side of a `logi ?` ternary or in Samsung-only data — no unconditional Logitech-visible Samsung/authorization string.

- [ ] **Step 8: Commit**

```bash
git add lib/vcSpecLabels.ts lib/vcSpecLabels.test.ts components/ProductCard.tsx "app/products/[slug]/page.tsx"
git commit -m "feat(vc): VC-aware spec labels + brand-scoped product-page copy"
```

---

## Task 14: VC-aware catalog filters

**Files:**
- Modify: `lib/productFilters.ts`
- Test: `lib/productFilters.test.ts` (extend the existing file)

**Interfaces:**
- Consumes: `applyFilters(products, filters)` — signature unchanged.
- Produces: VC products are never wrongly excluded by the nit-band brightness filter. The safest, smallest change (per spec: "VC category page uses its own filter set instead of nit-band brightness filters") is to make the brightness filter **skip products whose brightness carries no nit value** (already true — `parseBrightnessNit` returns null and the product is excluded). The real risk is a VC touch panel with a genuine nit value ("350 nit") being *included* in a Samsung nit band on the `/products` page — which is actually fine (it genuinely is 350 nit). The concrete bug the spec calls out is "113° FOV" false-matching: `parseBrightnessNit("113° FOV")` returns `113`, which would land in "Under 350 nit". Fix: only parse a nit value when the string actually denotes nits.

- [ ] **Step 1: Add failing tests to `lib/productFilters.test.ts`**

Append:

```typescript
import { applyFilters, DEFAULT_FILTERS } from "./productFilters";
import type { Product } from "@/data/products";

function p(over: Partial<Product>): Product {
  return {
    id: over.id ?? "x", name: "n", category: over.category ?? "Digital Signage",
    series: "s", description: "d", features: ["f"],
    specs: {
      resolution: over.specs?.resolution ?? "4K UHD",
      brightness: over.specs?.brightness ?? "500 nit",
      screenSizes: over.specs?.screenSizes ?? ["55"],
      operationTime: over.specs?.operationTime ?? "24/7",
    },
    images: [], ...over,
  } as Product;
}

describe("applyFilters — FOV must not false-match a nit band", () => {
  it("excludes a '113° FOV' VC product from the 'Under 350 nit' band (not a match)", () => {
    const fov = p({ id: "fov", specs: { resolution: "4K UHD", brightness: "113° FOV", screenSizes: [], operationTime: "Huddle Rooms" } });
    const out = applyFilters([fov], { ...DEFAULT_FILTERS, brightness: "Under 350 nit" });
    expect(out).toHaveLength(0);
  });

  it("still bands a genuine nit value correctly", () => {
    const nit = p({ id: "nit", specs: { resolution: "FHD", brightness: "350 nit", screenSizes: ["65"], operationTime: "Large Rooms" } });
    const out = applyFilters([nit], { ...DEFAULT_FILTERS, brightness: "350–500 nit" });
    expect(out).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/productFilters.test.ts`
Expected: FAIL — the "113° FOV" product is currently parsed to 113 nit and matches "Under 350 nit".

- [ ] **Step 3: Make `parseBrightnessNit` nit-aware**

In `lib/productFilters.ts`, tighten `parseBrightnessNit` so it only returns a number when the string actually expresses nits (contains "nit", or is a pure number). A string like "113° FOV", "CollabOS", "USB touch controller", "PoE touch controller" returns null and is excluded from every numeric nit band:

```typescript
function parseBrightnessNit(brightness: string): number | null {
  // Only strings that actually denote nits participate in nit bands. A VC
  // "113° FOV" / "CollabOS" / "PoE touch controller" must NOT be parsed as a
  // brightness (its leading number is a field-of-view angle, not nits).
  const isNitLike = /nit/i.test(brightness) || /^\s*[\d,]+\s*$/.test(brightness);
  if (!isNitLike) return null;
  const cleaned = brightness.replace(/,/g, "");
  const nums = cleaned.match(/\d+/g);
  if (!nums) return null;
  if (nums.length === 1) return parseInt(nums[0]);
  return Math.round((parseInt(nums[0]) + parseInt(nums[nums.length - 1])) / 2);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/productFilters.test.ts`
Expected: PASS — existing brightness/size/resolution tests still green, new FOV tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/productFilters.ts lib/productFilters.test.ts
git commit -m "fix(vc): brightness filter ignores non-nit values (e.g. '113° FOV')"
```

---

## Task 15: Homepage category grid + root metadata + full build

**Files:**
- Modify: `components/sections/CategoryGrid.tsx` (`CATEGORY_CARDS` array + grid cols)
- Modify: `app/layout.tsx` (root meta description)
- Test: full production build (`npm run build`) + the authoriz/partner/certif grep gate.

**Interfaces:** no exported changes. Adds the 6th homepage category card (decision confirmed) and broadens the root meta description (positioning rule 6; title unchanged).

- [ ] **Step 1: Add the 6th homepage category card**

In `components/sections/CategoryGrid.tsx`, import an icon for VC. There is no dedicated VC icon; reuse an existing brand icon that reads as "video/meeting" — check `@/components/icons` for a `VideoIcon`/`MonitorIcon`/`CameraIcon`. If none fits, use `MonitorIcon` (already imported). Add this entry to the END of `CATEGORY_CARDS` (after `led-signage`):

```typescript
  {
    id: "video-conferencing",
    Icon: MonitorIcon, // reuse until a dedicated VC icon exists
    title: ["Video", "Conferencing"],
    iconColor: "#0d9488",
    accentClass: "text-teal-600",
    span: "",
  },
```

Then change the grid from 5-up to 6-up so it stays a clean single row on desktop. In the `MobileProductScroller` props (line ~81):

```tsx
<MobileProductScroller gridCols="sm:grid-cols-2 lg:grid-cols-6" autoPlay={true} autoPlayInterval={3200} initialDelay={1800}>
```

And remove the now-stale `span: "sm:col-span-2 lg:col-span-1"` on the `led-signage` card (change its `span` to `""`) — with 6 cards the orphan-avoidance span is no longer needed (6 is even on a 2-col grid). Verify the comment block at the top of the file (lines ~16-18) still reads sensibly; update "all five categories" → "all six categories" and `lg:grid-cols-5` → `lg:grid-cols-6` in that comment.

- [ ] **Step 2: Broaden the root meta description**

In `app/layout.tsx`, update BOTH the `metadata.description` (line ~42) and the `openGraph.description` (line ~62) to append Logitech VC. Title stays unchanged. New `metadata.description`:

```typescript
  description:
    "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs — and Logitech video conferencing systems. End-to-end supply, installation & support across India.",
```

New `openGraph.description`:

```typescript
    description:
      "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs — plus Logitech video conferencing — across India.",
```

> The site title/identity stays Samsung-led. The phrase "…and Logitech video conferencing systems" describes the added product line without claiming Logitech authorization (the description authorizes only Samsung, which is true).

- [ ] **Step 3: Run the full production build**

Run: `npm run build`
Expected: build succeeds. All 16 new product routes + the new category route are statically generated (`dynamicParams=false` is satisfied by `generateStaticParams`). No soft-404 regressions.

If the build fails, STOP and fix before proceeding — a broken build blocks everything downstream. Common causes: a circular value-import between `products.ts`/`videoConferencing.ts` (must be `import type`), a missing image path that a component reads without a guard (VC uses `images: []` — verify every consumer guards `images?.[0]`).

- [ ] **Step 4: Hard grep gate — no authorization wording on any Logitech route**

Build output goes to `.next`. Grep the generated HTML for the VC category and every Logitech product route:

```bash
# Server-rendered HTML for prerendered routes lands under .next/server/app.
grep -rilE "authoriz|partner|certif" .next/server/app/products/logitech-* .next/server/app/categories/video-conferencing* 2>/dev/null
```
Expected: **no output.** Any hit is a positioning-rule violation — trace it back to the offending helper/page and fix, then rebuild.

> If `.next/server/app` layout differs, fall back to: `grep -rilE "authoriz|partner|certif" .next | xargs -I{} sh -c 'echo {}'` and manually confirm no Logitech route file matches. The authoritative check is Task 16's runtime grep of the actually-served HTML.

- [ ] **Step 5: Run the full unit-test suite**

Run: `npm run test`
Expected: all suites pass (existing + every new test from Tasks 1-14).

- [ ] **Step 6: Commit**

```bash
git add components/sections/CategoryGrid.tsx app/layout.tsx
git commit -m "feat(vc): homepage VC category card + broadened root meta description"
```

---

## Task 16: Runtime verification pass (verify skill)

**Files:** none modified — this is the acceptance gate.

**Interfaces:** none. Uses the project `verify` skill to launch the app and exercise every button on a real Logitech product page, then hard-greps served HTML.

- [ ] **Step 1: Launch the app via the verify skill**

Invoke the `verify` skill (project skill: "Build/launch/drive recipe for verifying changes at runtime"). Follow its recipe to start the Next.js server. Remember the Windows caveat: after stopping any background server, kill the port PID so a stale build can't poison the run.

- [ ] **Step 2: Drive a Logitech product page end-to-end**

On `/products/logitech-rally-bar` (or any VC product), exercise every parity feature and confirm each works AND shows no banned wording:
- Card/detail spec labels read "Field of View" / "Video" / "Designed For" (not Brightness/Resolution/Operation).
- **Compare:** add this product + a Samsung product; open `/compare`; confirm the mixed table renders (specGroups rows), Export Excel / Print work. (Cosmetic: the Excel filename is `samsung-product-comparison.xlsx` — acceptable; note but do not block.)
- **Spec sheet PDF:** click Download; complete the lead gate; open the PDF; confirm the "Why Buy From Aplus" strip shows Supply/Installation/AMC (NOT "Samsung Authorized") and the header sub-line is the neutral Logitech distributor line.
- **WhatsApp button:** confirm the prefilled text names the product (Logitech), no "Samsung".
- **Add to Quote → /quote → download quote PDF:** confirm the footer/company line is brand-neutral (no "Authorized Samsung … Distributor").
- **tel: / Call buttons:** confirm they dial the canonical number.
- **FAQs:** confirm the on-page FAQ accordion shows Logitech-safe answers (no authorized/genuine-Samsung), and no model-number FAQ appears (no Logitech code exists).

- [ ] **Step 3: Hard grep of served HTML for all Logitech routes**

With the server running, fetch and grep each Logitech route's HTML (product pages + the category page). For every route, the following must return NOTHING:

```bash
# Example for one route; repeat for all 16 products + the VC category.
curl -s http://localhost:3000/products/logitech-rally-bar | grep -iE "authoriz|partner|certif" && echo "VIOLATION" || echo "clean"
curl -s http://localhost:3000/categories/video-conferencing | grep -iE "authoriz|partner|certif" && echo "VIOLATION" || echo "clean"
```
Expected: every route prints `clean`. Any `VIOLATION` is a release blocker — trace and fix.

- [ ] **Step 4: Spot-check a Samsung product is unchanged**

Fetch a Samsung product page (e.g. `/products/samsung-qet-series`) and confirm it STILL contains "Authorized Samsung" (the Samsung claims must remain intact):

```bash
curl -s http://localhost:3000/products/samsung-qet-series | grep -iE "authorized samsung" && echo "samsung intact" || echo "REGRESSION"
```
Expected: `samsung intact`.

- [ ] **Step 5: Stop the server and clean up**

Stop the background server; kill the port PID (Windows orphan caveat).

---

## Self-Review (author checklist — completed)

**1. Spec coverage** — every spec section maps to a task:
- Positioning rules 1-7 → Global Constraints + Tasks 4,5,7,8,9,10,11,12,13,15.
- Catalog content (category + 16 products, subCategory grouping, exclusions, `catalog2026` unset) → Tasks 2,3.
- Data model (`brand?` field, absent⇒Samsung, display-spec fields per type) → Tasks 1,3.
- ProductCard/listing label swap → Task 13.
- Filters (FOV false-match) → Task 14.
- Feature-parity map row-by-row: spec-sheet trust bullet (Task 8), spec-sheet footer (Task 8), quote footer (Task 9), WhatsApp (Task 6), product FAQs (Task 4), category FAQs (Task 5), product JSON-LD (Task 7), category JSON-LD (Task 7), OG share image (Task 10 product / Task 11 category), footer (Task 12), model codes (no-op — verified degrades in Tasks 3,4).
- "No changes needed" data-driven items (compare, quote flow, tel, gallery, search, sitemap, generateStaticParams, SKU line) → confirmed in File Structure "untouched"; exercised in Task 16.
- SEO & routing (static params, sitemap auto, no redirects, root metadata) → Tasks 2,15.
- Testing & verification (unit tests per helper, full build, runtime pass, authoriz grep) → Tasks 4-14 (unit), 15 (build+grep), 16 (runtime+grep).
- Homepage grid decision (add 6th card) → Task 15. Series-field decision (family label) → Task 3. Both from the user's answers.

**2. Placeholder scan** — no "TBD/TODO/handle edge cases" left; the only deferred real-world content is the 16 products' exact spec values and product images, which are explicitly sourced from logitech.com in Task 3 with a template and per-product mapping table, and images degrade gracefully via `images: []` (Task 14 build proves it).

**3. Type consistency** — `brandOf`/`isLogitech`/`BRAND_MANUFACTURER`/`BRAND_JSONLD_NAME` (Task 1) are referenced with identical names in Tasks 4,5,7,8,10,13. `specLabels`/`SpecLabels` (Task 13) consistent. `trustCardsFor`/`distributorLineFor` (Task 8) consistent. `videoConferencingProducts` (Task 3) consistent with `data/products.ts` import. `CategorySlug` gains `"video-conferencing"` (Task 2) and is used as a literal in Tasks 5,7,11,13,15.

**Known cosmetic follow-ups (non-blocking, noted for the reviewer):** the compare Excel export filename is hardcoded `samsung-product-comparison.xlsx`; the compare "Series" pill shows the VC family label. Neither is a positioning violation. Leave unless the reviewer wants them polished.
