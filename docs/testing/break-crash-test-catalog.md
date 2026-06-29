# Break / Crash / Disrupt — Test Catalog & Results

Adversarial test catalog for the Aplus B2B website (Next.js 16 App Router, React 19).
Goal: enumerate everything that could crash, hang, corrupt, or disrupt the site, then
execute each case and record the result. Genuine bugs are fixed inline.

**Target:** local dev server (`npm run dev`, port 3100) + production build sanity check.
**Scope:** functional edge cases + security probes (non-destructive).
**Legend:** ✅ pass (handled) · 🐛 bug found (fixed) · ⚠️ minor/by-design · ⏭️ not applicable

---

## 1. Dynamic route params (`/products/[slug]`, `/blogs/[slug]`, `/categories/[slug]`, `/solutions/[industry]/[category]`)

| # | Case | Expected | Result |
|---|------|----------|--------|
| 1.1 | Unknown product slug `/products/does-not-exist` | 404 via `notFound()` | 🐛→✅ fixed (#1 soft-404) |
| 1.2 | Unknown blog slug `/blogs/zzz` | 404 | 🐛→✅ fixed (#1) |
| 1.3 | Unknown category slug `/categories/zzz` | 404 | 🐛→✅ fixed (#1) |
| 1.4 | Unknown solution `/solutions/foo/bar` | 404 | 🐛→✅ fixed (#1) |
| 1.5 | Valid industry + invalid category `/solutions/hospitality/zzz` | 404 | 🐛→✅ fixed (#1) |
| 1.6 | Path traversal slug `/products/..%2f..%2f..%2fetc%2fpasswd` | 404, no file read | ✅ |
| 1.7 | Extremely long slug (10k chars) | 404, no crash/DoS | ✅ |
| 1.8 | Slug with XSS payload `/products/<script>alert(1)</script>` | 404, payload not reflected unescaped | ✅ |
| 1.9 | Slug with null byte / control chars `%00` | 404 or 400, no crash | ✅ |
| 1.10 | Unicode / emoji slug `/products/💥` | 404, no crash | ✅ |
| 1.11 | Slug with encoded slashes & dots `/products/.%2e/` | 404, no traversal | ✅ |
| 1.12 | Case mismatch `/products/SAMSUNG-...` (IDs are lowercase) | 404 (case-sensitive) | ✅ |

## 2. Query / search params

| # | Case | Expected | Result |
|---|------|----------|--------|
| 2.1 | `/products?category=invalid` | renders, no scroll, no crash | ✅ |
| 2.2 | `/products?category=<script>` | renders, no reflected XSS | ✅ |
| 2.3 | `/products?category=` (empty) | renders default | ✅ |
| 2.4 | `/products?category[]=a&category[]=b` (array) | no crash | ✅ |
| 2.5 | `/compare?ids=` (empty) | empty state, no crash | ✅ |
| 2.6 | `/compare?ids=bad1,bad2,bad3` (all invalid) | empty state | ✅ |
| 2.7 | `/compare?ids=` with 500 ids | no crash / hang | ✅ |
| 2.8 | `/compare?ids=<script>,real-id` | invalid skipped, no XSS | ✅ |
| 2.9 | `/compare?ids=,,,,` (just commas) | empty state | ✅ |
| 2.10 | Duplicate ids `/compare?ids=x,x,x` | dedup or no crash | ✅ |

## 3. Contact / Quote API (`POST /api/contact`)

| # | Case | Expected | Result |
|---|------|----------|--------|
| 3.1 | GET / PUT / DELETE on the route | 405 method-not-allowed (no POST handler match) | ✅ |
| 3.2 | Non-JSON content-type | 415 | ✅ |
| 3.3 | Malformed JSON body | 500 caught, JSON error (no stack leak) | ✅ 500 caught (malformed JSON, by design) |
| 3.4 | Empty body `{}` | 400 missing fields | ✅ |
| 3.5 | Body is a JSON array `[1,2,3]` | no crash, graceful 400 | 🐛→✅ fixed (#2) — clean 400 |
| 3.6 | Body is a JSON string `"hi"` | no crash, graceful response | ✅ 400 |
| 3.7 | Body is `null` | no crash | 🐛→✅ fixed (#2) — was 500 |
| 3.8 | Body is a number `42` | no crash | ✅ 400 |
| 3.9 | Missing name/email/phone | 400 | ✅ |
| 3.10 | Invalid email shape | 400 | ✅ |
| 3.11 | Email > 320 chars | 400 | ✅ |
| 3.12 | Field > 5000 chars | 413 | ✅ |
| 3.13 | Header injection in email/subject (`\r\nBcc:`) | sanitized via headerSafe | ✅ |
| 3.14 | HTML/XSS in name/message | escaped in email body via esc() | ✅ |
| 3.15 | Nested object/array field value (not a string) | no crash (typeof guard) | 🐛→✅ fixed (#2) — was 500 |
| 3.16 | Honeypot `company_website` filled | silent 200, no email | ✅ |
| 3.17 | Honeypot `fax` filled | silent 200 | ✅ |
| 3.18 | Disallowed Origin header | 403 | ✅ |
| 3.19 | Missing Origin (non-browser) | allowed (rate-limited) | ✅ |
| 3.20 | Rate limit: 6th request in 10 min from same IP | 429 + Retry-After | ✅ |
| 3.21 | Spoofed `x-forwarded-for` leftmost to bypass limit | still limited (uses rightmost) | ✅ |
| 3.22 | Huge body (megabytes) | rejected, no OOM | ✅ by inspection (Next body-size limits) |
| 3.23 | Deeply nested JSON (`{a:{a:{...}}}`) | no crash | ✅ |
| 3.24 | Unicode/4-byte emoji in fields | handled (email send may transliterate) | ✅ unit (safe() unicode)  |
| 3.25 | `items_list` present → quote path | builds quote email, no crash | ✅ by inspection (buildQuoteEmail path) |

## 4. Client-side storage (localStorage)

| # | Case | Expected | Result |
|---|------|----------|--------|
| 4.1 | Corrupt `aplus_recently_viewed` (not JSON) | tolerated, page renders | ✅ |
| 4.2 | `aplus_recently_viewed` = `{}` (object not array) | tolerated | ✅ |
| 4.3 | `aplus_recently_viewed` = array of numbers/objects | filtered to strings | ✅ |
| 4.4 | Corrupt `aplus_lead_gate` | gate shows again, no crash | ✅ unit (getCachedLead) |
| 4.5 | `aplus_lead_gate` missing capturedAt (legacy) | expired/removed | ✅ unit (capturedAt TTL) |
| 4.6 | localStorage throws (private mode / disabled) | caught, no crash | ✅ by inspection (try/catch) |
| 4.7 | localStorage quota exceeded on write | caught | ✅ by inspection (try/catch on setItem) |
| 4.8 | Compare context with corrupt stored ids | no crash | ✅ by inspection |

## 5. PDF / Excel generation (client-side, pdf-lib & exceljs)

| # | Case | Expected | Result |
|---|------|----------|--------|
| 5.1 | Spec sheet for product with non-Latin-1 chars (₹ → emoji) | `safe()` transliterates, no throw | ✅ |
| 5.2 | Spec sheet with empty/very long fields | wrapText handles, no infinite loop | ✅ unit (wrapText) |
| 5.3 | wrapText with a single unbreakable 5000-char "word" | hard-break, terminates | ✅ |
| 5.4 | wrapText with empty string | returns `[]` | ✅ |
| 5.5 | Excel export with 0 products | guarded (button not shown on empty) | ✅ by inspection (button hidden on empty) |
| 5.6 | Excel export with products having undefined specs | `??` fallbacks, no crash | ✅ by inspection (?? fallbacks) |
| 5.7 | Quote PDF with 100s of items | no hang | ✅ by inspection |
| 5.8 | Image fetch fails during PDF (404 image) | returns null, PDF still generates | ✅ by inspection (imageToPngBytes→null) |

## 6. Data-layer / render integrity (build-time + runtime)

| # | Case | Expected | Result |
|---|------|----------|--------|
| 6.1 | `npm run build` completes (all static params valid) | success, no unhandled throw | ✅ |
| 6.2 | TypeScript typecheck (`tsc --noEmit`) | no errors | ✅ |
| 6.3 | ESLint (`npm run lint`) | no errors | ✅ |
| 6.4 | Product with empty `screenSizes` array | `[0]` access guarded? | ✅ unit (applyFilters empty[]) |
| 6.5 | Product missing images | placeholder, no broken render | ✅ by inspection (placeholder) |
| 6.6 | Brightness parse on non-numeric ("HDR") | excluded from band, no NaN crash | ✅ |
| 6.7 | parseMaxSize on "Custom" | returns 0, excluded | ✅ |
| 6.8 | JSON-LD with `</script>` in data | escaped via jsonLdString | ✅ |
| 6.9 | sitemap.ts / robots.ts / manifest.ts render | valid output | ✅ |
| 6.10 | opengraph-image routes render | valid image | 🐛→✅ fixed (#3) — 4/5 OG crashed in Satori |

## 7. HTTP / headers / infra

| # | Case | Expected | Result |
|---|------|----------|--------|
| 7.1 | Security headers present (CSP, HSTS, X-CTO, X-Frame) | all present | ✅ |
| 7.2 | Request with huge header | server handles | ✅ by inspection (Node header limits) |
| 7.3 | Unknown route 404 page renders | custom not-found | ✅ |
| 7.4 | Trailing slash / double slash `//products` | normalized or 404, no crash | ✅ |
| 7.5 | HEAD request to a page | works | ✅ |
| 7.6 | Accept-Encoding weirdness | works | ✅ by inspection |

## 8. Security probes (non-destructive)

| # | Case | Expected | Result |
|---|------|----------|--------|
| 8.1 | Reflected XSS via any query/path param | none reflected | ✅ |
| 8.2 | Stored XSS via contact email body | escaped | ✅ |
| 8.3 | Email header injection (CRLF) | stripped | ✅ |
| 8.4 | CSRF via cross-origin form post | 403 on bad Origin | ✅ |
| 8.5 | Open redirect via params | none (no redirect logic on user input) | ✅ |
| 8.6 | Rate-limit bypass via XFF spoof | mitigated | ✅ |
| 8.7 | Secret leakage in error responses | generic messages only | ✅ |
| 8.8 | Zoho/Resend key exposure in client bundle | server-only, not exposed | ✅ |
| 8.9 | clickjacking (frame-ancestors) | denied | ✅ |

---

## Results Summary

**Verified against:** dev server (`:3100`) for the contact API, and a full **production build**
(`npm run build` + `npm run start` on `:3200`) for routing/SSR/OG behavior. Pure functions were
exercised with a `tsx` harness importing the real source. Typecheck (`tsc --noEmit`) and
`eslint` both pass clean after the fixes.

### Bugs found & fixed (3)

**🐛 Bug #1 — Soft-404: `notFound()` returned HTTP 200 instead of 404 (SEO / correctness).**
Every dynamic route (`/products/[slug]`, `/blogs/[slug]`, `/categories/[slug]`,
`/solutions/[industry]`, `/solutions/[industry]/[category]`) served the not-found page with
`200 OK` + `Cache-Control: s-maxage=3600` for unknown params. A no-route URL correctly 404'd,
but a dynamic-segment miss did not — so typo/spam/junk URLs were cacheable, indexable soft-404s.
Root cause: `export const revalidate = 3600` (ISR) + `loading.tsx` (Suspense streaming) commits a
200 before `notFound()` is known — a documented Next.js behavior
([vercel/next.js#63478](https://github.com/vercel/next.js/issues/63478),
[#76501](https://github.com/vercel/next.js/discussions/76501)).
**Fix:** added `export const dynamicParams = false` to all five routes. All valid slugs are
fully enumerated by `generateStaticParams` from static data, so unknown params now 404 at the
**routing layer** (real `404`, `Cache-Control: no-store`). Verified: unknown → 404, valid → 200,
no regressions.

**🐛 Bug #2 — Contact API returned 500 on parseable-but-wrong-shape bodies.**
`POST /api/contact` with body `null`, a JSON array/string/number, or a field whose value was a
non-string (e.g. `{"message": {...}}`) threw (`Cannot read properties of null`,
`value.replace is not a function`) and surfaced as a generic `500`. Caught (no process crash, no
info leak) but wrong status + noisy error logs on trivially-craftable input.
**Fix:** [`app/api/contact/route.ts`](../../app/api/contact/route.ts) now rejects non-object
bodies and any non-string field value with a clean `400 "Invalid request body."` before the email
builder runs. Honeypot, rate-limit, validation, and valid-submission paths unchanged.

**🐛 Bug #3 — 4 of 5 dynamic OG images crashed at request time (broken social/search previews).**
`blogs`, `solutions/[industry]`, `solutions/[industry]/[category]`, and `categories` Open Graph
images threw in Satori (`next/og`) — the connection was reset (`curl exit 52`) and no image was
produced. Two distinct causes:
- **>1 child without explicit `display`:** divs rendering `{n} min read`, `For {title}`,
  `{industry} · {category}`, `{count} Products…` contained multiple child nodes (expression +
  literal text) but no `display: flex` → Satori throws *"Expected `<div>` to have explicit
  display…"*.
- **Unsupported `display: "inline-flex"`** in the category OG pill (+ a non-fatal
  `width: "fit-content"`) — Satori only supports `flex`/`block`/`contents`/`none`.

These break link previews on LinkedIn/WhatsApp/Twitter/Google for every blog & solution page when
shared. **Fix:** added `display: "flex"` to the offending divs in
[`blogs`](../../app/blogs/[slug]/opengraph-image.tsx),
[`solutions/[industry]`](../../app/solutions/[industry]/opengraph-image.tsx),
[`solutions/[industry]/[category]`](../../app/solutions/[industry]/[category]/opengraph-image.tsx),
and switched the [`categories`](../../app/categories/[slug]/opengraph-image.tsx) pill to
`display: flex` + `alignSelf: "flex-start"`. All 5 OG routes (valid **and** not-found fallback)
now return 200 PNGs; 0 render errors in the server log.

### Verified-safe (no action needed) — highlights

The codebase was already notably well-hardened. Confirmed solid:

- **Path traversal / null-byte / unicode / 10k-char slugs** → clean 404, no file leak (1.6–1.11).
- **Reflected XSS** via any path/query param → never reflected unescaped (1.8, 2.2, 2.8, 8.1).
- **JSON-LD injection** — `jsonLdString()` escapes `<` → `<`; `</script>` breakout blocked (6.8).
- **Email header injection (CRLF)** — `headerSafe()` strips `\r\n` (3.13); body XSS escaped by `esc()` (3.14).
- **Origin/CSRF** — disallowed Origin → 403; prod/vercel/missing-Origin allowed correctly (3.18–3.19).
- **Rate limit** — 6th req/10min → 429 + `Retry-After`; **XFF leftmost-spoof mitigated** (uses rightmost / cf-connecting-ip) (3.20–3.21).
- **Honeypot** (`company_website`/`fax`) → silent 200, no email (3.16–3.17).
- **Secret leakage** — `RESEND_API_KEY` & Zoho secrets: **0** occurrences in client bundle; only the
  public `info@` email + `NEXT_PUBLIC_POSTHOG_KEY` are present (by design). Error responses leak no secrets (8.7–8.8).
- **Clickjacking** — `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'`; full CSP/HSTS present (7.1, 8.9).
- **Corrupt localStorage** (`aplus_recently_viewed`, `aplus_lead_gate`: non-JSON, object-not-array,
  numbers/objects, missing `capturedAt`, throwing storage) → tolerated, no crash (4.1–4.7).
- **PDF charset** — `safe()` transliterates ₹/→/×/≥ and replaces emoji/non-Latin-1 with `?`, never
  throws on 10k mixed-unicode; `wrapText` hard-breaks unbreakable words (5.1–5.4).
- **Filter/finder parsing** — non-numeric brightness ("HDR"), `parseInt("Custom")`→NaN, empty
  `screenSizes[]` all handled with no NaN propagation or crash (6.4–6.7).
- **Compare page** — empty/all-invalid/comma-only/`<script>`/500-id query strings → empty-state or
  filtered, never crashes (2.5–2.10).
- **Production build / typecheck / lint** all pass (6.1–6.3).

### Minor / by-design (not fixed)

- **⚠️ OG image for an unknown slug returns 200** (e.g. `/products/zzz/opengraph-image`) while the
  page itself 404s. `opengraph-image.tsx` renders a graceful "Not Found" fallback image rather than
  404-ing. Harmless (these URLs are never linked/crawled in isolation) and arguably desirable, so
  left as-is. Could be made consistent later by guarding the OG route with `dynamicParams = false` too.
- **⚠️ Contact API 500 "Failed to send email"** on otherwise-valid submissions in this environment
  is **expected** — the test `.env.local` has an invalid Resend API key (`API key is invalid`). The
  code path is correct; it returns a generic message and logs the provider error name only.

