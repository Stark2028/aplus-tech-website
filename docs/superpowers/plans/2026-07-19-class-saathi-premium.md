# Class Saathi Premium Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate `/categories/education` to home-hero craft level: pure-CSS animated classroom hero, dual-view (Student/Teacher) live classroom simulator, and a premium restyle of every other section — all copy and claims unchanged.

**Architecture:** Server components keep the static shell and SEO surface; interactivity stays in small client islands (`ClassroomStage` tilt hook, `ClassroomSimulator` dynamic island, `InView` trigger). Animation vocabulary is scoped CSS files with an `edu-` prefix, adapted from the home hero's `hero2-*`/`stg-*` system (`components/sections/hero/stage.css`). Accent fonts ride CSS variables set by the server component (never `next/font` from `"use client"` files).

**Tech Stack:** Next.js 16 (app router, Turbopack), Tailwind v4, framer-motion (already in the page's islands), vitest.

**Spec:** `docs/superpowers/specs/2026-07-19-class-saathi-premium-design.md`

## Global Constraints

- **Content truth policy** (enforced by `data/education.test.ts` over `data/education.ts`): no new claims; UI strings must never match `/authori[sz]ed|official|certified|partner/i`; "Samsung" only ever as "Samsung C-Lab". Simulated data is labelled as simulation.
- **No fabricated people:** teacher view uses anonymous "Seat 01–24" labels only.
- **Turbopack font rule:** never import `next/font` (or `app/fonts-accent`) from a `"use client"` file. Fonts apply as `spaceGrotesk.variable`/`plexMono.variable` classes on the education `<main>` in the server `EducationLanding`; components consume `var(--font-display)` / `var(--font-mono)`.
- Copy, headings, SEO surface and JSON-LD unchanged (spec-sanctioned additions only: simulation chip, per-tab mono eyebrow, mono numbering).
- All animation transform/opacity only (paint-only micro-exceptions get a comment, matching stage.css precedent). `prefers-reduced-motion` gets static/instant fallbacks — note the global guard in `app/globals.css:268` force-completes animations (0.001ms × 1 iteration, no fill), so every scoped CSS file must pin its own static frame under reduced motion.
- Page stays fully static: no new data fetching, no new deps.
- `data/education.ts` is **not modified** in any task.
- Work happens on branch `feat/class-saathi-premium` off `feat/logitech-video-conferencing` (where the shipped landing lives, unmerged).

## File Structure

**New:**
- `components/education/education.css` — shared light-section vocabulary (type helpers, auroras, dot fields, marquee, seat dots, draw-line, CTA texture, dark simulator-band backdrop) — imported by `EducationLanding`
- `components/education/InView.tsx` — 20-line client trigger: adds `.edu-anim` on mount, `.edu-inview` when scrolled in
- `components/education/hero/ClassroomStage.tsx` + `components/education/hero/stage.css` — pure-CSS classroom answer-loop scene (16s, two beats), React only wires the tilt
- `components/education/simulator/seatMap.ts` + `seatMap.test.ts` — pure derived-stats helpers (deterministic seat permutations, accuracy, session summary, streaks)
- `components/education/simulator/ClassroomSimulator.tsx` — orchestrator: phases, timers, session state, Student/Teacher toggle
- `components/education/simulator/ClickerDevice.tsx` — premium CSS clicker (student input)
- `components/education/simulator/Smartboard.tsx` — student-view board: options, collecting seat grid, reveal panel, summary card
- `components/education/simulator/TeacherDashboard.tsx` — teacher view computed from the same session
- `components/education/simulator/simulator.css` — dark-band component rules (press physics, flight packets, seats, confetti)

**Modified:** `EducationLanding.tsx` (fonts, css import, simulator band, dynamic import), `EducationHero.tsx`, `AwardsStrip.tsx`, `ParticipationComparison.tsx`, `HowItWorks.tsx`, `EcosystemTabs.tsx`, `EducationFaq.tsx`, `ClosingCta.tsx`, `BlueprintLeadForm.tsx` (light touch).

**Deleted:** `components/education/ClickerSimulator.tsx` (Task 8, once replaced).

---

### Task 1: Branch + shared premium foundation

**Files:**
- Create: `components/education/education.css`
- Create: `components/education/InView.tsx`
- Modify: `components/education/EducationLanding.tsx` (imports + `<main>` className only)

**Interfaces:**
- Produces: `edu-display`, `edu-mono`, `edu-eyebrow` (mono type, no color — color via Tailwind), `edu-grad`, `edu-rise`, `edu-dots-light`, `edu-aur`(`-a`/`-b`), `edu-marquee`(`-track`, `-dup`), `edu-seat`(`.off`), `edu-drawline`, `edu-card-grad`, `edu-faq-body`, `edu-cta-dots`, `edu-cta-aur`(`.a`/`.b`), `edu-sim-dots`, `edu-sim-aur`(`-a`/`-b`), `edu-sim-noise`, `edu-sim-vignette` CSS classes; `InView({ children, className? })` component; `--font-display`/`--font-mono` variables live on education `<main>`.

- [ ] **Step 1: Create the branch**

```powershell
git checkout -b feat/class-saathi-premium
```

- [ ] **Step 2: Write `components/education/education.css`**

```css
/* ═══════════════════════════════════════════════════════════════════════════
   Class Saathi premium — shared education-landing vocabulary (spec §A).
   Scope: edu-* classes for the landing's bright sections plus the dark
   simulator band's backdrop (which is server-rendered by EducationLanding).
   Hero-stage rules live in hero/stage.css; simulator component rules in
   simulator/simulator.css. Adapted from the home hero's hero2-*/stg-*
   vocabulary (components/sections/hero/stage.css), re-tuned to a light,
   airy emerald identity. Animations are transform/opacity only.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── type system (fonts arrive as CSS vars from EducationLanding) ── */
.edu-display { font-family: var(--font-display, system-ui, sans-serif); }
.edu-mono { font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace); }
.edu-eyebrow {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

/* Shimmering emerald headline gradient (hero2-grad, re-colored). */
.edu-grad {
  background: linear-gradient(100deg, #047857 15%, #10b981 38%, #6ee7b7 50%, #059669 62%, #065f46 85%);
  background-size: 230% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: edu-shimmer 7s ease-in-out infinite;
}
@keyframes edu-shimmer {
  0%, 100% { background-position: 0% 0; }
  50% { background-position: 100% 0; }
}

/* Entrance rise (hero2-rise twin — that class lives in the home hero's CSS,
   which this page never loads). `both` fill keeps elements hidden through
   their delay. */
.edu-rise { animation: edu-risein 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
@keyframes edu-risein {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── light atmosphere ── */
.edu-dots-light {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(4, 120, 87, 0.09) 1px, transparent 1.3px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 30%, transparent 78%);
  mask-image: radial-gradient(ellipse at 50% 40%, #000 30%, transparent 78%);
}
.edu-aur {
  position: absolute;
  width: 46%;
  height: 52%;
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
}
.edu-aur-a {
  left: -10%;
  top: -16%;
  background: radial-gradient(closest-side, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.07) 45%, transparent 72%);
  animation: edu-drift 16s ease-in-out infinite alternate;
}
.edu-aur-b {
  right: -12%;
  bottom: -20%;
  background: radial-gradient(closest-side, rgba(45, 212, 191, 0.14), rgba(45, 212, 191, 0.05) 45%, transparent 72%);
  animation: edu-drift 19s ease-in-out infinite alternate-reverse;
}
@keyframes edu-drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(40px, 26px) scale(1.15); }
}

/* ── awards marquee (spec §C) ── */
.edu-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.edu-marquee-track {
  display: flex;
  gap: 16px;
  width: max-content;
  animation: edu-marquee 48s linear infinite;
}
.edu-marquee:hover .edu-marquee-track { animation-play-state: paused; }
/* Track = two identical card sets; -50% - 8px lands set 2 exactly where set 1
   started (8px = half the 16px seam gap), so the loop is seamless. */
@keyframes edu-marquee {
  to { transform: translateX(calc(-50% - 8px)); }
}

/* ── in-view trigger (seat dots + timeline draw-line) ──
   InView.tsx adds .edu-anim on mount (JS present) and .edu-inview once
   scrolled in. Without JS neither class lands and the finished state
   shows — same no-JS behavior as AnimatedSection. */
.edu-seat {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  transition: background-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
  transition-delay: calc(var(--i) * 55ms);
}
.edu-seat.off {
  background: #e5e7eb;
  box-shadow: none;
}
.edu-anim:not(.edu-inview) .edu-seat {
  background: #e5e7eb;
  box-shadow: none;
  transform: scale(0.8);
}

/* SVG paths must set pathLength="100". Default = drawn (no-JS safe). */
.edu-drawline {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}
.edu-anim:not(.edu-inview) .edu-drawline { stroke-dashoffset: 100; }

/* Gradient-ring card (spec §D after-panel). */
.edu-card-grad {
  border: 2px solid transparent;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, #34d399, #059669 60%, #10b981) border-box;
  box-shadow: 0 24px 64px -28px rgba(5, 150, 105, 0.35);
}

/* FAQ body entrance on open (spec §H) — close stays native/instant. */
details[open] .edu-faq-body { animation: edu-faq-in 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes edu-faq-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── closing CTA texture (spec §H) ── */
.edu-cta-dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.09) 1px, transparent 1.3px);
  background-size: 22px 22px;
}
.edu-cta-aur { position: absolute; width: 55%; height: 90%; pointer-events: none; }
.edu-cta-aur.a {
  left: -15%;
  top: -35%;
  background: radial-gradient(closest-side, rgba(52, 211, 153, 0.35), rgba(52, 211, 153, 0.12) 45%, transparent 72%);
  animation: edu-drift 16s ease-in-out infinite alternate;
}
.edu-cta-aur.b {
  right: -18%;
  bottom: -40%;
  background: radial-gradient(closest-side, rgba(6, 95, 70, 0.55), rgba(6, 95, 70, 0.2) 45%, transparent 72%);
  animation: edu-drift 19s ease-in-out infinite alternate-reverse;
}

/* ── dark simulator band backdrop (server-rendered by EducationLanding) ── */
.edu-sim-band { isolation: isolate; }
.edu-sim-dots {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(110, 231, 183, 0.06) 1px, transparent 1.3px);
  background-size: 26px 26px;
}
.edu-sim-aur {
  position: absolute;
  width: 46%;
  height: 52%;
  opacity: 0.55;
  z-index: 0;
  pointer-events: none;
}
.edu-sim-aur-a {
  left: -8%;
  top: -14%;
  background: radial-gradient(closest-side, rgba(5, 150, 105, 0.3), rgba(5, 150, 105, 0.11) 45%, transparent 72%);
  animation: edu-drift 16s ease-in-out infinite alternate;
}
.edu-sim-aur-b {
  right: -10%;
  bottom: -18%;
  background: radial-gradient(closest-side, rgba(13, 148, 136, 0.24), rgba(13, 148, 136, 0.09) 45%, transparent 72%);
  animation: edu-drift 19s ease-in-out infinite alternate-reverse;
}
/* Static film grain: one tiny inline SVG data-URI (angle brackets URL-encoded
   for Firefox), matching hero2-noise. */
.edu-sim-noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url('data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="140" height="140"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/%3E%3C/filter%3E%3Crect width="140" height="140" filter="url(%23n)" opacity="0.55"/%3E%3C/svg%3E');
}
.edu-sim-vignette {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 120%, transparent 30%, rgba(0, 0, 0, 0.5) 100%);
}

/* ── reduced motion: pin finished states (global guard force-completes) ── */
@media (prefers-reduced-motion: reduce) {
  .edu-grad,
  .edu-aur-a, .edu-aur-b,
  .edu-cta-aur.a, .edu-cta-aur.b,
  .edu-sim-aur-a, .edu-sim-aur-b {
    animation: none !important;
  }
  .edu-rise { animation: none !important; opacity: 1 !important; transform: none !important; }
  .edu-seat, .edu-drawline { transition: none !important; }
  .edu-marquee { -webkit-mask-image: none; mask-image: none; }
  .edu-marquee-track {
    animation: none !important;
    width: auto;
    flex-wrap: wrap;
    justify-content: center;
  }
  .edu-marquee-dup { display: none; }
  details[open] .edu-faq-body { animation: none; }
}
```

- [ ] **Step 3: Write `components/education/InView.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Adds `.edu-anim` on mount and `.edu-inview` once scrolled into view, so
 *  scoped CSS can stagger child transitions (seat dots, timeline draw-line).
 *  Without JS neither class lands and the finished state shows — the same
 *  no-JS behavior as AnimatedSection. Fires once. */
export default function InView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("edu-anim");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("edu-inview");
          observer.disconnect();
        }
      },
      { rootMargin: "-80px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Wire fonts + stylesheet in `EducationLanding.tsx`**

Add imports and change the `<main>` line; everything else stays:

```tsx
import { spaceGrotesk, plexMono } from "@/app/fonts-accent";
import "./education.css";
```

```tsx
    <main className={`${spaceGrotesk.variable} ${plexMono.variable} min-h-screen bg-white`}>
```

- [ ] **Step 5: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → all existing suites pass (education truth-policy suite included).

- [ ] **Step 6: Commit**

```powershell
git add components/education/education.css components/education/InView.tsx components/education/EducationLanding.tsx
git commit -m "feat(education): premium foundation - accent fonts, shared edu-* vocabulary, InView trigger"
```

---

### Task 2: Hero — `ClassroomStage` + `EducationHero` rewrite

**Files:**
- Create: `components/education/hero/ClassroomStage.tsx`
- Create: `components/education/hero/stage.css`
- Modify: `components/education/EducationHero.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `simulatorQuestions` from `@/data/education` (read-only; beats reuse questions 1 and 3), `edu-*` type/atmosphere classes from Task 1, `.hero-word` from `app/globals.css`.
- Produces: `ClassroomStage` default export (no props) — used only by `EducationHero`.

**Scene spec (16s master clock, two 8s beats, pure CSS):** board question fades in → clicker key depresses + LED blinks (~15.6% / 65.6%) → Bluetooth rings + 3 packet dots travel clicker→board (~17–23% / 67–73%) → result bars race (23–30%), answered counter ticks 7→16→24, correct option flashes a check (31%) → crossfade to beat 2 at 50%. Beat-2 board children inherit `--beat: 8s` as `animation-delay`. Reduced motion pins the "results filled" frame of beat 1.

- [ ] **Step 1: Write `components/education/hero/stage.css`**

```css
/* ═══════════════════════════════════════════════════════════════════════════
   ClassroomStage — the education hero's animated scene (spec §B).
   Pattern: components/sections/hero/stage.css (DisplayStage), emerald-tuned.
   em scale: .edu-st-scale sets base 10px @ 440px container width (2.28cqw).
   16s master clock, two 8s question beats; beat 2's board children inherit
   --beat: 8s as animation-delay. Loop is transform/opacity only; the correct-
   option border/background flash is a paint-only micro-exception (small
   area), matching the stg-focus precedent.
   ═══════════════════════════════════════════════════════════════════════════ */

.edu-st-col {
  container-type: inline-size;
  position: relative;
  z-index: 2;
}
.edu-st-scale { font-size: clamp(7px, 2.28cqw, 13px); }
.edu-st-persp { perspective: 1200px; position: relative; }
.edu-st-tilt { transition: transform 0.18s ease-out; transform-style: preserve-3d; }
.edu-st-float { animation: edu-st-float 8s ease-in-out infinite; }
@keyframes edu-st-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.edu-st-glow {
  position: absolute;
  inset: -16%;
  background: radial-gradient(closest-side, rgba(6, 95, 70, 0.34), rgba(6, 95, 70, 0.12) 45%, transparent 72%);
  pointer-events: none;
  z-index: 0;
}
.edu-st-stagebox { position: relative; height: 37em; }

/* dust motes (emerald) at different translateZ depths */
.edu-st-dust {
  position: absolute;
  border-radius: 50%;
  background: #6ee7b7;
  pointer-events: none;
  animation: edu-st-dustf 11s ease-in-out infinite alternate;
}
.edu-st-dust.d1 { width: 3px; height: 3px; left: 6%; top: 16%; opacity: 0.35; translate: 0 0 60px; }
.edu-st-dust.d2 { width: 2px; height: 2px; right: 10%; top: 28%; opacity: 0.3; translate: 0 0 -50px; animation-duration: 14s; animation-direction: alternate-reverse; }
.edu-st-dust.d3 { width: 4px; height: 4px; left: 14%; bottom: 24%; opacity: 0.25; translate: 0 0 30px; animation-duration: 17s; }
.edu-st-dust.d4 { width: 2px; height: 2px; right: 18%; bottom: 16%; opacity: 0.35; translate: 0 0 -30px; animation-duration: 13s; }
@keyframes edu-st-dustf {
  from { transform: translateY(0); }
  to { transform: translateY(-16px); }
}

/* ── smartboard: light bezel, dark screen ── */
.edu-st-board {
  width: 88%;
  margin: 0 auto;
  aspect-ratio: 16 / 10;
  border-radius: 1em;
  padding: 0.5em;
  background: linear-gradient(160deg, #f8fafc, #cbd5e1 60%, #e2e8f0);
  box-shadow:
    0 2.4em 6em -1.8em rgba(2, 44, 34, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.45),
    0 0 5.4em -0.8em rgba(16, 185, 129, 0.35);
}
.edu-st-screen {
  position: relative;
  overflow: hidden;
  height: 100%;
  border-radius: 0.6em;
  background: #081611;
}
/* glass sheen sweep, every 9s (stg-screen::after twin) */
.edu-st-screen::after {
  content: "";
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: 0;
  width: 34%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.07) 45%, rgba(255, 255, 255, 0.13) 50%, rgba(255, 255, 255, 0.07) 55%, transparent);
  transform: translateX(-132%) skewX(-18deg);
  animation: edu-st-sheen 9s ease-in-out infinite;
  z-index: 6;
  pointer-events: none;
}
@keyframes edu-st-sheen {
  0%, 55% { transform: translateX(-132%) skewX(-18deg); }
  75%, 100% { transform: translateX(382%) skewX(-18deg); }
}

/* ── question beats ── */
.edu-st-beat {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5em 1.8em;
  opacity: 0;
  animation: edu-st-beatk 16s ease-in-out infinite;
  --beat: 0s;
}
.edu-st-beat.b2 { animation-delay: 8s; --beat: 8s; }
@keyframes edu-st-beatk {
  0% { opacity: 0; transform: scale(0.985); }
  2.5% { opacity: 1; transform: scale(1); }
  45% { opacity: 1; transform: scale(1); }
  49.5% { opacity: 0; transform: scale(0.99); }
  100% { opacity: 0; }
}
.edu-st-bhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.8em;
  letter-spacing: 0.18em;
  color: #34d399;
  margin-bottom: 1em;
}
.edu-st-count {
  position: relative;
  width: 14em;
  height: 1.3em;
  text-align: right;
  color: #a7f3d0;
}
.edu-st-count i {
  position: absolute;
  right: 0;
  top: 0;
  font-style: normal;
  opacity: 0;
  animation-duration: 16s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-delay: var(--beat);
}
.edu-st-count .c1 { animation-name: edu-st-c1; }
.edu-st-count .c2 { animation-name: edu-st-c2; }
.edu-st-count .c3 { animation-name: edu-st-c3; }
@keyframes edu-st-c1 { 0%, 17% { opacity: 0; } 18%, 24% { opacity: 1; } 25%, 100% { opacity: 0; } }
@keyframes edu-st-c2 { 0%, 25% { opacity: 0; } 26%, 29% { opacity: 1; } 30%, 100% { opacity: 0; } }
@keyframes edu-st-c3 { 0%, 30% { opacity: 0; } 31%, 46% { opacity: 1; } 47%, 100% { opacity: 0; } }
.edu-st-q {
  font-family: var(--font-display, system-ui, sans-serif);
  font-weight: 700;
  font-size: 1.55em;
  letter-spacing: -0.01em;
  color: #f0fdf4;
  margin-bottom: 1em;
}
.edu-st-opts {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  margin-top: auto;
}
.edu-st-opt {
  display: flex;
  align-items: center;
  gap: 0.9em;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.7em;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.55em 0.9em;
}
/* correct option flash at reveal — paint-only micro-exception (small card) */
.edu-st-opt.is-correct {
  animation: edu-st-optc 16s ease-in-out infinite;
  animation-delay: var(--beat);
}
@keyframes edu-st-optc {
  0%, 31% { border-color: rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.04); }
  34%, 46% { border-color: rgba(52, 211, 153, 0.75); background: rgba(6, 78, 59, 0.45); }
  48%, 100% { border-color: rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.04); }
}
.edu-st-key {
  width: 1.9em;
  height: 1.9em;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.9em;
  font-weight: 500;
  color: #d1fae5;
}
.edu-st-lbl {
  flex: none;
  width: 7.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.05em;
  color: #cbd5e1;
}
.edu-st-track {
  flex: 1;
  height: 0.8em;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}
.edu-st-bar {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.55);
  transform: scaleX(0);
  transform-origin: left;
  animation: edu-st-bark 16s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-delay: var(--beat);
}
.edu-st-opt.is-correct .edu-st-bar { background: linear-gradient(90deg, #34d399, #059669); }
@keyframes edu-st-bark {
  0%, 23% { transform: scaleX(0); }
  30% { transform: scaleX(var(--w)); }
  46% { transform: scaleX(var(--w)); }
  48% { transform: scaleX(0); }
  100% { transform: scaleX(0); }
}
.edu-st-chk {
  width: 1.5em;
  flex: none;
  text-align: center;
  color: #34d399;
  font-weight: 700;
  opacity: 0;
  transform: scale(0.6);
  animation: edu-st-chkk 16s ease-in-out infinite;
  animation-delay: var(--beat);
}
@keyframes edu-st-chkk {
  0%, 31% { opacity: 0; transform: scale(0.6); }
  33% { opacity: 1; transform: scale(1.15); }
  35% { opacity: 1; transform: scale(1); }
  46% { opacity: 1; transform: scale(1); }
  48%, 100% { opacity: 0; transform: scale(0.6); }
}

/* power-on boot line, once */
.edu-st-boot {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: #d1fae5;
  box-shadow: 0 0 26px 5px rgba(209, 250, 229, 0.95);
  z-index: 7;
  transform: scaleX(0);
  animation: edu-st-poweron 1.1s ease-out 1.15s forwards;
}
@keyframes edu-st-poweron {
  0% { transform: scaleX(0); opacity: 1; }
  55% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}
.edu-st-reveal { opacity: 0; animation: edu-st-revl 0.9s ease-out 1.95s forwards; }
@keyframes edu-st-revl { to { opacity: 1; } }

/* ── bluetooth link: rings at the clicker, packets travelling to the board ── */
.edu-st-link {
  position: absolute;
  left: 24%;
  bottom: 10.5em;
  width: 12em;
  height: 12em;
  pointer-events: none;
  z-index: 4;
}
.edu-st-ring {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 2.4em;
  height: 2.4em;
  border: 2px solid rgba(52, 211, 153, 0.75);
  border-radius: 50%;
  opacity: 0;
  animation: edu-st-ringk 16s ease-out infinite;
}
.edu-st-ring.r2 { animation-delay: 0.45s; }
@keyframes edu-st-ringk {
  0%, 16.8% { opacity: 0; transform: scale(0.35); }
  17.5% { opacity: 0.9; transform: scale(0.7); }
  22% { opacity: 0; transform: scale(2.1); }
  22.5% { opacity: 0; transform: scale(0.35); }
  66.8% { opacity: 0; transform: scale(0.35); }
  67.5% { opacity: 0.9; transform: scale(0.7); }
  72% { opacity: 0; transform: scale(2.1); }
  72.5%, 100% { opacity: 0; transform: scale(0.35); }
}
.edu-st-pkt {
  position: absolute;
  left: 0.9em;
  bottom: 0.9em;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.9);
  opacity: 0;
  animation: edu-st-pktk 16s ease-in-out infinite;
}
.edu-st-pkt.k2 { animation-delay: 0.35s; }
.edu-st-pkt.k3 { animation-delay: 0.7s; }
@keyframes edu-st-pktk {
  0%, 17% { opacity: 0; transform: translate(0, 0); }
  18% { opacity: 1; }
  22.5% { opacity: 1; transform: translate(7em, -9em); }
  23% { opacity: 0; transform: translate(7em, -9em); }
  24% { opacity: 0; transform: translate(0, 0); }
  67% { opacity: 0; transform: translate(0, 0); }
  68% { opacity: 1; }
  72.5% { opacity: 1; transform: translate(7em, -9em); }
  73%, 100% { opacity: 0; transform: translate(7em, -9em); }
}

/* ── the Class Saathi student clicker (foreground) ── */
.edu-st-clicker {
  position: absolute;
  left: 3%;
  bottom: 0;
  width: 15em;
  border-radius: 2.4em;
  padding: 1.3em;
  background: linear-gradient(165deg, #ffffff, #dbe3ec 85%);
  border: 2px solid #fff;
  box-shadow:
    0 2em 4.5em -1.4em rgba(2, 44, 34, 0.6),
    inset 0 1px 0 #fff;
  transform: rotate(-4deg);
  z-index: 3;
}
.edu-st-lcd {
  position: relative;
  height: 3.4em;
  border-radius: 0.8em;
  background: #0a1f16;
  border: 1px solid rgba(6, 78, 59, 0.5);
  overflow: hidden;
}
.edu-st-lcd i {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.85em;
  letter-spacing: 0.14em;
  color: #6ee7b7;
  opacity: 0;
  animation-duration: 16s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.edu-st-lcd .l1 { animation-name: edu-st-l1; }
.edu-st-lcd .l2 { animation-name: edu-st-l2; }
@keyframes edu-st-l1 {
  0%, 15.5% { opacity: 1; }
  16.5%, 48% { opacity: 0; }
  50%, 65.5% { opacity: 1; }
  66.5%, 100% { opacity: 0; }
}
@keyframes edu-st-l2 {
  0%, 16.5% { opacity: 0; }
  17.5%, 45% { opacity: 1; }
  46%, 66.5% { opacity: 0; }
  67.5%, 95% { opacity: 1; }
  96%, 100% { opacity: 0; }
}
.edu-st-keys {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  margin-top: 1.2em;
}
.edu-st-keys i {
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-weight: 700;
  font-size: 1.3em;
  color: #fff;
  border-bottom: 0.28em solid rgba(0, 0, 0, 0.28);
  box-shadow: 0 0.4em 1em rgba(2, 44, 34, 0.25);
}
.edu-st-keys .ka { background: #f43f5e; }
.edu-st-keys .kb { background: #0ea5e9; }
.edu-st-keys .kc { background: #f59e0b; }
.edu-st-keys .kd { background: #8b5cf6; }
/* the correct key of each beat visibly depresses (assigned in TSX from data) */
.edu-st-keys .press1 { animation: edu-st-press1 16s ease-in-out infinite; }
.edu-st-keys .press2 { animation: edu-st-press2 16s ease-in-out infinite; }
@keyframes edu-st-press1 {
  0%, 14.5% { transform: translateY(0); }
  15.5%, 17% { transform: translateY(0.22em); }
  18.5%, 100% { transform: translateY(0); }
}
@keyframes edu-st-press2 {
  0%, 64.5% { transform: translateY(0); }
  65.5%, 67% { transform: translateY(0.22em); }
  68.5%, 100% { transform: translateY(0); }
}
.edu-st-led {
  position: absolute;
  top: 1em;
  right: 1.5em;
  width: 0.55em;
  height: 0.55em;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
  opacity: 0.22;
  animation: edu-st-ledk 16s linear infinite;
}
@keyframes edu-st-ledk {
  0%, 15% { opacity: 0.22; }
  15.5%, 17.5% { opacity: 1; }
  18.5%, 65% { opacity: 0.22; }
  65.5%, 67.5% { opacity: 1; }
  68.5%, 100% { opacity: 0.22; }
}

/* ── floor ── */
.edu-st-floor { position: relative; height: 5em; margin-top: 1em; }
.edu-st-shadow {
  position: absolute;
  left: 50%;
  top: 0.4em;
  transform: translateX(-50%);
  width: 56%;
  height: 2em;
  background: radial-gradient(ellipse, rgba(2, 44, 34, 0.45), rgba(2, 44, 34, 0.18) 45%, transparent 72%);
}
.edu-st-pool {
  position: absolute;
  left: 13%;
  right: 13%;
  top: 0;
  height: 3em;
  background: radial-gradient(ellipse, rgba(16, 185, 129, 0.32), rgba(16, 185, 129, 0.12) 45%, transparent 72%);
}

/* ── reduced motion: frozen "results filled" frame of beat 1 ── */
@media (prefers-reduced-motion: reduce) {
  .edu-st-col *,
  .edu-st-col *::before,
  .edu-st-col *::after {
    animation: none !important;
    transition: none !important;
  }
  .edu-st-reveal { opacity: 1 !important; }
  .edu-st-boot { display: none; }
  .edu-st-beat.b1 { opacity: 1; }
  .edu-st-beat.b2 { opacity: 0; }
  .edu-st-bar { transform: scaleX(var(--w)); }
  .edu-st-count .c3 { opacity: 1; }
  .edu-st-chk { opacity: 1; transform: scale(1); }
  .edu-st-opt.is-correct { border-color: rgba(52, 211, 153, 0.75); background: rgba(6, 78, 59, 0.45); }
  .edu-st-ring, .edu-st-pkt { opacity: 0; }
  .edu-st-lcd .l1 { opacity: 0; }
  .edu-st-lcd .l2 { opacity: 1; }
  .edu-st-led { opacity: 1; }
  .edu-st-screen::after { display: none; }
}
```

- [ ] **Step 2: Write `components/education/hero/ClassroomStage.tsx`**

```tsx
"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./stage.css";
import { simulatorQuestions } from "@/data/education";

const OPTS = ["A", "B", "C", "D"] as const;

// Two question "beats" for the 16s loop — real entries from the simulator
// bank (Math + Science), so the decorative scene shows only vetted content.
const BEATS = [simulatorQuestions[0], simulatorQuestions[2]].map((q) => ({
  question: q.question,
  options: OPTS.map((o) => q.options[o]),
  correct: OPTS.indexOf(q.correct),
  // Result-bar widths: each option's share of the 23 simulated answers.
  widths: OPTS.map((o) => Math.round((q.classAnswers[o] / 23) * 100)),
}));

/** The education hero's right-half stage: a smartboard + student clicker
 *  running the classroom answer loop on a pure-CSS 16s clock (spec §B).
 *  React only wires the desktop 3D tilt — the loop runs without JS. */
export default function ClassroomStage() {
  const colRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // 3D mouse tilt: desktop fine-pointer viewports only, rAF-throttled —
  // identical guards to DisplayStage.
  useEffect(() => {
    const col = colRef.current;
    const tilt = tiltRef.current;
    if (!col || !tilt) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = col.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 4.5).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      tilt.style.transform = "rotateY(0deg) rotateX(0deg)";
    };
    col.addEventListener("mousemove", onMove);
    col.addEventListener("mouseleave", onLeave);
    return () => {
      col.removeEventListener("mousemove", onMove);
      col.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={colRef} className="edu-st-col w-full">
      <div className="edu-st-scale">
        {/* Everything visual is decorative; the H1/copy carry the information. */}
        <div aria-hidden="true">
          <div className="edu-st-persp">
            <div className="edu-st-glow" />
            <div ref={tiltRef} className="edu-st-tilt">
              <div className="edu-st-dust d1" />
              <div className="edu-st-dust d2" />
              <div className="edu-st-dust d3" />
              <div className="edu-st-dust d4" />
              <div className="edu-st-float">
                <div className="edu-st-stagebox">
                  <div className="edu-st-board edu-st-reveal">
                    <div className="edu-st-screen">
                      {BEATS.map((b, bi) => (
                        <div key={b.question} className={`edu-st-beat b${bi + 1}`}>
                          <div className="edu-st-bhead">
                            <span>CLASS SAATHI · LIVE QUIZ</span>
                            <span className="edu-st-count">
                              <i className="c1">answered 7/24</i>
                              <i className="c2">answered 16/24</i>
                              <i className="c3">answered 24/24</i>
                            </span>
                          </div>
                          <div className="edu-st-q">{b.question}</div>
                          <div className="edu-st-opts">
                            {b.options.map((opt, oi) => (
                              <div key={opt} className={`edu-st-opt ${oi === b.correct ? "is-correct" : ""}`}>
                                <span className="edu-st-key">{OPTS[oi]}</span>
                                <span className="edu-st-lbl">{opt}</span>
                                <span className="edu-st-track">
                                  <i
                                    className="edu-st-bar"
                                    style={{ "--w": String(b.widths[oi] / 100) } as CSSProperties}
                                  />
                                </span>
                                <span className="edu-st-chk">✓</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="edu-st-boot" />
                    </div>
                  </div>

                  {/* Bluetooth pulse rings + packets, clicker → board */}
                  <div className="edu-st-link">
                    <i className="edu-st-ring r1" />
                    <i className="edu-st-ring r2" />
                    <i className="edu-st-pkt k1" />
                    <i className="edu-st-pkt k2" />
                    <i className="edu-st-pkt k3" />
                  </div>

                  {/* Student clicker in the foreground; each beat's correct key
                      gets the matching press animation (press1/press2). */}
                  <div className="edu-st-clicker">
                    <i className="edu-st-led" />
                    <div className="edu-st-lcd">
                      <i className="l1">PRESS A–D</i>
                      <i className="l2">SENT ✓</i>
                    </div>
                    <div className="edu-st-keys">
                      {OPTS.map((letter, ki) => (
                        <i
                          key={letter}
                          className={[
                            `k${letter.toLowerCase()}`,
                            BEATS[0].correct === ki ? "press1" : "",
                            BEATS[1].correct === ki ? "press2" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {letter}
                        </i>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="edu-st-floor">
                  <div className="edu-st-pool" />
                  <div className="edu-st-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `components/education/EducationHero.tsx`**

Copy strings all come from `educationHero` — unchanged. The brochure `<Image>` is replaced by the stage.

```tsx
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import ClassroomStage from "./hero/ClassroomStage";
import { educationHero } from "@/data/education";

export default function EducationHero() {
  const words = educationHero.headline.split(" ");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/70 via-white to-white border-b border-gray-100">
      <div className="edu-dots-light" aria-hidden="true" />
      <div className="edu-aur edu-aur-a" aria-hidden="true" />
      <div className="edu-aur edu-aur-b" aria-hidden="true" />
      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6">
          <p className="edu-eyebrow edu-rise text-emerald-700 mb-4" style={{ animationDelay: "0.05s" }}>
            {educationHero.eyebrow}
          </p>
          <h1 className="edu-display text-4xl md:text-5xl font-bold text-gray-900 leading-[1.05] tracking-tight">
            {words.map((word, i) => (
              <span key={word} className="hero-word" style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
            <span
              className="hero-word edu-grad !block"
              style={{
                animationDelay: `${0.12 + words.length * 0.07}s`,
                // bg-clip-text + tight line-height clips descenders; add a
                // little vertical room and offset it (home-hero pattern).
                lineHeight: 1.18,
                paddingBottom: "0.08em",
                marginBottom: "-0.08em",
              }}
            >
              {educationHero.headlineAccent}
            </span>
          </h1>
          <p className="edu-rise mt-5 max-w-xl text-gray-600 text-base md:text-lg leading-relaxed" style={{ animationDelay: "0.4s" }}>
            {educationHero.sub}
          </p>
          <div className="edu-rise mt-6 flex flex-wrap gap-2" style={{ animationDelay: "0.5s" }}>
            {educationHero.chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 ring-1 ring-emerald-600/15 shadow-sm text-emerald-900 text-xs font-semibold"
              >
                <i className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>
          <div className="edu-rise mt-8 flex flex-col sm:flex-row gap-3" style={{ animationDelay: "0.6s" }}>
            <MagneticButton>
              <Link
                href="#simulator"
                className="edu-display inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-gray-900/10"
              >
                <Play size={16} aria-hidden="true" /> Try the live simulator
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="#lead-form"
                className="edu-display inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-800 hover:text-emerald-700 px-7 py-3.5 rounded-xl font-semibold transition-colors group"
              >
                Request a school demo
                <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </MagneticButton>
          </div>
        </div>
        <div className="lg:col-span-6">
          <ClassroomStage />
        </div>
      </div>
    </section>
  );
}
```

Note: `.hero-word` (word-rise) is global in `app/globals.css:258`. `!block` beats `.hero-word`'s `display: inline-block` for the accent line.

- [ ] **Step 4: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.
Runtime spot-check happens in Task 11; a quick `npx next build` is optional here if anything looks off.

- [ ] **Step 5: Commit**

```powershell
git add components/education/hero components/education/EducationHero.tsx
git commit -m "feat(education): pure-CSS classroom answer-loop hero stage"
```

---

### Task 3: Awards strip → premium trust band

**Files:**
- Modify: `components/education/AwardsStrip.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `AnimatedCounter` (`components/AnimatedCounter.tsx`, prop `value: string`), `edu-marquee*` classes, `educationAwards`/`educationTrustLine` (unchanged data).

- [ ] **Step 1: Rewrite `components/education/AwardsStrip.tsx`**

```tsx
import { Award } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { educationAwards, educationTrustLine, type EducationAward } from "@/data/education";

// Split the verified trust line around its number so AnimatedCounter can
// count it up without touching the data string.
function splitTrustLine() {
  const m = educationTrustLine.match(/^(.*?)([\d,]+\+?)(.*)$/);
  return m ? { pre: m[1], num: m[2], post: m[3] } : { pre: educationTrustLine, num: "", post: "" };
}

function MedallionCard({ award, dup = false }: { award: EducationAward; dup?: boolean }) {
  return (
    <div
      aria-hidden={dup || undefined}
      className={`${dup ? "edu-marquee-dup " : ""}flex items-center gap-4 w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4`}
    >
      <div className="w-11 h-11 shrink-0 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
        <Award size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{award.title}</p>
        <p className="edu-mono text-[10px] uppercase tracking-wider text-gray-400 mt-1">
          {award.issuer} · {award.year}
        </p>
      </div>
    </div>
  );
}

export default function AwardsStrip() {
  const { pre, num, post } = splitTrustLine();
  return (
    <section className="bg-white border-b border-gray-100 overflow-hidden" aria-label="Class Saathi awards and recognition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-16">
        <p className="edu-eyebrow text-center text-gray-400">Recognised across global education technology</p>
        <p className="edu-display text-center text-3xl md:text-4xl font-bold text-gray-900 mt-3">
          {pre}
          <span className="text-emerald-600">
            <AnimatedCounter value={num} />
          </span>
          {post}
        </p>
      </div>
      {/* Slow auto-scrolling medallion marquee; pauses on hover. Cards render
          twice for the seamless loop; reduced motion collapses to a static
          wrapped grid (education.css hides the duplicate set). */}
      <div className="edu-marquee py-12 md:py-14">
        <div className="edu-marquee-track px-4">
          {educationAwards.map((a) => (
            <MedallionCard key={a.title} award={a} />
          ))}
          {educationAwards.map((a) => (
            <MedallionCard key={`${a.title}-dup`} award={a} dup />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: `EducationAward` is already exported from `data/education.ts:11`. `educationTrustLine` = "Trusted in 15,000+ classrooms globally" → renders "Trusted in " + counter("15,000+") + " classrooms globally". AnimatedCounter's en-IN formatting renders 15000 as "15,000".

- [ ] **Step 2: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass (award count/shape tests untouched).

- [ ] **Step 3: Commit**

```powershell
git add components/education/AwardsStrip.tsx
git commit -m "feat(education): trust band with counting stat and awards medallion marquee"
```

---

### Task 4: Participation comparison → animated gap

**Files:**
- Modify: `components/education/ParticipationComparison.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `AnimatedCounter`, `AnimatedSection`, `InView` (Task 1), `edu-seat`/`edu-card-grad` classes, `participationComparison` (unchanged).

- [ ] **Step 1: Rewrite `components/education/ParticipationComparison.tsx`**

```tsx
import type { CSSProperties } from "react";
import { Check, X } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import AnimatedCounter from "@/components/AnimatedCounter";
import InView from "./InView";
import { participationComparison } from "@/data/education";

const SEATS = 20;
// Scattered "which seats participate" pattern for the before-card (8 of 20).
const BEFORE_LIT = new Set([0, 2, 5, 7, 10, 13, 16, 18]);

function SeatGrid({ litAll }: { litAll: boolean }) {
  return (
    <div className="mt-6 grid grid-cols-10 gap-1.5 max-w-55" aria-hidden="true">
      {Array.from({ length: SEATS }, (_, i) => (
        <i
          key={i}
          className={`edu-seat ${litAll || BEFORE_LIT.has(i) ? "" : "off"}`}
          style={{ "--i": String(i) } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default function ParticipationComparison() {
  const { before, after } = participationComparison;
  return (
    <section className="bg-gray-50 border-b border-gray-100 relative overflow-hidden">
      <div className="edu-dots-light" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="edu-eyebrow text-emerald-700 mb-3">The participation gap</p>
          <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            From a silent majority to a hundred-percent classroom
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <AnimatedSection className="h-full">
            <div className="h-full bg-white rounded-3xl border border-gray-200 p-8">
              <p className="edu-eyebrow text-gray-500">{before.title}</p>
              <p className="edu-display mt-4 text-5xl font-bold text-gray-300">
                <AnimatedCounter value={before.stat} />
              </p>
              <p className="text-sm text-gray-400 mt-1">{before.statLabel}</p>
              <InView>
                <SeatGrid litAll={false} />
              </InView>
              <ul className="mt-6 space-y-3">
                {before.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-gray-500">
                    <X size={16} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.12} className="h-full">
            <div className="edu-card-grad h-full rounded-3xl p-8">
              <p className="edu-eyebrow text-emerald-700">{after.title}</p>
              <p className="edu-display mt-4 text-5xl font-bold text-emerald-600">
                <AnimatedCounter value={after.stat} />
              </p>
              <p className="text-sm text-emerald-700/70 mt-1">{after.statLabel}</p>
              <InView>
                <SeatGrid litAll />
              </InView>
              <ul className="mt-6 space-y-3">
                {after.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.

- [ ] **Step 3: Commit**

```powershell
git add components/education/ParticipationComparison.tsx
git commit -m "feat(education): animated participation gap with counting stats and seat-dot grids"
```

---

### Task 5: How it works → connected timeline

**Files:**
- Modify: `components/education/HowItWorks.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `InView`, `edu-drawline` (path must set `pathLength="100"`), `howItWorksSteps` (unchanged), Lucide `ClipboardList`/`MousePointerClick`/`Database`/`Sparkles`.

- [ ] **Step 1: Rewrite `components/education/HowItWorks.tsx`**

```tsx
import { ClipboardList, Database, MousePointerClick, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import InView from "./InView";
import { howItWorksSteps } from "@/data/education";

// One Lucide glyph per brochure step (icons chrome per components/icons rules).
const STEP_ICONS = [ClipboardList, MousePointerClick, Database, Sparkles];

export default function HowItWorks() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="edu-eyebrow text-emerald-700 mb-3">In the classroom</p>
          <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            How Class Saathi works in class
          </h2>
        </div>
        <InView className="relative max-w-6xl mx-auto">
          {/* Connecting draw-line through the 4 icon nodes; draws on scroll
              (edu-drawline transition). Desktop only — cards stack below lg. */}
          <svg
            className="hidden lg:block absolute top-0 left-[12.5%] w-3/4 h-14 pointer-events-none z-[1]"
            viewBox="0 0 900 56"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 28 C 120 28 180 8 300 8 S 480 48 600 48 S 780 28 900 28"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength="100"
              className="edu-drawline"
            />
          </svg>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorksSteps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <AnimatedSection key={step.title} delay={i * 0.08} className="h-full">
                  <div className="h-full bg-gray-50 rounded-3xl border border-gray-100 p-6 pt-7">
                    <div className="relative z-[2] w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 ring-4 ring-white">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <p className="edu-mono text-[11px] uppercase tracking-[0.2em] text-emerald-700/70 mt-4">
                      Step 0{i + 1}
                    </p>
                    <h3 className="edu-display mt-1 text-base font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </InView>
      </div>
    </section>
  );
}
```

Layering note: the SVG (`z-[1]`) paints above the card backgrounds; each icon tile (`z-[2]`, white ring) reads as a node the line passes behind. The `top-0` + card `pt-7` puts the line at tile-center height (28px ≈ 7py + half of 56px tile ≈ card top + 28px — visually verified in Task 11).

- [ ] **Step 2: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.

- [ ] **Step 3: Commit**

```powershell
git add components/education/HowItWorks.tsx
git commit -m "feat(education): connected timeline with scroll draw-line and gradient icon nodes"
```

---

### Task 6: Ecosystem tabs → device frames

**Files:**
- Modify: `components/education/EcosystemTabs.tsx` (full rewrite below)

**Interfaces:**
- Consumes: `ecosystemTabs` (unchanged), framer-motion (already imported), `edu-eyebrow`/`edu-mono`/`edu-display`.

- [ ] **Step 1: Rewrite `components/education/EcosystemTabs.tsx`**

```tsx
"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ecosystemTabs } from "@/data/education";

/* Soft emerald glow shared by both frames (radial gradient, no blur filter). */
function FrameGlow() {
  return (
    <div
      aria-hidden="true"
      className="absolute -inset-10 bg-[radial-gradient(closest-side,rgba(16,185,129,0.16),transparent_72%)] pointer-events-none"
    />
  );
}

/* Phone bezel for the portrait student/parent screenshots. */
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-60">
      <FrameGlow />
      <div className="relative rounded-[2.4rem] bg-slate-900 p-2.5 shadow-2xl shadow-emerald-900/25">
        <div
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-2xl z-[1]"
        />
        {children}
      </div>
    </div>
  );
}

/* Browser chrome for the landscape teacher/admin dashboard screenshots. */
function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <FrameGlow />
      <div className="relative rounded-2xl bg-white shadow-2xl shadow-emerald-900/15 ring-1 ring-gray-200 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <i className="w-2.5 h-2.5 rounded-full bg-rose-400" aria-hidden="true" />
          <i className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          <i className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="ml-3 edu-mono text-[10px] text-gray-400 bg-white border border-gray-100 rounded-md px-2.5 py-0.5">
            Class Saathi · dashboard
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function EcosystemTabs() {
  const [activeId, setActiveId] = useState(ecosystemTabs[0].id);
  const active = ecosystemTabs.find((t) => t.id === activeId) ?? ecosystemTabs[0];
  // Phone screenshots (portrait) get the phone bezel; dashboards get browser chrome.
  const isPortrait = active.id === "student" || active.id === "parent";

  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="edu-eyebrow text-emerald-700 mb-3">One platform, four roles</p>
          <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Built for everyone in the school
          </h2>
        </div>

        <div role="tablist" aria-label="Class Saathi stakeholders" className="flex flex-wrap justify-center gap-2 mb-10">
          {ecosystemTabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className="relative px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="eduTabPill"
                    className="absolute inset-0 bg-gray-900 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-600 hover:text-gray-900"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12"
          >
            <div className="lg:col-span-6">
              <p className="edu-eyebrow text-emerald-700/80 mb-2">Class Saathi · {active.label}</p>
              <h3 className="edu-display text-2xl font-bold text-gray-900">{active.headline}</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{active.blurb}</p>
              <ul className="mt-6 space-y-4">
                {active.features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                      <p className="text-sm text-gray-500">{feature.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6 py-4">
              {isPortrait ? (
                <PhoneFrame>
                  <Image
                    src={active.image}
                    alt={active.imageAlt}
                    width={474}
                    height={975}
                    sizes="(max-width: 1024px) 60vw, 15rem"
                    className="w-full h-auto rounded-[1.9rem]"
                  />
                </PhoneFrame>
              ) : (
                <BrowserFrame>
                  <Image
                    src={active.image}
                    alt={active.imageAlt}
                    width={1200}
                    height={675}
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    className="w-full h-auto"
                  />
                </BrowserFrame>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.

- [ ] **Step 3: Commit**

```powershell
git add components/education/EcosystemTabs.tsx
git commit -m "feat(education): ecosystem screenshots in phone and browser device frames"
```

---

### Task 7: Simulator derived-stats helpers (TDD)

**Files:**
- Create: `components/education/simulator/seatMap.ts`
- Test: `components/education/simulator/seatMap.test.ts`

**Interfaces:**
- Consumes: `SimOption`, `SimQuestion`, `simulatorQuestions` from `@/data/education`.
- Produces (used by Tasks 8–9):
  - `CLASS_SIZE = 23`, `TOTAL_SEATS = 24`
  - `seatOrder(qid: number, n?: number): number[]` — deterministic permutation
  - `assignSeatAnswers(q: SimQuestion): SimOption[]` — 23 seat answers matching `classAnswers` exactly
  - `type AnsweredQuestion = { question: SimQuestion; yourAnswer: SimOption }`
  - `questionAccuracy(q: SimQuestion, yourAnswer: SimOption): number` — % of 24
  - `type SessionSummary = { score: number; total: number; classAvgPct: number; bestStreak: number }`
  - `sessionSummary(answered: AnsweredQuestion[]): SessionSummary`
  - `hardestQuestion(answered: AnsweredQuestion[]): AnsweredQuestion | null`
  - `currentStreak(answered: AnsweredQuestion[]): number`

- [ ] **Step 1: Write the failing test `components/education/simulator/seatMap.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { simulatorQuestions } from "@/data/education";
import {
  CLASS_SIZE,
  TOTAL_SEATS,
  seatOrder,
  assignSeatAnswers,
  questionAccuracy,
  sessionSummary,
  hardestQuestion,
  currentStreak,
} from "./seatMap";

describe("seatOrder", () => {
  it("returns a stable permutation of all seats", () => {
    const a = seatOrder(1);
    const b = seatOrder(1);
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: TOTAL_SEATS }, (_, i) => i));
  });

  it("varies by question id", () => {
    expect(seatOrder(1)).not.toEqual(seatOrder(2));
  });
});

describe("assignSeatAnswers", () => {
  it("deals exactly the question's classAnswers distribution across 23 seats", () => {
    for (const q of simulatorQuestions) {
      const seats = assignSeatAnswers(q);
      expect(seats).toHaveLength(CLASS_SIZE);
      const counts = { A: 0, B: 0, C: 0, D: 0 };
      seats.forEach((o) => counts[o]++);
      expect(counts).toEqual(q.classAnswers);
    }
  });
});

describe("questionAccuracy", () => {
  it("includes the visitor in the 24-seat denominator", () => {
    const q = simulatorQuestions[0]; // correct B; 16 of 23 simulated correct
    expect(questionAccuracy(q, "B")).toBe(Math.round((17 / 24) * 100));
    expect(questionAccuracy(q, "A")).toBe(Math.round((16 / 24) * 100));
  });
});

describe("session stats", () => {
  const q = (i: number) => simulatorQuestions[i];

  it("guards the empty session (teacher-view empty state)", () => {
    expect(sessionSummary([])).toEqual({ score: 0, total: 0, classAvgPct: 0, bestStreak: 0 });
    expect(hardestQuestion([])).toBeNull();
    expect(currentStreak([])).toBe(0);
  });

  it("scores, streaks and finds the hardest question of a mixed session", () => {
    const answered = [
      { question: q(0), yourAnswer: q(0).correct }, // right → 17/24
      { question: q(1), yourAnswer: q(1).correct }, // right → 15/24 (hardest)
      { question: q(2), yourAnswer: "A" as const }, // wrong (correct C) → 17/24
      { question: q(3), yourAnswer: q(3).correct }, // right → 19/24
    ];
    const s = sessionSummary(answered);
    expect(s.score).toBe(3);
    expect(s.total).toBe(4);
    expect(s.bestStreak).toBe(2);
    expect(currentStreak(answered)).toBe(1);
    expect(hardestQuestion(answered)?.question.id).toBe(2);
    // class average uses only the simulated 23 (visitor shown separately)
    const expectedAvg = Math.round(((16 / 23 + 14 / 23 + 17 / 23 + 18 / 23) / 4) * 100);
    expect(s.classAvgPct).toBe(expectedAvg);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run components/education/simulator/seatMap.test.ts`
Expected: FAIL — cannot resolve `./seatMap`.

- [ ] **Step 3: Write `components/education/simulator/seatMap.ts`**

```ts
import type { SimOption, SimQuestion } from "@/data/education";

/** Pure derived-stats helpers for the classroom simulator. Everything is
 *  computed client-side from the existing simulated classAnswers — no new
 *  content claims (spec §G "Data"). */

export const CLASS_SIZE = 23; // simulated students; the visitor is seat 24
export const TOTAL_SEATS = CLASS_SIZE + 1;

export interface AnsweredQuestion {
  question: SimQuestion;
  yourAnswer: SimOption;
}

export interface SessionSummary {
  score: number;
  total: number;
  classAvgPct: number;
  bestStreak: number;
}

/** Deterministic permutation of 0..n-1, varied per question id (tiny seeded
 *  LCG + Fisher-Yates) so seat patterns are stable across renders. */
export function seatOrder(qid: number, n: number = TOTAL_SEATS): number[] {
  const seats = Array.from({ length: n }, (_, i) => i);
  let seed = qid * 9973 + 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }
  return seats;
}

/** Deal the 23 simulated classAnswers onto seats 0..22, deterministically. */
export function assignSeatAnswers(q: SimQuestion): SimOption[] {
  const pool: SimOption[] = [];
  (["A", "B", "C", "D"] as SimOption[]).forEach((opt) => {
    for (let i = 0; i < q.classAnswers[opt]; i++) pool.push(opt);
  });
  const order = seatOrder(q.id, CLASS_SIZE);
  const seats = new Array<SimOption>(CLASS_SIZE);
  order.forEach((seat, i) => {
    seats[seat] = pool[i];
  });
  return seats;
}

/** Class accuracy for one question as % of all 24 seats, visitor included. */
export function questionAccuracy(q: SimQuestion, yourAnswer: SimOption): number {
  const correct = q.classAnswers[q.correct] + (yourAnswer === q.correct ? 1 : 0);
  return Math.round((correct / TOTAL_SEATS) * 100);
}

/** Session roll-up. classAvgPct averages the simulated class only — the
 *  visitor's score is shown alongside it, not mixed into it. */
export function sessionSummary(answered: AnsweredQuestion[]): SessionSummary {
  const total = answered.length;
  const score = answered.filter((a) => a.yourAnswer === a.question.correct).length;
  const classAvgPct =
    total === 0
      ? 0
      : Math.round(
          (answered.reduce((s, a) => s + a.question.classAnswers[a.question.correct] / CLASS_SIZE, 0) / total) * 100
        );
  let bestStreak = 0;
  let run = 0;
  for (const a of answered) {
    run = a.yourAnswer === a.question.correct ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
  }
  return { score, total, classAvgPct, bestStreak };
}

/** Hardest question so far = lowest class accuracy (visitor included).
 *  Null when nothing is answered yet (teacher-view empty state guard). */
export function hardestQuestion(answered: AnsweredQuestion[]): AnsweredQuestion | null {
  if (answered.length === 0) return null;
  return answered.reduce((worst, a) =>
    questionAccuracy(a.question, a.yourAnswer) < questionAccuracy(worst.question, worst.yourAnswer) ? a : worst
  );
}

/** Consecutive correct answers at the tail of the session (streak chip). */
export function currentStreak(answered: AnsweredQuestion[]): number {
  let n = 0;
  for (let i = answered.length - 1; i >= 0; i--) {
    if (answered[i].yourAnswer === answered[i].question.correct) n++;
    else break;
  }
  return n;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/education/simulator/seatMap.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Run the whole suite + lint**

Run: `npm test` → all pass. Run: `npm run lint` → 0 errors.

- [ ] **Step 6: Commit**

```powershell
git add components/education/simulator/seatMap.ts components/education/simulator/seatMap.test.ts
git commit -m "feat(education): deterministic seat-map and session stats for the classroom simulator"
```

---

### Task 8: Student-view simulator + landing wiring

**Files:**
- Create: `components/education/simulator/simulator.css`
- Create: `components/education/simulator/ClickerDevice.tsx`
- Create: `components/education/simulator/Smartboard.tsx`
- Create: `components/education/simulator/ClassroomSimulator.tsx` (student view; toggle arrives in Task 9)
- Modify: `components/education/EducationLanding.tsx` (band backdrop + dynamic import swap)
- Delete: `components/education/ClickerSimulator.tsx`

**Interfaces:**
- Consumes: Task 7 helpers, `simulatorQuestions`, framer-motion, `edu-sim-*` band classes (Task 1).
- Produces: `ClassroomSimulator` default export (no props); `type Phase = "idle" | "armed" | "transmitting" | "collecting" | "revealed" | "summary"` exported for children; `ClickerDevice`/`Smartboard` prop contracts as written below (Task 9 relies on `ClassroomSimulator`'s `answered`/`setView` state shape).

- [ ] **Step 1: Write `components/education/simulator/simulator.css`**

```css
/* ═══════════════════════════════════════════════════════════════════════════
   ClassroomSimulator — dark-band component rules (spec §G).
   Band backdrop lives in education.css (server-rendered); these classes style
   the interactive island: clicker press physics, transmit flight, collecting
   seats, confetti. Animations transform/opacity only; the transmit LED pulse
   is a paint-only micro-exception (6px dot).
   ═══════════════════════════════════════════════════════════════════════════ */

/* clicker shell: soft white, top sheen */
.edu-sim-shell {
  position: relative;
  background: linear-gradient(165deg, #ffffff, #d7dfe9 90%);
  border: 3px solid #fff;
  box-shadow: 0 28px 70px -24px rgba(0, 0, 0, 0.65), inset 0 1px 0 #fff;
}
.edu-sim-shell::before {
  content: "";
  position: absolute;
  inset: 6px 6px 60%;
  border-radius: 2rem 2rem 40% 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), transparent);
  pointer-events: none;
}
.edu-sim-lcd {
  background: #0a1f16;
  border: 1px solid rgba(6, 78, 59, 0.55);
}

/* answer-key press physics */
.edu-key {
  transition: transform 0.08s ease, box-shadow 0.08s ease, background-color 0.15s ease;
}
.edu-key:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.35);
}

/* transmit LED — paint-only micro-exception (6px dot) */
.edu-sim-led {
  position: absolute;
  top: 14px;
  right: 22px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}
.edu-sim-led.on {
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
  animation: edu-sim-blink 0.22s linear infinite;
}
@keyframes edu-sim-blink {
  50% { opacity: 0.35; }
}

/* transmit ripple rings, centered on the LCD */
.edu-sim-ring {
  position: absolute;
  top: 3.2rem;
  left: 50%;
  width: 3rem;
  height: 3rem;
  margin-left: -1.5rem;
  border: 2px solid rgba(52, 211, 153, 0.7);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}
.is-tx .edu-sim-ring { animation: edu-sim-ripple 0.45s ease-out; }
.is-tx .edu-sim-ring.r2 { animation-delay: 0.12s; }
@keyframes edu-sim-ripple {
  from { opacity: 0.9; transform: scale(0.5); }
  to { opacity: 0; transform: scale(1.9); }
}

/* packet flight strip between clicker and board:
   horizontal on lg, vertical when the columns stack */
.edu-sim-flight { position: relative; pointer-events: none; }
.edu-sim-flight i {
  position: absolute;
  left: 0;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
  opacity: 0;
}
.edu-sim-flight.is-tx i { animation: edu-sim-pkt-x 0.45s ease-in forwards; }
.edu-sim-flight.is-tx i:nth-child(2) { animation-delay: 0.09s; }
.edu-sim-flight.is-tx i:nth-child(3) { animation-delay: 0.18s; }
@keyframes edu-sim-pkt-x {
  from { opacity: 0; transform: translate(0, -50%); }
  15% { opacity: 1; }
  85% { opacity: 1; }
  to { opacity: 0; transform: translate(3.4rem, -50%); }
}
@keyframes edu-sim-pkt-y {
  from { opacity: 0; transform: translate(-50%, 0); }
  15% { opacity: 1; }
  85% { opacity: 1; }
  to { opacity: 0; transform: translate(-50%, 2.6rem); }
}
@media (max-width: 1023.98px) {
  .edu-sim-flight i { left: 50%; top: 0; }
  .edu-sim-flight.is-tx i { animation-name: edu-sim-pkt-y; }
}

/* collecting: 24-seat dot grid on the board */
.edu-sim-seat {
  display: block;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: background-color 0.18s ease, box-shadow 0.18s ease;
}
.edu-sim-seat.on {
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
}

/* live "class ready" dot */
.edu-sim-livedot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
  animation: edu-sim-pulse 2.4s ease-in-out infinite;
}
@keyframes edu-sim-pulse {
  50% { opacity: 0.4; }
}

/* confetti burst on a correct reveal */
.edu-sim-confetti {
  position: absolute;
  top: 12px;
  left: 22px;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 2;
}
.edu-sim-confetti i {
  position: absolute;
  width: 7px;
  height: 10px;
  border-radius: 2px;
  opacity: 1;
  animation: edu-sim-conf 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}
@keyframes edu-sim-conf {
  from { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  to { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); }
}

@media (prefers-reduced-motion: reduce) {
  .edu-sim-confetti { display: none; }
  .edu-sim-ring, .edu-sim-flight i { display: none; }
  .edu-sim-led.on, .edu-sim-livedot { animation: none !important; opacity: 1; }
  .edu-key, .edu-sim-seat { transition: none !important; }
}
```

- [ ] **Step 2: Write `components/education/simulator/ClickerDevice.tsx`**

```tsx
"use client";

import { RotateCcw } from "lucide-react";
import type { SimOption } from "@/data/education";
import type { Phase } from "./ClassroomSimulator";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];
// Key colours mirror the real clicker's rainbow keys (brochure p.2).
const KEY_COLORS: Record<SimOption, string> = {
  A: "bg-rose-500 hover:bg-rose-400 border-rose-700",
  B: "bg-sky-500 hover:bg-sky-400 border-sky-700",
  C: "bg-amber-500 hover:bg-amber-400 border-amber-700",
  D: "bg-violet-500 hover:bg-violet-400 border-violet-700",
};

interface Props {
  phase: Phase;
  selected: SimOption | null;
  onPick: (opt: SimOption) => void;
  onSubmit: () => void;
  onRestart: () => void;
}

export default function ClickerDevice({ phase, selected, onPick, onSubmit, onRestart }: Props) {
  const locked = phase === "transmitting" || phase === "collecting" || phase === "revealed" || phase === "summary";
  const lcdLine: Record<Phase, string> = {
    idle: "Press A, B, C or D",
    armed: `Ready: ${selected} — press Submit`,
    transmitting: "• • •",
    collecting: `Sent: ${selected}`,
    revealed: `Sent: ${selected}`,
    summary: "Session complete",
  };

  return (
    <div className={`edu-sim-shell relative w-full max-w-70 rounded-[2.5rem] p-6 ${phase === "transmitting" ? "is-tx" : ""}`}>
      <span className="edu-sim-ring r1" aria-hidden="true" />
      <span className="edu-sim-ring r2" aria-hidden="true" />
      <span className={`edu-sim-led ${phase === "transmitting" ? "on" : ""}`} aria-hidden="true" />
      <div className="edu-sim-lcd relative rounded-2xl p-4 mb-6 text-center min-h-20 flex flex-col justify-center">
        <p className="edu-mono text-[10px] uppercase tracking-widest text-emerald-500/60 mb-1">
          {phase === "transmitting" ? "Sending…" : phase === "revealed" ? "Answer sent" : "Class Saathi"}
        </p>
        <p className="edu-mono text-sm font-bold text-emerald-300" role="status" aria-live="polite">
          {lcdLine[phase]}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {OPTION_KEYS.map((opt) => (
          <button
            key={opt}
            onClick={() => onPick(opt)}
            disabled={locked}
            aria-label={`Answer ${opt}`}
            className={`edu-key aspect-square rounded-full text-2xl font-bold text-white border-b-4 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${KEY_COLORS[opt]} ${
              selected === opt ? "ring-4 ring-white/70 scale-105" : ""
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-400/40">
        <button
          onClick={onSubmit}
          disabled={phase !== "armed"}
          className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
        <button
          onClick={onRestart}
          className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw size={13} aria-hidden="true" /> Restart
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `components/education/simulator/Smartboard.tsx`**

```tsx
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, Flame, RotateCcw, XCircle } from "lucide-react";
import type { SimOption, SimQuestion } from "@/data/education";
import { TOTAL_SEATS, type SessionSummary } from "./seatMap";
import type { Phase } from "./ClassroomSimulator";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];

/** Percentage that counts up over ~700ms at reveal (instant under reduced motion). */
function CountUpPct({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 700, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{n}%</>;
}

/** Small CSS confetti burst (suppressed under reduced motion via CSS). */
function ConfettiBurst() {
  const pieces = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const dist = 46 + (i % 3) * 22;
    return {
      dx: `${Math.round(Math.cos(angle) * dist)}px`,
      dy: `${Math.round(Math.sin(angle) * dist - 30)}px`,
      rot: `${(i % 2 ? 1 : -1) * (120 + i * 20)}deg`,
      color: ["#34d399", "#38bdf8", "#fbbf24", "#a78bfa"][i % 4],
      delay: `${(i % 4) * 40}ms`,
    };
  });
  return (
    <span className="edu-sim-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={
            {
              "--dx": p.dx,
              "--dy": p.dy,
              "--rot": p.rot,
              background: p.color,
              animationDelay: p.delay,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

interface Props {
  question: SimQuestion;
  qIndex: number;
  total: number;
  phase: Phase;
  selected: SimOption | null;
  litSeats: Set<number>;
  collected: number;
  streak: number;
  isLast: boolean;
  summary: SessionSummary;
  onNext: () => void;
  onRestart: () => void;
}

export default function Smartboard({
  question,
  qIndex,
  total,
  phase,
  selected,
  litSeats,
  collected,
  streak,
  isLast,
  summary,
  onNext,
  onRestart,
}: Props) {
  const isCorrect = selected === question.correct;

  if (phase === "summary") {
    const yourPct = summary.total === 0 ? 0 : Math.round((summary.score / summary.total) * 100);
    return (
      <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between text-xs edu-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
          <span>Classroom smartboard · session summary</span>
          <span>Simulation</span>
        </div>
        <div className="my-auto text-center py-6">
          <p className="edu-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-4">Session complete</p>
          <p className="edu-display text-6xl font-bold text-white">
            {summary.score}
            <span className="text-slate-500">/{summary.total}</span>
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              ["Your score", `${yourPct}%`],
              ["Class average", `${summary.classAvgPct}%`],
              ["Best streak", `×${summary.bestStreak}`],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-4">
                <p className="edu-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className="edu-display text-2xl font-bold text-emerald-300 mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-gray-100 text-sm font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <RotateCcw size={15} aria-hidden="true" /> Restart
            </button>
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors group"
            >
              Request a school demo
              <ArrowRight size={15} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
      <div className="flex items-center justify-between text-xs edu-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
        <span>Classroom smartboard · {question.subject}</span>
        <span>
          Question {qIndex + 1} / {total}
        </span>
      </div>
      <h3 className="edu-display text-lg md:text-xl font-bold text-white leading-snug mb-6">{question.question}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {OPTION_KEYS.map((opt) => {
          const revealed = phase === "revealed";
          const correct = question.correct === opt;
          const chosen = selected === opt;
          return (
            <div
              key={opt}
              className={`p-4 rounded-2xl border text-sm flex items-start gap-3 transition-colors ${
                revealed && correct
                  ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-100"
                  : revealed && chosen
                  ? "bg-rose-950/70 border-rose-500/70 text-rose-100"
                  : chosen
                  ? "bg-emerald-900/30 border-emerald-500/50 text-white"
                  : "bg-slate-900 border-white/10 text-slate-300"
              }`}
            >
              <span className="w-6 h-6 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {opt}
              </span>
              <span>{question.options[opt]}</span>
            </div>
          );
        })}
      </div>

      {(phase === "idle" || phase === "armed") && (
        <div className="mt-auto flex items-center gap-2.5 edu-mono text-xs text-slate-400">
          <span className="edu-sim-livedot" aria-hidden="true" />
          {TOTAL_SEATS} students ready — waiting for your answer
        </div>
      )}

      {(phase === "transmitting" || phase === "collecting") && (
        <div className="mt-auto bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <p className="edu-mono text-[11px] text-slate-400 mb-3" role="status" aria-live="polite">
            {phase === "transmitting" ? "receiving…" : `answers ${collected}/${TOTAL_SEATS}`}
          </p>
          <div className="grid grid-cols-12 gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL_SEATS }, (_, i) => (
              <i key={i} className={`edu-sim-seat ${litSeats.has(i) ? "on" : ""}`} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "revealed" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative bg-slate-900/80 border border-white/10 rounded-2xl p-5"
          >
            {isCorrect && <ConfettiBurst />}
            <div className="flex items-start gap-3 mb-4">
              {isCorrect ? (
                <CheckCircle2 size={20} className="shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <XCircle size={20} className="shrink-0 text-rose-400" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                  {isCorrect ? "Correct!" : "Not quite."}
                  {streak >= 2 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 edu-mono text-[10px] px-2 py-0.5">
                      <Flame size={11} aria-hidden="true" /> ×{streak} in a row
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <p className="edu-mono text-[11px] text-slate-400">
                Class responses · {TOTAL_SEATS} students · simulated
              </p>
              {OPTION_KEYS.map((opt) => {
                const count = question.classAnswers[opt] + (selected === opt ? 1 : 0);
                const pct = Math.round((count / TOTAL_SEATS) * 100);
                return (
                  <div key={opt} className="flex items-center gap-3 text-xs">
                    <span className="w-4 text-right font-bold text-slate-400">{opt}</span>
                    <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${question.correct === opt ? "bg-emerald-500" : "bg-slate-600"}`}
                      />
                    </div>
                    <span className="w-16 text-right edu-mono text-slate-300">
                      <CountUpPct target={pct} /> ({count})
                    </span>
                    <span className="w-9">
                      {selected === opt && (
                        <span className="edu-mono text-[9px] uppercase tracking-wider text-emerald-400 border border-emerald-500/40 rounded-full px-1.5 py-px">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "revealed" && (
        <button
          onClick={onNext}
          className="mt-5 ml-auto inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {isLast ? "See session summary" : "Next question"} <ChevronRight size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write `components/education/simulator/ClassroomSimulator.tsx`** (student view; Task 9 adds the toggle + teacher view)

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { simulatorQuestions, type SimOption } from "@/data/education";
import { currentStreak, seatOrder, sessionSummary, TOTAL_SEATS, type AnsweredQuestion } from "./seatMap";
import ClickerDevice from "./ClickerDevice";
import Smartboard from "./Smartboard";
import "./simulator.css";

export type Phase = "idle" | "armed" | "transmitting" | "collecting" | "revealed" | "summary";

const TRANSMIT_MS = 450;
const COLLECT_MS = 2500;

export default function ClassroomSimulator() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<SimOption | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [collected, setCollected] = useState(0);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (ticker.current) {
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const question = simulatorQuestions[qIndex];
  const isLast = qIndex === simulatorQuestions.length - 1;

  const pick = (opt: SimOption) => {
    if (phase !== "idle" && phase !== "armed") return;
    setSelected(opt);
    setPhase("armed");
  };

  const submit = () => {
    if (phase !== "armed" || !selected) return;
    const sel = selected;
    const finalize = () => {
      setCollected(TOTAL_SEATS);
      setAnswered((a) => [...a, { question, yourAnswer: sel }]);
      setPhase("revealed");
    };
    setPhase("transmitting");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.push(
      setTimeout(() => {
        // Reduced motion skips the collecting theater straight to the reveal.
        if (reduced) {
          finalize();
          return;
        }
        setPhase("collecting");
        setCollected(1);
        ticker.current = setInterval(() => {
          setCollected((c) => {
            if (c + 1 >= TOTAL_SEATS) {
              if (ticker.current) {
                clearInterval(ticker.current);
                ticker.current = null;
              }
              // brief beat on the full grid before the reveal
              timers.current.push(setTimeout(finalize, 250));
              return TOTAL_SEATS;
            }
            return c + 1;
          });
        }, COLLECT_MS / TOTAL_SEATS);
      }, TRANSMIT_MS)
    );
  };

  const next = () => {
    if (phase !== "revealed") return;
    if (isLast) {
      setPhase("summary");
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setCollected(0);
    setPhase("idle");
  };

  const restart = () => {
    clearTimers();
    setQIndex(0);
    setSelected(null);
    setCollected(0);
    setAnswered([]);
    setPhase("idle");
  };

  // Deterministic per-question light-up order for the collecting seat grid.
  const litSeats = new Set(seatOrder(question.id).slice(0, collected));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_4.5rem_minmax(0,7fr)] items-stretch">
      <div className="flex flex-col items-center justify-center">
        <p className="edu-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400/70 mb-4">
          Your clicker
        </p>
        <ClickerDevice phase={phase} selected={selected} onPick={pick} onSubmit={submit} onRestart={restart} />
      </div>
      <div className={`edu-sim-flight h-12 lg:h-auto ${phase === "transmitting" ? "is-tx" : ""}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <Smartboard
        question={question}
        qIndex={qIndex}
        total={simulatorQuestions.length}
        phase={phase}
        selected={selected}
        litSeats={litSeats}
        collected={collected}
        streak={currentStreak(answered)}
        isLast={isLast}
        summary={sessionSummary(answered)}
        onNext={next}
        onRestart={restart}
      />
    </div>
  );
}
```

- [ ] **Step 5: Update `components/education/EducationLanding.tsx`** (full file)

```tsx
import dynamic from "next/dynamic";
import { breadcrumbLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { educationFaqs } from "@/data/education";
import { spaceGrotesk, plexMono } from "@/app/fonts-accent";
import EducationHero from "./EducationHero";
import AwardsStrip from "./AwardsStrip";
import ParticipationComparison from "./ParticipationComparison";
import HowItWorks from "./HowItWorks";
import EcosystemTabs from "./EcosystemTabs";
import EducationFaq from "./EducationFaq";
import ClosingCta from "./ClosingCta";
import "./education.css";

// Code-split the interactive islands so the landing stays light.
const ClassroomSimulator = dynamic(() => import("./simulator/ClassroomSimulator"));
const BlueprintLeadForm = dynamic(() => import("./BlueprintLeadForm"));

export default function EducationLanding() {
  const jsonLd = [
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Education", url: "/categories/education" },
    ]),
    faqPageLd(educationFaqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <main className={`${spaceGrotesk.variable} ${plexMono.variable} min-h-screen bg-white`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <EducationHero />
      <AwardsStrip />
      <ParticipationComparison />
      <HowItWorks />
      <EcosystemTabs />

      {/* The page's single dark band — the live classroom theater. */}
      <section
        id="simulator"
        className="edu-sim-band relative overflow-hidden scroll-mt-24 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950"
      >
        <div className="edu-sim-dots" aria-hidden="true" />
        <div className="edu-sim-aur edu-sim-aur-a" aria-hidden="true" />
        <div className="edu-sim-aur edu-sim-aur-b" aria-hidden="true" />
        <div className="edu-sim-noise" aria-hidden="true" />
        <div className="edu-sim-vignette" aria-hidden="true" />
        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="edu-eyebrow text-emerald-400 mb-3">Live simulator</p>
            <h2 className="edu-display text-3xl md:text-4xl font-bold text-white leading-tight">
              Try the clicker yourself
            </h2>
            <p className="mt-3 text-slate-400 text-sm md:text-base">
              Press a key, submit your answer, and watch the class results come in — exactly the loop students
              experience.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 edu-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Simulation · sample class data
            </p>
          </div>
          <ClassroomSimulator />
        </div>
      </section>

      {/* Lead capture */}
      <section id="lead-form" className="scroll-mt-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <BlueprintLeadForm />
        </div>
      </section>

      <EducationFaq />
      <ClosingCta />
    </main>
  );
}
```

- [ ] **Step 6: Delete the old simulator**

```powershell
git rm components/education/ClickerSimulator.tsx
```

- [ ] **Step 7: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.
Run: `npm run build` → compiles clean (first full build since the dynamic-import swap).

- [ ] **Step 8: Commit**

```powershell
git add components/education/simulator components/education/EducationLanding.tsx
git commit -m "feat(education): dual-column classroom simulator with collecting theater, streaks and session summary"
```

---

### Task 9: Teacher view + Student/Teacher toggle

**Files:**
- Create: `components/education/simulator/TeacherDashboard.tsx`
- Modify: `components/education/simulator/ClassroomSimulator.tsx` (add view state + toggle + crossfade)

**Interfaces:**
- Consumes: `assignSeatAnswers`, `hardestQuestion`, `questionAccuracy`, `TOTAL_SEATS`, `AnsweredQuestion` (Task 7); framer-motion.
- Produces: `TeacherDashboard({ answered, onGoStudent })`; `type View = "student" | "teacher"` exported from `ClassroomSimulator`.

- [ ] **Step 1: Write `components/education/simulator/TeacherDashboard.tsx`**

```tsx
"use client";

import { BarChart3, Users } from "lucide-react";
import { simulatorQuestions, type SimOption } from "@/data/education";
import {
  assignSeatAnswers,
  hardestQuestion,
  questionAccuracy,
  TOTAL_SEATS,
  type AnsweredQuestion,
} from "./seatMap";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];

interface Props {
  answered: AnsweredQuestion[];
  onGoStudent: () => void;
}

/** Teacher-side render of the same simulated session. Seats are anonymous
 *  ("Seat 01–24", spec hard constraint) — seat 24 is the visitor. */
export default function TeacherDashboard({ answered, onGoStudent }: Props) {
  // Divide-by-zero guard: nothing answered yet → empty state (spec §G).
  if (answered.length === 0) {
    return (
      <div className="bg-slate-950 rounded-3xl border border-white/10 p-10 md:p-14 text-center">
        <Users size={28} className="mx-auto text-slate-600" aria-hidden="true" />
        <h3 className="edu-display mt-4 text-xl font-bold text-white">No responses yet</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          The teacher dashboard fills in as the class answers. Switch to the Student view and answer your first
          question.
        </p>
        <button
          onClick={onGoStudent}
          className="mt-6 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          Go to Student view
        </button>
      </div>
    );
  }

  const latest = answered[answered.length - 1];
  const seats = assignSeatAnswers(latest.question);
  const hardest = hardestQuestion(answered)!;
  const hardestPct = questionAccuracy(hardest.question, hardest.yourAnswer);
  const yourOk = latest.yourAnswer === latest.question.correct;

  const seatCard = (ok: boolean, label: string, you = false) => (
    <div
      className={`rounded-lg border px-1.5 py-1.5 text-center ${
        ok
          ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
          : "bg-rose-950/40 border-rose-500/30 text-rose-300"
      } ${you ? "ring-1 ring-emerald-400/50" : ""}`}
    >
      <span className={`block edu-mono text-[9px] uppercase tracking-wider ${you ? "text-emerald-400/80" : "text-slate-500"}`}>
        {label}
      </span>
      <span className="text-xs font-bold">{ok ? "✓" : "✗"}</span>
    </div>
  );

  return (
    <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs edu-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
        <span>Teacher dashboard · simulated session</span>
        <span>
          {answered.length} / {simulatorQuestions.length} questions answered
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 24-seat response grid for the latest answered question */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-white/10 rounded-2xl p-5">
          <p className="edu-mono text-[11px] text-slate-400 mb-1">
            Latest question · {latest.question.subject}
          </p>
          <p className="text-sm text-slate-200 font-semibold mb-4 leading-snug">{latest.question.question}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {seats.map((ans, i) =>
              (
                <div key={i}>
                  {seatCard(ans === latest.question.correct, `Seat ${String(i + 1).padStart(2, "0")}`)}
                </div>
              )
            )}
            <div>{seatCard(yourOk, "Seat 24 · you", true)}</div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          {/* Per-question accuracy + answer distribution */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
            <p className="edu-mono text-[11px] text-slate-400 mb-3">Per-question accuracy</p>
            <div className="space-y-3.5">
              {answered.map((a) => {
                const pct = questionAccuracy(a.question, a.yourAnswer);
                return (
                  <div key={a.question.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        Q{a.question.id} · {a.question.subject}
                      </span>
                      <span className="edu-mono text-slate-400">{pct}% correct</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    {/* answer-distribution mini-bars (A–D shares of 24) */}
                    <div className="mt-1.5 flex gap-1" aria-hidden="true">
                      {OPTION_KEYS.map((opt) => {
                        const count = a.question.classAnswers[opt] + (a.yourAnswer === opt ? 1 : 0);
                        return (
                          <i
                            key={opt}
                            className={`h-1 rounded-full ${opt === a.question.correct ? "bg-emerald-500" : "bg-slate-600"}`}
                            style={{ width: `${(count / TOTAL_SEATS) * 100}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardest question so far */}
          <div className="bg-amber-950/30 border border-amber-500/25 rounded-2xl p-5">
            <p className="edu-mono text-[11px] text-amber-400/90 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <BarChart3 size={12} aria-hidden="true" /> Hardest question so far
            </p>
            <p className="text-sm text-slate-200 font-semibold leading-snug">{hardest.question.question}</p>
            <p className="mt-1 text-xs text-slate-400">{hardestPct}% of the class answered correctly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the toggle to `ClassroomSimulator.tsx`**

Add imports:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import TeacherDashboard from "./TeacherDashboard";
```

Add below the `Phase` type:

```tsx
export type View = "student" | "teacher";
```

Add view state next to the others:

```tsx
  const [view, setView] = useState<View>("student");
```

Replace the `return (...)` with:

```tsx
  return (
    <div>
      {/* Student / Teacher segmented toggle (spec §G) */}
      <div className="flex justify-center mb-10">
        <div
          role="tablist"
          aria-label="Simulator view"
          className="inline-flex items-center gap-1 bg-slate-900/80 ring-1 ring-white/10 rounded-full p-1"
        >
          {(["student", "teacher"] as View[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`edu-mono px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                view === v ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {v === "student" ? "Student" : "Teacher"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "student" ? (
          <motion.div
            key="student"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_4.5rem_minmax(0,7fr)] items-stretch"
          >
            <div className="flex flex-col items-center justify-center">
              <p className="edu-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400/70 mb-4">
                Your clicker
              </p>
              <ClickerDevice phase={phase} selected={selected} onPick={pick} onSubmit={submit} onRestart={restart} />
            </div>
            <div className={`edu-sim-flight h-12 lg:h-auto ${phase === "transmitting" ? "is-tx" : ""}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <Smartboard
              question={question}
              qIndex={qIndex}
              total={simulatorQuestions.length}
              phase={phase}
              selected={selected}
              litSeats={litSeats}
              collected={collected}
              streak={currentStreak(answered)}
              isLast={isLast}
              summary={sessionSummary(answered)}
              onNext={next}
              onRestart={restart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="teacher"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <TeacherDashboard answered={answered} onGoStudent={() => setView("student")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
```

- [ ] **Step 3: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.

- [ ] **Step 4: Commit**

```powershell
git add components/education/simulator
git commit -m "feat(education): teacher dashboard view with anonymous 24-seat grid and session analytics"
```

---

### Task 10: FAQ, closing CTA, lead form restyle

**Files:**
- Modify: `components/education/EducationFaq.tsx` (full rewrite below)
- Modify: `components/education/ClosingCta.tsx` (full rewrite below)
- Modify: `components/education/BlueprintLeadForm.tsx` (two classNames only)

- [ ] **Step 1: Rewrite `components/education/EducationFaq.tsx`**

```tsx
import { ChevronRight } from "lucide-react";
import { educationFaqs } from "@/data/education";

export default function EducationFaq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-gray-50 border-b border-gray-100 relative overflow-hidden"
      aria-labelledby="education-faq-heading"
    >
      <div className="edu-dots-light" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2
          id="education-faq-heading"
          className="edu-display text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center"
        >
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {educationFaqs.map((faq, i) => (
            <details
              key={faq.q}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-sm open:shadow-lg open:border-emerald-200 transition-shadow"
            >
              <summary className="flex items-center gap-4 cursor-pointer list-none px-6 py-5">
                <span className="edu-mono text-[11px] font-medium text-emerald-700/70 tracking-wider" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-semibold text-gray-900">{faq.q}</span>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-emerald-600 transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <div className="edu-faq-body px-6 pb-5 pl-[4.1rem] -mt-1 text-sm text-gray-600 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

(`details`/`summary` semantics kept; open animates via `edu-faq-body`; `pl-[4.1rem]` aligns the answer under the question text past the mono number.)

- [ ] **Step 2: Rewrite `components/education/ClosingCta.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { educationClosing } from "@/data/education";

export default function ClosingCta() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="rounded-3xl bg-linear-to-br from-emerald-700 to-emerald-900 px-8 py-12 md:px-14 md:py-16 text-center relative overflow-hidden">
          <div className="edu-cta-dots" aria-hidden="true" />
          <div className="edu-cta-aur a" aria-hidden="true" />
          <div className="edu-cta-aur b" aria-hidden="true" />
          <h2 className="edu-display relative text-3xl md:text-4xl font-bold text-white leading-tight">
            {educationClosing.headline}
          </h2>
          <p className="relative mt-3 text-emerald-100/90 text-sm md:text-base max-w-xl mx-auto">
            {educationClosing.sub}
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <MagneticButton>
              <Link
                href="#simulator"
                className="edu-display inline-flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-7 py-3.5 rounded-xl font-semibold transition-colors"
              >
                <Play size={16} aria-hidden="true" /> Try the live simulator
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="#lead-form"
                className="edu-display inline-flex items-center justify-center gap-2 bg-emerald-600/40 border border-emerald-400/40 text-white hover:bg-emerald-600/60 px-7 py-3.5 rounded-xl font-semibold transition-colors group"
              >
                Request a school demo
                <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </MagneticButton>
          </div>
        </div>
        {/* Trademark attribution — end of page content, above the site footer. */}
        <p className="mt-8 text-center text-xs text-gray-400">{educationClosing.trademark}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Light-touch `BlueprintLeadForm.tsx`**

Only two className edits (structure/pipeline untouched):

- `components/education/BlueprintLeadForm.tsx:96` eyebrow:
  `"text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3"` → `"edu-eyebrow text-emerald-700 mb-3"`
- `components/education/BlueprintLeadForm.tsx:97-99` h2:
  `"text-3xl md:text-4xl font-bold text-gray-900 leading-tight"` → `"edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight"`

- [ ] **Step 4: Verify**

Run: `npm run lint` → 0 errors. Run: `npm test` → pass.

- [ ] **Step 5: Commit**

```powershell
git add components/education/EducationFaq.tsx components/education/ClosingCta.tsx components/education/BlueprintLeadForm.tsx
git commit -m "feat(education): premium FAQ cards, aurora closing CTA and lead-form type alignment"
```

---

### Task 11: Full verification

- [ ] **Step 1: Suite + build**

Run: `npm test` → all pass. Run: `npm run build` → clean (no type errors, `/categories/education` prerendered).

- [ ] **Step 2: Runtime drive (project `verify` skill)**

Use the `verify` skill's build/launch/drive recipe. Check on `/categories/education`:
1. Hero: word-rise H1, animated gradient accent line, stage loop cycles both beats (key press → rings/packets → bars → counter 24/24 → check → crossfade), tilt on desktop.
2. Awards: counter counts to 15,000+, marquee scrolls, pauses on hover.
3. Comparison: 40%/100% count up in view; seat dots stagger (8 vs 20).
4. Timeline: line draws on scroll; 4 gradient icon nodes.
5. Tabs: all four render in correct frame type (phone: student/parent; browser: teacher/admin); spring entrance.
6. Simulator full student flow: pick → submit → transmit packets → collecting grid ticks answers N/24 → reveal (bars, count-up, You marker, explanation); wrong answer shows no confetti; correct shows confetti + streak chip at ×2; after the final question (Q5) the summary card (score, class average, best streak, Restart + Request a school demo).
7. Teacher view: empty state before any answer; after answers — seat grid (Seat 01–24, seat 24 ring), per-question accuracy bars, hardest-question callout; toggle crossfades.
8. Reduced motion (DevTools emulation): hero frozen on "results filled", marquee static grid, simulator skips collecting, no confetti.
9. Mobile (~390px): stage scales, simulator stacks vertically with vertical packet flight.
10. Kill the dev/start server by port PID when done (Windows TaskStop memory).

- [ ] **Step 3: Lighthouse sanity**

Fresh `npm run build` + `npm run start`, then Lighthouse against `/categories/education` — performance within a few points of the pre-redesign baseline; no new CLS from the stage (aspect-ratio boxes reserve space). Kill the server after.

- [ ] **Step 4: Fix anything found, re-run, commit fixes**

---

## Self-review notes

- Spec coverage: §A→Task 1, §B→Task 2, §C→Task 3, §D→Task 4, §E→Task 5, §F→Task 6, §G→Tasks 7–9, §H→Task 10, Engineering/Error-handling/Testing→Tasks 7–11. Old `ClickerSimulator` deleted in Task 8.
- Deviation from spec file list (recorded): `InView.tsx` + `seatMap.ts` added (in-view CSS triggers need one tiny client hook; derived stats extracted pure for TDD). `SimQuestion` type import in components is type-only.
- Teacher-view "–" state: represented by the empty state (nothing answered) — per-seat "–" never occurs because the dashboard only renders answered questions; noted as an accepted interpretation.
