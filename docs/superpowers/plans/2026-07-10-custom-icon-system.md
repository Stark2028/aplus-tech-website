# Custom Branded Icon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inconsistent Lucide icon usage with a custom branded icon family (slate outline + blue accent, keycap tiles) for expressive icons and normalized Lucide for chrome.

**Architecture:** A `BrandIcon` SVG primitive enforces the two-layer stroke convention (outline layer inherits text color, accent layer colored via a wrapper class). ~26 per-icon components pass path data to it. An `IconTile` keycap container replaces flat `bg-blue-50` squares. Consumption sites swap imports; chrome Lucide icons get normalized stroke/size.

**Tech Stack:** Next.js (App Router), React server components, Tailwind CSS, lucide-react (kept for chrome only).

## Global Constraints

- Icon style: 24×24 viewBox, outline stroke `1.7`, accent stroke `2.2` (spec: "D — outline + blue accent"), `stroke-linecap="round" stroke-linejoin="round"`, `fill="none"`.
- Outline color: slate-800 (`text-slate-800` on light); accent default `text-blue-600`.
- Keycap tile: white bg, `border-slate-200`, `rounded-xl`, shadow `0 1px 2px rgba(15,23,42,.06)` + `inset 0 1px 0 #fff`.
- Hover: tile border → `blue-200`; outline → `blue-700`. No solid-blue tile hovers remain.
- Dark variant: outline `slate-200`, accent `blue-400`, tile `bg-white/5 border-white/10`.
- Chrome Lucide: strokeWidth 2 (tiny ≤13px ticks may keep 2.5–3; compare-active Scale 2.5 stays); sizes 14 inline / 16–18 buttons / 22 nav.
- Do NOT touch product badge logic. Do NOT modify lib/pdf or OG images.
- All icon components are server-safe (no hooks) and `aria-hidden="true"` by default.
- Icon geometry starts from lucide-react's path data (`node_modules/lucide-react/dist/esm/icons/<name>.js` or the lucide.dev site paths) and is split into outline/accent layers per the table in Task 2/3.
- There is no unit-test infra for SVGs; the test cycle per task is `npx tsc --noEmit` (fast) and the `/dev/icons` gallery + affected pages viewed via `npm run dev`. `npm run build` gates the final task.

---

### Task 1: BrandIcon primitive, IconTile, barrel file

**Files:**
- Create: `components/icons/BrandIcon.tsx`
- Create: `components/icons/IconTile.tsx`
- Create: `components/icons/index.ts`

**Interfaces:**
- Produces: `BrandIcon({ size?, className?, accentClassName?, outline, accent, label? })`, `IconTile({ size?: "md"|"lg", dark?, className?, children })`. All later icon components consume `BrandIcon`; all consumption sites use `IconTile`.

- [ ] **Step 1: Write BrandIcon**

```tsx
// components/icons/BrandIcon.tsx
import type { ReactNode, SVGProps } from "react";

export interface BrandIconProps
  extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
  /** Color of the outline layer (inherits currentColor). */
  className?: string;
  /** Color of the accent layer. */
  accentClassName?: string;
  /** Paths drawn at outline weight (1.7). */
  outline: ReactNode;
  /** Paths drawn at accent weight (2.2) in the accent color. */
  accent: ReactNode;
  /** Accessible label; omitted = decorative (aria-hidden). */
  label?: string;
}

/**
 * Two-layer branded icon: slate outline + single blue accent element.
 * Both layers use currentColor so hover recoloring is pure CSS —
 * the outline reads the svg's text color, the accent reads the
 * accent <g>'s text color.
 */
export default function BrandIcon({
  size = 24,
  className = "text-slate-800",
  accentClassName = "text-blue-600",
  outline,
  accent,
  label,
  ...rest
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {outline}
      <g className={accentClassName} stroke="currentColor" strokeWidth={2.2}>
        {accent}
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Write IconTile**

```tsx
// components/icons/IconTile.tsx
import type { ReactNode } from "react";

const SIZES = { md: "w-12 h-12", lg: "w-14 h-14" } as const;

/**
 * Keycap container for brand icons: white tile, hairline border,
 * soft shadow with inset top highlight. Pair with `group` on the
 * parent card — hover shifts the border to blue and the icon's
 * outline to blue-700 (icons use currentColor).
 */
export default function IconTile({
  size = "md",
  dark = false,
  className = "",
  children,
}: {
  size?: keyof typeof SIZES;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const surface = dark
    ? "bg-white/5 border-white/10 text-slate-200 group-hover:border-blue-400/40"
    : "bg-white border-slate-200 text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,.06),inset_0_1px_0_#fff] group-hover:border-blue-200 group-hover:text-blue-700";
  return (
    <div
      className={`${SIZES[size]} rounded-xl border flex items-center justify-center transition-colors ${surface} ${className}`}
    >
      {children}
    </div>
  );
}
```

Note: icons placed inside an IconTile should be rendered with `className="text-current"` so the tile's `text-slate-800 → group-hover:text-blue-700` drives the outline color.

- [ ] **Step 3: Create barrel `components/icons/index.ts`** exporting BrandIcon and IconTile (icon exports appended in Tasks 2–3).

```ts
export { default as BrandIcon } from "./BrandIcon";
export { default as IconTile } from "./IconTile";
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit` passes.

- [ ] **Step 5: Commit** — `git add components/icons && git commit -m "feat(icons): BrandIcon primitive and IconTile keycap container"`

---

### Task 2: Custom icons — trust/feature set (12) + dev gallery

**Files:**
- Create: `components/icons/glyphs.tsx` (all icon components live in one file per set is NOT desired — one component per file):
  `ShieldCheckIcon.tsx, HeadphonesIcon.tsx, TruckIcon.tsx, AwardIcon.tsx, WrenchIcon.tsx, LifeBuoyIcon.tsx, MessageSquareIcon.tsx, CheckCircleIcon.tsx, BadgeCheckIcon.tsx, UsersIcon.tsx, TimerIcon.tsx, ZapIcon.tsx` under `components/icons/`
- Create: `app/dev/icons/page.tsx` (temporary gallery)
- Modify: `components/icons/index.ts` (add exports)

**Interfaces:**
- Produces: each icon component `({ size?, className?, accentClassName? })` forwarding to BrandIcon. Names: `ShieldCheckIcon` etc. as listed.

Every icon follows this pattern (fully worked example — ShieldCheck):

```tsx
// components/icons/ShieldCheckIcon.tsx
import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function ShieldCheckIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      }
      accent={<path d="m9 12 2 2 4-4" />}
    />
  );
}
```

- [ ] **Step 1: Author the 12 components.** Take each glyph's path data from lucide-react source and split layers per this table (everything not listed as accent goes in outline):

| Icon | Lucide source | Accent layer (blue) |
|---|---|---|
| ShieldCheckIcon | shield-check | the check `m9 12 2 2 4-4` |
| HeadphonesIcon | headphones | both ear-cup rects/paths |
| TruckIcon | truck | both wheel circles |
| AwardIcon | award | the ribbon path (below the circle) |
| WrenchIcon | wrench | none in source — split: draw wrench outline; accent = small screw dot `circle cx=6.5 cy=17.5 r=.5` scaled up; simpler: accent = the handle segment `path d="m14.7 9.3-8.4 8.4"` drawn under outline head |
| LifeBuoyIcon | life-buoy | inner circle `circle cx=12 cy=12 r=4` |
| MessageSquareIcon | message-square | three dots added: `path d="M8 10h.01M12 10h.01M16 10h.01"` |
| CheckCircleIcon | circle-check-big | the check `m9 11 3 3L22 4` |
| BadgeCheckIcon | badge-check | the check `m9 12 2 2 4-4` |
| UsersIcon | users | the second-person arc + head (`M22 21v-2a4 4 0 0 0-3-3.87` and `M16 3.13a4 4 0 0 1 0 7.75`) |
| TimerIcon | timer | the hand `path d="M12 14l3-3"` + top button `M10 2h4` |
| ZapIcon | zap | none separable — accent = whole bolt at 2.2, outline layer empty is NOT allowed; instead outline = bolt, accent = small underline spark `M8 22h8` — simpler and cleaner: outline bolt, accent none → use bolt as outline and add accent dot; final call: outline = zap bolt path, accent = `path d="M9 22h6"` ground stroke |

(For Wrench and Zap the accent additions are new elements, not Lucide subpaths — keep them minimal and geometric.)

- [ ] **Step 2: Add exports to `components/icons/index.ts`.**

- [ ] **Step 3: Create the gallery** at `app/dev/icons/page.tsx`: renders all exported icons (import from the barrel) in a grid at sizes 16/24/32, one row inside light `IconTile` within a `group` card (to demo hover), one row inside dark tiles on a `bg-slate-900` band.

```tsx
// app/dev/icons/page.tsx  (TEMPORARY — deleted in final task)
import * as Icons from "@/components/icons";
import IconTile from "@/components/icons/IconTile";

const entries = Object.entries(Icons).filter(
  ([name]) => name.endsWith("Icon") && name !== "BrandIcon"
);

export default function IconGallery() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-bold">Brand icon gallery (dev)</h1>
      <section className="grid grid-cols-4 md:grid-cols-6 gap-6">
        {entries.map(([name, C]) => {
          const Comp = C as React.ComponentType<{ size?: number }>;
          return (
            <div key={name} className="group flex flex-col items-center gap-2 border border-gray-100 rounded-xl p-4">
              <div className="flex items-end gap-2">
                <Comp size={16} /> <Comp size={24} /> <Comp size={32} />
              </div>
              <IconTile><Comp size={26} className="text-current" /></IconTile>
              <span className="text-[10px] text-gray-500">{name}</span>
            </div>
          );
        })}
      </section>
      <section className="bg-slate-900 rounded-2xl p-8 grid grid-cols-4 md:grid-cols-6 gap-6">
        {entries.map(([name, C]) => {
          const Comp = C as React.ComponentType<{
            size?: number; className?: string; accentClassName?: string;
          }>;
          return (
            <div key={name} className="group flex justify-center">
              <IconTile dark>
                <Comp size={26} className="text-current" accentClassName="text-blue-400" />
              </IconTile>
            </div>
          );
        })}
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit`; view `/dev/icons` in dev server; all 12 render, accents read clearly at 16px.

- [ ] **Step 5: Commit** — `git commit -m "feat(icons): trust/feature icon set + dev gallery"`

---

### Task 3: Custom icons — category/product, industry, CTA sets (14)

**Files:**
- Create under `components/icons/`: `MonitorIcon.tsx, LayoutGridIcon.tsx, InteractiveIcon.tsx (mouse-pointer-click), TvIcon.tsx, LedIcon.tsx (cpu), PackageIcon.tsx, BuildingIcon.tsx (building-2), GraduationCapIcon.tsx, StoreIcon.tsx, ShoppingBagIcon.tsx, SendIcon.tsx, PhoneIcon.tsx, MailIcon.tsx, MapPinIcon.tsx`
- Modify: `components/icons/index.ts`

**Interfaces:**
- Produces: same component signature as Task 2. Names exactly as listed (note renames: `InteractiveIcon`, `LedIcon`, `BuildingIcon`).

- [ ] **Step 1: Author the 14 components** (same worked pattern as Task 2), accent splits:

| Icon | Lucide source | Accent layer |
|---|---|---|
| MonitorIcon | monitor | stand `M8 21h8` + `M12 17v4` |
| LayoutGridIcon | layout-grid | bottom-right rect |
| InteractiveIcon | mouse-pointer-click | the click sparks (the 4 short strokes) |
| TvIcon | tv | antenna `m17 2-5 5-5-5` |
| LedIcon | cpu | inner rect `rect x=9 y=9 width=6 height=6` |
| PackageIcon | package | the tape seam `path d="m7.5 4.27 9 5.15"` + `M12 22V12` |
| BuildingIcon | building-2 | door/windows column (the small `M10 6h4`-style window strokes → pick the door `M10 18v3`... use windows) |
| GraduationCapIcon | graduation-cap | the tassel/base `M6 12v5c3 3 9 3 12 0v-5` |
| StoreIcon | store | awning scallop path |
| ShoppingBagIcon | shopping-bag | handle `M16 10a4 4 0 0 1-8 0` |
| SendIcon | send | the inner diagonal `M22 2 11 13` |
| PhoneIcon | phone | none separable — outline = receiver path; accent = signal arcs added `M15 7a4 4 0 0 1 2 2` (two small arcs) |
| MailIcon | mail | envelope flap `m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7` |
| MapPinIcon | map-pin | inner circle `circle cx=12 cy=10 r=3` |

- [ ] **Step 2: Export from barrel.**

- [ ] **Step 3: Verify** — `npx tsc --noEmit`; `/dev/icons` shows all 26; check 16px legibility and dark band.

- [ ] **Step 4: Commit** — `git commit -m "feat(icons): category, industry and CTA icon sets"`

---

### Task 4: Swap homepage marketing sections

**Files:**
- Modify: `components/sections/WhyChooseUs.tsx`
- Modify: `components/sections/HowItWorks.tsx`
- Modify: `components/sections/FinalCTA.tsx`
- Modify: `components/sections/IndustrySolutions.tsx`

**Interfaces:**
- Consumes: Task 2/3 icons + `IconTile` from `@/components/icons`.

- [ ] **Step 1: WhyChooseUs** — replace lucide imports with `ShieldCheckIcon, HeadphonesIcon, TruckIcon, AwardIcon, IconTile`. Replace both tile blocks (mobile marquee `w-10 h-10 bg-blue-50 ...` and desktop `w-12 h-12 bg-blue-50 ...`) with `<IconTile size="md"><Icon size={24} className="text-current" /></IconTile>` (mobile can pass `className="w-10 h-10"` override via IconTile's className with size md). Remove `group-hover:bg-blue-600` / `text-white` hover classes — hover comes from IconTile. Keep card `group` class.
- [ ] **Step 2: HowItWorks** — same treatment for its step icons (MessageSquareIcon, PackageIcon, WrenchIcon, LifeBuoyIcon, PhoneIcon).
- [ ] **Step 3: FinalCTA** — swap ShieldCheck/Award/Truck/CheckCircle2 → brand icons. If the section is on a dark band, use `IconTile dark` + `accentClassName="text-blue-400"`; check the section bg first.
- [ ] **Step 4: IndustrySolutions** — swap Building2/Monitor/GraduationCap/Store → BuildingIcon/MonitorIcon/GraduationCapIcon/StoreIcon in tiles; keep ArrowRight (chrome).
- [ ] **Step 5: Verify** — `npx tsc --noEmit`; view homepage in dev server; hover states work; no solid-blue tile hovers remain in these files.
- [ ] **Step 6: Commit** — `git commit -m "feat(icons): homepage marketing sections use brand icons + keycap tiles"`

---

### Task 5: Swap category/solutions/finder surfaces

**Files:**
- Modify: `components/sections/CategoryGrid.tsx`
- Modify: `components/MobileProductScroller.tsx` (if it renders category icons)
- Modify: `components/ProductFinderSection.tsx`
- Modify: `data/solutions.ts` + `app/solutions/[industry]/page.tsx` + `app/solutions/[industry]/[category]/page.tsx` (icon fields)

**Interfaces:**
- Consumes: Task 3 icons; `accentClassName` per-category hue.

- [ ] **Step 1: CategoryGrid** — replace `Monitor, LayoutGrid, MousePointerClick, Tv, Cpu` with brand icons. Map existing per-category hex hues to accent classes: `#2563eb→text-blue-600`, `#4f46e5→text-indigo-600`, `#7c3aed→text-violet-600`, `#0e7490→text-cyan-700`, `#0891b2→text-cyan-600`. Replace `iconColorLight` tinted squares with `IconTile`; outline stays slate, accent uses the per-category class. Drop the now-unused `iconColor`/`iconColorLight` fields if nothing else reads them (check first).
- [ ] **Step 2: ProductFinderSection** — swap any expressive icons (check imports: uses lucide) to brand equivalents where they exist; leave chrome (chevrons/close) as Lucide.
- [ ] **Step 3: solutions data/pages** — `data/solutions.ts` exports `Zap, Monitor, LayoutGrid, Award` in data; swap to `ZapIcon, MonitorIcon, LayoutGridIcon, AwardIcon` (they render `<item.icon size={..} />` — verify call sites accept the new props; brand icons accept size/className so compatible).
- [ ] **Step 4: Verify** — `npx tsc --noEmit`; view /, /solutions/<industry>, finder section; category hues preserved.
- [ ] **Step 5: Commit** — `git commit -m "feat(icons): category grid, finder and solutions use brand icons"`

---

### Task 6: Swap remaining pages (about, contact, not-found, empty states, misc)

**Files:**
- Modify: `app/about/page.tsx`, `app/contact/page.tsx`, `app/not-found.tsx`
- Modify: `components/search/SearchEmptyContent.tsx`, `components/quote/EmptyQuoteState.tsx`
- Modify: `components/MobileStickyCTA.tsx`, `components/RecentlyViewed.tsx` (Monitor placeholder), `components/ProductCatalogSection.tsx` (Monitor placeholder), `app/products/[slug]/page.tsx` (Monitor size-64 placeholder)

**Interfaces:**
- Consumes: brand icons from barrel; chrome stays Lucide.

- [ ] **Step 1: about** — swap CheckCircle2→CheckCircleIcon, Users→UsersIcon, Award→AwardIcon, Headphones→HeadphonesIcon, Truck→TruckIcon, ShieldCheck→ShieldCheckIcon in feature contexts; keep ChevronRight/ArrowRight/Linkedin as Lucide chrome.
- [ ] **Step 2: contact** — swap Phone/Mail/MapPin/Building2/Timer/BadgeCheck/Send/CheckCircle (expressive contexts, e.g. info cards) to brand icons; Clock in metadata stays Lucide at size 14.
- [ ] **Step 3: not-found + empty states + placeholders** — MonitorIcon for product-image placeholders (keep size 64 with default strokes — check visual weight at 64, outline 1.7 reads fine); ShoppingBagIcon in EmptyQuoteState; MobileStickyCTA Phone→PhoneIcon, FileText stays Lucide (chrome-ish doc icon) unless it sits in a tile.
- [ ] **Step 4: Verify** — `npx tsc --noEmit`; visit /about, /contact, /404, empty quote and search states.
- [ ] **Step 5: Commit** — `git commit -m "feat(icons): remaining pages use brand icons"`

---

### Task 7: Chrome normalization

**Files:**
- Modify (audit every file from `grep -l "lucide-react"`): normalize strokeWidth/size per global constraints. Known deviations to fix: `BackToTop.tsx` (2.5→2 ok to keep? no → 2), `NavbarMobile.tsx` ShoppingBag 1.8→2, `NavbarDesktop.tsx` 1.8→2, `ProductCard.tsx`/`ProductActions.tsx`/`ProgressStepper.tsx` mixed 2.5s on non-tiny icons → 2, `app/products/[slug]/page.tsx` Monitor strokeWidth 1 (replaced in Task 6).

**Interfaces:** none new.

- [ ] **Step 1:** `grep -rn "strokeWidth" app components` — for each hit: tiny ticks (size ≤13) keep bold; compare-active Scale keeps 2.5; everything else → 2 (which is Lucide's default — prefer deleting the prop).
- [ ] **Step 2:** Spot-check sizes against roles (14 inline / 16–18 buttons / 22 nav); fix outliers only where visually wrong — do not churn every callsite.
- [ ] **Step 3: Verify** — `npx tsc --noEmit`; click through navbar, cards, compare bar in dev server.
- [ ] **Step 4: Commit** — `git commit -m "style(icons): normalize lucide chrome stroke widths and sizes"`

---

### Task 8: Dark surfaces (Footer, dark CTA bands)

**Files:**
- Modify: `components/Footer.tsx`; any dark band found in Task 4 Step 3 (FinalCTA) if not already done.

**Interfaces:**
- Consumes: `IconTile dark`, `accentClassName="text-blue-400"`.

- [ ] **Step 1:** Audit Footer for expressive icons (contact info: Phone/Mail/MapPin) → brand icons with `className="text-slate-200"` `accentClassName="text-blue-400"`; social/chrome stays Lucide.
- [ ] **Step 2: Verify** — dev server footer + dark bands; contrast acceptable.
- [ ] **Step 3: Commit** — `git commit -m "feat(icons): dark-surface icon variants"`

---

### Task 9: Final verification and cleanup

**Files:**
- Delete: `app/dev/icons/page.tsx`
- Modify: any bug fixes found along the way (user directive: fix bugs encountered).

- [ ] **Step 1:** `grep -rn "bg-blue-50" components/sections app | grep -i icon` — plus manual check of the Task 4–6 files: zero flat icon squares remain.
- [ ] **Step 2:** Final visual pass of `/dev/icons` (all 26, three sizes, light+dark, hover), then delete the gallery page.
- [ ] **Step 3:** `npm run build` — passes clean.
- [ ] **Step 4: Commit** — `git commit -m "chore(icons): remove dev gallery, final cleanup"`
