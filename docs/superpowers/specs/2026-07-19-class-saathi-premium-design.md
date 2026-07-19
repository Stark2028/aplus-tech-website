# Class Saathi Premium Page — Design

**Date:** 2026-07-19
**Status:** Approved (all sections) — pending user review of this written spec
**Predecessor:** `2026-07-19-class-saathi-education-design.md` (the shipped landing this upgrades)

## Goal

Elevate the Class Saathi education landing (`/categories/education`) to the same
premium craft level as the home hero (`DisplayStage`) and tag-hive.com:

1. Replace the static brochure hero image with a **pure-CSS animated classroom
   scene** (the "display products animation" equivalent for Class Saathi).
2. Rebuild the live simulator into a **dual-view (Student/Teacher) live
   classroom theater** — the page's centerpiece.
3. Premium restyle of **every other section** (awards, comparison, how-it-works,
   ecosystem tabs, FAQ, closing CTA), keeping all copy and claims unchanged.

## Decisions (user-confirmed)

| Decision | Choice |
|---|---|
| Scope | Full-page premium redesign |
| Aesthetic | **Bright premium** — light, airy emerald identity elevated; the simulator remains the page's single dark "cinema" band |
| Hero stage content | **Classroom answer loop** — one continuous story scene (clicker → Bluetooth pulse → smartboard results) |
| Simulator direction | **Dual-view teacher mode** — live classroom theater plus a Teacher-dashboard view toggle |

## Hard constraints

- **Content truth policy** (`data/education.ts` header, enforced by
  `data/education.test.ts`): every claim traces to the Class Saathi brochure or
  tag-hive.com. No partnership/"authorized" language. No new claims are
  introduced by this redesign; simulated data is labelled as simulation.
- **No fabricated people:** teacher-view uses anonymous "Seat 01–24" labels,
  never invented student names.
- **Turbopack font rule:** never import `next/font` from a `"use client"` file.
  Accent fonts are applied as CSS variables from the server component
  (`EducationLanding`).
- Copy, headings, SEO surface and JSON-LD are unchanged.
- All animation: transform/opacity only; `prefers-reduced-motion` gets static
  or instant fallbacks everywhere.

## A. Shared premium foundation

- Apply `spaceGrotesk.variable` + `plexMono.variable` (from `app/fonts-accent`)
  on the education `<main>` in `EducationLanding` (server component). Display
  font for section headings/stats; mono for eyebrows, labels, telemetry text.
- New scoped stylesheets with an `edu-` class prefix providing the shared
  atmosphere vocabulary, adapted from `hero2-*`/`stg-*`: emerald aurora washes,
  dot-grid field, film grain, vignette (dark band only), SVG draw-line
  keyframes, pulse rings, press physics. Placement: hero-stage rules in
  `components/education/hero/stage.css`, simulator rules in
  `components/education/simulator/simulator.css`, and shared light-section
  effects (marquee, seat dots, timeline draw-line) in
  `components/education/education.css` imported by `EducationLanding`.
- Light-theme variants for the bright sections; dark variants for the simulator
  band.

## B. Hero — `ClassroomStage`

**Left column** (copy unchanged): word-by-word rise animation on the H1
(display font; animated gradient on the accent line), mono eyebrow, refined
chip pills, CTAs wrapped in `MagneticButton`.

**Right column:** replace the brochure `<Image>` with `ClassroomStage` — a
pure-CSS animated scene patterned on `DisplayStage`:

- **Composition:** CSS-drawn smartboard (dark screen, light bezel) floating on
  a subtle 3D perspective; a large CSS-drawn Class Saathi student clicker
  (soft-white shell, four rainbow keys, LCD strip) in the foreground; emerald
  glow pools on the floor, floating dust motes, soft floor shadow.
- **Loop (~16s, pure CSS keyframes, two question "beats"):**
  1. Board shows a short question with A–D options.
  2. A clicker key visibly depresses; its LED blinks.
  3. Bluetooth pulse rings + a dotted packet travel from clicker to board.
  4. Board result bars race up; an "answered" counter ticks to 24/24; the
     correct option flashes a check.
  5. Crossfade to the second question; loop.
- **Interaction:** desktop-only rAF-throttled mouse tilt (pointer:fine +
  lg + no reduced-motion), same guards as `DisplayStage`.
- **Accessibility:** entire stage `aria-hidden` (decorative); reduced-motion
  users see the frozen "results filled" frame.
- **No JS animation loop** — React only wires the tilt.

## C. Awards strip → premium trust band

- Trust line ("Trusted in 15,000+ classrooms globally") becomes a large
  display-font statement with `AnimatedCounter` on "15,000+".
- The 8 awards become **medallion cards** (gradient icon tile, title,
  issuer · year) in a **slow auto-scrolling CSS marquee**; pauses on hover;
  reduced-motion falls back to the existing static grid layout.
- Data unchanged (`educationAwards`, `educationTrustLine`).

## D. Participation comparison → animated gap

- 40% / 100% stats count up on scroll via the existing `AnimatedCounter`
  (already in-view triggered through IntersectionObserver, fires once).
- Each panel gains a **seat-dot grid** (20 dots): before-card lights 8 with a
  stagger; after-card lights all 20. Pure CSS/`AnimatedSection`-triggered.
- After-card: gradient ring + soft emerald glow. Copy unchanged.

## E. How it works → connected timeline

- The 4 step cards become nodes on an **animated SVG draw-line** that
  progresses on scroll into view.
- Each step gets a gradient icon tile following `components/icons` conventions
  (Lucide glyphs, IconTile pattern). Copy unchanged.

## F. Ecosystem tabs → device frames

- Screenshots framed in CSS device chrome: **phone bezel** for portrait
  student/parent shots; **browser/tablet chrome** for teacher/admin dashboard
  shots. Floating treatment: soft shadow + emerald glow.
- Tabs/pill animation kept; entrance transition refined (spring).
- Mono eyebrow added per-tab. Content unchanged.

## G. Simulator — `ClassroomSimulator` (dual-view, dark cinema band)

**Band:** layered dark backdrop (dot field, drifting emerald auroras, film
grain, vignette). Section header keeps its copy, restyled in the type system,
plus a small **"Simulation · sample class data"** chip.

**Component:** rebuild of `ClickerSimulator` as `ClassroomSimulator` with a
segmented **Student / Teacher** toggle (pill control, mono labels).

### Student view

- **Device:** premium CSS clicker — soft-white shell with top sheen, mono-green
  LCD, four rainbow keys with press physics (translate + inner shadow +
  active ring), Submit/Restart controls, transmit LED.
- **Flow (extends current `idle → armed → transmitting → revealed` phases):**
  1. `idle`: question on the smartboard panel; class status "24 students
     ready"; pick a key → `armed`.
  2. Submit → `transmitting` (~0.45s): Bluetooth ripple rings + packet dots
     travel from clicker toward the board (horizontal on lg, vertical stack on
     mobile).
  3. **`collecting` (new, ~2.5s):** a 24-seat dot grid on the board lights up
     progressively (deterministic per-question pattern); live counter ticks
     "answers 7/24 … 24/24". Reduced-motion: skip straight to reveal.
  4. `revealed`: correct option flashes; **racing bars** with count-up
     percentages; your-answer marker; small CSS confetti burst on correct
     (suppressed under reduced motion); explanation card slides in;
     **streak chip** (×N correct in a row, session-local).
  5. Next question. After the final question: **session summary card** — your
     score (e.g. 5/6), class-average comparison from the simulated data, best
     streak — with **Restart** and **"Request a school demo"** (`#lead-form`)
     CTAs.

### Teacher view

- Toggle flips (crossfade/flip transition) to a **teacher dashboard render of
  the same session**: 24-seat response grid with anonymous "Seat 01–24"
  labels (✓/✗/– states), per-question accuracy, answer-distribution mini-bars,
  and a "hardest question so far" callout — all computed from `classAnswers`
  plus the visitor's own answers this session.
- Empty state (no questions answered yet) points back to Student view.

### Data

- `simulatorQuestions` unchanged. All derived stats computed client-side from
  existing `classAnswers`; no new content claims.

## H. Lead form, FAQ, closing CTA

- **BlueprintLeadForm:** light-touch restyle only (type-system alignment of
  headings/eyebrows). No structural or pipeline changes — it is freshly shipped
  and wired to the contact pipeline.
- **FAQ:** glass cards, mono numbering (01, 02, …), smooth height-transition
  expand, emerald accents. `details/summary` semantics kept.
- **Closing CTA:** aurora blobs + dot texture inside the gradient band, display
  font headline, `MagneticButton` CTAs. Trademark attribution line stays.

## Engineering

**New files**

- `components/education/hero/ClassroomStage.tsx` + `components/education/hero/stage.css`
- `components/education/simulator/ClassroomSimulator.tsx` (orchestrator, view
  toggle, phase state)
- `components/education/simulator/ClickerDevice.tsx`
- `components/education/simulator/Smartboard.tsx` (student view board)
- `components/education/simulator/TeacherDashboard.tsx`
- `components/education/simulator/simulator.css`

**Changed files**

- `components/education/EducationLanding.tsx` — font variables on `<main>`;
  dynamic import points at `ClassroomSimulator`; simulator band backdrop.
- `EducationHero`, `AwardsStrip`, `ParticipationComparison`, `HowItWorks`,
  `EcosystemTabs`, `EducationFaq`, `ClosingCta` — restyled in place.
- Old `ClickerSimulator.tsx` deleted once replaced.

**Rules**

- Simulator stays a dynamically imported client island; hero stage is CSS-only
  (client component solely for the tilt hook, matching `DisplayStage`).
- Page remains fully static; no new data fetching, no bundle-heavy deps
  (framer-motion is already in the page's islands).
- Existing tests must pass (`data/education.test.ts` content policy); any new
  UI strings avoid partnership/authorized language.

## Error handling

- Simulator timers cleaned up on unmount (existing pattern extended to the
  collecting-phase timer chain).
- Teacher view guards against divide-by-zero (no answered questions → empty
  state).
- Marquee and stage degrade to static layouts without JS (CSS animations still
  run) and under reduced motion (frozen frames).

## Testing / verification

- `npm run build` clean; existing test suite passes.
- Runtime drive via the project `verify` skill: hero loop renders and cycles,
  simulator full flow (both views, summary card, restart), reduced-motion
  spot-check, mobile layout spot-check (stage scale, vertical simulator).
- Lighthouse sanity on `/categories/education` — no regression from the CSS
  additions (kill stale servers per Windows TaskStop memory before measuring).
