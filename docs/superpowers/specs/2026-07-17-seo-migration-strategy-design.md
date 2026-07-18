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

The migration's safety rests on `middleware.ts` + `lib/redirects.ts`. I pulled the **live old-site sitemaps** (this session, via the public URLs) to measure coverage exactly.

### 2.0 Verified live inventory (from `sitemap.xml` + 3 child sitemaps)

| Sitemap | Count | Contents |
| --- | --- | --- |
| `sitemap.xml` | ~58 | home, `/about-us/`, `/contact-us/`, `/products/`, `/privacy-policy/`, `/terms-and-conditions/`, `/our-presence/`, `/blog/` + 4 posts, 6 category roots, ~40 product pages |
| `sitemap-1.xml` | 228 | `/distributor/`, `/suppliers/`, `/exporters/` roots + 75 products each |
| `sitemap-2.xml` | 2,020 | cities A–M: each city **hub** + ~59 city×product pages |
| `sitemap-3.xml` | 1,190 | cities N–Z: each city **hub** + city×product pages |
| **Total declared** | **~3,496** | (not the ~7,500 earlier assumed — the real declared surface is ~3.5k) |

**Coverage of the declared sitemap = effectively 100%.** The 75 distinct product slugs used across every city/role URL match the 75 keys in `OLD_PRODUCT_SLUG_TO_ID` **exactly, 1:1** (verified diff, 0 missing). So:

- Static pages, 6 category roots, 4 blog posts, 75 product pages, 3 role roots, all 225 role×product and ~3,200 city×product URLs → **301 correctly** (last-segment match).
- The 95 **city hubs** (`/agra/`, `/noida/`, …) are the one exception: they must become **real pages** (Phase 1), not redirects — they're the top growth engine.

**Integrity also PASS:** every redirect target resolves; no loops; the 20 products with no incoming redirect are net-new 2026 inventory (correct).

### 2.1 The real gap: non-sitemapped legacy orphans

The only would-404 URLs are ones **not in the current sitemap** but still indexed/trafficked (surfaced by GA4, p10–13). These need manual redirect entries:

| Old URL (has traffic, NOT in sitemap) | Evidence | Should 301 to (proposed) |
| --- | --- | --- |
| `/services/` | GA top pages (p10) | `/products` (or a `/solutions` mapping) |
| `/samsung-interactive-displays/` (plural) | GA top pages (p10) | `/categories/interactive` (map has only the singular) |
| `/displays-screens-india/` | GA top pages (p10) | `/products` |
| `/samsung-business-tv/samsung-business-tv-beh-k2/` | 19 views (p11) | `/products/samsung-business-tv-befx-h2` (GA title confirms it IS the BEFX-H2) |
| `/dahlv/` | 16 views (p11) | resolve via GSC Pages export (likely a mistyped city or stray SKU) |

**Implication:** the declared surface is safe; the residual risk is a **finite set of legacy orphans**. To find them ALL, one input is needed that the public site can't give: the **GSC "Pages" export** (every URL Google has indexed, including de-listed-from-sitemap ones). That is the single remaining Phase-0 dependency.

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
