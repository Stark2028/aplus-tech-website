# SEO Migration & Growth Strategy — Design

**Date:** 2026-07-17
**Owner:** Sunil (taking over SEO custody from the incumbent agency)
**Status:** Design — approved framing, pending spec review

---

## 1. Situation (verified, not assumed)

| Fact | Detail | Source |
| --- | --- | --- |
| Old site is LIVE and ranking | Apache/PHP on US GoRock server, `www.aplustechsol.com` | User |
| Old site is controlled by another agency | We cannot edit its code | User |
| New Next.js site is NOT live | This repo; never crawled by Google | Repo |
| We control DNS | Cutover is ours to schedule | User |
| Real traffic is small & branded | ~1.28k clicks / 50.8k impressions / 2.5% CTR / avg pos 9.3 over ~3mo; 95% India | GSC screenshots |
| "1,048 keywords at #1" is a vanity metric | Terms are zero-demand long-tail model-name variants (e.g. "24 Inch Interactive QBC"); they produce ~0 clicks | Keyword XLSX (1,059 rows: 1,048×#1, 10×#2, 1×#3) |
| New site tech SEO is already strong | Org/LocalBusiness JSON-LD, per-product metadata, canonicals, OG images, sitemap, robots | Repo |
| Redirect map is verified-sound | All targets resolve to real pages; no loops (5/5 integrity checks pass) | `scripts` audit, this session |
| **One structural risk remains** | The 95 legacy city hub pages (`/delhi`…) are **not built** and would 404 on cutover | `middleware.ts` + unbuilt `app/[city]` |

### The core reframe

The reports look like success (SEO grade A, GEO A+, ~1,048 #1 rankings) but describe **a site we don't control, ranking for terms nobody searches.** The one asset we fully control — this fast Next.js site — is switched off. So "better SEO" splits into two distinct guarantees:

- **"Not worse"** = *zero ranking loss at cutover*: a proven-complete redirect map, every currently-ranking URL has a live destination, and a measured before/after.
- **"Better"** = net gains on top: edge speed for India, buyer-intent content, a revived Google Business Profile.

These need different work and are sequenced accordingly.

---

## 2. Verified redirect coverage

The migration's ranking-safety rests on the redirect layer in `middleware.ts` + `lib/redirects.ts`. Verified this session:

- **Mechanism:** old city/role URLs (`/delhi/samsung-qet-series`, `/distributor/samsung-flip-3`) all *end* in a product slug, so one 75-entry slug→id map matched on the **last** path segment 301s thousands of old URLs at once. Plus 6 category roots, 9 static/exact paths, 6 merged-duplicate ids.
- **Integrity (all PASS):** every product redirect target is a real product id; every category target is a real category id; no merged-duplicate key still exists as a live product; no redirect loops.
- **20 "orphan" products** (The Wall, all-in-one LED, e-paper, outdoor, etc.) have no incoming old-URL redirect — **correct**, because they are net-new 2026 inventory that never existed on the old site.

**Conclusion:** the redirect map itself is not the risk. The risk is (a) the unbuilt 95 city pages, and (b) any *indexed old URL we haven't inventoried yet* — which Phase 0 exists to find.

---

## 3. Strategy — five phases

Ordered so every "don't perform worse" guarantee is locked in **before** the DNS switch, and growth work comes after.

### Phase 0 — Baseline & coverage proof (BEFORE anything ships)
You cannot claim no regression without a measured "before."
- **Crawl the live old site** (Screaming Frog, or its XML sitemaps) → the authoritative list of every indexed URL.
- **Export Search Console** (old property): 16 months of query + page data → the ranking baseline.
- **Diff every old URL against the redirect map** → a coverage report: ✅ 301s vs ⚠️ would-404. Add a redirect entry for every ⚠️.
- Deliverable: a committed `coverage-report` + a redirect map with **0 known 404s**.

### Phase 1 — Build the ranking-preserving surface
- **Build the 95 city landing pages** (`app/[city]/page.tsx`) per the existing `2026-07-13-city-landing-pages` plan. These are migration-critical (they hold live local rankings), not growth.
- Confirm every product/category/blog/static 301 resolves against the new routes.
- Set up Google Search Console + Bing Webmaster for the new deployment; prepare the new sitemap.

### Phase 2 — Cutover
- Deploy to Vercel (edge-fast for the 95%-India audience — a ranking tailwind vs US Apache).
- Test on a preview/staging domain first (redirects, metadata, Core Web Vitals).
- Point DNS (ours). Same domain, so no change-of-address needed.
- Submit sitemap; request indexing on top pages.
- **Monitor GSC coverage daily for 2–4 weeks**: watch for 404 spikes, crawl errors, impression drops.

### Phase 3 — Net-gain layer (beat the incumbent, not just match)
- **Commercial-intent pages**: distributor / dealer / price landing pages targeting the buyer queries the old site never ranked for.
- **Datasheet-optimized product pages**: model queries (e.g. `hg55u701f`) already convert — make new product pages win them decisively.
- **High-intent guides**: a small set of comparison/informational posts (e.g. Flip vs whiteboard, best signage for retail).
- **Google Business Profile revival**: GBP interactions are declining (Apr ~108 → Jul ~45); refresh posts, photos, categories, Q&A.

### Phase 4 — Measure the delta
Compare post-launch GSC to the Phase-0 baseline (clicks, impressions, position, indexed-page count, 404 count). This is the proof — to yourself and to whoever you report to — that you came out ahead, not behind.

---

## 4. Scope boundaries (YAGNI)

- **Do NOT** rebuild the ~7,125 city×product clone pages. They 301 to the product page (equity consolidates); the 95 city *hubs* carry the local intent. (Matches existing memory: hubs-only.)
- **Do NOT** chase the zero-demand long-tail keywords the old site "ranks #1" for — they produce no clicks.
- **Do NOT** touch the old site's code — it isn't ours. Our only interaction with it is *reading* it for the Phase-0 inventory.
- **No** change-of-address in GSC (same domain).

---

## 5. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Indexed old URL we never inventoried → 404 after cutover | Phase 0 crawl + coverage diff before any switch |
| 95 city hubs 404 | Phase 1 builds them before cutover |
| Ranking dip during Google's re-crawl | Same-domain 301s (fastest signal transfer); monitor daily; keep old server reachable on a fallback subdomain if possible for diffing |
| Thin/duplicate city content penalized | City pages carry genuinely varied, honest per-city copy (quality gate in the city plan: ship 30 strong over 95 thin) |
| Losing branded/model rankings | Those pages 301 1:1; datasheet pages in Phase 3 reinforce them |

---

## 6. Success criteria

- **Not-worse (hard gate):** post-cutover 404 count ≈ 0 for previously-indexed URLs; total clicks/impressions within noise of baseline within 4–6 weeks; branded + model queries retain position.
- **Better (goal):** measurable lift in non-branded commercial-intent clicks; faster Core Web Vitals (LCP) for India; recovering GBP interactions; new inventory (The Wall, LED, e-paper) indexed and ranking.

---

## 7. First concrete deliverable

**Phase 0 tooling + the city-page build**, because together they *are* the "don't perform worse" guarantee: Phase 0 proves the redirect map is complete against the real indexed URL set, and the city pages close the one known 404 gap. Everything else compounds on top once the site is safely live.
