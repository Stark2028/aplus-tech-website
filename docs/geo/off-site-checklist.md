# Off-site entity corroboration checklist

**Owner of this document:** whoever runs the GEO/AEO work. Update the *Current state* and
*URL* columns as each item is completed — this file is the record.

## Why this exists

The on-site work (Tasks 1–9 of the GEO/AEO plan) tells AI answer engines what Aplus is. It does
not, on its own, make them *believe* it. Answer engines corroborate a supplier's self-description
against third-party sources before naming it in an answer. An Organization entity with a
credential nobody else confirms is a claim; the same credential echoed by Google Business
Profile, Samsung's own partner locator and LinkedIn is a fact.

Everything on-site is done. Without this list, that work under-delivers.

## The canonical NAP

Every listing below must match this **exactly** — same spelling, same punctuation, same order.
Inconsistent NAP is the single most common reason an entity fails to resolve.

| Field | Value | Source of truth |
|---|---|---|
| Name | `Aplus Technology Solutions Pvt. Ltd.` | `lib/jsonLd.ts` → `organizationLd().name` |
| Street | `Supernova Astralis, Sector-94` | `lib/jsonLd.ts` → `address.streetAddress` |
| Locality | `Noida` | `lib/jsonLd.ts` → `address.addressLocality` |
| Region | `Uttar Pradesh` | `lib/jsonLd.ts` → `address.addressRegion` |
| Postal code | `201301` | `lib/jsonLd.ts` → `address.postalCode` |
| Country | `IN` | `lib/jsonLd.ts` → `address.addressCountry` |
| Phone (display) | `+91 93105 09909` | `lib/contact.ts` → `PHONE_DISPLAY` |
| Phone (schema) | `+91-9310509909` | `lib/contact.ts` → `PHONE_SCHEMA` |
| Email | `info@aplustechsol.com` | `lib/contact.ts` → `CONTACT_EMAIL` |
| Website | `https://www.aplustechsol.com` | `lib/jsonLd.ts` → `SITE` |
| Founded | `2020` | `lib/jsonLd.ts` → `foundingDate`; About timeline |
| Hours | `Mo-Sa 10:00-18:00` | `lib/jsonLd.ts` → `openingHours` |

**Credential wording — never vary it:**
`Authorized Samsung Commercial Display Distributor & Service Partner`
(`lib/credentials.ts` → `SAMSUNG_CREDENTIAL`). Never "Service Center" or "Service Centre".

---

## 1. Google Business Profile — highest priority

GBP is the strongest single corroboration signal for a business entity, and it feeds Google's
own AI surfaces directly.

- **Current state (2026-07-29): a profile EXISTS and is ACTIVELY MANAGED.** Confirmed by Sunil:
  searching the canonical phone `+91 93105 09909` in Google Maps returns Aplus, and the profile
  carries **multiple Posts** — content nobody at Aplus published. Ownership is therefore held by
  a third party, most likely the previous agency (VRD Creative, who also hold a `Full` user role
  on the Search Console property).
  **→ This is an ownership TRANSFER, not a creation. Never create a second listing.**
- **Action:**
  1. Search Google Maps for "Aplus Technology Solutions Noida" and for the phone number.
  2. If a listing exists, claim it. If it exists and is claimed by the previous agency
     (VRD Creative), request ownership transfer — do not create a second listing.
  3. Set primary category to **Audio visual equipment supplier**.
  4. Set NAP to the table above, character for character.
  5. Add the website URL, hours, and the credential in the business description.
- **Owner:**
- **URL once live:**

## 2. Samsung partner locator

The only source that can corroborate the Samsung credential with Samsung's own authority.

- **Current state:** _unverified._
- **Action:**
  1. Confirm Aplus appears in Samsung India's B2B partner/dealer locator.
  2. Confirm the entry carries **both** the distribution and the Service Partner credential —
     the service half is the part currently invisible off-site.
  3. If the listing is missing or wrong, raise it with the Samsung India B2B account contact.
- **Owner:**
- **URL once live:**

## 3. LinkedIn company page

Already in `sameAs` and confirmed HTTP 200, so the link exists — the page content is what needs
work.

- **Current state:** page exists at
  `https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd` (confirmed 200,
  2026-07-28). Completeness not audited.
- **Action:**
  1. Set the website URL to `https://www.aplustechsol.com`.
  2. Set "Founded" to **2020**.
  3. Set specialties to mirror `organizationLd().knowsAbout`: digital signage, video wall
     displays, interactive flat panel displays, hospitality and hotel television systems, LED
     display systems, video conferencing rooms, commercial display installation, annual
     maintenance contracts.
  4. Put the credential in the About section, in the approved wording.
- **Owner:**
- **URL:** `https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd`

## 4. India B2B directories

Answer engines lean on these for Indian supplier queries.

| Directory | Current state | Action | Owner | URL |
|---|---|---|---|---|
| IndiaMART | **EXISTS** (confirmed 200, 2026-07-29). Listed as *New Delhi, Delhi* — conflicts with canonical Noida. Name reads "Private Limited", not "Pvt. Ltd." | **Claim, then align NAP** — see the address decision below | | `https://www.indiamart.com/aplus-technology-solutions/profile.html` |
| Justdial | **EXISTS** (confirmed 200, 2026-07-29). Filed under *New Ashok Nagar, Delhi* — conflicts with canonical Noida | **Claim; fix address to the corporate office** | | `https://www.justdial.com/Delhi/Aplus-Technology-Solutions-Pvt-Ltd-New-Ashok-Nagar/011PXX11-XX11-221217210135-E7W3_BZDET` |
| TradeIndia | **EXISTS** (confirmed 200, 2026-07-29). Name matches canonical exactly. Address `B-127, Sector-2, Noida` conflicts with canonical `Supernova Astralis, Sector-94`. No website link, no Samsung wording | **Claim; fix address; add website URL + credential** | | `https://www.tradeindia.com/aplus-technology-solutions-pvt-ltd-38683806/` |

For each: search first, claim second, create only if genuinely absent. Record the exact
name/address/phone **as found** before editing — that is the audit trail for item 5.

### ✅ Address resolved (Sunil, 2026-07-29)

**The corporate office is `Supernova Astralis, Sector-94, Noida, UP 201301`** — the address
already in `lib/jsonLd.ts`. **No code change needed; the site is correct.** Every listing below
must be aligned *to it*.

Aplus holds **multiple GST registrations** (normal for multi-state operations), which is why
directories show different addresses — TradeIndia's GSTIN `07AAUCA5631L1Z6` carries the `07`
Delhi state code. Those are registration addresses, not the place customers deal with.

| Source | Address as found | Verdict |
|---|---|---|
| This site (`lib/jsonLd.ts`) | Supernova Astralis, **Sector-94**, Noida, UP 201301 | ✅ **canonical** |
| TradeIndia | B-127, **Sector-2**, Noida, UP 201301 | ✗ update |
| IndiaMART | **New Delhi, Delhi** | ✗ update |
| Justdial | **New Ashok Nagar, Delhi** | ✗ update |

NAP consistency is about the *physical place customers deal with*, not tax registration — so a
GST address must never be published as the business location on a listing.

## 5. NAP consistency audit

One row per listing discovered anywhere, including ones nobody at Aplus created.

Audited 2026-07-29. "As found" values are recorded **before** any edit — this is the audit trail.

| Source | Name as found | Address as found | Phone as found | Matches canonical? | Fixed on |
|---|---|---|---|---|---|
| TradeIndia | `Aplus Technology Solutions Pvt. Ltd.` | `B-127,Sector-2, Noida, Uttar Pradesh, 201301, India` | not published | **Name ✅ / Address ✗** (Sector-2 vs Sector-94). No phone, no website link, no Samsung wording | |
| IndiaMART | `Aplus Technology Solutions Private Limited` | `New Delhi, Delhi` | not displayed (behind "Call Now") | **Name ✗** ("Private Limited") **/ Address ✗** (Delhi vs Noida) | |
| Justdial | `Aplus Technology Solutions Pvt Ltd` | `New Ashok Nagar, Delhi` (per listing URL) | not captured | **Address ✗** (Delhi vs Noida corporate office) | |
| LinkedIn | not audited | not audited | not audited | pending — see item 3 | |
| Google Business Profile | unknown | unknown | unknown | pending — see item 1 | |

Corroborating facts found during the audit (no action needed, recorded for consistency):

- **Founded 2020** on both directories — matches `foundingDate` in `organizationLd()` ✅
- GSTIN `07AAUCA5631L1Z6` (TradeIndia) — `07` = Delhi state code
- Contact person listed as `M Chandel (Senior BDM)` / `Mr. Madhur Chandel, Manager`
- Neither directory carries any Samsung authorization wording — the credential is currently
  corroborated **nowhere off-site**, which is the single biggest gap on this page

**Do not add either directory URL to `sameAs` yet.** Both return HTTP 200, so they pass the
mechanical precondition, but pointing the entity at listings that contradict its own address
would corroborate the wrong facts. Fix the NAP first, then add them.

Stale listings carrying an old address or number actively harm entity resolution. Finding and
correcting them matters as much as creating new ones.

## 5b. Access register (added 2026-07-31)

Every account that affects search visibility, and who holds it. **Access is the blocker on most
of the work below** — you cannot fix a listing you cannot log into.

Prompted by the 2026-07-31 SERP review: the Google Business Profile shows
**"Add missing information → Add website"**, i.e. the panel that owns the brand query does not
link to the site at all. That single missing field is why registry sites outrank the domain for
"aplus technology solutions private limited".

### Tier 1 — control of the entity (do first)

| # | Account | State | Action |
|---|---|---|---|
| 1 | **Google Business Profile** | Exists, **not claimed by Aplus**, 105 reviews @ 4.9, **NO website link** | Click "Own this business?" → ownership transfer (likely VRD Creative). Then **add the website URL** — highest-value single field anywhere in this document |
| 2 | **Google Search Console** | Aplus has access — but **VRD Creative holds a `Full` role** | Audit Settings → Users and permissions. Remove or downgrade third parties who no longer need it |
| 3 | **DNS / registrar** | Registrar = GoDaddy; **DNS hosted on VRD Creative's cPanel** | Get direct control. Needed to retire the dead `mail.` / `belden.` / `odisha.` subdomains and to make any future DNS change without a third party |
| 4 | **Vercel** | Aplus-controlled | Confirm who else has project access |
| 5 | **Google Analytics (GA4)** | Unaudited | Confirm ownership; check for agency-era users |
| 6 | **Bing Webmaster Tools** | Aplus-controlled, sitemap submitted 2026-07-29 | — |

### Tier 2 — directories that currently outrank the site for its own brand name

Confirmed on the SERP for "aplus technology solutions private limited", 2026-07-31.

| # | Platform | State | Action |
|---|---|---|---|
| 7 | **IndiaMART** | Exists. Name "Private Limited", city **New Delhi** (conflicts with canonical Noida). Ranks above the site | Claim → fix NAP → add website link → credential |
| 8 | **Justdial** | Exists, **New Ashok Nagar, Delhi**, 106 reviews @ 4.9. Ranks above the site | Claim → fix address to corporate office → add website |
| 9 | **TradeIndia** | Exists, name ✅, address `B-127 Sector-2` ✗, no website link | Claim → fix address → add website + credential |
| 10 | **AmbitionBox** | Exists (employer profile, 4.3 ★). Ranks above the site | Claimable as employer — lower priority, but it is on page 1 |
| 11 | **Tracxn** | Exists, already in `sameAs` | Claimable; verify the details are current |

### Tier 3 — social

| # | Platform | State | Action |
|---|---|---|---|
| 12 | **LinkedIn** | Live, in `sameAs`, 150+ followers | Confirm admin access. Set website, founded 2020, specialties, credential |
| 13 | **Facebook** | Exists, **empty** | Populate NAP, website, category, credential |
| 14 | **Instagram** | Live, in `sameAs` | Bio: credential + Noida + website link |

### Tier 4 — create new

| # | Platform | Action |
|---|---|---|
| 15 | **Bing Places** | Create after the GBP transfer, then import from GBP |
| 16 | **GeM** | Seller registration. Heavier lift (GST, bank, docs); also a sales channel |
| 17 | **Samsung partner locator** | Not an account — ask the Samsung India B2B contact to confirm/fix the listing |

### Not claimable — informational only

`ZaubaCorp`, `Tofler`, `TheCompanyCheck`, `Connect2India`, `Masters India` scrape MCA/GST filings
and generally cannot be edited. They rank for the brand name because they carry the exact legal
string **"APLUS TECHNOLOGY SOLUTIONS PRIVATE LIMITED"**. The counter-move is on-site, not on
theirs: add `legalName` to `organizationLd()` and put the registered name + CIN
(`U72900DL2020PTC374888`) in the footer, so the site itself matches that query.

---

## 6. Additional platforms (added 2026-07-30, driven by the AI answer baseline)

The baseline capture (`ai-answer-baseline.md`) showed ChatGPT quoting "GeM supplier" as a
credential for a competitor, and Copilot's underlying index is Bing. Both are cheap to miss.

| Platform | Why | Action | Owner | URL |
|---|---|---|---|---|
| **GeM (Government e-Marketplace)** | ChatGPT cited "Samsung Authorized Dealer & GeM supplier" as Sunlite's credential — GeM registration is itself a quotable third-party fact, and it opens government sales | Register as a seller; list the display catalogue. Heavier lift (GST, bank, docs) — schedule it, don't block on it | | |
| **Bing Places** | Bing is the index behind Microsoft Copilot. Free, ~15 min, can import from GBP | Do **after** the GBP transfer completes, then import. NOT the same as Bing Webmaster (below) — Places is the business listing, Webmaster is site indexing | | |
| **Bing Webmaster Tools** | Bing's index feeds Copilot, DuckDuckGo, Yahoo — and ChatGPT's live search has leaned on it | **Sitemap submitted 2026-07-29** ✅. **Submit `sitemap.xml` ONLY — do NOT submit the legacy sitemaps to Bing** (decided 2026-07-31). The §4b trick is Google-specific: it works by overwriting sitemap URLs *already registered in GSC* from the agency era, forcing recrawl of ~5.3k Google-indexed legacy URLs. Bing has no such registration and a fresh property's modest crawl budget must go to the 248 real pages, not 18,934 redirects. Bing finds the 301s through normal recrawl. Remaining: URL-submit the top ~10 pages incl. `/samsung-india-model-codes`, run Site Scan once, record the Search Performance baseline. IndexNow only if the 248 still aren't indexed after ~2 weeks | | |
| **Instagram bio** | Already in `sameAs`, but the bio is the only crawlable text on the page | Bio: credential wording + Noida + website link | | `https://www.instagram.com/aplus_tech_sol/` |
| YouTube (optional) | Installation/demo videos corroborate the installer/AMC claim; low priority | Only if content exists anyway — do not create an empty channel | | |

---

## Feeding results back into the code

As each profile is confirmed live, add its URL to `sameAs` in `organizationLd()`
(`lib/jsonLd.ts`).

**Precondition, no exceptions:** fetch the URL and confirm **HTTP 200** first.

```bash
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0" -L "<url>"
```

A `sameAs` pointing at a 404 or a soft-redirect is worse than no `sameAs` — it tells the engine
the entity's own self-description is unreliable.

Currently in `sameAs` — **all three re-verified 200 on 2026-07-29**:

- `https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd`
- `https://www.instagram.com/aplus_tech_sol/`
- `https://tracxn.com/d/companies/aplus-technology-solutions/__X0jfs978sJ_zMaSRtjyU_qU725oQEJuIEa77TUJnqP0`

### Candidates not yet added

| URL | Status | Blocker |
|---|---|---|
| `https://www.facebook.com/aplustechsol/` | **Confirmed Aplus-owned but EMPTY** (Sunil, 2026-07-29). Machine check returns `400` — Meta anti-bot, not a dead link | Add to `sameAs` **after** populating it. An empty page links identity but corroborates no facts; filling in NAP, website, category and the credential turns it into a real corroboration source. ~10 min |
| TradeIndia, IndiaMART, Justdial listings | All confirmed **200** | **NAP is wrong on all three.** Adding them now would corroborate the wrong address. Fix the listings first, then add |

The 200 check is a floor, not the whole test: a live URL carrying contradictory facts weakens
the entity just as a dead one does.

## Truth policy

The GEO plan's global constraints apply to every listing here as much as to the code:

- **No ratings, no reviews, no star counts** are to be solicited, fabricated or marked up.
  Search Console's "Review snippets: 71 invalid" is a known false alarm from legacy WordPress
  URLs — no rating markup exists in this repo or on any live page, and none may be added to
  clear it.
- **No prices.** The catalogue is quote-only.
- **Brand accuracy.** Video Conferencing is **Logitech**; Education is **TagHive** (Class
  Saathi). Never describe either as Samsung on a directory listing, exactly as the site never
  does. `lib/categoryBrand.ts` is the arbiter.
