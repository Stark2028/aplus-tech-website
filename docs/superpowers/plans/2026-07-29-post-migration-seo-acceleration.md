# Post-Migration SEO Acceleration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Accelerate Google's processing of the WordPress→Next.js migration by reviving the old sitemap URLs with the full legacy-URL inventory, and collapse legacy redirect chains from 2 hops to 1.

**Architecture:** A build-time generator (`lib/legacySitemaps.ts`) derives every legacy WordPress URL from the existing redirect maps and serves them as XML at the exact sitemap URLs still submitted in Google Search Console (`/sitemap/sitemap-{1,2,3}.xml`). Separately, `skipTrailingSlashRedirect` in `next.config.ts` moves trailing-slash normalization into `proxy.ts`, so a legacy URL like `/delhi/samsung-signage-display-qbc-series/` 301s directly to its product page in one hop instead of two.

**Tech Stack:** Next.js 16 App Router (route handlers, `proxy.ts` middleware), TypeScript, Vitest.

## Why (context for a fresh session)

The site migrated from WordPress (~7,507 URLs) to Next.js on Vercel (248 URLs) around 2026-07-17–28. All legacy URLs 301 via `proxy.ts` + `lib/redirects.ts` (verified against a full inventory: 23,493 city×SKU URLs, 0 dead). GSC data pulled 2026-07-29 shows:

- Google still holds **~5,343 old URLs as indexed**; only **3** have been reclassified "Page with redirect". The reprocessing wave has not started.
- The old sitemap files `/sitemap/sitemap-{1,2,3}.xml` are still submitted in GSC from the agency era but **404 today** (a planned redirect task that slipped). Google periodically re-fetches known sitemaps — serving the legacy URL list there makes Google recrawl the old URLs and discover the 301s weeks faster.
- Legacy URLs cost 2 hops (`/{old}/` →308 strip slash→ `/{old}` →301→ target) because the old site used trailing slashes everywhere. Collapsing to 1 hop maximizes crawl efficiency during the wave.
- Full background: `docs/seo/README.md` (master reference — **read §1–§4 and §13 before starting**).

## Global Constraints

- **Truth policy** (`docs/seo/README.md` §10): no fabricated `lastmod`, no ratings/reviews/prices, no unverified claims. Non-negotiable.
- **Never change a live page's URL** — this plan adds routes and changes redirect mechanics only.
- Legacy-content redirects are **301**; trailing-slash normalization is **308** (matches Next's own default behavior).
- Baselines: `npm test` = **511 passing / 65 files** before this plan; `npm run lint` = **8 errors / 3 warnings, all pre-existing — do NOT try to fix them, do not treat as regression**.
- `SITE` constant (`https://www.aplustechsol.com`, no trailing slash) comes from `@/lib/jsonLd` — reuse it, never hardcode the origin.
- Windows dev machine: after stopping a background `next start`, kill the process that owns the port or stale builds poison later verification (see Task 4 Step 7).

---

### Task 1: Shared legacy-city list + legacy URL inventory (`lib/legacySitemaps.ts`)

**Files:**
- Create: `data/legacyCities.ts`
- Modify: `data/cities.test.ts` (replace inline `LEGACY_SLUGS` const with import)
- Create: `lib/legacySitemaps.ts`
- Test: `lib/legacySitemaps.test.ts`

**Interfaces:**
- Consumes: `OLD_PRODUCT_SLUG_TO_ID`, `OLD_CATEGORY_ROOT_TO_ID`, `OLD_EXACT_PATH_TO_NEW`, `OLD_BLOG_SLUG_TO_NEW` from `@/lib/redirects`; `SITE` from `@/lib/jsonLd`; `proxy` from `@/proxy` (tests only).
- Produces: `LEGACY_CITY_SLUGS: readonly string[]` (data/legacyCities.ts); `legacyPaths(): string[]`, `buildLegacySitemap(part: number): string`, `LEGACY_SITEMAP_PARTS = 3` (lib/legacySitemaps.ts). Task 2's route handlers call `buildLegacySitemap(1|2|3)`.

- [ ] **Step 1: Create `data/legacyCities.ts`**

Move the 95-slug list currently inlined in `data/cities.test.ts` (lines ~16–35) into a shared module. Copy the list **verbatim** from the test file — do not retype it:

```ts
// The 95 legacy city hub slugs, harvested from the old WordPress site's live
// sitemaps before shutdown. These are INDEXED, ranking URLs. Two consumers:
// data/cities.test.ts guards that every one still exists as a live hub page,
// and lib/legacySitemaps.ts uses them to enumerate legacy city×product URLs.
// NEVER add net-new cities here — this list is a historical record, not the
// live city roster (that's data/cities.ts).
export const LEGACY_CITY_SLUGS: readonly string[] = [
  "agra","ahmedabad","ajmer","aligarh","allahabad","ambattur","amravati","amritsar","asansol","aurangabad",
  "bangalore","bareilly","belgaum","bhavnagar","bhilai-nagar","bhiwandi","bhopal","bhubaneswar","bikaner",
  "chandigarh","chennai","coimbatore","cuttack","dehradun","delhi","dhanbad","durgapur","faridabad","firozabad",
  "gaya","ghaziabad","gorakhpur","greater-noida","gulbarga","guntur","gurgaon","guwahati","gwalior","haora",
  "hyderabad","indore","jabalpur","jaipur","jalandhar","jalgaon","jammu","jamnagar","jamshedpur","jhansi","jodhpur",
  "kalyan","kanpur","kochi","kolapur","kolkata","kota","lucknow","ludhiana","madurai","maheshtala","mangalore",
  "meerut","mira-and-bhayander","moradabad","mumbai","nagpur","nanded-waghala","nashik","navi-mumbai","nellore",
  "noida","patna","pimpri-and-chinchwad","pune","raipur","rajkot","ranchi","saharanpur","salem","sangli","siliguri",
  "solapur","srinagar","surat","thane","thiruvananthapuram","tiruchirappalli","udaipur","ujjain","ulhasnagar",
  "vadodara","varanasi","vijayawada","visakhapatnam","warangal",
];
```

- [ ] **Step 2: Point `data/cities.test.ts` at the shared list**

In `data/cities.test.ts`: delete the inline `const LEGACY_SLUGS = [...]` block (keep its explanatory comment, moving it if needed), add `import { LEGACY_CITY_SLUGS } from "@/data/legacyCities";`, and rename the two usages of `LEGACY_SLUGS` → `LEGACY_CITY_SLUGS`.

- [ ] **Step 3: Run the cities tests to verify nothing broke**

Run: `npx vitest run data/cities.test.ts`
Expected: all tests PASS (same count as before the edit).

- [ ] **Step 4: Write the failing test for the inventory**

Create `lib/legacySitemaps.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { legacyPaths, buildLegacySitemap, LEGACY_SITEMAP_PARTS } from "./legacySitemaps";
import { proxy } from "@/proxy";
import sitemap from "@/app/sitemap";

const paths = legacyPaths();
const livePaths = new Set(sitemap().map((e) => new URL(e.url).pathname));

describe("legacyPaths", () => {
  it("covers the whole legacy URL space (~19k URLs, under the 50k sitemap cap)", () => {
    expect(paths.length).toBeGreaterThan(18000);
    expect(paths.length).toBeLessThan(50000);
  });

  it("contains no duplicates", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("never lists a live page (this sitemap is redirects-only)", () => {
    const overlap = paths.filter((p) => livePaths.has(p.replace(/\/+$/, "") || "/"));
    expect(overlap).toEqual([]);
  });

  it("every path 301s through the proxy to a live sitemap URL", () => {
    const bad: string[] = [];
    for (const p of paths) {
      const res = proxy(new NextRequest(new URL(`https://www.aplustechsol.com${p}`)));
      const loc = res.headers.get("location");
      if (res.status !== 301 || !loc) {
        bad.push(`${p} → status ${res.status}`);
        continue;
      }
      const target = new URL(loc).pathname;
      if (!livePaths.has(target)) bad.push(`${p} → ${target} (not a live page)`);
    }
    expect(bad.slice(0, 20)).toEqual([]); // slice: keep failure output readable
  });
});

describe("buildLegacySitemap", () => {
  it("splits the full inventory exactly across the parts, nothing lost", () => {
    const locs = (xml: string) => xml.match(/<loc>/g)?.length ?? 0;
    let total = 0;
    for (let part = 1; part <= LEGACY_SITEMAP_PARTS; part++) {
      total += locs(buildLegacySitemap(part));
    }
    expect(total).toBe(paths.length);
  });

  it("emits well-formed sitemap XML with absolute URLs and no lastmod", () => {
    const xml = buildLegacySitemap(1);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://www.aplustechsol.com/");
    expect(xml).not.toContain("<lastmod>"); // truth policy: we don't know real lastmod dates
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });
});
```

Note: the 301-resolution test iterates ~19k paths through the pure `proxy()` function; it runs in a few seconds. Do not "optimize" it down to a sample — full coverage is the point (spot-checks are how the original redirect gap survived; see `docs/seo/README.md` §13).

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run lib/legacySitemaps.test.ts`
Expected: FAIL — cannot resolve `./legacySitemaps`.

- [ ] **Step 6: Implement `lib/legacySitemaps.ts`**

```ts
import {
  OLD_PRODUCT_SLUG_TO_ID,
  OLD_CATEGORY_ROOT_TO_ID,
  OLD_EXACT_PATH_TO_NEW,
  OLD_BLOG_SLUG_TO_NEW,
} from "@/lib/redirects";
import { LEGACY_CITY_SLUGS } from "@/data/legacyCities";
import { SITE } from "@/lib/jsonLd";

export const LEGACY_SITEMAP_PARTS = 3;

// The old site's local-SEO role prefixes (/{role}/{product-slug}/).
const ROLE_PREFIXES = ["distributor", "suppliers", "exporters"] as const;

/**
 * Every legacy-WordPress URL path this site 301s (see proxy.ts). Served back
 * to Google at the OLD sitemap URLs (/sitemap/sitemap-N.xml — still submitted
 * in Search Console from the agency era) so Google recrawls the ~7.5k indexed
 * legacy URLs and discovers their redirects in weeks instead of months.
 *
 * City hub paths (/delhi/ …) are deliberately absent: those are live pages,
 * listed in the real sitemap. This file must only ever emit URLs that redirect
 * — lib/legacySitemaps.test.ts enforces it against proxy.ts itself.
 */
export function legacyPaths(): string[] {
  const paths: string[] = [];
  for (const root of Object.keys(OLD_EXACT_PATH_TO_NEW)) paths.push(`/${root}/`);
  for (const root of Object.keys(OLD_CATEGORY_ROOT_TO_ID)) paths.push(`/${root}/`);
  paths.push("/blog/");
  for (const slug of Object.keys(OLD_BLOG_SLUG_TO_NEW)) paths.push(`/blog/${slug}/`);
  for (const slug of Object.keys(OLD_PRODUCT_SLUG_TO_ID)) {
    paths.push(`/${slug}/`);
    for (const role of ROLE_PREFIXES) paths.push(`/${role}/${slug}/`);
    for (const city of LEGACY_CITY_SLUGS) paths.push(`/${city}/${slug}/`);
  }
  return [...new Set(paths)];
}

/** XML body for /sitemap/sitemap-{part}.xml (part is 1-based). */
export function buildLegacySitemap(part: number): string {
  const all = legacyPaths();
  const per = Math.ceil(all.length / LEGACY_SITEMAP_PARTS);
  const chunk = all.slice((part - 1) * per, part * per);
  const urls = chunk.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run lib/legacySitemaps.test.ts`
Expected: PASS (all 6 tests). If the 301-resolution test fails, the failure list tells you which legacy path doesn't resolve — fix the path generation (or discover a real redirect gap, which must then be fixed in `lib/redirects.ts`, not papered over in the test).

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: 511 + 6 new + cities tests still passing, 0 failures.

- [ ] **Step 9: Commit**

```bash
git add data/legacyCities.ts data/cities.test.ts lib/legacySitemaps.ts lib/legacySitemaps.test.ts
git commit -m "feat(seo): legacy URL inventory generator for migration sitemaps

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Serve the legacy sitemaps at the old GSC-submitted URLs

**Files:**
- Create: `app/sitemap/sitemap-1.xml/route.ts`
- Create: `app/sitemap/sitemap-2.xml/route.ts`
- Create: `app/sitemap/sitemap-3.xml/route.ts`

**Interfaces:**
- Consumes: `buildLegacySitemap(part)` from `@/lib/legacySitemaps` (Task 1).
- Produces: static XML responses at `/sitemap/sitemap-{1,2,3}.xml`. No later task consumes these in code; Phase B resubmits them in GSC.

Notes for the implementer:
- A folder literally named `sitemap-1.xml` is a valid App Router segment; the dot in the path also means these URLs **bypass `proxy.ts`** (its matcher `/((?!_next/|.*\..*).*)` excludes dotted paths) — no middleware change needed.
- `app/sitemap.ts` (the real sitemap at `/sitemap.xml`) is a Next metadata route and is unrelated; do not touch it.
- The bare `/sitemap` and `/sitemap/` paths keep their existing 301 via `OLD_EXACT_PATH_TO_NEW` — these new routes don't affect them.

- [ ] **Step 1: Create the three route handlers**

`app/sitemap/sitemap-1.xml/route.ts` (siblings are identical except the part number):

```ts
import { buildLegacySitemap } from "@/lib/legacySitemaps";

// Migration aid, not a permanent surface: the OLD WordPress sitemap URLs are
// still submitted in Google Search Console, so serving the legacy URL
// inventory here makes Google recrawl those URLs and discover their 301s
// fast. DELETE this route and its two siblings once the redirect wave is done
// (exit criterion: Phase B of docs/superpowers/plans/
// 2026-07-29-post-migration-seo-acceleration.md).
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLegacySitemap(1), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
```

Create `sitemap-2.xml/route.ts` and `sitemap-3.xml/route.ts` the same way with `buildLegacySitemap(2)` and `buildLegacySitemap(3)`.

- [ ] **Step 2: Build and verify the routes exist**

Run: `npm run build`
Expected: build succeeds; the route list printed at the end includes `/sitemap/sitemap-1.xml`, `-2`, `-3` as static (○ or ƒ-free) routes.

- [ ] **Step 3: Verify served content locally**

```powershell
Start-Process cmd -ArgumentList "/c","npm run start -- -p 3110"; Start-Sleep -Seconds 6
(Invoke-WebRequest http://localhost:3110/sitemap/sitemap-1.xml).Content.Substring(0,200)
([regex]::Matches((Invoke-WebRequest http://localhost:3110/sitemap/sitemap-1.xml).Content, "<loc>")).Count
([regex]::Matches((Invoke-WebRequest http://localhost:3110/sitemap/sitemap-3.xml).Content, "<loc>")).Count
Get-NetTCPConnection -LocalPort 3110 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Expected: XML starting `<?xml version="1.0"`, part 1 has ~6,300 `<loc>` entries, part 3 has the remainder (parts 1+2+3 sum to `legacyPaths().length`). The final line kills the server — do not skip it (stale servers poison later verification on this machine).

- [ ] **Step 4: Commit**

```bash
git add app/sitemap
git commit -m "feat(seo): serve legacy URL sitemaps at old GSC-submitted paths

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Collapse legacy redirect chains to a single hop

**Files:**
- Modify: `next.config.ts:61` (the `nextConfig` object)
- Modify: `proxy.ts`
- Test: `proxy.test.ts` (add a describe block)

**Interfaces:**
- Consumes: nothing new.
- Produces: `proxy(req: NextRequest): NextResponse` keeps its exact signature (`proxy.test.ts` and Next both call it). Internal helper `resolve(req: NextRequest): NextResponse | null` is NOT exported.

Background: Next currently 308s `/{path}/` → `/{path}` *before* `proxy.ts` runs, so every legacy trailing-slash URL costs 2 hops. `skipTrailingSlashRedirect: true` hands that responsibility to us: `proxy.ts` already tolerates trailing slashes internally (the `clean` variable), so legacy URLs resolve to their 301 in one hop, and everything else gets the 308 Next used to produce. **Critical invariant: with the config flag on, any trailing-slash path the proxy passes through would RENDER at both `/foo` and `/foo/` (duplicate content). The proxy must therefore 308 every unhandled trailing-slash path itself.** The refactor below guarantees this structurally: `resolve()` returns `null` for pass-through, and the single exit point in `proxy()` applies the 308 before falling through to `NextResponse.next()`.

- [ ] **Step 1: Write the failing tests**

Append to `proxy.test.ts`:

```ts
describe("trailing-slash normalisation (single-hop redirects)", () => {
  const run = (path: string) =>
    proxy(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));

  it("301s a legacy trailing-slash URL straight to its final target (1 hop)", () => {
    const res = run("/delhi/samsung-signage-display-qbc-series/");
    expect(res.status).toBe(301);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/products/samsung-signage-qbc"
    );
  });

  it("308s a live route's trailing-slash variant to the canonical path", () => {
    const res = run("/delhi/");
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/delhi");
  });

  it("308s a reserved-root trailing-slash variant", () => {
    const res = run("/products/samsung-signage-qbc/");
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      "/products/samsung-signage-qbc"
    );
  });

  it("preserves the query string on the 308", () => {
    const res = run("/products/samsung-signage-qbc/?utm_source=x&gclid=abc");
    const loc = new URL(res.headers.get("location")!);
    expect(res.status).toBe(308);
    expect(loc.searchParams.get("utm_source")).toBe("x");
    expect(loc.searchParams.get("gclid")).toBe("abc");
  });

  it("leaves the bare home path alone", () => {
    expect(run("/").headers.get("location")).toBeNull();
  });

  it("collapses a run of slashes to home without looping", () => {
    const res = run("//");
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });

  it("still passes clean canonical paths through untouched", () => {
    expect(run("/delhi").headers.get("location")).toBeNull();
    expect(run("/products/samsung-signage-qbc").headers.get("location")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify the new block fails**

Run: `npx vitest run proxy.test.ts`
Expected: the four 308 tests FAIL (proxy currently returns pass-through for those paths); the 301 and pass-through tests already pass.

- [ ] **Step 3: Refactor `proxy.ts`**

Three changes, no logic rewrites:

1. Rename the current exported `proxy` function to `function resolve(req: NextRequest): NextResponse | null` (not exported).
2. Inside `resolve`, replace **every** `return NextResponse.next()` with `return null` (there are 4: home, city pass-through, reserved roots, final fallthrough).
3. Add the new exported `proxy`:

```ts
export function proxy(req: NextRequest) {
  const redirect = resolve(req);
  if (redirect) return redirect;

  // next.config.ts sets skipTrailingSlashRedirect, so Next no longer strips
  // trailing slashes before this middleware runs. Normalising here — AFTER
  // legacy resolution — is what collapses the old site's 2-hop chains
  // (/{old}/ → /{old} → /products/{id}) into a single 301: legacy paths have
  // already returned above and never reach this branch. Every unhandled
  // trailing-slash path MUST 308 here, or it would render as a duplicate of
  // its canonical URL.
  const { pathname } = req.nextUrl;
  if (pathname !== "/" && pathname.endsWith("/")) {
    const to = new URL(pathname.replace(/\/+$/, "") || "/", req.url);
    to.search = req.nextUrl.search;
    return NextResponse.redirect(to, 308);
  }
  return NextResponse.next();
}
```

- [ ] **Step 4: Enable the config flag**

In `next.config.ts`, add one line at the top of the `nextConfig` object (line ~61):

```ts
const nextConfig: NextConfig = {
  // proxy.ts owns trailing-slash normalisation so legacy redirects resolve in
  // ONE hop (Next's own strip-slash 308 would otherwise run first). See the
  // trailing-slash block in proxy.ts before changing this.
  skipTrailingSlashRedirect: true,
```

- [ ] **Step 5: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all tests PASS (including Task 1's 19k-path resolution test — it proves the refactor didn't alter any legacy 301), tsc clean.

- [ ] **Step 6: Runtime verification over real HTTP**

Unit tests can't see the config flag interaction — verify against a real server (build first: the flag is read at build/serve time):

```powershell
npm run build
Start-Process cmd -ArgumentList "/c","npm run start -- -p 3110"; Start-Sleep -Seconds 6
curl.exe -sIL "http://localhost:3110/delhi/samsung-signage-display-qbc-series/" | Select-String "HTTP/|location"
curl.exe -sIL "http://localhost:3110/delhi/" | Select-String "HTTP/|location"
curl.exe -sI  "http://localhost:3110/delhi" | Select-String "HTTP/"
curl.exe -sI  "http://localhost:3110/llms.txt" | Select-String "HTTP/"
Get-NetTCPConnection -LocalPort 3110 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Expected, in order: **exactly one** `301` with `location: /products/samsung-signage-qbc` then `200`; one `308` → `/delhi` then `200`; a direct `200`; a `200` for llms.txt (dotted path, bypasses proxy — confirms no regression). If `/delhi/` returns `200` instead of `308`, the proxy fell through without normalising — stop and fix before committing (that's live duplicate content).

- [ ] **Step 7: Commit**

```bash
git add proxy.ts proxy.test.ts next.config.ts
git commit -m "feat(seo): collapse legacy redirect chains to a single hop

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Documentation, deploy, and live verification

**Files:**
- Modify: `docs/seo/README.md` (§4 hop table, §11 open items, new §4b)

**Interfaces:**
- Consumes: everything above, deployed to Vercel production.
- Produces: updated master reference; live site verified.

- [ ] **Step 1: Update `docs/seo/README.md`**

Three edits:

1. In §4 after the hop-count table, replace the paragraph beginning "The old site used trailing slashes…" with:

```markdown
**Collapsed to 1 hop on 2026-07-XX** (fill in the deploy date): `skipTrailingSlashRedirect`
in `next.config.ts` hands trailing-slash normalisation to `proxy.ts`, which resolves the
legacy redirect BEFORE stripping the slash. `https://www.` legacy URLs now cost exactly
1 hop; only the `http://`/non-www entry hops remain (Vercel platform level, not collapsible
in app code).
```

2. Add a new subsection after §4:

```markdown
### 4b. Legacy sitemaps (temporary migration aid)

`/sitemap/sitemap-{1,2,3}.xml` — the OLD WordPress sitemap URLs, still submitted in GSC —
serve the full ~19k legacy URL inventory (generated from the redirect maps by
`lib/legacySitemaps.ts`; every emitted URL is proven to 301 to a live page by its test).
Purpose: force Google to recrawl the ~5.3k indexed legacy URLs and discover the 301s fast.
**Delete the three routes in `app/sitemap/` once GSC shows the wave is done** — exit
criterion: "Page with redirect" > 5,000 in the Pages report, or 10 weeks post-deploy,
whichever first.
```

3. In §11 Open items, remove the "Trailing-slash redirect chain" row and add: `| Remove legacy sitemaps when wave completes | Aplus | §4b exit criterion |`.

- [ ] **Step 2: Commit, push, deploy**

```bash
git add docs/seo/README.md
git commit -m "docs(seo): record legacy sitemaps + single-hop redirect collapse

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push
```

Vercel deploys master automatically. Wait for the deployment to finish (check `npx vercel ls` or the dashboard) before the next step.

- [ ] **Step 3: Verify live production**

```bash
curl -sIL -A "Googlebot/2.1" "https://www.aplustechsol.com/delhi/samsung-signage-display-qbc-series/" | grep -iE "HTTP/|location"
curl -s "https://www.aplustechsol.com/sitemap/sitemap-1.xml" | grep -c "<loc>"
curl -s "https://www.aplustechsol.com/sitemap/sitemap-3.xml" | grep -c "<loc>"
curl -s "https://www.aplustechsol.com/sitemap.xml" | grep -c "<loc>"
```

Expected: exactly one `301` → `location: /products/samsung-signage-qbc` → `200`; sitemap-1 ≈ 6,300; sitemap-3 > 6,000; real sitemap still 248. **If any of these fails, the deploy is wrong — do not proceed to Phase B.**

---

## Phase B — GSC & off-site checklist (Sunil, no code — do after Phase A deploys)

- [ ] **B1. Secure GSC ownership.** GSC → Settings → Users and permissions + Ownership verification. Confirm at least one verification method YOU control (HTML tag on the new site, or a DNS TXT record you added in GoDaddy yourself — not one the agency added). If the only verification is agency-era, add your own today; losing verification = losing all this data.
- [ ] **B2. Resubmit the legacy sitemaps.** GSC → Sitemaps: the old entries `sitemap/sitemap-1.xml`, `-2`, `-3` should flip from error to Success on their next fetch; resubmit each one manually to trigger it now. Keep `sitemap.xml` submitted too. Within ~1 week the sitemap.xml report's denominator should become 248 (the "50 indexed / 10 not" you saw was stale agency-era state).
- [ ] **B3. Archive 16 months of GSC data THIS WEEK.** GSC keeps only 16 months; the old site's baseline rolls off month by month and is irreplaceable. Performance → Search results → date = 16 months, **no filters** → Export for: Queries, Pages, Countries, Devices. Also Links → Export external links. Store in `docs/seo/gsc-archive/2026-07/` in the repo or a safe folder.
- [ ] **B4. Bing Webmaster Tools** (~10 min). bing.com/webmasters → "Import from Google Search Console". Bing's index feeds ChatGPT/Copilot answers — this directly serves the GEO work already shipped. Verify `sitemap.xml` is listed after import.
- [ ] **B5. Google Business Profile.** Search Google Maps for "Aplus Technology Solutions". If a profile exists and the agency owns it → request ownership transfer (Google's "Request access" flow, takes ~7 days). Do NOT create a duplicate. Once owned: correct NAP (name/address/phone must match the site footer exactly), set service areas (Noida HQ + Kolkata office + service cities), add the Samsung credential wording from `lib/credentials.ts` — "Authorized Samsung Commercial Display Distributor & Service Partner", never "Service Center".
- [ ] **B6. Off-site corroboration checklist** — work through `docs/geo/off-site-checklist.md` (GBP → Samsung partner locator → LinkedIn → India B2B directories). Any new profile URL goes into `sameAs` in `lib/jsonLd.ts` ONLY after fetching it and confirming HTTP 200 (truth policy).
- [ ] **B7. Weekly monitoring** (every Monday, 10 min). GSC → Indexing → Pages, note four numbers:

  | Metric | Healthy trajectory | Alarm |
  |---|---|---|
  | "Page with redirect" | climbs from 3 toward ~5,000+ | flat after 3 weeks → recheck legacy sitemaps are Success in GSC |
  | Indexed (sitemap.xml filter) | climbs toward 248 | falling, or new URLs marked Soft 404 |
  | Old-format URLs still Indexed | drains from ~5,343 toward 0 | — (slow is normal) |
  | Soft 404 count | flat or declining from 133 | climbing WITH new-format URLs in the examples |

  Clicks WILL dip in weeks 2–6 — that is normal reprocessing, not failure. Judge clicks only at week 8+, against the baseline **3,852 clicks/365 days (~74/week)**. Do not change URL structure during the transition, whatever any report says.
- [ ] **B8. Exit: remove the legacy sitemaps.** When "Page with redirect" > 5,000 or 10 weeks have passed: delete the three `app/sitemap/sitemap-*.xml` folders, `lib/legacySitemaps.ts(.test.ts)` (keep `data/legacyCities.ts` — cities.test.ts uses it), remove the GSC sitemap submissions, update `docs/seo/README.md` §4b. Small cleanup PR.
- [ ] **Never do:** re-add wildcard DNS (`*.aplustechsol.com` — the dead `mail.`/`belden.`/`odisha.` ghosts must stay dead); add ratings/review markup to "fix" the GSC review-snippet report (it's a false alarm — `docs/seo/README.md` §10); rebuild city×product clone pages.

---

## Phase C — City×category pages (SPEC ONLY — needs its own brainstorm + plan session)

**Do not implement from this section.** It records the data-derived scope so a future session (run `superpowers:brainstorming` first) can design it properly. Client (Sunil) must review all copy before ship.

**Evidence** (GSC 16-month city-query export, 2026-07-29): real demand the old site never captured — it sat at positions 27–101 for all of it, 0 clicks. Target combos by impressions:

| Query cluster | Impressions | Old position |
|---|---|---|
| digital signage × Mumbai | 118 | 87 |
| wayfinding × Mumbai (3 queries) | ~79 | 33–67 |
| retail signage × Mumbai | 50 | 57 |
| digital signage × Bangalore (4 queries) | ~64 | 76–90 |
| video wall × Mumbai | 11 | 94 |
| interactive flat panel / Flip × Indore, Pune | ~10 | 17–22 |
| digital signage × Pune, Lucknow, Indore | ~13 | 23–75 |

**Constraints locked by prior decisions:**
- 10–15 pages max to start, closed authored list (a `data/` file mirroring `data/useCaseCombos.ts` convention), `dynamicParams = false` on the route. NOT a programmatic matrix — that's the doorway pattern this migration just killed (`docs/seo/README.md` §2).
- Recommended URL shape: `/{city}/{category}` (e.g. `/mumbai/digital-signage`) as a real route `app/[city]/[category]/page.tsx`. Proxy check needed: two-segment unknown paths currently fall through `proxy.ts` last-segment product matching — add a test asserting no chosen category slug is a key of `OLD_PRODUCT_SLUG_TO_ID` (collision would 301 the new page away).
- Content honesty rules from the city-hub project apply verbatim: no invented local facts, only claims derivable from verified data (`data/cities.ts` servedFrom, catalog, client-reviewed text). See the thin-content resolution in `docs/superpowers/plans/2026-07-13-city-landing-pages.md` history.
- JSON-LD: `Service` + `areaServed` City (builder exists in `lib/jsonLd.ts` — `cityServiceLd` is the pattern), never a second `LocalBusiness`.
- Each page: added to `app/sitemap.ts`, interlinked from its city hub AND its category page (ring/stratified linking, not `.slice(0,N)` — that bug class is documented in the city-pages plan).
- Wayfinding has no category on the site — it's a use case. Decide in brainstorming whether it's a `/solutions` surface or folds into the signage category page. Do not invent a fake product category for it.
- Timing: ship only after the sitemap.xml Indexed count is climbing steadily (B7), roughly weeks 3–5 post-deploy. New URLs are additive and safe; the wait is only so indexing signal stays readable.

---

## Execution notes for the implementing session

- Work on a branch off master (e.g. `feat/seo-acceleration`), merge when Phase A Task 4 Step 3 passes.
- `npm run lint` shows 8 errors / 3 warnings that are PRE-EXISTING. Leave them.
- Full check before claiming done: `npm test` (clean), `npx tsc --noEmit` (clean), plus the live curls in Task 4 Step 3.
- Verification recipes and traps: `docs/seo/README.md` §12–§13 — especially "never grep raw HTML through the RSC payload" and "verify against a URL inventory, never a spot-check".
