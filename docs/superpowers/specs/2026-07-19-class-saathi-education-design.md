# Class Saathi Education Landing — Design

**Date:** 2026-07-19
**Status:** Approved by user (brainstorming session)
**Goal:** Add an Education category to the site whose landing page is a premium
Class Saathi (TagHive) marketing experience that generates school leads,
delivered to Sunil and counted/segmented so Aplus can demonstrate lead volume
to TagHive.

## Context

- Aplus has an **exploratory / prospective** tie-up with TagHive (maker of
  Class Saathi, a Bluetooth clicker + AI learning platform). Nothing is
  formalized. The page itself is part of the pitch to TagHive ("we generate
  leads for you"), so it must be impeccable and truthful.
- Source material: a Google AI Studio single-page export (Vite/React, emerald
  theme, ~1500-line App.tsx + ~1000-line clicker simulator) and the official
  10-page Class Saathi brochure PDF (`Class_Saathi.pdf`) with ~40 embedded
  real images and the verifiable fact base.
- The site already has a precedent for partner-brand categories: Logitech
  Video Conferencing and Samsung Software Solutions (data file + category
  entry + brand-scoped metadata). Education follows the same shape, minus
  catalog products (none yet).

## Decisions (user-approved)

| Decision | Choice |
|---|---|
| Placement | New `education` category; its category page IS the premium landing (Approach A: taxonomy entry + branch) |
| Lead routing | Existing `/api/contact` pipeline; email to `CLASS_SAATHI_TO_EMAIL` (sunil@aplustechsol.com, env var — never hardcoded); Zoho `Lead_Source: "Class Saathi"` segment |
| Partnership language | **None.** Exploratory status ⇒ zero "official/authorized/certified/partner" claims. Aplus is an independent solutions provider *featuring* Class Saathi |
| Aesthetic | Aplus premium chrome + restrained education-green accent. Standard site navbar AND standard site footer (AI Studio page's custom footer dropped) |
| Interactives | Keep both: clicker simulator (rebuilt, refined) + Blueprint lead form (rebuilt with real contact fields) |
| Content truth | Every claim must trace to the brochure or TagHive's public site; fake testimonials, invented stats (+12% grades, 500k clickers), and invented SKUs (CS-25/CS-40) are dropped unless verified |
| Home 2×4 grid | Untouched in this phase (7 tiles + view-all just shipped). Education reachable via navbar Products dropdown |

## Architecture

### Taxonomy & routing

- `data/categories.ts`: add `"education"` to `CategorySlug` and a
  `productCategories` entry — name `"Education"`, navLabel `"Education"`,
  tagline like "Smart classrooms & AI-powered learning", subtitle/overview
  written under the content truth policy (no partner language, no Samsung
  words). Navbar desktop + mobile, sitemap, and not-found page pick the
  category up automatically (they map over `productCategories`).
- `app/categories/[slug]/page.tsx`: early branch — when `slug === "education"`
  render `<EducationLanding />` instead of the standard product-grid template
  (Education has zero catalog products; the standard template would render
  empty grids). `generateMetadata` branches the same way with
  education-scoped metadata. `generateStaticParams`/`dynamicParams = false`
  continue to work unchanged (education is in the enumerated set).
- OG image route (`app/categories/[slug]/opengraph-image.tsx` + `ogAlt.ts`):
  verify it renders sensibly from the education category data; add
  education-specific alt/copy if the generic path produces Samsung-flavored
  text.
- **Products page guard:** `/products` category chips (ProductsCategoryNav /
  ProductsClientShell / ProductCatalogSection) get a generic rule — a category
  with zero products renders no filter chip. Education lives in the navbar and
  its landing page only, until real products exist. Audit the remaining
  `productCategories` consumers (`EmptyQuoteState`, `not-found`) for
  empty-category sanity.

### Components

New directory `components/education/`:

| Component | Type | Purpose |
|---|---|---|
| `EducationLanding` | server | Section composer for the page |
| `EducationHero` | server | Premium hero |
| `AwardsStrip` | server | 8 real award badges |
| `ParticipationComparison` | server | Before/After panels (scroll reveal via the site's existing `AnimatedSection` client wrapper) |
| `HowItWorks` | server | 4-step flow |
| `EcosystemTabs` | client | Teacher/Student/Parent/Admin tabs |
| `ClickerSimulator` | client, dynamic import | Virtual clicker demo (dark stage) |
| `BlueprintLeadForm` | client, dynamic import | Lead capture + success state |
| `EducationFaq` | server + client accordion | FAQ w/ JSON-LD |

Copy, FAQs, awards, and simulator questions live in `data/education.ts`
(pattern: `data/software.ts` / `data/videoConferencing.ts`). Animations use
the already-installed `framer-motion`; icons follow the site's Lucide chrome
conventions.

## Page experience (top → bottom)

1. **Hero** — light premium, education-green accent reserved for brand
   moments. Headline kept from the draft: "Every voice heard. Every learner
   engaged." Real clicker imagery from the brochure. Fact chips: *100%
   offline*, *Every student participates*, *By TagHive — a Samsung C-Lab
   spin-off* (factual attribution, not endorsement). CTAs: **Try the live
   simulator** (scroll) and **Request a school demo** (scroll to form).
2. **Awards strip** — refined monochrome badges: UNICEF XTC Top-10 EdTech
   2022 · Edison Awards Bronze 2025 · MIT Solve 2025 (Top 1%) · Global EdTech
   Awards 2024 Best Hardware · Financial Express AI Excellence 2025 · GLE
   Awards 2023 · Indian Education Awards 2024 · DIDAC India Startup 2019.
   (All from brochure p.10.)
3. **Before / After Class Saathi** — two-panel comparison: silent-majority
   classroom vs 100% participation classroom (brochure p.3 concept), rebuilt
   in premium site language.
4. **How it works** — 4 steps from brochure p.9: Class Preparation →
   Students answer with clickers → Data tracking → AI-powered reports.
5. **Ecosystem tabs** — Teacher (AI quiz generation from URLs/docs/prompts,
   Smart AI lesson plans, AI-based insights/reports — p.5), Student (Saathi
   Tutor, daily quizzes, subject-centric quizzes, personalized assignments —
   p.7), Parent (progress + learning supervision — p.4), Admin (real-time
   monitoring, monthly LMS reports — p.8). Real screenshots extracted from
   the brochure.
6. **Clicker simulator** — dark cinematic stage section (the page's one dark
   band). Core interaction preserved from the draft: virtual clicker with
   A/B/C/D tactile buttons, question flow, simulated live class responses,
   result distribution. Rebuilt on site design tokens; code-split so the
   landing stays light.
7. **Blueprint lead form** — split layout (persuasion left, form right).
   Fields: name, role/designation, school name, city, **email**, **phone**,
   student-count band, primary goal (select), optional message. Honeypot +
   rate-limit inherited from the pipeline. Success state: submission summary +
   "our education specialist will reach out within 1 business day" — no
   invented kit SKUs, no promises on TagHive's behalf.
8. **FAQ** — 6 vetted Q&As (BLE connectivity, offline operation, battery,
   curriculum alignment, what's in the kit, who is TagHive), answers rewritten
   from brochure/TagHive-site facts only. FAQPage JSON-LD via the site's
   `jsonLd.ts` patterns.
9. **Closing CTA band** + small-print attribution: "Class Saathi® is a
   registered trademark of TagHive Inc." — placed at the end of page content,
   **above the standard Aplus site footer**, which renders unchanged.

## Lead pipeline

- `BlueprintLeadForm` POSTs JSON to `/api/contact` with
  `lead_source: "Class Saathi"`, `subject: "Class Saathi Lead — <school>"`,
  `company` ← school name, plus the fields above folded into `message` /
  dedicated keys.
- `app/api/contact/route.ts`: when `body.lead_source === "Class Saathi"`,
  deliver to `process.env.CLASS_SAATHI_TO_EMAIL ?? TO_EMAIL` and use a new
  education-themed email template (school details grid, green accent).
  All existing protections (origin check, rate limit, honeypot, field caps)
  apply unchanged.
- `lib/zoho.ts`: `Lead_Source: body.lead_source || "Web Site"` — Class Saathi
  leads become a filterable Zoho segment; export = the TagHive report.
- Analytics: PostHog event `class_saathi_lead_submitted` on success as a
  second counting surface.
- Env: `CLASS_SAATHI_TO_EMAIL=sunil@aplustechsol.com` set in Vercel and
  `.env.local`; documented next to `CONTACT_TO_EMAIL`.

## Content truth policy

- Allowed sources: `Class_Saathi.pdf` brochure; TagHive's public web
  properties (tag-hive.com / classsaathi.com), verified during implementation.
- Dropped from the AI Studio draft: all testimonials (fabricated people),
  "+12% grade performance", "500k+ clickers / 5,000+ schools / 5M+ questions"
  (unless verified on TagHive's site during implementation), CS-25/CS-40/CS-80
  SKU names, "Blueprint PDF download" fake button, invented FAQ specifics
  (500,000-question bank, CR2032 1–2 yr battery) unless verified.
- No "official / authorized / certified / partner" wording anywhere on the
  page, in metadata, or in structured data (Logitech precedent, stricter).
- Numeric stats appear in the hero ONLY if verified; otherwise qualitative
  chips are used.

## Assets

- Python script (pypdf + Pillow) extracts the brochure's embedded images
  (mix of PNG/JPG/JP2), converts to optimized webp under
  `public/education/class-saathi/` (Logitech image-optimization precedent).
- Hero needs one strong device/classroom shot; ecosystem tabs need the app
  screenshots (brochure pp. 5–9); awards strip is text/badge-rendered (no
  low-res logo extraction needed).
- Fallback: if extraction quality disappoints, user supplies official TagHive
  assets.
- The AI Studio draft's Google-hosted AI-generated images are not used.

## SEO & metadata

- Title/description scoped to Class Saathi + education keywords (student
  response system, classroom clickers, smart classroom, India). No Samsung
  hardware claims, no authorized-distributor language on this route.
- FAQPage JSON-LD; sitemap entry arrives automatically via the taxonomy.
- Middleware redirects: none needed (new URL, no legacy WordPress
  equivalent).

## Error handling

- Client validation per `lib/formSchemas.ts` conventions (required fields,
  email/phone shape) before POST; server keeps authoritative validation.
- API failure → inline error with retry; 429 → friendly "please try again in
  a few minutes" message.
- Zoho failure stays non-fatal (existing behavior — email is the lead of
  record).
- Simulator is purely client-side entertainment; any crash is contained by
  the site's error boundary and never blocks the lead form (separate
  islands).

## Testing & verification

- `data/education.test.ts` — category entry integrity (mirrors
  `software.test.ts` pattern).
- Zoho mapping unit test: `lead_source` → `Lead_Source` passthrough +
  default.
- Runtime verification via the project's verify skill before merge: navbar
  shows Education, `/categories/education` renders all sections, products
  page chips unaffected, form posts successfully in dev, build passes.

## Out of scope (this phase)

- Catalog product entries for clicker kits (spec sheets, compare, finder) —
  future phase when the TagHive relationship formalizes and real SKUs/pricing
  exist.
- Home page category grid rework to include Education.
- Admin "leads generated" dashboard (Zoho filter + PostHog cover reporting
  for now; a Firestore-backed counter was considered and deferred).
- City-page or blog cross-linking for education keywords.
