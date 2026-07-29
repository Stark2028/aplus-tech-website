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

- **Current state:** _still unverified as of 2026-07-29 — **must be checked by hand in Google
  Maps**._ Maps listings do not reliably surface in ordinary web search, so absence from search
  results is NOT evidence that no profile exists. A duplicate listing is worse than none, so
  search before creating.
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
| Justdial | **NOT FOUND** (searched 2026-07-29) | Create from scratch; align NAP | | |
| TradeIndia | **EXISTS** (confirmed 200, 2026-07-29). Name matches canonical exactly. Address `B-127, Sector-2, Noida` conflicts with canonical `Supernova Astralis, Sector-94`. No website link, no Samsung wording | **Claim; fix address; add website URL + credential** | | `https://www.tradeindia.com/aplus-technology-solutions-pvt-ltd-38683806/` |

For each: search first, claim second, create only if genuinely absent. Record the exact
name/address/phone **as found** before editing — that is the audit trail for item 5.

### ⚠️ Address decision required before editing anything

Three different addresses are live for this company right now, and they cannot all be right:

| Source | Address |
|---|---|
| This site (`lib/jsonLd.ts`) | Supernova Astralis, **Sector-94**, Noida, UP 201301 |
| TradeIndia | B-127, **Sector-2**, Noida, UP 201301 |
| IndiaMART | **New Delhi, Delhi** |

TradeIndia also shows GSTIN `07AAUCA5631L1Z6`. The `07` prefix is the Delhi state code, which
corroborates a **Delhi registered office** — so IndiaMART may be quoting the registered address
rather than being simply wrong.

**Do not "fix" the directories until Sunil confirms which address is the business location.**
NAP consistency is about the *physical place customers deal with*, not the tax registration, so
the operational Noida address is the likely canonical choice — but picking the wrong one and
propagating it across every listing is worse than the current inconsistency. Once decided, the
chosen address must also match `lib/jsonLd.ts`.

## 5. NAP consistency audit

One row per listing discovered anywhere, including ones nobody at Aplus created.

Audited 2026-07-29. "As found" values are recorded **before** any edit — this is the audit trail.

| Source | Name as found | Address as found | Phone as found | Matches canonical? | Fixed on |
|---|---|---|---|---|---|
| TradeIndia | `Aplus Technology Solutions Pvt. Ltd.` | `B-127,Sector-2, Noida, Uttar Pradesh, 201301, India` | not published | **Name ✅ / Address ✗** (Sector-2 vs Sector-94). No phone, no website link, no Samsung wording | |
| IndiaMART | `Aplus Technology Solutions Private Limited` | `New Delhi, Delhi` | not displayed (behind "Call Now") | **Name ✗** ("Private Limited") **/ Address ✗** (Delhi vs Noida) | |
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

Currently in `sameAs` (all confirmed 200 on 2026-07-28):

- `https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd`
- `https://www.instagram.com/aplus_tech_sol/`
- `https://tracxn.com/d/companies/aplus-technology-solutions/__X0jfs978sJ_zMaSRtjyU_qU725oQEJuIEa77TUJnqP0`

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
