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

- **Current state:** _unverified — confirm whether a listing already exists before creating one._
  A duplicate listing is worse than none.
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
| IndiaMART | _unverified_ | Claim or create; align NAP; list categories | | |
| Justdial | _unverified_ | Claim or create; align NAP | | |
| TradeIndia | _unverified_ | Claim or create; align NAP | | |

For each: search first, claim second, create only if genuinely absent. Record the exact
name/address/phone **as found** before editing — that is the audit trail for item 5.

## 5. NAP consistency audit

One row per listing discovered anywhere, including ones nobody at Aplus created.

| Source | Name as found | Address as found | Phone as found | Matches canonical? | Fixed on |
|---|---|---|---|---|---|
| | | | | | |

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
