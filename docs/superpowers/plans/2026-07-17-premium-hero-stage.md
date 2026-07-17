# Premium Hero — "The Display Is the Stage" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero's empty right half with a CSS-driven "display stage" that morphs through four Samsung product form factors (signage → video wall → hotel TV → Flip whiteboard), each playing believable scene content, per the approved V3 mockup.

**Architecture:** `HeroSection.tsx` stays a server component and gains a two-column grid + the three `next/font` families; the stage mounts as one client island (`DisplayStage.tsx`) that imports a single global stylesheet (`stage.css`) holding every keyframe. The 20s channel loop is pure CSS (staggered `animation-delay`); React state exists only for manual chip mode (a `stg-manual` class + `on` markers) and the rAF-throttled 3D tilt.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4 (layout classes only — all stage visuals are hand-written CSS), `next/font/google` (Space Grotesk, IBM Plex Mono, Caveat), posthog-js/react, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-17-premium-hero-stage-design.md` (committed in Task 1).
**Visual source of truth:** `.superpowers/brainstorm/1701-1784238270/content/hero-a-premium-v3.html` in the *original* checkout (`c:\Users\samee\b2b-website`, untracked, NOT copied to the worktree). All of its CSS is already translated into the code blocks below — you do not need the mockup to execute this plan.

## Global Constraints

- **Zero copy changes**: H1 text, sr-only span, supporting paragraph, CTA labels/targets (`/quote`, `/products`), stats values (`500+ / 5+ / 10,000+ / 100%`) stay byte-identical.
- `HeroSection.tsx` remains a **server component** (no `"use client"`); the stage is the only client island.
- **No raster images**; stage = DOM + CSS + inline SVG. Film grain = one static inline SVG data-URI.
- **Loop animations restricted to `opacity`/`transform`** (large elements). No `filter: blur()` on large elements — use soft radial-gradients. Documented micro-exceptions (tiny in-scene elements only): hotel typing (`max-width` steps), tile focus ring (`box-shadow`), QLED drift (`background-position`), SVG line draw (`stroke-dashoffset`).
- **No framer-motion in the stage.** Client JS ≈ chip state + tilt handler only.
- Fonts via `next/font` only (self-hosted at build; **no CDN font `<link>`s**). Variables: `--font-display` (Space Grotesk 500/700), `--font-mono` (IBM Plex Mono 400/500), `--font-hand` (Caveat 600). They are applied on the hero `<section>`, deliberately shadowing the site-wide `--font-display` (Plus Jakarta Sans) *inside the hero subtree only*.
- `prefers-reduced-motion`: every animation off, CH·01 (retail) shown statically, all copy fully visible. NOTE: `app/globals.css` has a global guard that force-completes all animations (`animation-duration:0.001ms; iteration-count:1 !important`) — the 20s loop has no fill so everything would land at `opacity:0`. `stage.css` MUST carry its own reduced-motion block with explicit static opacities (included below).
- PostHog events: `hero_stage_channel_click` (property `channel`), `hero_stage_auto_resume`. Use `usePostHog()` + optional chaining (`ph?.capture(...)`) — the provider is absent when `NEXT_PUBLIC_POSTHOG_KEY` is unset.
- Accessibility: stage visuals wrapped in `aria-hidden="true"`; chips are real `<button>`s OUTSIDE that wrapper with `aria-pressed` + `aria-label="Preview: <label>"`; chip text contrast ≥ 4.5:1.
- Work happens in a **git worktree** on branch `feat/premium-hero` cut from `master`. NEVER commit to `feat/live-chat` or touch the original checkout's working tree (it has unrelated uncommitted live-chat work and a possibly-running dev server).
- Commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `components/sections/HeroSection.tsx` | modify | Server component: fonts, two-col grid, premium left column, mounts stage |
| `components/sections/hero/DisplayStage.tsx` | create | Client island: tilt, manual-mode state, chips, OSDs, chrome markup |
| `components/sections/hero/stage.css` | create | ALL stage + hero-shell keyframes/classes (global CSS, imported by DisplayStage) |
| `components/sections/hero/useStageChannel.ts` | create | Reducer + hook for auto/manual channel state |
| `components/sections/hero/useStageChannel.test.ts` | create | Vitest unit tests for the reducer (node env — tests the pure reducer, no rendering) |
| `components/sections/hero/scenes/RetailScene.tsx` | create | CH·01 retail campaign scene |
| `components/sections/hero/scenes/NocScene.tsx` | create | CH·02 NOC dashboard on 2×2 video wall |
| `components/sections/hero/scenes/HotelScene.tsx` | create | CH·03 hotel TV home UI |
| `components/sections/hero/scenes/FlipScene.tsx` | create | CH·04 Flip whiteboard |
| `app/globals.css` | modify | Add `hero-rise` keyframe/class; update the hero-entrance LCP comment |

**Scaling model (locked decision):** the mockup was designed at a ~440px-wide stage. All intra-stage dimensions are written in `em` at the ratio *mockup-px ÷ 10*, and the stage root sets `font-size: clamp(7px, 2.28cqw, 13px)` inside a `container-type: inline-size` column. Result: at 440px the stage renders pixel-identical to the mockup (base 10px); at 560px (desktop spec) everything uniformly scales ×1.27; at ~358px (390px viewport) it scales ×0.82, giving the spec's ~260px mobile stage height for free. Hairlines (1–3px borders, seams, boot line, dust) stay in px on purpose. Chips are real UI, not scenery — they use fixed px type.

**Class naming (locked):** hero-shell classes are `hero2-*`; stage classes are `stg-*`. Channel index suffixes mirror the mockup: `.p1–.p4` (scenes), `.g1–.g4` (glows/pools), `.o1–.o4` (OSDs), `.c1–.c4` (chips). Manual mode = `.stg-manual` on the scale wrapper + `.on` on the selected channel's elements.

---

### Task 1: Worktree, branch, first commit

**Files:**
- Create (in worktree): `docs/superpowers/specs/2026-07-17-premium-hero-stage-design.md` (copy), `docs/superpowers/plans/2026-07-17-premium-hero-stage.md` (copy)

**Interfaces:**
- Produces: a worktree checkout of branch `feat/premium-hero` (cut from `master`) with `node_modules` installed, containing the committed spec + plan. All later tasks run inside this worktree. `<WT>` below denotes its absolute path.

- [ ] **Step 1: Create the worktree** — invoke the `superpowers:using-git-worktrees` skill (falls back to `git worktree` if no native tool). Target: new branch `feat/premium-hero` cut from `master`. Fallback command from the original checkout:

```bash
git -C /c/Users/samee/b2b-website worktree add ../b2b-website-premium-hero -b feat/premium-hero master
```

Expected: new directory `c:\Users\samee\b2b-website-premium-hero` on branch `feat/premium-hero`.

- [ ] **Step 2: Copy the spec and this plan into the worktree** (both are untracked in the original checkout — do NOT `git add` them there):

```bash
mkdir -p "$WT/docs/superpowers/plans"
cp /c/Users/samee/b2b-website/docs/superpowers/specs/2026-07-17-premium-hero-stage-design.md "$WT/docs/superpowers/specs/"
cp /c/Users/samee/b2b-website/docs/superpowers/plans/2026-07-17-premium-hero-stage.md "$WT/docs/superpowers/plans/"
```

- [ ] **Step 3: Install dependencies in the worktree**

Run: `npm install` (in `<WT>`). Expected: exits 0, `node_modules` present.

- [ ] **Step 4: Baseline sanity + performance snapshot** — run `npx tsc --noEmit` (expected: clean) and `npm run test` (expected: pass; rules tests are excluded by default). Then capture a **baseline Lighthouse** of the homepage using the `verify` skill's launch recipe + `npx lighthouse http://localhost:3000 --preset=desktop` and default mobile run, saving reports to the session scratchpad (NOT the repo). If Lighthouse/Chrome isn't available, record LCP from a DevTools trace via the verify skill's browser instead, and note it. Baseline numbers are compared in Task 10.

- [ ] **Step 5: Commit spec + plan**

```bash
git add docs/superpowers/specs/2026-07-17-premium-hero-stage-design.md docs/superpowers/plans/2026-07-17-premium-hero-stage.md
git commit -m "docs(hero): premium hero stage spec + implementation plan

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `useStageChannel` — channel state reducer + hook (TDD)

**Files:**
- Create: `components/sections/hero/useStageChannel.ts`
- Test: `components/sections/hero/useStageChannel.test.ts`

**Interfaces:**
- Produces: `useStageChannel(): { manualIndex: number | null; select: (index: number) => void; resumeAuto: () => void }` — `manualIndex === null` means auto-cycling. Also exports pure `stageChannelReducer(state, action)`, `type StageChannelState = { manualIndex: number | null }`, `type StageChannelAction = { type: "select"; index: number } | { type: "resume" }`, and `CHANNEL_COUNT = 4`. Task 7's `DisplayStage` consumes the hook.

- [ ] **Step 1: Write the failing test** — create `components/sections/hero/useStageChannel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { stageChannelReducer, type StageChannelState } from "./useStageChannel";

const auto: StageChannelState = { manualIndex: null };

describe("stageChannelReducer", () => {
  it("selecting a channel from auto enters manual mode on that channel", () => {
    expect(stageChannelReducer(auto, { type: "select", index: 2 })).toEqual({ manualIndex: 2 });
  });

  it("selecting another channel while manual switches channels", () => {
    expect(stageChannelReducer({ manualIndex: 2 }, { type: "select", index: 0 })).toEqual({ manualIndex: 0 });
  });

  it("ignores out-of-range channel indexes", () => {
    expect(stageChannelReducer(auto, { type: "select", index: -1 })).toBe(auto);
    expect(stageChannelReducer(auto, { type: "select", index: 4 })).toBe(auto);
  });

  it("resume returns to auto", () => {
    expect(stageChannelReducer({ manualIndex: 3 }, { type: "resume" })).toEqual({ manualIndex: null });
  });

  it("resume while already in auto returns the same state object", () => {
    expect(stageChannelReducer(auto, { type: "resume" })).toBe(auto);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/sections/hero/useStageChannel.test.ts`
Expected: FAIL — "Cannot find module './useStageChannel'" (or equivalent resolve error).

- [ ] **Step 3: Write the implementation** — create `components/sections/hero/useStageChannel.ts`:

```ts
"use client";

import { useCallback, useReducer } from "react";

export const CHANNEL_COUNT = 4;

export type StageChannelState = { manualIndex: number | null };
export type StageChannelAction =
  | { type: "select"; index: number }
  | { type: "resume" };

export function stageChannelReducer(
  state: StageChannelState,
  action: StageChannelAction,
): StageChannelState {
  switch (action.type) {
    case "select": {
      if (!Number.isInteger(action.index) || action.index < 0 || action.index >= CHANNEL_COUNT) {
        return state;
      }
      return { manualIndex: action.index };
    }
    case "resume":
      return state.manualIndex === null ? state : { manualIndex: null };
  }
}

/** Channel state for the hero display stage. `manualIndex === null` = the pure-CSS
 *  20s auto loop is running; a number = that channel is pinned via the chips. */
export function useStageChannel() {
  const [state, dispatch] = useReducer(stageChannelReducer, { manualIndex: null });
  const select = useCallback((index: number) => dispatch({ type: "select", index }), []);
  const resumeAuto = useCallback(() => dispatch({ type: "resume" }), []);
  return { manualIndex: state.manualIndex, select, resumeAuto };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/sections/hero/useStageChannel.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Full check + commit**

Run: `npx tsc --noEmit` (clean) and `npm run test` (all pass), then:

```bash
git add components/sections/hero/useStageChannel.ts components/sections/hero/useStageChannel.test.ts
git commit -m "feat(hero): stage channel state reducer + hook

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `stage.css` shared chrome + RetailScene (CH·01)

**Files:**
- Create: `components/sections/hero/stage.css`
- Create: `components/sections/hero/scenes/RetailScene.tsx`

**Interfaces:**
- Produces: `RetailScene` — default-exported, prop-less presentational component. Task 7 renders it inside `<div className="stg-prod p1">`. Also produces the shared classes every scene uses: `stg-screen` (+sheen), `stg-kb`, `stg-cap`, `stg-drawline`/`stg-drawline-slow` (SVG line draw), and `@keyframes stg-draw`.

- [ ] **Step 1: Create `components/sections/hero/stage.css`** with the header + shared scene chrome + full CH·01 section:

```css
/* ═══════════════════════════════════════════════════════════════════════════
   Premium hero + display stage.
   Design source of truth: brainstorm mockup hero-a-premium-v3.html (2026-07-17,
   approved by user). Its CSS is translated here 1:1 with two production changes:
   1. SCALE — the mockup was a fixed ~440px stage. All intra-stage dimensions
      are em at (mockup px ÷ 10); .stg-scale sets the base via container-query
      width, so the stage renders the mockup's exact proportions at any width.
      Hairlines (1–3px borders/seams/boot) intentionally stay px.
   2. PERF — no filter:blur() on large elements (soft radial-gradients instead);
      loop animations use opacity/transform only (sheen + chip bars converted
      from left/width to transforms).
   Imported once, globally, by DisplayStage.tsx. Classes: hero2-* = hero shell
   (used by the server HeroSection), stg-* = stage island.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── shared screen chrome ─────────────────────────────────────────────────── */
.stg-screen {
  position: relative;
  overflow: hidden;
  background: #000;
}
/* Glass sheen sweep, every 9s. Mockup animated `left`; converted to translateX
   (element is 34% of parent width, so -45%/130% of parent ≈ -132%/382% of self). */
.stg-screen::after {
  content: "";
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: 0;
  width: 34%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.09) 45%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.09) 55%, transparent);
  transform: translateX(-132%) skewX(-18deg);
  animation: stg-sheen 9s ease-in-out infinite;
  z-index: 6;
  pointer-events: none;
}
@keyframes stg-sheen {
  0%, 55% { transform: translateX(-132%) skewX(-18deg); }
  75%, 100% { transform: translateX(382%) skewX(-18deg); }
}
/* Slow ken-burns push on photographic scene backdrops. */
.stg-kb {
  position: absolute;
  inset: 0;
  animation: stg-kbzoom 7s ease-in-out infinite alternate;
}
@keyframes stg-kbzoom {
  from { transform: scale(1); }
  to { transform: scale(1.045); }
}
/* Mono caption pinned bottom-left of a screen. */
.stg-cap {
  position: absolute;
  bottom: 0.8em;
  left: 1.2em;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  color: #e0f2fe;
  font-size: 0.85em;
  letter-spacing: 0.16em;
  font-weight: 500;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.7);
  z-index: 5;
}
/* Self-drawing SVG strokes (NOC chart, whiteboard marker). Elements must set
   pathLength="100"; dasharray/offset are paint-only, allowed by the perf budget. */
.stg-drawline {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: stg-draw 3.2s ease-out infinite;
}
.stg-drawline-slow { animation-duration: 4s; }
.stg-drawline-delayed { animation-delay: 0.3s; }
@keyframes stg-draw {
  0% { stroke-dashoffset: 100; }
  45%, 88% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}

/* ── CH·01 · retail campaign on slim-bezel signage ────────────────────────── */
.stg-sign {
  width: 78%;
  aspect-ratio: 16 / 9;
  border-radius: 0.6em;
  padding: 0.3em;
  background: linear-gradient(160deg, #475569, #0f172a 30%, #1e293b 70%, #0b1120);
  box-shadow: 0 2.4em 6em -1.8em rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(148, 163, 184, 0.15), 0 0 5.4em -0.8em rgba(37, 99, 235, 0.4);
}
.stg-sign .stg-screen {
  border-radius: 0.4em;
  height: 100%;
}
.stg-retail {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 0%, #1d4ed8 0%, #0b2b5e 45%, #04102a 100%);
}
.stg-retail::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.35));
}
.stg-ret-eyebrow {
  position: absolute;
  top: 12%;
  left: 8%;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.75em;
  letter-spacing: 0.24em;
  color: #7dd3fc;
}
.stg-ret-big {
  position: absolute;
  top: 20%;
  left: 8%;
  font-family: var(--font-display, system-ui, sans-serif);
  font-weight: 700;
  line-height: 0.95;
  color: #fff;
  font-size: 3.4em;
  letter-spacing: -0.03em;
}
.stg-ret-big em {
  font-style: normal;
  background: linear-gradient(100deg, #22d3ee, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stg-ret-big small {
  display: block;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.265em; /* 9px at mockup scale (parent is 34px) */
  letter-spacing: 0.05em;
  color: #93b8e8;
  margin-top: 0.55em;
}
.stg-ret-shop {
  position: absolute;
  bottom: 16%;
  left: 8%;
  font-family: var(--font-display, system-ui, sans-serif);
  font-weight: 700;
  background: #fff;
  color: #0b2b5e;
  font-size: 0.85em;
  padding: 0.6em 1.5em;
  border-radius: 99px;
  letter-spacing: 0.02em;
}
.stg-minitv {
  position: absolute;
  right: 9%;
  top: 22%;
  width: 33%;
}
.stg-minitv .scr {
  aspect-ratio: 16 / 9;
  border-radius: 0.4em;
  padding: 2px;
  background: linear-gradient(160deg, #52525b, #18181b);
  box-shadow: 0 1em 2.6em rgba(0, 0, 0, 0.6), 0 0 3em -0.4em rgba(34, 211, 238, 0.45);
}
.stg-minitv .scr > div {
  height: 100%;
  border-radius: 0.3em;
  background: linear-gradient(120deg, #22d3ee, #6366f1 45%, #d946ef 90%);
  background-size: 220% 220%;
  animation: stg-qled 6s ease-in-out infinite alternate;
}
@keyframes stg-qled {
  from { background-position: 0% 0%; }
  to { background-position: 100% 100%; }
}
.stg-minitv .neck {
  width: 1.6em;
  height: 0.7em;
  margin: 0 auto;
  background: #18181b;
  clip-path: polygon(25% 0, 75% 0, 100% 100%, 0 100%);
}
.stg-minitv .base {
  width: 5.2em;
  height: 0.3em;
  margin: 0 auto;
  border-radius: 99px;
  background: #27272a;
}
.stg-minitv .price {
  margin-top: 0.8em;
  text-align: center;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.75em;
  color: #bae6fd;
  letter-spacing: 0.08em;
}
```

- [ ] **Step 2: Create `components/sections/hero/scenes/RetailScene.tsx`** (presentational; becomes a client module because DisplayStage imports it — no directive needed):

```tsx
/** CH·01 — retail campaign playing on a slim-bezel signage panel.
 *  Scene content is decorative set-dressing (inside the stage's aria-hidden
 *  wrapper); prices/claims are illustrative, not live copy. */
export default function RetailScene() {
  return (
    <div className="stg-sign">
      <div className="stg-screen">
        <div className="stg-kb">
          <div className="stg-retail">
            <div className="stg-ret-eyebrow">FESTIVE SEASON · LIMITED TIME</div>
            <div className="stg-ret-big">
              UP TO <em>40% OFF</em>
              <small>Neo QLED · Soundbars · Bespoke</small>
            </div>
            <div className="stg-ret-shop">SHOP NOW →</div>
            <div className="stg-minitv">
              <div className="scr">
                <div />
              </div>
              <div className="neck" />
              <div className="base" />
              <div className="price">NEO QLED 55&quot; · ₹74,990</div>
            </div>
          </div>
        </div>
        <div className="stg-cap">SMART SIGNAGE · RETAIL</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: clean (the component is not yet imported anywhere — that happens in Task 7).

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero/stage.css components/sections/hero/scenes/RetailScene.tsx
git commit -m "feat(hero): stage chrome css + retail scene (CH-01)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: NocScene (CH·02) + its CSS

**Files:**
- Modify: `components/sections/hero/stage.css` (append the CH·02 section at the end)
- Create: `components/sections/hero/scenes/NocScene.tsx`

**Interfaces:**
- Consumes: `stg-screen`, `stg-cap`, `stg-drawline` from Task 3.
- Produces: `NocScene` — default-exported, prop-less. Also `@keyframes stg-pulse` (reused by the hero badge in Task 8).

- [ ] **Step 1: Append to `components/sections/hero/stage.css`:**

```css
/* ── CH·02 · NOC dashboard on a 2×2 video wall ────────────────────────────── */
.stg-vwall {
  width: 78%;
  aspect-ratio: 16 / 9;
  border-radius: 0.3em;
  padding: 2px;
  background: linear-gradient(160deg, #334155, #0b1120 40%, #1e293b);
  box-shadow: 0 2.4em 6em -1.8em rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(148, 163, 184, 0.14), 0 0 5.4em -0.8em rgba(20, 184, 166, 0.35);
}
.stg-vwall .stg-screen {
  border-radius: 2px;
  height: 100%;
}
.stg-ctrl {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #04211c 0%, #0a2f2a 50%, #0f172a 100%);
}
.stg-noc-head {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 16%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4%;
  border-bottom: 1px solid rgba(45, 212, 191, 0.18);
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.7em;
  letter-spacing: 0.2em;
  color: #5eead4;
  background: rgba(2, 10, 9, 0.4);
  z-index: 3;
}
.stg-noc-live {
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 0.4em;
}
.stg-noc-live::before {
  content: "";
  width: 0.4em;
  height: 0.4em;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: stg-pulse 1.6s ease-in-out infinite;
}
@keyframes stg-pulse {
  50% { opacity: 0.4; }
}
.stg-noc-chart {
  position: absolute;
  left: 4%;
  top: 24%;
  width: 42%;
  height: 34%;
  border: 1px solid rgba(45, 212, 191, 0.16);
  border-radius: 0.3em;
  background: rgba(4, 32, 28, 0.45);
}
.stg-kpis {
  position: absolute;
  right: 4%;
  top: 24%;
  width: 44%;
  display: flex;
  gap: 0.4em;
}
.stg-kpi {
  flex: 1;
  border: 1px solid rgba(45, 212, 191, 0.16);
  border-radius: 0.3em;
  background: rgba(4, 32, 28, 0.45);
  padding: 0.5em 0.6em;
}
.stg-kpi b {
  display: block;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  color: #99f6e4;
  font-size: 1.05em;
  font-weight: 500;
}
.stg-kpi span {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  color: #3d8f84;
  font-size: 0.56em;
  letter-spacing: 0.14em;
}
.stg-map {
  position: absolute;
  right: 4%;
  top: 47%;
  width: 44%;
  height: 32%;
  border: 1px solid rgba(45, 212, 191, 0.16);
  border-radius: 0.3em;
  background: rgba(4, 32, 28, 0.45);
}
.stg-mdot {
  position: absolute;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: #2dd4bf;
}
.stg-mdot::after {
  content: "";
  position: absolute;
  inset: -0.5em;
  border-radius: 50%;
  border: 1px solid rgba(45, 212, 191, 0.7);
  animation: stg-ring 2.4s ease-out infinite;
}
.stg-mdot.m2::after { animation-delay: 0.7s; }
.stg-mdot.m3::after { animation-delay: 1.3s; }
@keyframes stg-ring {
  from { transform: scale(0.4); opacity: 1; }
  to { transform: scale(2.1); opacity: 0; }
}
.stg-bars {
  position: absolute;
  left: 4%;
  top: 63%;
  width: 42%;
  height: 16%;
  display: flex;
  align-items: flex-end;
  gap: 0.3em;
}
.stg-bars i {
  flex: 1;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(180deg, #2dd4bf, rgba(45, 212, 191, 0.12));
  /* transform-origin added vs mockup so pulsing bars stay planted on the baseline */
  transform-origin: bottom;
  animation: stg-bar 2.6s ease-in-out infinite;
}
.stg-bars i:nth-child(1) { height: 55%; }
.stg-bars i:nth-child(2) { height: 70%; animation-delay: 0.3s; }
.stg-bars i:nth-child(3) { height: 45%; animation-delay: 0.6s; }
.stg-bars i:nth-child(4) { height: 85%; animation-delay: 0.9s; }
.stg-bars i:nth-child(5) { height: 60%; animation-delay: 1.2s; }
@keyframes stg-bar {
  50% { transform: scaleY(0.72); }
}
.stg-ticker {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 13%;
  background: rgba(2, 10, 9, 0.6);
  border-top: 1px solid rgba(45, 212, 191, 0.18);
  overflow: hidden;
  display: flex;
  align-items: center;
  z-index: 3;
}
.stg-ticker > div {
  white-space: nowrap;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.65em;
  letter-spacing: 0.12em;
  color: #5eead4;
  animation: stg-tick 14s linear infinite;
}
@keyframes stg-tick {
  from { transform: translateX(30%); }
  to { transform: translateX(-100%); }
}
/* Physical bezel seams of the 2×2 wall — hairlines, deliberately px. */
.stg-seamv {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 3px;
  margin-left: -1.5px;
  background: linear-gradient(90deg, #04060d, #1e293b 50%, #04060d);
  z-index: 4;
}
.stg-seamh {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  margin-top: -1.5px;
  background: linear-gradient(180deg, #04060d, #1e293b 50%, #04060d);
  z-index: 4;
}
```

- [ ] **Step 2: Create `components/sections/hero/scenes/NocScene.tsx`:**

```tsx
/** CH·02 — network operations dashboard playing across a 2×2 video wall.
 *  All figures are decorative set-dressing inside the aria-hidden stage. */
export default function NocScene() {
  return (
    <div className="stg-vwall">
      <div className="stg-screen">
        <div className="stg-ctrl">
          <div className="stg-noc-head">
            <span>NETWORK OPERATIONS CENTER</span>
            <span className="stg-noc-live">LIVE</span>
          </div>
          <div className="stg-noc-chart">
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: "8% 5%", width: "90%", height: "84%" }}
            >
              <polyline
                className="stg-drawline"
                points="0,34 14,26 28,30 42,16 56,22 70,9 84,14 100,4"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.6"
                pathLength="100"
              />
            </svg>
          </div>
          <div className="stg-kpis">
            <div className="stg-kpi"><b>99.98%</b><span>UPTIME</span></div>
            <div className="stg-kpi"><b>1,248</b><span>SCREENS</span></div>
            <div className="stg-kpi"><b>17ms</b><span>LATENCY</span></div>
          </div>
          <div className="stg-map">
            <div className="stg-mdot" style={{ left: "28%", top: "30%" }} />
            <div className="stg-mdot m2" style={{ left: "52%", top: "55%" }} />
            <div className="stg-mdot m3" style={{ left: "70%", top: "26%" }} />
          </div>
          <div className="stg-bars"><i /><i /><i /><i /><i /></div>
          <div className="stg-ticker">
            <div>
              ▲ BKC MALL WALL 4×4 ONLINE&nbsp;&nbsp;·&nbsp;&nbsp;✓ PUNE AIRPORT SIGNAGE
              SYNCED&nbsp;&nbsp;·&nbsp;&nbsp;▲ FIRMWARE V2.4 DEPLOYED — 214
              SCREENS&nbsp;&nbsp;·&nbsp;&nbsp;✓ ALL ZONES NOMINAL
            </div>
          </div>
          <div className="stg-seamv" />
          <div className="stg-seamh" />
        </div>
        <div className="stg-cap" style={{ bottom: "16%" }}>
          VIDEO WALL 2×2 · CONTROL ROOM
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles** — run `npx tsc --noEmit`. Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero/stage.css components/sections/hero/scenes/NocScene.tsx
git commit -m "feat(hero): NOC video-wall scene (CH-02)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: HotelScene (CH·03) + its CSS

**Files:**
- Modify: `components/sections/hero/stage.css` (append the CH·03 section at the end)
- Create: `components/sections/hero/scenes/HotelScene.tsx`

**Interfaces:**
- Consumes: `stg-screen`, `stg-kb`, `stg-cap` (Task 3).
- Produces: `HotelScene` — default-exported, prop-less. The TV's neck/base render as siblings under the screen; the parent `.stg-prod` (Task 7) is a centered flex column, which stacks them.

- [ ] **Step 1: Append to `components/sections/hero/stage.css`:**

```css
/* ── CH·03 · hotel TV home UI on a TV with neck + base stand ──────────────── */
.stg-tv {
  width: 64%;
  aspect-ratio: 16 / 9;
  border-radius: 0.5em;
  padding: 0.3em;
  background: linear-gradient(160deg, #3f3f46, #09090b 35%, #18181b);
  box-shadow: 0 2.4em 6em -1.8em rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(161, 161, 170, 0.16), 0 0 5.4em -0.8em rgba(217, 119, 6, 0.3);
}
.stg-tv .stg-screen {
  border-radius: 0.3em;
  height: 100%;
}
.stg-neck {
  width: 3.6em;
  height: 1.3em;
  background: linear-gradient(180deg, #27272a, #09090b);
  clip-path: polygon(28% 0, 72% 0, 100% 100%, 0 100%);
}
.stg-base {
  width: 10em;
  height: 0.6em;
  border-radius: 99px;
  background: linear-gradient(180deg, #3f3f46, #18181b);
  box-shadow: 0 0.6em 1.4em rgba(0, 0, 0, 0.6);
}
.stg-hotel {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, #1e1035 0%, #4c1d95 55%, #7c2d12 130%);
}
/* Warm bedside-lamp light, upper right. */
.stg-hotel::before {
  content: "";
  position: absolute;
  right: -8%;
  top: -30%;
  width: 55%;
  height: 110%;
  background: radial-gradient(closest-side, rgba(251, 191, 36, 0.22), transparent);
}
.stg-hbrand {
  position: absolute;
  top: 9%;
  left: 7%;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.7em;
  letter-spacing: 0.3em;
  color: #fcd34d;
}
.stg-hbrand small {
  color: #fbbf24;
  letter-spacing: 0.1em;
}
.stg-hgreet {
  position: absolute;
  top: 22%;
  left: 7%;
  font-family: var(--font-display, system-ui, sans-serif);
  font-weight: 500;
  font-size: 0.9em;
  letter-spacing: 0.06em;
  color: #d8c9f7;
}
/* Typing welcome line. `max-width` steps() is a documented micro-exception to
   the transform/opacity budget (17ch of text, repaints a few px per step). */
.stg-htype {
  display: block;
  margin-top: 0.25em;
  color: #fff;
  font-family: var(--font-display, system-ui, sans-serif);
  font-size: 1.78em; /* 16px at mockup scale (parent is 9px) */
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  max-width: 17ch;
  border-right: 2px solid rgba(255, 255, 255, 0.75);
  animation: stg-type 3.6s steps(17) infinite;
}
@keyframes stg-type {
  0% { max-width: 0; }
  55%, 92% { max-width: 17ch; }
  100% { max-width: 17ch; }
}
.stg-tiles {
  position: absolute;
  bottom: 23%;
  left: 7%;
  right: 7%;
  display: flex;
  gap: 0.6em;
}
/* Golden focus ring steps tile-to-tile like a real remote. box-shadow pulse is
   a documented micro-exception (tiny tiles, paint-only). */
.stg-tile {
  flex: 1;
  height: 3.8em;
  border-radius: 0.5em;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: flex-end;
  padding: 0.5em 0.7em;
  font-weight: 600;
  font-size: 0.7em;
  color: #f5f3ff;
  position: relative;
  animation: stg-focus 5s linear infinite;
}
.stg-tile:nth-child(2) { animation-delay: 1s; }
.stg-tile:nth-child(3) { animation-delay: 2s; }
.stg-tile:nth-child(4) { animation-delay: 3s; }
.stg-tile:nth-child(5) { animation-delay: 4s; }
@keyframes stg-focus {
  0%, 16% {
    box-shadow: 0 0 0 1.5px #fbbf24, 0 0.4em 1.8em rgba(251, 191, 36, 0.35);
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  }
  20%, 100% { box-shadow: none; }
}
.stg-hinfo {
  position: absolute;
  bottom: 8%;
  left: 7%;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.65em;
  letter-spacing: 0.16em;
  color: #e9d5ff;
  opacity: 0.85;
}
```

- [ ] **Step 2: Create `components/sections/hero/scenes/HotelScene.tsx`:**

```tsx
/** CH·03 — hotel TV home screen (guest room). Decorative set-dressing inside
 *  the aria-hidden stage; hotel name/guest are fictional. */
export default function HotelScene() {
  return (
    <>
      <div className="stg-tv">
        <div className="stg-screen">
          <div className="stg-kb">
            <div className="stg-hotel">
              <div className="stg-hbrand">
                THE GRAND MERIDIAN&nbsp;<small>★★★★★</small>
              </div>
              <div className="stg-hgreet">
                GOOD EVENING
                <span className="stg-htype">Welcome, Mr. Kapoor</span>
              </div>
              <div className="stg-tiles">
                <div className="stg-tile">Live TV</div>
                <div className="stg-tile">Movies</div>
                <div className="stg-tile">Dining</div>
                <div className="stg-tile">Spa</div>
                <div className="stg-tile">My Bill</div>
              </div>
              <div className="stg-hinfo">8:42 PM&nbsp;·&nbsp;28°C MUMBAI&nbsp;·&nbsp;WIFI: MERIDIAN-GUEST</div>
            </div>
          </div>
          <div className="stg-cap">HOSPITALITY TV · GUEST ROOM</div>
        </div>
      </div>
      <div className="stg-neck" />
      <div className="stg-base" />
    </>
  );
}
```

- [ ] **Step 3: Verify it compiles** — run `npx tsc --noEmit`. Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero/stage.css components/sections/hero/scenes/HotelScene.tsx
git commit -m "feat(hero): hotel TV scene (CH-03)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: FlipScene (CH·04) + its CSS

**Files:**
- Modify: `components/sections/hero/stage.css` (append the CH·04 section at the end)
- Create: `components/sections/hero/scenes/FlipScene.tsx`

**Interfaces:**
- Consumes: `stg-screen`, `stg-drawline`, `stg-drawline-slow`, `stg-drawline-delayed` (Task 3).
- Produces: `FlipScene` — default-exported, prop-less. Sticky notes (`stg-note`) are synced to the 20s master clock (delays 15.3–15.9s) — Task 7's manual-mode CSS must force them visible when pinned (`.stg-manual .stg-note`).

- [ ] **Step 1: Append to `components/sections/hero/stage.css`:**

```css
/* ── CH·04 · whiteboard on a Flip with easel legs + wheels ────────────────── */
.stg-flip {
  width: 46%;
  aspect-ratio: 4 / 3;
  border-radius: 1em;
  padding: 0.7em;
  background: linear-gradient(160deg, #f8fafc, #cbd5e1 60%, #e2e8f0);
  box-shadow: 0 2.4em 6em -1.8em rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.25), 0 0 5.4em -0.8em rgba(148, 163, 184, 0.35);
}
.stg-flip .stg-screen {
  border-radius: 0.5em;
  height: 100%;
  background: #f1f5f9;
}
.stg-board {
  position: absolute;
  inset: 0;
  background: #fbfcfe;
  background-image: radial-gradient(circle, rgba(100, 116, 139, 0.14) 1px, transparent 1.2px);
  background-size: 1.6em 1.6em;
}
.stg-btitle {
  position: absolute;
  top: 6%;
  left: 8%;
  font-family: var(--font-hand, cursive);
  font-weight: 600;
  font-size: 1.9em;
  color: #1e293b;
  transform: rotate(-2deg);
}
.stg-btitle u {
  text-decoration-color: #dc2626;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
/* Sticky notes pop in near the end of the 20s cycle (Flip's 15–20s window).
   `scale` (the standalone property) is animated so the per-note rotate
   transforms are preserved. */
.stg-note {
  position: absolute;
  width: 4.4em;
  height: 4em;
  padding: 0.5em;
  font-family: var(--font-hand, cursive);
  font-weight: 600;
  font-size: 0.95em;
  line-height: 1.1;
  color: #334155;
  box-shadow: 0 0.3em 0.8em rgba(0, 0, 0, 0.18);
  opacity: 0;
  animation: stg-note 20s ease-in-out infinite;
}
.stg-note.n1 { right: 10%; top: 9%; background: #fef08a; transform: rotate(4deg); animation-delay: 15.3s; }
.stg-note.n2 { right: 26%; top: 13%; background: #fbcfe8; transform: rotate(-5deg); animation-delay: 15.6s; }
.stg-note.n3 { right: 8%; top: 38%; background: #bae6fd; transform: rotate(2deg); animation-delay: 15.9s; }
@keyframes stg-note {
  0% { opacity: 0; scale: 0.5; }
  1.6% { opacity: 1; scale: 1.06; }
  2.6% { scale: 1; }
  25% { opacity: 1; }
  28% { opacity: 0; }
  100% { opacity: 0; }
}
.stg-axes {
  position: absolute;
  left: 9%;
  bottom: 14%;
  width: 56%;
  height: 52%;
  border-left: 1.5px solid #94a3b8;
  border-bottom: 1.5px solid #94a3b8;
}
.stg-palette {
  position: absolute;
  bottom: 7%;
  right: 8%;
  display: flex;
  gap: 0.4em;
  z-index: 5;
}
.stg-palette i {
  width: 0.7em;
  height: 0.7em;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.stg-capdark {
  position: absolute;
  bottom: 7%;
  left: 9%;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  color: #64748b;
  font-size: 0.8em;
  letter-spacing: 0.14em;
  z-index: 5;
}
.stg-legs {
  display: flex;
  justify-content: center;
  gap: 5.2em;
  margin-top: -2px;
}
.stg-legs i {
  width: 0.4em;
  height: 3.2em;
  background: linear-gradient(180deg, #475569, #1e293b);
  border-radius: 3px;
}
.stg-legs i:first-child { transform: rotate(9deg); }
.stg-legs i:last-child { transform: rotate(-9deg); }
.stg-wheels {
  display: flex;
  justify-content: center;
  gap: 6.8em;
  margin-top: -0.4em;
}
.stg-wheels i {
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  background: #334155;
  box-shadow: 0 0.3em 0.6em rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 2: Create `components/sections/hero/scenes/FlipScene.tsx`:**

```tsx
/** CH·04 — interactive whiteboard (Flip) sketching a growth plan in a
 *  boardroom. Decorative set-dressing inside the aria-hidden stage. */
export default function FlipScene() {
  return (
    <>
      <div className="stg-flip">
        <div className="stg-screen">
          <div className="stg-board">
            <div className="stg-btitle">
              <u>Q3 Growth Plan</u> ↗
            </div>
            <div className="stg-note n1">Retail +32%</div>
            <div className="stg-note n2">New cities!</div>
            <div className="stg-note n3">Hire AV team</div>
            <div className="stg-axes" />
            <svg
              viewBox="0 0 200 110"
              preserveAspectRatio="xMidYMid meet"
              style={{ position: "absolute", inset: "12% 6% 14%", width: "88%", height: "74%" }}
            >
              <path
                className="stg-drawline stg-drawline-slow"
                d="M18,88 C40,86 44,60 66,62 C88,64 92,40 114,44 C136,48 142,22 170,18"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength="100"
              />
              <path
                className="stg-drawline stg-drawline-slow stg-drawline-delayed"
                d="M168,10 L178,16 L168,24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="100"
              />
            </svg>
            <div className="stg-capdark">INTERACTIVE · BOARDROOM</div>
            <div className="stg-palette">
              <i style={{ background: "#1e293b" }} />
              <i style={{ background: "#2563eb" }} />
              <i style={{ background: "#dc2626" }} />
              <i style={{ background: "#16a34a" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="stg-legs"><i /><i /></div>
      <div className="stg-wheels"><i /><i /></div>
    </>
  );
}
```

- [ ] **Step 3: Verify it compiles** — run `npx tsc --noEmit`. Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero/stage.css components/sections/hero/scenes/FlipScene.tsx
git commit -m "feat(hero): Flip whiteboard scene (CH-04)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: DisplayStage client island + stage chrome CSS

**Files:**
- Modify: `components/sections/hero/stage.css` (append the chrome + reduced-motion sections at the end)
- Create: `components/sections/hero/DisplayStage.tsx`

**Interfaces:**
- Consumes: `useStageChannel` (Task 2), the four scene components (Tasks 3–6), `usePostHog` from `posthog-js/react`.
- Produces: `DisplayStage` — default-exported, prop-less client component. Task 8 renders it in the hero grid's second column. It fills its parent's width (`.stg-col` is `width: 100%` via className) and derives all sizing from that width.

- [ ] **Step 1: Append the stage chrome to `components/sections/hero/stage.css`:**

```css
/* ── stage chrome: scale, tilt, loop machinery, chips ─────────────────────── */
/* Column = container; .stg-scale turns container width into the em base:
   10px at the mockup's 440px design width (10/440 = 2.28cqw), clamped so
   very narrow/wide layouts stay sane. */
.stg-col {
  container-type: inline-size;
  position: relative;
  z-index: 2;
}
.stg-scale {
  font-size: clamp(7px, 2.28cqw, 13px);
}
.stg-persp {
  perspective: 1200px;
  position: relative;
}
.stg-tilt {
  transition: transform 0.18s ease-out;
  transform-style: preserve-3d;
}
.stg-float {
  animation: stg-float 8s ease-in-out infinite;
}
@keyframes stg-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.stg-stagebox {
  position: relative;
  height: 29.5em;
}
/* Dust motes at different translateZ depths. Depth uses the standalone
   `translate` property so the keyframe's transform doesn't clobber it
   (mockup animated margin-top; converted to transform per perf budget). */
.stg-dust {
  position: absolute;
  border-radius: 50%;
  background: #93c5fd;
  pointer-events: none;
  animation: stg-dustf 11s ease-in-out infinite alternate;
}
.stg-dust.d1 { width: 3px; height: 3px; left: 6%; top: 18%; opacity: 0.3; translate: 0 0 60px; }
.stg-dust.d2 { width: 2px; height: 2px; right: 10%; top: 30%; opacity: 0.25; translate: 0 0 -50px; animation-duration: 14s; animation-direction: alternate-reverse; }
.stg-dust.d3 { width: 4px; height: 4px; left: 14%; bottom: 22%; opacity: 0.2; translate: 0 0 30px; animation-duration: 17s; }
.stg-dust.d4 { width: 2px; height: 2px; right: 18%; bottom: 14%; opacity: 0.3; translate: 0 0 -30px; animation-duration: 13s; animation-direction: alternate-reverse; }
@keyframes stg-dustf {
  from { transform: translateY(0); }
  to { transform: translateY(-16px); }
}
/* ── the 20s master clock: 4 channels × 5s, staggered delays ── */
.stg-prod {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: stg-chan 20s ease-in-out infinite;
}
.stg-prod.p2 { animation-delay: 5s; }
.stg-prod.p3 { animation-delay: 10s; }
.stg-prod.p4 { animation-delay: 15s; }
@keyframes stg-chan {
  0% { opacity: 0; transform: scale(0.965); }
  2.6% { opacity: 1; transform: scale(1); }
  25% { opacity: 1; transform: scale(1); }
  28% { opacity: 0; transform: scale(0.98); }
  100% { opacity: 0; }
}
/* Broadcast OSD tag, top-right, flashes ~2.6s at each channel start. */
.stg-osd {
  position: absolute;
  top: -0.4em;
  right: 0;
  z-index: 8;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 0.95em;
  letter-spacing: 0.14em;
  color: #bae6fd;
  background: rgba(2, 6, 17, 0.72);
  border: 1px solid rgba(125, 211, 252, 0.28);
  border-radius: 4px;
  padding: 0.4em 0.9em;
  opacity: 0;
  transform: translateY(-6px);
  animation: stg-osdk 20s ease-in-out infinite;
}
.stg-osd b { color: #fff; font-weight: 500; }
.stg-osd.o2 { animation-delay: 5s; }
.stg-osd.o3 { animation-delay: 10s; }
.stg-osd.o4 { animation-delay: 15s; }
@keyframes stg-osdk {
  0% { opacity: 0; transform: translateY(-6px); }
  2% { opacity: 1; transform: translateY(0); }
  13% { opacity: 1; }
  17% { opacity: 0; transform: translateY(-2px); }
  100% { opacity: 0; }
}
/* Power-on: bright line expands then fades, once, 1.15s after load. */
.stg-boot {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: #e0f2fe;
  box-shadow: 0 0 26px 5px rgba(224, 242, 254, 0.95);
  z-index: 7;
  transform: scaleX(0);
  animation: stg-poweron 1.1s ease-out 1.15s forwards;
}
@keyframes stg-poweron {
  0% { transform: scaleX(0); opacity: 1; }
  55% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}
.stg-reveal {
  opacity: 0;
  animation: stg-revl 0.9s ease-out 1.95s forwards;
}
@keyframes stg-revl {
  to { opacity: 1; }
}
/* ── floor: contact shadow + per-channel light pools ── */
.stg-floor {
  position: relative;
  height: 4.4em;
  margin-top: 0.6em;
}
.stg-shadow {
  position: absolute;
  left: 50%;
  top: 0.4em;
  transform: translateX(-50%);
  width: 52%;
  height: 2em;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.25) 45%, transparent 72%);
}
/* Pools are positioned with left/right (not translateX) so the stg-chan
   keyframe's transform doesn't shift them off-center. Soft gradient stops
   replace the mockup's blur(12px). */
.stg-pool {
  position: absolute;
  left: 13%;
  right: 13%;
  top: 0;
  height: 3em;
  opacity: 0;
  animation: stg-chan 20s ease-in-out infinite;
}
.stg-pool.g1 { background: radial-gradient(ellipse, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.15) 45%, transparent 72%); }
.stg-pool.g2 { background: radial-gradient(ellipse, rgba(45, 212, 191, 0.36), rgba(45, 212, 191, 0.13) 45%, transparent 72%); animation-delay: 5s; }
.stg-pool.g3 { background: radial-gradient(ellipse, rgba(251, 191, 36, 0.32), rgba(251, 191, 36, 0.12) 45%, transparent 72%); animation-delay: 10s; }
.stg-pool.g4 { background: radial-gradient(ellipse, rgba(203, 213, 225, 0.32), rgba(203, 213, 225, 0.12) 45%, transparent 72%); animation-delay: 15s; }
/* Ambient rim-light glow behind the whole stage, re-colored per channel.
   Soft gradient stops replace the mockup's blur(52px). */
.stg-glow {
  position: absolute;
  inset: -18%;
  opacity: 0;
  animation: stg-chan 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.stg-glow.g1 { background: radial-gradient(closest-side, rgba(30, 64, 175, 0.38), rgba(30, 64, 175, 0.14) 45%, transparent 72%); }
.stg-glow.g2 { background: radial-gradient(closest-side, rgba(19, 78, 74, 0.42), rgba(19, 78, 74, 0.16) 45%, transparent 72%); animation-delay: 5s; }
.stg-glow.g3 { background: radial-gradient(closest-side, rgba(146, 64, 14, 0.32), rgba(146, 64, 14, 0.12) 45%, transparent 72%); animation-delay: 10s; }
.stg-glow.g4 { background: radial-gradient(closest-side, rgba(148, 163, 184, 0.26), rgba(148, 163, 184, 0.1) 45%, transparent 72%); animation-delay: 15s; }
/* ── manual mode: chips pin a channel, loop visuals freeze ── */
.stg-manual .stg-prod,
.stg-manual .stg-glow,
.stg-manual .stg-pool,
.stg-manual .stg-osd {
  animation: none !important;
  opacity: 0 !important;
}
.stg-manual .stg-prod.on { opacity: 1 !important; transform: scale(1); }
.stg-manual .stg-glow.on { opacity: 1 !important; }
.stg-manual .stg-pool.on { opacity: 0.85 !important; }
.stg-manual .stg-osd.on { opacity: 1 !important; transform: translateY(0) !important; }
/* Sticky notes ride the 20s clock; when Flip is pinned, show them statically. */
.stg-manual .stg-note { animation: none !important; opacity: 1 !important; }
/* ── chips: real buttons, real UI — fixed px type, not stage-scaled ── */
.stg-chips {
  display: flex;
  gap: 7px;
  justify-content: center;
  margin-top: 8px;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
}
.stg-chip {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #94a3b8; /* ≥4.5:1 on the near-black hero */
  border: 1px solid rgba(148, 163, 184, 0.22);
  padding: 6px 12px;
  min-height: 30px;
  border-radius: 99px;
  position: relative;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.5);
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s;
}
.stg-chip:hover {
  border-color: rgba(125, 211, 252, 0.45);
  color: #cbd5e1;
}
.stg-chip[aria-pressed="true"] {
  border-color: rgba(56, 189, 248, 0.65);
  color: #e0f2fe;
}
/* Per-chip progress bar synced to the 20s clock. Mockup animated width;
   converted to scaleX per perf budget. */
.stg-chip-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 100%;
  transform-origin: left;
  transform: scaleX(0);
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  animation: stg-chipbar 20s linear infinite;
}
.stg-chip.c2 .stg-chip-bar { animation-delay: 5s; }
.stg-chip.c3 .stg-chip-bar { animation-delay: 10s; }
.stg-chip.c4 .stg-chip-bar { animation-delay: 15s; }
@keyframes stg-chipbar {
  0% { transform: scaleX(0); opacity: 1; }
  25% { transform: scaleX(1); opacity: 1; }
  26% { transform: scaleX(1); opacity: 0; }
  100% { transform: scaleX(0); opacity: 0; }
}
.stg-manual .stg-chip-bar {
  animation: none !important;
  transform: scaleX(0);
}
.stg-chip-auto {
  color: #67e8f9;
  border-color: rgba(103, 232, 249, 0.4);
}

/* ── reduced motion: everything static, CH·01 visible, copy visible ─────────
   The global guard in globals.css force-completes animations (0.001ms × 1
   iteration); the 20s loop has no fill, so without these overrides every
   channel would land at opacity 0. This block loads after globals.css
   (component CSS ordering) and pins the exact static frame we want. */
@media (prefers-reduced-motion: reduce) {
  .hero2 *,
  .hero2 *::before,
  .hero2 *::after {
    animation: none !important;
    transition: none !important;
  }
  .hero2-rise,
  .hero2 .hero-word,
  .stg-reveal {
    opacity: 1 !important;
    transform: none !important;
  }
  .stg-boot { display: none; }
  .stg-prod, .stg-glow, .stg-pool, .stg-osd { opacity: 0; }
  .stg-prod.p1 { opacity: 1; }
  .stg-glow.g1 { opacity: 1; }
  .stg-pool.g1 { opacity: 0.85; }
  .stg-osd.o1 { opacity: 1; transform: translateY(0); }
  .stg-note { opacity: 1; }
  .stg-chip-bar, .stg-screen::after { display: none; }
  .stg-htype { max-width: 17ch; border-right-color: transparent; }
  .stg-drawline { stroke-dashoffset: 0 !important; }
}
```

- [ ] **Step 2: Create `components/sections/hero/DisplayStage.tsx`:**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import "./stage.css";
import { useStageChannel } from "./useStageChannel";
import RetailScene from "./scenes/RetailScene";
import NocScene from "./scenes/NocScene";
import HotelScene from "./scenes/HotelScene";
import FlipScene from "./scenes/FlipScene";

const CHANNELS = [
  { key: "signage", chip: "SIGNAGE", label: "Smart Signage", ch: "CH·01", osd: "SMART SIGNAGE", Scene: RetailScene },
  { key: "video-wall", chip: "VIDEO WALL", label: "Video Wall", ch: "CH·02", osd: "VIDEO WALL", Scene: NocScene },
  { key: "hotel-tv", chip: "HOTEL TV", label: "Hospitality TV", ch: "CH·03", osd: "HOSPITALITY TV", Scene: HotelScene },
  { key: "interactive", chip: "INTERACTIVE", label: "Interactive Display", ch: "CH·04", osd: "INTERACTIVE", Scene: FlipScene },
] as const;

/** The hero's right-half "stage": a display that morphs through four product
 *  form factors on a pure-CSS 20s loop. React only handles manual chip mode
 *  and the desktop 3D tilt — the loop itself runs without JS. */
export default function DisplayStage() {
  const { manualIndex, select, resumeAuto } = useStageChannel();
  const posthog = usePostHog();
  const colRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // 3D mouse tilt: desktop fine-pointer viewports only, rAF-throttled.
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

  const manual = manualIndex !== null;
  const on = (i: number) => (manualIndex === i ? " on" : "");

  return (
    <div ref={colRef} className="stg-col w-full">
      <div className={`stg-scale${manual ? " stg-manual" : ""}`}>
        {/* Everything visual is decorative; the H1/copy carry the information. */}
        <div aria-hidden="true">
          <div className="stg-persp">
            {CHANNELS.map((c, i) => (
              <div key={c.key} className={`stg-glow g${i + 1}${on(i)}`} />
            ))}
            <div ref={tiltRef} className="stg-tilt">
              <div className="stg-dust d1" />
              <div className="stg-dust d2" />
              <div className="stg-dust d3" />
              <div className="stg-dust d4" />
              <div className="stg-float">
                <div className="stg-stagebox stg-reveal">
                  {CHANNELS.map((c, i) => (
                    <div key={c.key} className={`stg-osd o${i + 1}${on(i)}`}>
                      {c.ch} <b>{c.osd}</b>
                    </div>
                  ))}
                  {CHANNELS.map(({ key, Scene }, i) => (
                    <div key={key} className={`stg-prod p${i + 1}${on(i)}`}>
                      <Scene />
                    </div>
                  ))}
                  <div className="stg-boot" />
                </div>
                <div className="stg-floor">
                  {CHANNELS.map((c, i) => (
                    <div key={c.key} className={`stg-pool g${i + 1}${on(i)}`} />
                  ))}
                  <div className="stg-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="stg-chips">
          {CHANNELS.map((c, i) => (
            <button
              key={c.key}
              type="button"
              className={`stg-chip c${i + 1}`}
              aria-pressed={manualIndex === i}
              aria-label={`Preview: ${c.label}`}
              onClick={() => {
                select(i);
                posthog?.capture("hero_stage_channel_click", { channel: c.key });
              }}
            >
              {c.chip}
              <span className="stg-chip-bar" />
            </button>
          ))}
          {manual && (
            <button
              type="button"
              className="stg-chip stg-chip-auto"
              onClick={() => {
                resumeAuto();
                posthog?.capture("hero_stage_auto_resume");
              }}
            >
              ▶ AUTO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Reconcile dust class names** — Task 7's CSS uses `.stg-dust.d1–.d4` (matching the JSX above). Confirm no other spelling (`stg-dust-1`) exists anywhere in `stage.css`; fix to `.d1–.d4` if found.

- [ ] **Step 4: Verify it compiles** — run `npx tsc --noEmit`. Expected: clean. (DisplayStage is still unmounted; runtime verification happens after Task 8 wires it into the hero.)

- [ ] **Step 5: Commit**

```bash
git add components/sections/hero/stage.css components/sections/hero/DisplayStage.tsx
git commit -m "feat(hero): display stage island - loop chrome, manual chips, tilt

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: HeroSection integration — fonts, grid, premium left column

**Files:**
- Modify: `components/sections/hero/stage.css` (append the hero-shell section at the end)
- Modify: `components/sections/HeroSection.tsx` (full rewrite below)
- Modify: `app/globals.css` (LCP comment block above `@keyframes word-rise`, ~lines 242–250)

**Interfaces:**
- Consumes: `DisplayStage` (Task 7), `@keyframes stg-pulse` (Task 4), existing `AnimatedCounter`, `MagneticButton`, `.hero-word` (globals.css).
- Produces: the shipped hero. Fonts exposed as `--font-display` / `--font-mono` / `--font-hand` on the `<section>` — Space Grotesk deliberately shadows the site-wide Plus Jakarta Sans `--font-display` inside the hero subtree, which restyles the H1 through the existing `h1 { font-family: var(--font-display) }` rule in globals.css.

- [ ] **Step 1: Append the hero shell to `components/sections/hero/stage.css`:**

```css
/* ── hero shell (classes used by the server HeroSection) ──────────────────── */
.hero2 {
  background: #04060d;
  isolation: isolate;
}
/* Pixel-grid dot field — the "display" identity motif. */
.hero2-dots {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(148, 163, 184, 0.07) 1px, transparent 1.3px);
  background-size: 26px 26px;
}
.hero2-vignette {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 120%, transparent 30%, rgba(0, 0, 0, 0.55) 100%);
}
/* Static film grain: one tiny inline SVG data-URI, per the perf budget. */
.hero2-noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/></filter><rect width="140" height="140" filter="url(%23n)" opacity="0.55"/></svg>');
}
/* Aurora blobs. Soft gradient stops replace the mockup's blur(70px). */
.hero2-aur {
  position: absolute;
  width: 46%;
  height: 52%;
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}
.hero2-aur-a {
  left: -8%;
  top: -14%;
  background: radial-gradient(closest-side, rgba(37, 99, 235, 0.34), rgba(37, 99, 235, 0.12) 45%, transparent 72%);
  animation: hero2-drift 16s ease-in-out infinite alternate;
}
.hero2-aur-b {
  right: -10%;
  bottom: -18%;
  background: radial-gradient(closest-side, rgba(124, 58, 237, 0.27), rgba(124, 58, 237, 0.1) 45%, transparent 72%);
  animation: hero2-drift 19s ease-in-out infinite alternate-reverse;
}
@keyframes hero2-drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(40px, 26px) scale(1.15); }
}
/* Entrance rise for badge / subcopy / CTAs (H1 uses .hero-word). `both` fill
   keeps elements hidden through their delay and painted after. */
.hero2-rise {
  animation: hero2-risein 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes hero2-risein {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Mono badge with pulsing status dot (reuses stg-pulse from the NOC scene). */
.hero2-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #7dd3fc;
  background: rgba(125, 211, 252, 0.07);
  border: 1px solid rgba(125, 211, 252, 0.16);
  padding: 7px 16px;
  border-radius: 99px;
}
.hero2-badge::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
  animation: stg-pulse 2.4s ease-in-out infinite;
}
@media (max-width: 420px) {
  .hero2-badge { font-size: 10px; letter-spacing: 0.16em; }
}
/* Shimmering headline gradient (replaces the static bg-clip gradient). */
.hero2-grad {
  background: linear-gradient(100deg, #60a5fa 15%, #a5b4fc 38%, #f0f9ff 50%, #c4b5fd 62%, #818cf8 85%);
  background-size: 230% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero2-shimmer 7s ease-in-out infinite;
}
@keyframes hero2-shimmer {
  0%, 100% { background-position: 0% 0; }
  50% { background-position: 100% 0; }
}
.hero2-sub { color: #8b98ad; }
.hero2-sub strong { color: #d3dbe6; }
.hero2-disp { font-family: var(--font-display, system-ui, sans-serif); }
/* CTA hover sheen sweep (MagneticButton still wraps the links). */
.hero2-cta {
  position: relative;
  overflow: hidden;
}
.hero2-cta::after {
  content: "";
  position: absolute;
  top: -40%;
  bottom: -40%;
  width: 30%;
  left: -50%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
}
.hero2-cta:hover::after { left: 130%; }
.hero2-cta2 {
  border: 1px solid rgba(255, 255, 255, 0.22);
  transition: border-color 0.3s, background-color 0.3s;
}
.hero2-cta2:hover {
  border-color: rgba(125, 211, 252, 0.5);
  background: rgba(125, 211, 252, 0.06);
}
```

- [ ] **Step 2: Rewrite `components/sections/HeroSection.tsx`** (full file — copy, hrefs, stats, sr-only span are byte-identical to the current file):

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Space_Grotesk, IBM_Plex_Mono, Caveat } from "next/font/google";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import DisplayStage from "@/components/sections/hero/DisplayStage";

// Hero-scoped premium type system (spec §4). Applied as CSS variables on the
// <section>: --font-display intentionally shadows the site-wide Plus Jakarta
// Sans inside the hero subtree (phase 2 decides the site-wide swap).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hand",
  display: "swap",
  preload: false,
});

const STATS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "5+", label: "Years in Business" },
  { value: "10,000+", label: "Installations Done" },
  { value: "100%", label: "Genuine Samsung" },
];

export default function HeroSection() {
  return (
    <section
      className={`${spaceGrotesk.variable} ${plexMono.variable} ${caveat.variable} hero2 relative min-h-[88vh] flex flex-col overflow-hidden`}
    >
      {/* Layered backdrop: pixel-dot field, drifting auroras, film grain,
          bottom vignette — all CSS, no images (stage.css `hero2-*`). */}
      <div className="hero2-dots" aria-hidden="true" />
      <div className="hero2-aur hero2-aur-a" aria-hidden="true" />
      <div className="hero2-aur hero2-aur-b" aria-hidden="true" />
      <div className="hero2-noise" aria-hidden="true" />
      <div className="hero2-vignette" aria-hidden="true" />

      <div className="relative z-[2] flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 md:py-16 grid items-center gap-10 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="hero2-badge hero2-rise mb-5" style={{ animationDelay: "0.15s" }}>
            Authorized Samsung Business Partner
          </div>

          <h1
            className="font-bold text-white mb-6"
            style={{
              fontSize: "clamp(36px, 4.8vw, 72px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
            }}
          >
            <span className="md:drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              <span className="hero-word" style={{ animationDelay: "0.3s" }}>India&apos;s Premier</span>
              <br />
              <span
                className="hero-word hero2-grad sm:whitespace-nowrap"
                style={{
                  animationDelay: "0.45s",
                  // bg-clip-text + tight line-height clips descenders (p, y, g).
                  // Add a little vertical room and offset it so line spacing
                  // stays visually unchanged.
                  lineHeight: 1.18,
                  paddingBottom: "0.08em",
                  marginBottom: "-0.08em",
                }}
              >
                Display Technology
              </span>
              <br />
              <span className="hero-word" style={{ animationDelay: "0.6s" }}>Partner</span>
            </span>
            {/* Keyword-rich context for crawlers without altering the visual headline. */}
            <span className="sr-only">
              {" "}— Authorized Samsung distributor for digital signage, video walls,
              interactive displays, and hospitality TVs across India.
            </span>
          </h1>

          {/* Visible supporting paragraph: gives the hero indexable body copy
              with the primary keywords search engines rank this page on. */}
          <p
            className="hero2-sub hero2-rise text-base md:text-lg mb-7 max-w-xl leading-relaxed"
            style={{ animationDelay: "0.75s" }}
          >
            Authorized Samsung distributor for{" "}
            <strong className="font-semibold">Smart Signage</strong>,{" "}
            <strong className="font-semibold">Video Walls</strong>,{" "}
            <strong className="font-semibold">Interactive Displays</strong>, and{" "}
            <strong className="font-semibold">Hospitality TVs</strong> —
            with certified installation and support across India.
          </p>

          <div className="hero2-rise flex flex-col sm:flex-row gap-3" style={{ animationDelay: "0.9s" }}>
            <MagneticButton>
              <Link
                href="/quote"
                className="hero2-cta hero2-disp inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-full font-bold text-base transition-colors"
                style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.45)" }}
              >
                Request a Free Quote
                <ArrowRight size={18} />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/products"
                className="hero2-cta2 hero2-disp inline-flex items-center justify-center gap-2.5 text-white px-7 py-3.5 rounded-full font-bold text-base"
              >
                Browse Products
                <ArrowRight size={18} style={{ opacity: 0.45 }} />
              </Link>
            </MagneticButton>
          </div>
        </div>

        {/* The stage: renders beside the copy on lg+, below the CTAs on
            smaller viewports (single-column grid flow). */}
        <DisplayStage />
      </div>

      {/* Stats bar — horizontal scroll pill strip on mobile, even 4-col row on desktop */}
      <div className="relative z-[2] bg-[#04060d]/90 md:bg-[#04060d]/65 md:backdrop-blur-md border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex-1 py-4 md:py-5 text-center ${i < STATS.length - 1 ? "border-r border-white/8" : ""}`}
              >
                <div className="text-xl md:text-3xl font-black text-white leading-none">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-[10px] md:text-xs font-medium text-gray-500 mt-1 px-1 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update the LCP comment in `app/globals.css`** — replace the "LCP note" paragraph inside the "Staggered hero entrance" comment block (keep the keyframe/class untouched):

```
   LCP note: the H1 is the LCP element, and an opacity-0 start defers when the
   browser counts it as painted. The premium hero staggers lines at
   0.3/0.45/0.6s (spec 2026-07-17-premium-hero-stage-design §5); Lighthouse
   before/after gates this — if mobile LCP regresses, tighten the delays
   (see the plan's Task 10 contingency). The reduced-motion guard (plus the
   hero2 block in components/sections/hero/stage.css) collapses the stagger
   entirely for reduced-motion users.
```

- [ ] **Step 4: Compile + runtime verify (desktop)** — run `npx tsc --noEmit` (clean), then use the `verify` skill to build/launch and check at 1440×900:
  - Hero shows copy left, stage right; stats bar intact.
  - H1 renders in Space Grotesk (compare letterforms — single-story "a" vs Jakarta), badge/OSD/chips in Plex Mono.
  - Power-on line sweeps once (~1.15s), stage reveals (~1.95s), then the 20s loop: retail → NOC → hotel → Flip, with OSD flashes, floor pools re-coloring (blue → teal → amber → silver), chip progress bars in sync.
  - Clicking VIDEO WALL pins CH·02 + shows "▶ AUTO"; clicking ▶ AUTO resumes the loop; mouse-move tilts the stage; CTA hover sheen works.
  - Screenshot the hero for the record.

- [ ] **Step 5: Commit**

```bash
git add components/sections/hero/stage.css components/sections/HeroSection.tsx app/globals.css
git commit -m "feat(hero): premium hero - fonts, split-stage grid, entrance motion

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Mobile pass — stage below CTAs, 390px clip bug, reduced motion

**Files:**
- Modify: whichever file the 390px diagnosis implicates (`components/sections/HeroSection.tsx` and/or `components/sections/hero/stage.css`)

**Interfaces:**
- Consumes: the assembled hero from Task 8.

- [ ] **Step 1: Verify mobile layout at 390×844** (verify skill): stage renders below the CTAs at reduced size (~240px stage box via the container scale), loop runs, tilt does NOT engage, no horizontal page scroll (`document.scrollingElement.scrollWidth === window.innerWidth`).

- [ ] **Step 2: Diagnose the pre-existing 390px clip** (spec §6 QA item: subheadline rendered "Smart Signag…"). In the driven browser at 390px, find offenders:

```js
[...document.querySelectorAll('section *')].filter(el => {
  const r = el.getBoundingClientRect();
  return r.right > window.innerWidth + 1;
}).map(el => `${el.className} → ${Math.round(el.getBoundingClientRect().right)}`)
```

Prime suspects (in order): the `sm:whitespace-nowrap` gradient span (only ≥640px, so likely innocent at 390), the wide-tracked badge (mitigated by the ≤420px rule in Task 8's CSS), the `<p>`'s content vs `px-4` gutter. Apply the smallest fix that clears the overflow — e.g. drop `sm:whitespace-nowrap` if the span is the offender at any width where it applies, and re-check 640–1024px too.

- [ ] **Step 3: Reduced-motion pass** — relaunch the driven browser with reduced motion emulated (CDP `Emulation.setEmulatedMedia` features `prefers-reduced-motion: reduce`, or Chromium flag `--force-prefers-reduced-motion`). Verify: no movement anywhere; badge/H1/subcopy/CTAs fully visible immediately; the stage shows CH·01 (retail) statically with its blue glow + pool; no boot line, no sheen, no chip bars. Chips still work (pinning still swaps the static scene).

- [ ] **Step 4: Re-verify desktop unaffected** — quick 1440×900 screenshot; confirm loop + entrance still correct after any Step 2 fix.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix(hero): mobile stage pass - 390px overflow + reduced-motion states

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Quality gate — tests, lint, build, Lighthouse vs baseline

**Files:**
- Modify (only if the contingency triggers): `components/sections/HeroSection.tsx` (entrance delays), `components/sections/hero/stage.css`

- [ ] **Step 1: Full static gate** — run and require all green:

```
npx tsc --noEmit      → clean
npm run test          → all pass (incl. useStageChannel tests)
npm run lint          → clean
npm run build         → succeeds
```

- [ ] **Step 2: Lighthouse after** — same commands/settings as the Task 1 baseline, desktop + mobile, against the production build (`npm run start` via the verify skill). Record LCP / CLS / Performance side by side with the baseline in the task notes.

- [ ] **Step 3: Apply contingencies only if measured** (spec §8: validate; §6: measure before deciding):
  - **LCP** — if mobile LCP regresses >0.3s vs baseline or exceeds 2.5s: tighten entrance delays (badge 0.1s, H1 lines 0.12/0.2/0.28s, subcopy 0.4s, CTAs 0.5s) and re-measure.
  - **CLS** — must stay ≈ 0 (stage height is width-derived em, so no late shift is expected; if Lighthouse shows hero CLS, find and pin the offender).
  - **Mobile CWV still poor with the stage present** — gate the stage to `lg+` (`hidden lg:block` on the `.stg-col` wrapper) per spec §6, and note the decision in the commit message.

- [ ] **Step 4: Commit** (only if Step 3 changed anything):

```bash
git add -A
git commit -m "perf(hero): tune entrance timing per Lighthouse gate

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Review + branch finish

- [ ] **Step 1: Self/code review** — invoke the `superpowers:requesting-code-review` skill (or `/code-review`) on the branch diff; fix anything CONFIRMED, re-running the Task 10 static gate after fixes.
- [ ] **Step 2: Verify clean tree** — `git status` shows nothing uncommitted; `git log master..feat/premium-hero --oneline` lists the task commits.
- [ ] **Step 3: Finish** — invoke `superpowers:finishing-a-development-branch`. Present the user the merge/PR options; do NOT merge autonomously. Remind: `feat/live-chat` is still in flight in the original checkout — do not touch it.
- [ ] **Step 4: Memory** — update `premium-hero-redesign.md` (phase 1 implemented on `feat/premium-hero`, awaiting user review; phase 2 site-wide system still pending its own brainstorm).

---

## Self-review notes (already folded in)

- Mockup deviations, all deliberate and commented in code: blur→gradient swaps (perf §8), sheen/chip-bar/dust converted to transform-only, pool centering fixed (mockup's `translateX(-50%)` was clobbered by the shared `stg-chan` keyframe), `transform-origin: bottom` on NOC bars, manual-mode static sticky notes, Caveat 600 (spec) instead of the mockup's 700, chips upgraded to fixed-px buttons with `aria-pressed` + min-height 30px.
- Spec coverage: §2 constraints → Global Constraints + Task 8 copy freeze; §3 architecture/files → File Structure; §4 fonts → Task 8; §5 motion → Tasks 7–8 (entrance, power-on, loop, OSD, sheen, float, aurora, dust) + scene tasks (in-scene motion) + Task 7 (tilt, chips) + Task 9 (reduced motion); §6 responsive → container-query scale + Tasks 8–9; §7 a11y → Task 7 markup; §8 perf → budget lines + Task 10; §9 analytics/testing → Tasks 2, 7, 9, 10; §10 build notes → Task 1; §11 out of scope → untouched.
- Type consistency: `useStageChannel` names (`manualIndex`/`select`/`resumeAuto`) match between Tasks 2 and 7; scene components are prop-less default exports consumed as `Scene` in Task 7; class names `.p1–.p4/.g1–.g4/.o1–.o4/.c1–.c4/.d1–.d4` consistent across Tasks 3–8.




