# SEO Migration & Growth Strategy — Design

**Date:** 2026-07-17
**Owner:** Sunil (taking over SEO custody from the incumbent agency)
**Status:** Design — approved framing, updated with audit-data findings, pending spec review

---

## 1. Situation (verified against the audit PDF + keyword XLSX, not assumed)

| Fact | Detail | Source |
| --- | --- | --- |
| Old site is LIVE and ranking | Apache/PHP on US GoRock server, `www.aplustechsol.com` | User |
| Old site is controlled by another agency | We cannot edit its code | User |
| New Next.js site is NOT live | This repo; never crawled by Google | Repo |
| We control DNS | Cutover is ours to schedule | User |
| Traffic is small | 1.28k clicks / 50.8k impressions / 2.5% CTR / avg pos 9.3 (3mo); ~404 clicks/28d; GA ~460–780 users/28d | Audit p1–3, p9–13 |
| Traffic is ~95–96% India | US/UAE/Saudi/Germany all <1% | Audit p5, p7 |
| Top queries are branded + one model number | "aplus technology solutions…" (119), "hg55u701f" (48), rest branded. **~Zero non-branded commercial-intent clicks.** | Audit p5 |
| **City hub pages are the #1 growth engine** | 28-day top trending-up pages: `/delhi/` (+11), `/bangalore/` (+5), `/indore/` (+4), `/kolkata/` (+4); 3-mo: `/bhubaneswar/` (+12) | Audit p4, p6 |
| Datasheet intent is emerging | "hg55u701f datasheet" trending up from 0 | Audit p7 |
| `/contact-us/` is the conversion page | 179 key events = **96.76% of all conversions** | Audit p11, p13 |
| GMB interactions are declining | 281 total; Apr ~108 → Jul ~43, despite active weekly posting | Audit p14–16 |
| Old site has `llms.txt`; **new site does not** | GEO parity gap — new site `public/` has none | Audit p18 + repo |
| New site tech SEO baseline is strong | Org/LocalBusiness JSON-LD, per-product metadata, canonicals, OG images, sitemap, robots | Repo |
| Old site SEO/GEO audit grades: A / A+ | "Strong foundation, minor issues"; LocalBusiness schema + llms.txt present | Audit p17–18 |
| **Redirect map integrity: verified sound** | All existing targets resolve; no loops (5/5 checks) | This session |
| **Redirect map coverage: INCOMPLETE** | 5 real, trafficked old URLs 404 today (see §2.1) — and that's from the top-10 GA pages alone, out of **350** trafficked pages | This session |
| City hubs (95) are unbuilt | Would 404 on cutover; spec+plan exist, not implemented | Repo |

### The core reframe

The reports look like success (SEO A, GEO A+, ~1,048 keywords at #1) but describe **a site we don't control, ranking for terms nobody searches.** The audit's own detail proves it: the money is in **branded queries, model numbers, and city hub pages** — not the thousand long-tail model-name variants. "Better SEO" splits into two guarantees:

- **"Not worse"** = *zero ranking loss at cutover*: a **coverage-complete** redirect map, every currently-ranking/trafficked URL has a live destination, llms.txt preserved, and a measured before/after.
- **"Better"** = net gains on top: edge speed for India, non-branded commercial-intent content, datasheet-optimized product pages, a revived GBP.

---

## 2. Redirect coverage — the crux of "not worse"

The migration's safety rests on `middleware.ts` + `lib/redirects.ts`. Two separate questions:

**Integrity (PASS).** Every product redirect target is a real product id; every category target a real category id; no merged-duplicate key still lives as a product; no loops. The last-segment match means one 75-entry slug→id map 301s thousands of city/role URLs at once. The 20 products with no incoming redirect are net-new 2026 inventory (correct).

**Coverage (INCOMPLETE — must fix before cutover).** Internal integrity ≠ complete coverage. Checking the audit's actual trafficked URLs against the map surfaced **5 confirmed 404s from the top-10 GA pages alone**:

### 2.1 Confirmed redirect gaps (would 404 today)

| Old URL (has real traffic) | 28-day views | Should 301 to (proposed) |
| --- | --- | --- |
| `/services/` | in top pages (p10) | `/products` or a new `/solutions` map — decide in Phase 0 |
| `/samsung-interactive-displays/` (plural) | in top pages (p10) | `/categories/interactive` (map has only the singular) |
| `/displays-screens-india/` | in top pages (p10) | `/products` (catch-all catalog) |
| `/samsung-business-tv/samsung-business-tv-beh-k2/` | 19 (p11) | `/products/samsung-business-tv-befx-h2` (GA title confirms it *is* the BEFX-H2) |
| `/dahlv/` | 16 (p11) | Unknown slug — resolve via the Phase 0 crawl (likely a mistyped city or a SKU page) |

**Implication:** the map must be completed against the **full** crawl, not spot-checked. 350 trafficked GA pages + the full indexed set is the real surface. This is precisely what Phase 0 produces.

---

## 3. Strategy — five phases

Ordered so every "not worse" guarantee is locked in **before** the DNS switch.

### Phase 0 — Baseline & coverage proof (BEFORE anything ships)
- **Crawl the live old site** (Screaming Frog / its XML sitemaps) → authoritative list of every indexed URL.
- **Export Search Console** (old property, 16 months) + **GA4 landing pages** (all 350) → ranking + traffic baseline.
- **Diff every old URL against the redirect map** → coverage report of ✅ 301s vs ⚠️ would-404. **Add a redirect entry for every ⚠️**, starting with the 5 already confirmed in §2.1.
- Deliverable: a committed coverage report + a redirect map with **0 known 404s**.

### Phase 1 — Build the ranking-preserving surface
- **Build the 95 city landing pages** (`app/[city]/page.tsx`, per the `2026-07-13-city-landing-pages` plan). The audit proves city hubs are the top trending-up pages — this is protecting the #1 growth engine, not optional polish.
- **Add `llms.txt`** to the new site (old site has one; required for GEO parity).
- Confirm every product/category/blog/static 301 resolves, including the §2.1 fixes.
- Preserve the **contact page** conversion path (it drives 96.76% of conversions) — verify the new `/contact` + lead form/quote flow works and that `/contact-us/` 301s to it.
- Set up GSC + Bing for the new deployment; prepare the new sitemap.

### Phase 2 — Cutover
- Deploy to Vercel (edge-fast for the 95%-India audience — a ranking tailwind vs US Apache).
- Test on a preview/staging domain first (redirects, metadata, Core Web Vitals, llms.txt, contact flow).
- Point DNS (ours). Same domain → no change-of-address needed.
- Submit sitemap; request indexing on top pages.
- **Monitor GSC coverage daily for 2–4 weeks**: 404 spikes, crawl errors, impression drops.

### Phase 3 — Net-gain layer (beat the incumbent, not just match)
- **Non-branded commercial-intent pages**: distributor/dealer/price landing pages for the buyer queries the old site never ranked for (its top queries are all branded).
- **Datasheet-optimized product pages**: "hg55u701f datasheet" is already trending — make product pages win model+datasheet queries decisively (spec table, downloadable PDF, schema).
- **High-intent guides**: a small set of comparison/informational posts.
- **Google Business Profile revival**: interactions are declining despite weekly posts — maintain the posting cadence *and* add reviews, Q&A, real product photos (GMB currently uses stock landscapes), and point the GBP website link at the new fast site.

### Phase 4 — Measure the delta
Compare post-launch GSC/GA to the Phase-0 baseline (clicks, impressions, position, indexed-page count, 404 count, GBP interactions). The proof you came out ahead.

---

## 4. Scope boundaries (YAGNI)

- **Do NOT** rebuild the ~7,125 city×product clone pages — they 301 to the product page; the 95 city *hubs* carry the local intent (audit-confirmed).
- **Do NOT** chase the zero-demand long-tail keywords the old site "ranks #1" for — they produce ~0 clicks.
- **Do NOT** touch the old site's code — not ours; we only *read* it for the Phase-0 inventory.
- **No** change-of-address in GSC (same domain).

---

## 5. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Trafficked old URL 404s after cutover | Phase 0 crawl + diff; §2.1 gaps fixed first; map reaches 0 known 404s before switch |
| 95 city hubs 404 (the #1 growth engine) | Phase 1 builds them before cutover |
| GEO regression | Add `llms.txt`; keep LocalBusiness schema (already present) |
| Lose the conversion path | Verify `/contact` + quote flow; 301 `/contact-us/`; watch key-event count post-launch |
| Ranking dip during re-crawl | Same-domain 301s (fastest signal transfer); daily monitoring; keep old server on a fallback subdomain for diffing if possible |
| GBP interactions keep declining | Maintain posting cadence + reviews/Q&A/real photos; repoint website link |
| GA4 data quality (odd "5K new users" vs 807 active, p9) | Sanity-check GA4 config during Phase 0 so the baseline is trustworthy |

---

## 6. Success criteria

- **Not-worse (hard gate):** post-cutover 404 count ≈ 0 for previously-indexed/trafficked URLs; clicks/impressions within noise of baseline within 4–6 weeks; branded + model queries retain position; `/contact` conversions hold.
- **Better (goal):** measurable lift in non-branded commercial-intent clicks; faster LCP for India; datasheet/model queries won; recovering GBP interactions; net-new inventory (The Wall, LED, e-paper) indexed and ranking.

---

## 7. First concrete deliverable

**Phase 0 tooling + the city-page build**, because together they *are* the "don't perform worse" guarantee: Phase 0 proves the redirect map is complete against the real indexed/trafficked URL set (starting with the 5 confirmed gaps), and the city pages close the largest known 404 gap while protecting the top growth engine. Everything else compounds on top once the site is safely live.
