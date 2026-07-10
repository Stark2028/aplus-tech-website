# Custom Branded Icon System — Design

**Date:** 2026-07-10
**Status:** Approved (style + container chosen via visual companion session)

## Goal

Replace the site's inconsistent Lucide icon usage with a refined, professional two-tier system:

1. **Custom branded icons** (D style: slate outline + brand-blue accent) for all expressive/marketing icons (~26).
2. **Restyled Lucide** for functional chrome (chevrons, ×, search, loaders) normalized to consistent stroke/size rules.

## Chosen visual style (user-selected)

- **Icon style "D — outline + blue accent":** 24×24 viewBox, primary outline in slate-800 `#1e293b` at stroke-width 1.7, exactly one semantic element per icon in brand blue `#2563eb` at stroke-width ~2.2 (e.g. shield's check, truck's wheels, monitor's stand). Round caps/joins.
- **Container "keycap tile":** white background, `border-slate-200` hairline border, soft outer shadow + inset top highlight (`shadow-[0_1px_2px_rgba(15,23,42,.06),inset_0_1px_0_#fff]`), `rounded-xl`. Replaces all flat `bg-blue-50` icon squares.
- **Hover:** tile border shifts to `blue-200`; icon outline transitions slate → `blue-700`. Replaces the current "tile turns solid blue, icon turns white" hover.
- **Dark surfaces** (Footer, dark CTA bands): outline `slate-200`, accent `blue-400`, tile `bg-white/5 border-white/10`.

## Architecture

### `components/icons/` (new)

- **`BrandIcon.tsx`** — shared primitive. Renders the `<svg>` shell (viewBox, fill=none, caps, joins, `aria-hidden` unless labelled) and standardizes the two-layer convention. Props: `size` (default 24), `className`, `accentClassName` (default `text-blue-600`). Outline layer uses `currentColor` (set slate via className); accent layer uses the accent class's `currentColor`. This makes hover recoloring pure CSS.
- **One file per icon**, e.g. `ShieldCheckIcon.tsx`, exporting a component that passes its paths to `BrandIcon`. Named exports re-exported from `components/icons/index.ts`.
- **`IconTile.tsx`** — keycap container. Props: `size` (`md` 48px / `lg` 56px), `className`, `dark` boolean for dark-surface variant. Group-hover styles built in.

### Custom icon inventory (~26)

| Set | Icons (replacing Lucide equivalent) |
|---|---|
| Trust/feature | ShieldCheck, Headphones, Truck, Award, Wrench, LifeBuoy, MessageSquare, CheckCircle, BadgeCheck, Users, Timer, Zap |
| Category/product | Monitor, LayoutGrid, MousePointerClick (interactive), Tv, Cpu (LED), Package |
| Industry | Building2, GraduationCap, Store |
| CTA/contact | ShoppingBag, Send, Phone, Mail, MapPin |

Custom icon geometry starts from the Lucide path (ISC licensed) and is restyled into the two-layer convention — this keeps glyphs recognizable and small-size legible.

**Per-category accent hues:** `CategoryGrid` currently gives each category its own hue (blue/indigo/violet/teal/cyan). The `accentClassName` prop preserves this — category icons pass their hue; everything else defaults to brand blue.

### Consumption sites (custom icons + IconTile)

`WhyChooseUs`, `HowItWorks`, `FinalCTA`, `IndustrySolutions`, `CategoryGrid`, `MobileProductScroller` (category cards), `ProductFinderSection`, `data/solutions.ts` + solutions pages, `app/about`, `app/contact`, `app/not-found` (Monitor), search empty state, quote empty state, `MobileStickyCTA`, `RecentlyViewed`/catalog placeholders (Monitor).

### Chrome normalization (stays Lucide)

Chevrons, arrows, X, Search, Menu, Plus/Minus, Loader2, RefreshCw, SlidersHorizontal, Share2, Printer, FileSpreadsheet, FileDown, ExternalLink, Scale, small Check ticks, Cookie, alerts, Tag, Calendar, Clock (metadata), Linkedin, MessageCircle, ScanSearch.

Rules:
- Stroke width **2** everywhere. Exceptions: tiny ticks (≤13px) may keep 2.5–3 for legibility; the compare-active `Scale` bold state (2.5) is a deliberate semantic signal and stays.
- Size roles: **14** inline/metadata, **16–18** buttons, **22** nav tap targets.
- Color: inherit text color; no icon-specific hues in chrome.

## Error handling / edge cases

- Icons are pure presentational SVG — no runtime failure modes. `aria-hidden="true"` by default; consumers pass visible labels alongside.
- PDF generation (`lib/pdf/*`) and OG images do not consume React icon components — out of scope.
- Server components: all icon components are stateless and server-safe (no hooks).

## Verification

- Temporary gallery at `app/dev/icons/page.tsx`: all custom icons at 16/24/32, inside light + dark IconTiles, hover demos. Visually checked, then **deleted before finishing**.
- `npm run build` (or `tsc --noEmit` + `next build`) passes.
- Grep confirms zero remaining `bg-blue-50` icon-tile squares in the consumption sites listed above.
- Any bugs encountered during the work are fixed as part of the pass (user directive).

## Out of scope

- Logo, favicons, OG images, PDF assets.
- Removing lucide-react (still used for chrome).
- Product badges (separate open question — do not touch).
