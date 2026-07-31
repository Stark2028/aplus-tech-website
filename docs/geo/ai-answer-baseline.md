# AI Answer Baseline — "Who supplies Samsung commercial displays in India / Delhi"

**Captured:** 2026-07-30 (user-run, verbatim paste)
**Status of on-site GEO work at capture time:** shipped and live; Google index still 0 new URLs
**Purpose:** the "before" shot. Re-run the same prompts monthly and diff against this file.

## Re-test protocol

Same question, no brand named in the prompt, fresh session each time:

> "Who supplies Samsung commercial displays in India? I'm in Delhi."

Record per engine: (1) is Aplus named at all, (2) in the national list or the Delhi list or
both, (3) with what detail (bare name vs address/phone/website), (4) which competitors are
named and with what detail. Paste verbatim below the results table.

## Results — 2026-07-30

| | Perplexity | ChatGPT |
|---|---|---|
| Aplus named | ✅ yes — national list | ❌ **not mentioned at all** |
| Detail given for Aplus | Bare name + "Listed as a leading Samsung display distributor in India" | — |
| Aplus in Delhi/NCR section | ❌ **absent — despite Noida HQ being IN NCR** | — |
| Contact details quoted for Aplus | none | — |

### Competitors named (both engines)

| Competitor | Perplexity | ChatGPT | Detail level |
|---|---|---|---|
| Achyutam Corporate | ✅ national | ✅ national + Delhi | Product portfolio listed by ChatGPT |
| VTL / Vitharan Trade Links | ✅ national | ✅ national | Portfolio + positioning |
| Sunlite Systems | ✅ national + Delhi | ✅ national | **Full NAP on Perplexity: address, two phones, email, website** |
| SanSo Networks | ✅ Delhi | ✅ Delhi (Nehru Place) | Location given |
| Imperial Techsol, 4 Genius Minds, A.S. Enterprises | ✅ Delhi list | — | Addresses given for some |

ChatGPT also pointed the user at the **official Samsung Business Partner Locator** as the
authoritative way to find partners by city.

## What the data says

1. **Score: 1 of 2 engines, and the weakest mention on the page.** Perplexity knows Aplus
   exists; ChatGPT does not. Where competitors got portfolios, addresses and phone numbers,
   Aplus got a bare name with the hedge "listed as".

2. **The detail gap is the off-site gap, made visible.** Sunlite's Perplexity entry — full
   address in Ghaziabad, two phone numbers, email, website — is the signature of a strong
   directory/GBP footprint being retrieved and quoted. The engines can only quote corroborated
   facts. Aplus has no quotable third-party facts, so it gets no details.

3. **Missing from the Delhi/NCR list while headquartered in Noida (NCR)** is the sharpest
   finding. Sunlite (Ghaziabad — also NCR, not Delhi proper) makes the Delhi list because its
   listings tie it to "Delhi NCR" explicitly. Nothing off-site ties Aplus to Delhi or NCR.
   Geographic association is earned in directories and GBP, not claimed on one's own site.

4. **The Samsung Partner Locator is cited by ChatGPT as the authority.** If Aplus is not in
   it (or not findable in it by city), that alone explains the ChatGPT zero. Checklist item
   #2 just became evidence-backed.

5. **The Perplexity mention is fragile.** "Listed as" with no source detail suggests one thin
   listing (Tracxn or a residual directory row). Uncorroborated mentions drop out of answers
   when engines re-retrieve. Without off-site work this could regress to 0 of 2.

## What this changes

Nothing in priority order — it **confirms** the existing order with direct evidence:

1. Google Business Profile (transfer if agency-claimed, don't duplicate)
2. Samsung Business Partner Locator listing — now known to be a ChatGPT-cited source
3. India B2B directories (IndiaMART / Justdial / TradeIndia) with NAP matching
   `lib/contact.ts` exactly — this is where competitor phone numbers are being quoted from
4. Each confirmed URL → `sameAs` after a 200 check

Target for the next capture: named by both engines; appearing in the Delhi/NCR section;
at least one contact detail quoted. That is what "working" looks like.

---

## Verbatim capture — Perplexity, 2026-07-30

> Samsung commercial displays in India (including Delhi) are supplied through a network of
> authorized distributors, dealers, and system integrators rather than a single national
> reseller. Below are some of the key suppliers you can approach.
>
> **Major authorized distributors in India**
> These partners handle Samsung's full commercial display portfolio (Smart Signage, The Wall
> LED, Hospitality TVs, Interactive Flip, Video Walls) with genuine warranty and pan‑India
> delivery:
>
> Achyutam Corporate – Authorized Samsung commercial display distributor for India.
>
> VTL – Authorized distributor for smart signage, hospitality TVs, LED video walls, outdoor &
> interactive displays across India.
>
> Aplus Technology Solutions Pvt. Ltd. – Listed as a leading Samsung display distributor in
> India.
>
> Sunlite Systems Pvt Ltd – Authorized dealer/distributor/reseller for Samsung commercial
> displays, hospitality TVs, digital signage and interactive panels in Delhi NCR and 100+
> Indian cities.
>
> **Delhi / NCR–focused suppliers**
> If you specifically need supply and support in Delhi:
>
> Sunlite Systems Pvt Ltd (Delhi NCR)
> Location: A-41, Rachna, Sector‑3, Vaishali, Ghaziabad, U.P – 201010 (serves Delhi NCR).
> Contact: +91‑9311170950 / +91‑9811783540; sales@sunlitesystems.com
> Website: www.sunlitesystems.com
>
> SanSo Networks Private Limited – Advertised as a trusted Samsung display supplier/dealer in
> Delhi and India.
>
> Imperial Techsol Private Limited – Supplier/dealer of Samsung (alongside LG/Philips)
> large‑format commercial displays and digital signage in Delhi.
>
> 4 Genius Minds – Listed as a Samsung commercial TV partner in New Delhi (K‑1/17 Chittaranjan
> Park, New Delhi – 110019).
>
> A.S. Enterprises – New Delhi–based seller of Samsung commercial 4K UHD displays (e.g.,
> QB43C) via B2B marketplaces.
>
> There are also many other local dealers and wholesalers in New Delhi; directories list
> multiple "Samsung LED Displays" wholesalers with contact details if you need more options.
>
> **How to choose a supplier**
> When contacting them, confirm:
> That they are an authorized Samsung Business partner for commercial displays (not just
> consumer TVs). Whether they can provide project quotes, installation, and AMC (service
> contract) for your use case (signage, video wall, hospitality, etc.). Warranty terms and
> whether billing is direct from Samsung or via the channel partner.

## Verbatim capture — ChatGPT, 2026-07-30

> If you're looking for Samsung commercial displays (Smart Signage, QBC/QMC/QHC series, video
> walls, LED walls, interactive displays, hospitality TVs, etc.) rather than consumer TVs,
> these are among the main suppliers and channel partners in India.
>
> **National authorized distributors**
>
> Achyutam Corporate — Authorized Samsung Commercial Display distributor. Supplies: QBC/QMC/QHC
> Smart Signage, Video Walls, The Wall MicroLED, Hospitality TVs, Interactive Displays (Flip).
> Pan-India delivery with enterprise/B2B support.
>
> Vitharan Trade Links (VTL) — Authorized Samsung commercial display distributor. Focuses on
> system integrators, hospitality, retail, and enterprise projects. Provides solution design,
> training, and logistics.
>
> Sunlite Systems — Samsung Authorized Dealer & GeM supplier. Supplies commercial displays,
> video walls, monitors, and interactive panels across India.
>
> **Delhi / NCR suppliers**
>
> SanSo Networks — Nehru Place, New Delhi. Samsung commercial display dealer and distributor.
> Handles corporate AV and digital signage projects.
>
> Achyutam Corporate — Serves Delhi NCR and large enterprise projects. Suitable for bulk
> purchases and digital signage deployments.
>
> **Samsung Business Partner Locator** — Official Samsung page to locate authorized partners
> by product category and city.
