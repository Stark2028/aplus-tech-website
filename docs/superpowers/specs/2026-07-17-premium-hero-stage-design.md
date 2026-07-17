# Premium Hero — "The Display Is the Stage" (Composition A, V3)

**Date:** 2026-07-17
**Status:** Approved visually by user via interactive mockups; spec pending user review
**Mockup of record:** `.superpowers/brainstorm/1701-1784238270/content/hero-a-premium-v3.html` (open via the brainstorm companion or directly in a browser)

## 1. Goal

Give the homepage a signature, ownable visual identity rooted in the product we sell: the hero's empty right half becomes a **stage** where a rendered display morphs through four real product form factors, each playing believable content. This closes the one gap identified in the unitedfins.com comparison (distinctiveness) without touching the things we already win on (conversion layout, SEO, performance).

Decisions already made with the user (do not re-litigate):

- Identity root: **the product — displays & pixels** (not cultural motifs, logo geometry, or illustration scenes).
- Hero concept: **C — "The Display Is the Stage"**, chosen over video-wall-grid background and LED-matrix typography.
- Composition: **A — Split Stage.** Copy + CTAs stay left exactly as today; stage occupies the right half. (B "cinematic center" was rejected for fold risk.)
- Fidelity: **V3** — real scene content + typography system. User confirmed satisfied: "start with this".
- Phase 2 (separate spec later): spread the premium language site-wide (home sections, products listing + detail, solutions/about/contact, quote + finder flows — user selected all).

## 2. What stays untouched (constraints)

- H1 text, sr-only keyword span, supporting paragraph, CTA labels/targets, stats values — **zero copy changes** (SEO surface is mid-migration; see memory `migration-to-aplustechsol`).
- `HeroSection.tsx` remains a server component; the stage mounts as a client island.
- Mobile sticky CTA bar, chat launcher, navbar: untouched.
- No new raster images; the entire stage is DOM + CSS + inline SVG.

## 3. Architecture

```
components/sections/HeroSection.tsx        (server, edited: grid layout + fonts)
components/sections/hero/
  DisplayStage.tsx      "use client" — stage container: tilt, channel state, chips
  stage.css             all stage keyframes/classes (imported by DisplayStage)
  scenes/RetailScene.tsx    CH·01 — retail campaign on slim-bezel signage
  scenes/NocScene.tsx       CH·02 — NOC dashboard on 2×2 video wall (seams)
  scenes/HotelScene.tsx     CH·03 — hotel TV home UI on TV w/ neck+base stand
  scenes/FlipScene.tsx      CH·04 — whiteboard on Flip w/ easel legs + wheels
```

- **Channel cycling is pure CSS** (20s loop, 5s per channel, staggered `animation-delay` — the proven mockup pattern). React state is used only for *manual mode*: clicking a chip adds a `manual` class + `on` markers; “▶ AUTO” removes them. No timers in JS for the loop.
- Suggested hook: `useStageChannel()` returning `{manualIndex, select, resumeAuto}` — trivially unit-testable.
- Everything synced to the loop (product groups, ambient glows, floor pools, OSD tags, chip progress bars) uses the same 20s keyframe timing with 0/5/10/15s delays.

## 4. Typography

- **Space Grotesk** (500/700 via `next/font/google`) — hero H1 + CTA labels. Scoped to the hero in phase 1; site-wide heading swap is a phase-2 decision (site currently loads Inter + Plus Jakarta Sans).
- **IBM Plex Mono** (400/500) — badge, OSD, scene captions, chips, dashboard figures. This is the "precision instrument" accent and becomes a site-wide token in phase 2.
- **Caveat** (600) — FlipScene handwriting only.
- All via `next/font` (self-hosted, `variable:` CSS custom properties `--font-display`, `--font-mono`, `--font-hand`). No CDN font links.

## 5. Motion spec

Entrance (once per load):
1. 0.15s badge rises → 0.30/0.45/0.60s H1 lines lift (reuse/extend existing `.hero-word` pattern) → 0.75s subcopy → 0.90s CTAs
2. 1.15s screen **power-on**: bright horizontal line expands then fades
3. 1.95s stage content reveals; loop begins

Loop (every 5s per channel): crossfade + 0.965→1 scale morph between product form factors; broadcast **OSD** ("CH·01 SMART SIGNAGE" …) flashes top-right ~2.6s; bezel rim-light and **floor light pool** re-color per channel (blue → teal → amber → silver); glass **sheen** sweeps each screen every 9s; stage **floats** ±8px over 8s; aurora blobs drift behind; dust motes at different `translateZ` depths.

In-scene motion: retail marquee + QLED color drift + ken-burns; NOC chart draw, KPI bars, radar pings, log ticker; hotel typing welcome + golden focus ring stepping across app tiles; whiteboard path drawing + sticky notes popping.

Interaction: 3D mouse tilt (±6°/±4.5°, rAF-throttled, desktop pointer:fine only); chips are buttons that jump channels & pause; ▶ AUTO resumes; CTA hover sheen (existing MagneticButton preserved).

`prefers-reduced-motion`: all animations off; CH·01 shown statically; content fully visible.

## 6. Responsive

- `lg+`: two-column grid (copy | stage), stage ~560px wide, tilt on.
- `<lg`: stage renders **below** CTAs at reduced height (~260px), tilt off, loop on. If Core Web Vitals regress on mobile, the stage may be gated to `lg+` — measure before deciding.
- Known QA item: the 390px screenshot showed the subheadline clipped a few px on the right (`Smart Signag…`). Diagnose and fix while in the hero (suspect `sm:whitespace-nowrap` on the gradient span or badge overflow).

## 7. Accessibility

- Stage visuals wrapper: `aria-hidden="true"` (purely decorative; all information exists in H1/copy).
- Chips live **outside** the aria-hidden wrapper as real `<button>`s: `aria-pressed`, labels "Preview: Smart Signage" etc. Focus styles per site conventions.
- OSD/captions decorative (inside hidden wrapper). Contrast of chip text ≥ 4.5:1.

## 8. Performance budget

- Loop animations restricted to `opacity`/`transform`. Ambient glows/pools: prefer **soft radial-gradients over `filter: blur()`** on large elements (mockup used blur; production shouldn't). Film grain = one tiny inline SVG data-URI, static.
- No images ⇒ LCP stays the H1 text; stage box has fixed height ⇒ CLS 0. Client JS ≈ chip state + tilt handler only (~2–3 KB); no framer-motion in the stage.
- `content-visibility` not needed (above fold). Validate with Lighthouse before/after on mobile + desktop.

## 9. Analytics & testing

- PostHog events: `hero_stage_channel_click` (channel), `hero_stage_auto_resume`.
- Vitest: `useStageChannel` logic (select → manual, resume → auto).
- Runtime verification via the `verify` skill: screenshots at 1440×900 and 390×844, a reduced-motion pass, chip-click behavior, and `npx tsc --noEmit`.

## 10. Build notes

- Current branch `feat/live-chat` has uncommitted in-progress work — **do not commit this spec or hero work there.** Default plan: implement in a **git worktree** on a new `feat/premium-hero` branch cut from `master`, leaving this checkout (and its running dev server) untouched; commit this spec as that branch's first commit. If live-chat merges first, a plain branch works too.
- Stats data (`500+ / 5+ / 10,000+ / 100%`) and `AnimatedCounter` unchanged.
- The V3 mockup is the visual source of truth; translate its CSS into `stage.css` with Tailwind used only for layout-level classes.

## 11. Out of scope (phase 2 — separate spec)

Site-wide premium system: bezel-frame product-card hover language, mono label/eyebrow system, section header treatment, solutions/about storytelling using the device-frame motif, quote/finder wizard styled as channels, global heading-font decision, footer polish. Phase 2 begins with its own short brainstorm once the hero ships.
