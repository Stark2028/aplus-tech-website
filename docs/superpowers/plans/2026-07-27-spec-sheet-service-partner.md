# Spec Sheet Service-Partner Credential Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** State Aplus's Samsung *service* authorization on the generated per-product spec sheet PDF, alongside the display-distribution authorization it already claims.

**Architecture:** Two string constants in `lib/pdf/specSheet.ts` change — the page-1 header sub-line returned by `distributorLineFor()`, and the description of the first Samsung trust card. No layout code is touched: both new strings were measured against the real font metrics and the real wrap width before approval and fit the existing boxes. The Logitech branches of both are deliberately untouched.

**Tech Stack:** TypeScript, pdf-lib (Helvetica standard fonts), Vitest.

## Global Constraints

- **Positioning rule — Logitech surfaces carry no Samsung claims.** `distributorLineFor(logitech)` and `trustCardsFor(logitech)` must never match `/authoriz|partner|certif|samsung/i`. Only the Samsung branch and `SAMSUNG_TRUST_CARDS` change in this plan.
- **Exact approved copy, verbatim** — header line: `Authorized Samsung Commercial Display Distributor & Service Partner · India`. Trust card description: `Genuine India-spec units, full Samsung warranty, authorized service.`
- **Separator is the middle dot `·` (U+00B7)**, matching the existing line — not a bullet, hyphen, or pipe. It is passed through `safe()` at the draw site.
- **Term is "Service Partner", never "Service Center"** — see the spec's terminology section.
- **`trustCardsFor` must always return exactly three cards.** The trust strip divides the content width by 3. Do not add a fourth card for the service claim.
- **Card titles are unchanged.** Only the first Samsung card's *description* changes; the title stays `Samsung Authorized`.

**Spec:** [docs/superpowers/specs/2026-07-27-spec-sheet-service-partner-design.md](../specs/2026-07-27-spec-sheet-service-partner-design.md)

---

### Task 1: Both Samsung credentials on the spec sheet

**Files:**
- Modify: `lib/pdf/specSheet.ts:63-67` (`SAMSUNG_TRUST_CARDS`) and `lib/pdf/specSheet.ts:86-90` (`distributorLineFor`)
- Test: `lib/pdf/specSheet.brand.test.ts:32-40` (replace one loose assertion) and `:8-30` (add one card assertion)

**Interfaces:**
- Consumes: nothing from earlier tasks — this is the only task.
- Produces: no signature changes. `distributorLineFor(product: Pick<Product, "brand">): string` and `trustCardsFor(product: Pick<Product, "brand">): ReadonlyArray<readonly [string, string]>` keep their exact existing signatures. Only the returned string values change.

- [ ] **Step 1: Write the failing tests**

In `lib/pdf/specSheet.brand.test.ts`, **replace** the existing loose Samsung assertion (currently lines 33-35):

```ts
  it("Samsung keeps 'Authorized Samsung Commercial Display Distributor'", () => {
    expect(distributorLineFor(samsung)).toMatch(/Authorized Samsung/i);
  });
```

with one that actually pins both credentials:

```ts
  it("Samsung names both the distribution and the service authorization", () => {
    expect(distributorLineFor(samsung)).toMatch(
      /Authorized Samsung Commercial Display Distributor & Service Partner/
    );
  });

  it("Samsung line says 'Service Partner', never 'Service Center'", () => {
    expect(distributorLineFor(samsung)).not.toMatch(/service cent(er|re)/i);
  });
```

Then **add** this test inside the existing `describe("trustCardsFor", ...)` block, after the "Samsung keeps the 'Samsung Authorized' trust card" test:

```ts
  it("Samsung trust card states authorized service, not just warranty", () => {
    const [, body] = trustCardsFor(samsung).find(([t]) =>
      /Samsung Authorized/i.test(t)
    ) ?? ["", ""];
    expect(body).toMatch(/authorized service/i);
  });
```

Leave every other test in the file exactly as it is — in particular both Logitech guards, which are the positioning-rule regression net.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/pdf/specSheet.brand.test.ts`

Expected: **2 failures, 6 passing** (8 tests total).

The two that MUST fail are `"Samsung names both the distribution and the service authorization"` and `"Samsung trust card states authorized service, not just warranty"` — the current strings satisfy neither. The `"Service Center"` test passes from the start by design: it is a guard against a wrong future edit, not a red-to-green test.

If either of the two content assertions passes here, the constants were edited before the tests were written — undo the source change and redo the steps in order.

- [ ] **Step 3: Update the two constants**

In `lib/pdf/specSheet.ts`, change the first entry of `SAMSUNG_TRUST_CARDS` (line 64):

```ts
const SAMSUNG_TRUST_CARDS: ReadonlyArray<readonly [string, string]> = [
  ["Samsung Authorized", "Genuine India-spec units, full Samsung warranty, authorized service."],
  ["Pan-India Installation", "Site survey, mounting and commissioning across India."],
  ["ISO 9001:2015", "Certified quality management, GST invoicing, bulk pricing."],
];
```

and the Samsung branch of `distributorLineFor` (line 89):

```ts
export function distributorLineFor(product: Pick<Product, "brand">): string {
  return isLogitech(product)
    ? "Commercial Video Conferencing Supply & Installation · India"
    : "Authorized Samsung Commercial Display Distributor & Service Partner · India";
}
```

Do not touch `LOGITECH_TRUST_CARDS`, the Logitech branch, the card titles, or the doc comments above either function.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/pdf/specSheet.brand.test.ts`

Expected: **PASS, 8/8** — including both Logitech guards, which must still be green. If a Logitech guard fails, the edit landed in the wrong branch or the wrong array; revert and reapply to the Samsung side only.

- [ ] **Step 5: Confirm the strings still fit their boxes**

The whole design rests on both strings fitting without a layout change. Re-verify against the *actual committed* constants rather than trusting the spec's numbers:

```bash
node -e "
(async () => {
  const { PDFDocument, StandardFonts } = require('pdf-lib');
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const b = await doc.embedFont(StandardFonts.HelveticaBold);

  const line = 'Authorized Samsung Commercial Display Distributor & Service Partner · India';
  const spaced = (t,font,size,cs) => font.widthOfTextAtSize(t,size) + cs*(t.length-1);
  const budget = (595.28-42) - spaced('SPEC SHEET',b,8.5,1.6) - 82;
  const w = f.widthOfTextAtSize(line, 7.5);
  console.log('header:', w.toFixed(1), '/', budget.toFixed(1), 'pt', w < budget ? 'OK' : 'OVERFLOW');

  const maxW = (511.28-20)/3 - 20;
  const wrap = (t) => { const o=[]; let l=''; for (const wd of t.split(' ')) { const c = l ? l+' '+wd : wd; if (f.widthOfTextAtSize(c,7.5) <= maxW) l=c; else { if(l) o.push(l); l=wd; } } if(l) o.push(l); return o; };
  for (const t of [
    'Genuine India-spec units, full Samsung warranty, authorized service.',
    'Site survey, mounting and commissioning across India.',
    'Certified quality management, GST invoicing, bulk pricing.',
  ]) console.log('card:', wrap(t).length, 'lines —', t.slice(0,34)+'…');
})();
"
```

Expected output: `header: 257.7 / 403.0 pt OK`, and **all three cards at 2 lines** (equal card heights, so `cardH` is unchanged and the strip does not grow). If the header reports OVERFLOW or any card reports 3 lines, stop — the copy needs shortening and the spec needs revisiting.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`

Expected: PASS. Nothing outside this file reads these two constants, but the suite is the check that says so rather than assuming it.

- [ ] **Step 7: Commit**

```bash
git add lib/pdf/specSheet.ts lib/pdf/specSheet.brand.test.ts
git commit -m "feat(pdf): claim Samsung service-partner authorization on spec sheets"
```

---

## Verification beyond the tests

The unit tests pin the strings; they do not prove the PDF still *looks* right. Step 5 covers that arithmetically, which is sufficient here because no layout code changed. If you want visual confirmation, the recipe that worked for the original redesign is in the project memory: Playwright with a scratchpad `playwright-core` install plus `pdf-to-img` to rasterize, bypassing the lead gate via `localStorage.aplus_lead_gate` (shape in `lib/leadGate.ts`). **Never `npm i` verification deps from inside the repo** — it has crashed the running dev server before.

## Out of scope

Deliberately not changed, per the spec: the website surfaces (`components/Footer.tsx`, `app/about/page.tsx`, `app/products/[slug]/page.tsx`, `app/products/page.tsx`, `app/layout.tsx` metadata, `lib/jsonLd.ts`, `app/products/[slug]/ogBadge.ts`) and the quote PDF, which is brand-neutral by design. Rolling the credential into indexed `<title>`/description copy is its own change with its own SEO review.
