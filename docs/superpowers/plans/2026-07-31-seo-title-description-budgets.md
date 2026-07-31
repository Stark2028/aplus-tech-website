# SEO Title & Description Budgets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every page's `<title>` under 60 characters and every `<meta description>` under
155, without losing the tokens that actually earn clicks — and add the missing `/blogs`
structured data.

**Architecture:** One shared pure module (`lib/seoText.ts`) computes SEO strings from existing
product/city/category data. Route `generateMetadata` functions call it instead of building
strings inline. A build-output test enforces the budgets site-wide so they cannot regress.

**Tech Stack:** Next.js 16 App Router (`metadata` / `generateMetadata`), TypeScript, Vitest.

**Why now:** Google has indexed **zero** new URLs. There are no established titles to disturb —
whatever is live when Google first crawls is simply what it learns. After reindexing starts,
this same change means rewriting titles Google already has click history against. **This window
closes as soon as the migration wave begins.**

## Global Constraints

- **The root template appends the brand.** `app/layout.tsx` sets
  `title: { template: "%s | Aplus Technology Solutions" }`. Page titles must **never** repeat the
  brand or it doubles (regression previously fixed in `e495544`). OpenGraph/Twitter titles are
  **not** run through the template, so those carry the brand explicitly — keep that split.
- **Budgets:** page-specific title ≤ **52 chars** (52 + 8-char suffix = 60). Description ≤ **155**.
- **Never drop the model code from a product title.** `hg55u701f` earned 84 clicks at position
  2.63 as a bare model-code query — it is the highest-converting token available.
- **Brand accuracy:** Video Conferencing is **Logitech**, Education is **TagHive**. Use
  `brandOf()` from `lib/brand.ts`; never hardcode "Samsung" in a shared helper.
- **Truth policy unchanged:** no ratings, no prices in structured data, no invented model codes.
- **Test command:** `npx vitest run <path>`. Full: `npm test`. Types: `npx tsc --noEmit`.
- `npm run lint` has **8 pre-existing errors** on master. Do not treat them as regressions; do
  not add new ones.
- Commit after every task.

## Not in scope

- The `— Price, Models & Specs` suffix on category titles. It promises a price the quote-only
  catalogue does not show, which is a mild intent mismatch — but it also captures real commercial
  intent, and the GSC export needed to quantify that demand is no longer on disk. **Leave the
  wording alone; raise it as a separate decision.**
- `/privacy` and `/terms` JSON-LD. Legal boilerplate, no search value.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/seoText.ts` | *(create)* Pure SEO string builders + budget constants |
| `lib/seoText.test.ts` | *(create)* Unit tests for every builder |
| `app/layout.tsx` | *(modify)* Shorten the title template suffix |
| `app/products/[slug]/page.tsx` | *(modify)* Use `productSeoTitle` + clamped description |
| `app/[city]/page.tsx` | *(modify)* Use `citySeoTitle` + clamped description |
| `app/categories/[slug]/page.tsx` | *(modify)* Clamp description |
| `app/solutions/[industry]/[category]/page.tsx` | *(modify)* Clamp description |
| `app/blogs/[slug]/page.tsx` | *(modify)* Clamp description |
| `app/blogs/page.tsx` | *(modify)* Add Blog + ItemList + Breadcrumb JSON-LD |
| `app/seoBudgets.test.ts` | *(create)* Site-wide budget enforcement on built HTML |

---

## Task 1: `lib/seoText.ts` — shared builders

**Files:**
- Create: `lib/seoText.ts`
- Test: `lib/seoText.test.ts`

**Interfaces:**
- Consumes: `Product` from `@/data/products`, `brandOf` + `BRAND_JSONLD_NAME` from `@/lib/brand`
- Produces:
  - `TITLE_BUDGET = 52`, `DESC_BUDGET = 155`
  - `clampDescription(text: string, max?: number): string`
  - `productSeoTitle(product: Product, modelCode?: string): string`
  - `citySeoTitle(cityName: string): string`

- [ ] **Step 1: Write the failing test**

Create `lib/seoText.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { clampDescription, productSeoTitle, citySeoTitle, TITLE_BUDGET, DESC_BUDGET } from "./seoText";
import type { Product } from "@/data/products";

const vhb: Product = {
  id: "samsung-vhb-e", name: "Samsung VHB-E High-Brightness Extreme Narrow Bezel Video Wall",
  category: "Video Wall", series: "VHB-E", description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "700 nit", screenSizes: ["55"], operationTime: "24/7" },
  images: ["/x.avif"],
};
const rally: Product = {
  id: "logitech-rally-bar", brand: "Logitech", name: "Logitech Rally Bar",
  category: "Video Conferencing", series: "Rally", subCategory: "Video Bars & Systems",
  description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "90° FOV", screenSizes: [], operationTime: "Large Rooms" },
  images: ["/y.avif"],
};

describe("clampDescription", () => {
  it("leaves a short description untouched", () => {
    expect(clampDescription("Short and sweet.")).toBe("Short and sweet.");
  });

  it("cuts at a sentence boundary when one fits", () => {
    const t = "First sentence here. " + "x".repeat(200);
    const out = clampDescription(t);
    expect(out).toBe("First sentence here.");
    expect(out.length).toBeLessThanOrEqual(DESC_BUDGET);
  });

  it("falls back to a word boundary with an ellipsis", () => {
    const out = clampDescription("alpha beta gamma delta ".repeat(20));
    expect(out.length).toBeLessThanOrEqual(DESC_BUDGET);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/); // no space before the ellipsis
  });

  it("never splits a word", () => {
    const out = clampDescription("supercalifragilistic ".repeat(30));
    expect(out.replace("…", "").trim().split(" ").pop()).toBe("supercalifragilistic");
  });

  it("collapses whitespace", () => {
    expect(clampDescription("a\n\n  b")).toBe("a b");
  });
});

describe("productSeoTitle", () => {
  it("keeps the model code and fits the budget", () => {
    const t = productSeoTitle(vhb, "LH55VHBEBGBXXL");
    expect(t).toContain("LH55VHBEBGBXXL");
    expect(t).toContain("VHB-E");
    expect(t.length).toBeLessThanOrEqual(TITLE_BUDGET);
  });

  it("puts the model code before the 40th character so it survives truncation", () => {
    expect(productSeoTitle(vhb, "LH55VHBEBGBXXL").indexOf("LH55VHBEBGBXXL")).toBeLessThan(40);
  });

  it("uses the correct brand for non-Samsung products", () => {
    const t = productSeoTitle(rally);
    expect(t).toContain("Logitech");
    expect(t).not.toContain("Samsung");
  });

  it("works without a model code", () => {
    const t = productSeoTitle(vhb);
    expect(t.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(t).toContain("VHB-E");
  });

  it("never repeats the brand name", () => {
    expect(productSeoTitle(vhb, "LH55VHBEBGBXXL").match(/Samsung/g)!.length).toBe(1);
  });

  it("drops the model code rather than blow the budget", () => {
    const longSeries = { ...vhb, series: "VERYLONGSERIESNAME-EXTENDED", category: "Interactive Display" };
    expect(productSeoTitle(longSeries, "LH55VHBEBGBXXL").length).toBeLessThanOrEqual(TITLE_BUDGET);
  });
});

describe("citySeoTitle", () => {
  it("drops a parenthetical alternate name", () => {
    expect(citySeoTitle("Aurangabad (Chhatrapati Sambhajinagar)"))
      .toBe("Samsung Commercial Displays in Aurangabad");
  });

  it("fits the budget for every real city name", () => {
    expect(citySeoTitle("Thiruvananthapuram").length).toBeLessThanOrEqual(TITLE_BUDGET);
  });

  it("leaves a plain city name alone", () => {
    expect(citySeoTitle("Delhi")).toBe("Samsung Commercial Displays in Delhi");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run lib/seoText.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/seoText.ts`:

```ts
import type { Product } from "@/data/products";
import { brandOf, BRAND_JSONLD_NAME } from "@/lib/brand";

/**
 * Budgets for search-result display.
 *
 * The root layout appends " | Aplus" (8 chars) via the title template, so a page
 * title of 52 renders as 60 — the point where Google starts truncating. Meta
 * descriptions are cut around 155.
 *
 * These are display budgets, not ranking factors: both engines read the full
 * string. The cost of overflow is a truncated snippet, and — on product pages —
 * losing the model code, which is the highest-converting token we have.
 */
export const TITLE_BUDGET = 52;
export const DESC_BUDGET = 155;

/**
 * Trim a description to the budget, preferring a sentence boundary, then a word
 * boundary. Only adds an ellipsis when the cut lands mid-sentence.
 */
export function clampDescription(text: string, max: number = DESC_BUDGET): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  // Prefer ending on a full sentence that fits.
  const sentenceEnd = clean.slice(0, max + 1).lastIndexOf(". ");
  if (sentenceEnd > max * 0.5) return clean.slice(0, sentenceEnd + 1);

  // Otherwise cut on a word boundary. Reserve one char for the ellipsis.
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Product title built from series + category rather than the full display name.
 *
 * The display name ("Samsung VHB-E High-Brightness Extreme Narrow Bezel Video
 * Wall") pushes the model code past character 60, where it is truncated away.
 * Leading with series + category keeps the code visible — and the code is what
 * B2B buyers actually search.
 *
 * Returns the bare title: the layout template appends the brand suffix.
 */
export function productSeoTitle(product: Product, modelCode?: string): string {
  const brand = BRAND_JSONLD_NAME[brandOf(product)];
  const base = `${brand} ${product.series} ${product.category}`.replace(/\s+/g, " ").trim();
  if (!modelCode) return base.slice(0, TITLE_BUDGET).trimEnd();

  const withCode = `${base} (${modelCode})`;
  // Budget is hard: drop the code rather than overflow. Callers keep it in
  // `keywords` and in the Product node's `mpn`, so it is never lost outright.
  return withCode.length <= TITLE_BUDGET ? withCode : base.slice(0, TITLE_BUDGET).trimEnd();
}

/**
 * City title. Some cities carry an official alternate in parentheses
 * ("Aurangabad (Chhatrapati Sambhajinagar)") which blows the budget; the page
 * body and h1 still show the full name.
 */
export function citySeoTitle(cityName: string): string {
  const short = cityName.split(" (")[0].trim();
  return `Samsung Commercial Displays in ${short}`;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run lib/seoText.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/seoText.ts lib/seoText.test.ts
git commit -m "feat(seo): shared title and description budget helpers"
```

---

## Task 2: Shorten the brand suffix

This single line reclaims **21 characters on all 253 pages**.

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:** none

- [ ] **Step 1: Change the template**

In `app/layout.tsx`, in the `metadata` export:

```ts
  title: {
    default: "Aplus Technology Solutions | Authorized Samsung Business Display Distributor",
    // Short suffix on purpose: the full legal name costs 29 characters of every
    // page's ~60-char display budget, which on product pages was truncating the
    // model code — the highest-converting token we have. The `default` above
    // still carries the full name for the homepage, and OpenGraph titles spell
    // it out explicitly since they do not run through this template.
    template: "%s | Aplus",
  },
```

Leave `default` unchanged — the homepage title is 63 chars and its brand text is the
point of that page.

- [ ] **Step 2: Verify no page title doubles the brand**

```bash
npm run build
grep -ho '<title>[^<]*</title>' .next/server/app/products/samsung-signage-qmc.html
```

Expected: exactly one `| Aplus`, no `Aplus Technology Solutions` in a page (non-home) title.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): shorten the title suffix to reclaim display budget"
```

---

## Task 3: Product titles and descriptions

**Files:**
- Modify: `app/products/[slug]/page.tsx` (`generateMetadata`, ~lines 56–70)
- Test: covered by Task 7

**Interfaces:**
- Consumes: `productSeoTitle`, `clampDescription` from `@/lib/seoText`

- [ ] **Step 1: Import the helpers**

```ts
import { productSeoTitle, clampDescription } from "@/lib/seoText";
```

- [ ] **Step 2: Replace the title and description construction**

Replace these two assignments:

```ts
  const title = modelCode ? `${product.name} (${modelCode})` : product.name;
```

with:

```ts
  // Built from series + category so the model code stays inside the ~60-char
  // display budget. The full display name still leads the h1 and OG title.
  const title = productSeoTitle(product, modelCode);
```

and wrap the description:

```ts
  const metaDescription = clampDescription(
    isLogitech(product)
      ? `${product.description} B2B pricing, installation and AMC from Aplus Technology Solutions in India.`
      : `${product.description} Available in ${sizeRange} — B2B pricing from Aplus, an authorized Samsung distributor in India.`,
  );
```

- [ ] **Step 3: Keep the full name on OpenGraph**

OG titles do not run through the layout template and have a much longer display allowance,
so they should keep the descriptive name. Change the `openGraph.title` from `title` to:

```ts
      title: `${product.name} | Aplus Technology Solutions`,
```

Leave `twitter.title` as `product.name`.

- [ ] **Step 4: Verify against the built output**

```bash
npm run build
python - <<'PY'
import re, glob, html
bad = []
for f in glob.glob(".next/server/app/products/*.html"):
    t = re.search(r"<title>(.*?)</title>", open(f, encoding="utf-8", errors="ignore").read(), flags=re.S)
    if t:
        s = html.unescape(t.group(1))
        if len(s) > 60:
            bad.append((len(s), f, s))
print(f"product pages over 60: {len(bad)}")
for L, f, s in sorted(bad, reverse=True)[:5]:
    print(f"  {L}  {s}")
PY
```

Expected: `product pages over 60: 0`

- [ ] **Step 5: Commit**

```bash
git add "app/products/[slug]/page.tsx"
git commit -m "feat(seo): keep the model code inside the product title budget"
```

---

## Task 4: City titles and descriptions

`city.intro` is long-form page prose — up to 384 characters as a description.

**Files:**
- Modify: `app/[city]/page.tsx` (`generateMetadata`, ~lines 42–60)

**Interfaces:**
- Consumes: `citySeoTitle`, `clampDescription` from `@/lib/seoText`

- [ ] **Step 1: Import and apply**

```ts
import { citySeoTitle, clampDescription } from "@/lib/seoText";
```

Replace the `pageTitle` assignment:

```ts
  const pageTitle = citySeoTitle(city.name);
  const shareTitle = `${pageTitle} | Aplus Technology Solutions`;
  const metaDescription = clampDescription(city.intro);
```

Then use `metaDescription` for `description` and for `openGraph.description` /
`twitter.description`. **Leave `city.intro` itself untouched** — the full text is page copy and
feeds `cityServiceLd`.

- [ ] **Step 2: Verify**

```bash
npm run build
python - <<'PY'
import re, glob, html, os
bad = []
for f in glob.glob(".next/server/app/*.html"):
    h = open(f, encoding="utf-8", errors="ignore").read()
    t = re.search(r"<title>(.*?)</title>", h, flags=re.S)
    d = re.search(r'<meta name="description" content="(.*?)"', h, flags=re.S)
    n = os.path.basename(f)
    if t and len(html.unescape(t.group(1))) > 60: bad.append(("title", n))
    if d and len(html.unescape(d.group(1))) > 155: bad.append(("desc", n))
print(f"root-level pages over budget: {len(bad)}")
for k, n in bad[:8]: print(" ", k, n)
PY
```

Expected: `0` (root level is where the 120 city pages live).

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/page.tsx"
git commit -m "feat(seo): city titles and descriptions inside display budgets"
```

---

## Task 5: Category, solution and blog-post descriptions

Titles on these already fit once the suffix shrinks; only descriptions overflow.

**Files:**
- Modify: `app/categories/[slug]/page.tsx`
- Modify: `app/solutions/[industry]/[category]/page.tsx`
- Modify: `app/blogs/[slug]/page.tsx`

- [ ] **Step 1: Wrap each description**

In each file, import:

```ts
import { clampDescription } from "@/lib/seoText";
```

and wrap the existing description expression in `clampDescription(...)`. Apply it to
`description`, `openGraph.description` and `twitter.description` so all three agree.

**Do not** shorten the underlying source strings — `category.description`, `combo.intro` and
`post.excerpt` are page copy and feed structured data.

⚠️ `app/solutions/[industry]/[category]/page.tsx` produced the single worst description
(414 chars on `/solutions/hospitality/video-conferencing`). Confirm that route is covered.

- [ ] **Step 2: Verify**

```bash
npm run build
npx vitest run app/seoBudgets.test.ts 2>/dev/null || echo "(budget test lands in Task 7)"
```

- [ ] **Step 3: Commit**

```bash
git add app/categories app/solutions app/blogs
git commit -m "feat(seo): clamp category, solution and blog descriptions to 155 chars"
```

---

## Task 6: `/blogs` structured data

The blog index lists 8 posts with no structured data — the same gap `/products` had.

**Files:**
- Modify: `lib/jsonLd.ts`
- Modify: `app/blogs/page.tsx`
- Test: `lib/jsonLd.test.ts`

**Interfaces:**
- Produces: `blogIndexLd(posts: Array<{ slug: string; title: string; date: string; excerpt: string }>): object`

- [ ] **Step 1: Write the failing test**

Append to `lib/jsonLd.test.ts`:

```ts
import { blogIndexLd } from "./jsonLd";

describe("blogIndexLd", () => {
  const posts = [
    { slug: "a", title: "Post A", date: "2026-05-20", excerpt: "x" },
    { slug: "b", title: "Post B", date: "2026-06-01", excerpt: "y" },
  ];

  it("is a Blog bound to the canonical org", () => {
    const ld = blogIndexLd(posts) as any;
    expect(ld["@type"]).toBe("Blog");
    expect(ld.url).toBe("https://www.aplustechsol.com/blogs");
    expect(ld.publisher["@id"]).toBe("https://www.aplustechsol.com/#organization");
  });

  it("lists every post with an absolute URL and date", () => {
    const ld = blogIndexLd(posts) as any;
    expect(ld.blogPost).toHaveLength(2);
    expect(ld.blogPost[0]).toMatchObject({
      "@type": "BlogPosting",
      headline: "Post A",
      url: "https://www.aplustechsol.com/blogs/a",
      datePublished: "2026-05-20",
    });
  });

  it("emits no ratings", () => {
    expect(JSON.stringify(blogIndexLd(posts))).not.toContain("aggregateRating");
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: FAIL — `blogIndexLd` is not exported.

- [ ] **Step 3: Implement**

Append to `lib/jsonLd.ts`:

```ts
/**
 * Blog index node for /blogs. Each post is a BlogPosting stub; the full Article
 * node lives on the post page itself.
 */
export function blogIndexLd(
  posts: Array<{ slug: string; title: string; date: string; excerpt: string }>,
) {
  const url = `${SITE}/blogs`;
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: "Aplus Technology Solutions — Blogs & Insights",
    description:
      "Guides and best practices for deploying commercial displays, video " +
      "conferencing and classroom technology across India.",
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE}/blogs/${p.slug}`,
      datePublished: p.date,
      description: p.excerpt,
      publisher: { "@id": ORG_ID },
    })),
  };
}
```

- [ ] **Step 4: Run and confirm it passes**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: PASS

- [ ] **Step 5: Render it**

In `app/blogs/page.tsx`, add the imports and emit the script as the first child of the
returned tree — matching the pattern in `app/products/page.tsx`:

```tsx
import { blogIndexLd, breadcrumbLd, jsonLdString } from "@/lib/jsonLd";
```

```tsx
  const jsonLd = [
    blogIndexLd(sorted),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Blogs", url: "/blogs" },
    ]),
  ];
```

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
```

`sorted` already exists in that component (newest-first). Reuse it so the markup order matches
what the page displays.

- [ ] **Step 6: Verify**

```bash
npm run build
grep -c 'application/ld+json' .next/server/app/blogs.html
```

Expected: `1` (was `0`).

- [ ] **Step 7: Commit**

```bash
git add lib/jsonLd.ts lib/jsonLd.test.ts app/blogs/page.tsx
git commit -m "feat(seo): Blog and ItemList structured data on the blog index"
```

---

## Task 7: Site-wide budget enforcement

Locks the work in. Without this, the next new route silently reintroduces the problem.

**Files:**
- Create: `app/seoBudgets.test.ts`

- [ ] **Step 1: Write the test**

Create `app/seoBudgets.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Display-budget contract for every prerendered page.
 *
 * Titles over ~60 chars and descriptions over ~155 are truncated in search
 * results. Truncation does not affect ranking, but on product pages it was
 * cutting the model code — the token B2B buyers actually search.
 *
 * Reads built HTML, so it is meaningful only after `npm run build`; skipped
 * otherwise so `npm test` stays runnable without one.
 */
const APP = join(process.cwd(), ".next", "server", "app");

// Never served at a URL: Next.js internals and robots-disallowed utility routes.
const EXEMPT = ["_not-found", "_global-error", "quote", "compare", "admin"];

function htmlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

const pages = htmlFiles(APP).filter(
  (f) => !EXEMPT.some((x) => f.replace(/\\/g, "/").includes(`/${x}`)),
);

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");

const rel = (f: string) => f.replace(/\\/g, "/").split("/.next/server/app")[1];

describe.skipIf(pages.length === 0)("SEO display budgets", () => {
  it("prerenders pages to check", () => {
    expect(pages.length).toBeGreaterThan(100);
  });

  it("keeps every <title> at 60 characters or fewer", () => {
    const over = pages
      .map((f) => {
        const m = /<title>(.*?)<\/title>/s.exec(readFileSync(f, "utf8"));
        return m ? { page: rel(f), len: decode(m[1]).length } : null;
      })
      .filter((r): r is { page: string; len: number } => !!r && r.len > 60);
    expect(over).toEqual([]);
  });

  it("keeps every meta description at 155 characters or fewer", () => {
    const over = pages
      .map((f) => {
        const m = /<meta name="description" content="(.*?)"/s.exec(readFileSync(f, "utf8"));
        return m ? { page: rel(f), len: decode(m[1]).length } : null;
      })
      .filter((r): r is { page: string; len: number } => !!r && r.len > 155);
    expect(over).toEqual([]);
  });

  it("never doubles the brand suffix", () => {
    const doubled = pages.filter((f) => {
      const m = /<title>(.*?)<\/title>/s.exec(readFileSync(f, "utf8"));
      return m ? (decode(m[1]).match(/Aplus/g) ?? []).length > 1 : false;
    });
    expect(doubled.map(rel)).toEqual([]);
  });

  it("keeps the model code in the title of every product that has one", () => {
    const missing = pages
      .filter((f) => f.replace(/\\/g, "/").includes("/products/"))
      .filter((f) => {
        const html = readFileSync(f, "utf8");
        const hasMpn = /"mpn"\s*:\s*"([A-Z0-9]+)"/.exec(html);
        if (!hasMpn) return false;
        const t = /<title>(.*?)<\/title>/s.exec(html);
        return t ? !decode(t[1]).includes(hasMpn[1]) : true;
      });
    expect(missing.map(rel)).toEqual([]);
  });
});
```

- [ ] **Step 2: Build and run**

```bash
npm run build
npx vitest run app/seoBudgets.test.ts
```

Expected: PASS. Any failure names the offending pages — fix the **page**, never relax the budget.

- [ ] **Step 3: Full suite**

```bash
npm test && npx tsc --noEmit
```

Expected: all green, no new type errors.

- [ ] **Step 4: Commit**

```bash
git add app/seoBudgets.test.ts
git commit -m "test(seo): enforce title and description display budgets site-wide"
```

---

## Final verification

- [ ] **Re-audit the built output**

```bash
npm run build
npm test
```

Then confirm against production after deploy — a local `next start` is not evidence of live state:

```bash
curl -s -A "GPTBot/1.0" https://www.aplustechsol.com/products/samsung-vhb-e \
  | grep -o '<title>[^<]*</title>'
curl -s -A "GPTBot/1.0" https://www.aplustechsol.com/blogs \
  | grep -c 'application/ld+json'
```

Expected: a title under 60 chars **containing `LH55VHBEBGBXXL`**, and `1` JSON-LD block on
`/blogs`.

- [ ] **Update `docs/seo/README.md`**

§9 gains the title/description budgets as a standing rule, and §12 gains
`npx vitest run app/seoBudgets.test.ts` as a verification recipe. Note the expected test count
has changed.
