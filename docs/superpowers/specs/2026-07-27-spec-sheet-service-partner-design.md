# Spec Sheet — Samsung Service Partner Credential

**Date:** 2026-07-27
**Status:** Approved by user (wording variant and scope both chosen from options during brainstorming)
**Scope:** Two string constants in `lib/pdf/specSheet.ts` plus their brand tests. No layout code, no data, no website surfaces.

## Problem

The generated spec sheet advertises one Samsung credential — "Authorized Samsung Commercial Display Distributor · India" in the page-1 header ([lib/pdf/specSheet.ts:89](../../../lib/pdf/specSheet.ts)). Aplus also holds an authorized Samsung **service partner** designation, which the document never states. Service authorization is the credential that matters most on a document a buyer keeps after purchase, because it answers "who fixes this under warranty".

The naive fix — a second gray line under the company name — was rejected. Two 7.5 pt gray lines read as a credential dump, add vertical weight opposite the SPEC SHEET / series / date column, and would sit ~9 pt above the 1.5 pt header rule at `A4_HEIGHT - 62`. It is also unnecessary: measurement showed one merged line fits with room to spare.

## Approach decision

**Chosen: merge both credentials into the existing single header line, and reinforce the service claim in the trust strip.**

One `Authorized Samsung` governs both nouns, so the phrase is not repeated, and `Commercial Display` still scopes the distribution credential (it is the literal Samsung program name).

Rejected alternatives:

- **Two stacked lines** — costs a header re-layout for no gain; see Problem.
- **Parallel bullets** (`Authorized Samsung Distributor & Service Partner · Commercial Displays · India`) — reads fine and fits, but genericizes "Distributor" away from the Commercial Display program name.
- **Website-wide rollout** (footer, /about, product pages, `app/layout.tsx` metadata, JSON-LD, OG badge) — deliberately deferred. It touches indexed `<title>`/description copy and warrants its own review pass.

## Changes

### 1. Header sub-line — `distributorLineFor`, Samsung branch

```diff
- "Authorized Samsung Commercial Display Distributor · India"
+ "Authorized Samsung Commercial Display Distributor & Service Partner · India"
```

The Logitech branch is untouched.

### 2. Trust card — `SAMSUNG_TRUST_CARDS[0]`, description only

```diff
  ["Samsung Authorized",
-  "Genuine India-spec units with full Samsung warranty."]
+  "Genuine India-spec units, full Samsung warranty, authorized service."]
```

The card title stays `Samsung Authorized`. `LOGITECH_TRUST_CARDS` is untouched.

## Layout verification (done before approval, not assumed)

Both edits were measured against the real font metrics and the real wrap function, not estimated:

| Surface | Constraint | Result |
| --- | --- | --- |
| Header line | Left text starts at `x=82` (`MARGIN_X + 40`); the right-hand `SPEC SHEET` block starts at `x=485`. Budget **403 pt**. | New line is **258 pt** at Helvetica 7.5 pt (old line: 197 pt). Stays one line; no re-layout; no collision. |
| Trust card | `wrapText` at `cardW - 20` = **143.8 pt**; `cardH` is driven by the tallest of the three cards. | New copy wraps to **2 lines**, same as the other two cards. `cardH` unchanged — the strip does not grow. |

## Testing

`lib/pdf/specSheet.brand.test.ts` currently asserts the Samsung line only loosely (`/Authorized Samsung/i`), which passes whether or not this change lands. Tighten the Samsung-side assertions so they actually pin the new credentials:

- `distributorLineFor(samsung)` matches `/Distributor & Service Partner/`.
- The `Samsung Authorized` trust card's description mentions authorized service.

The two Logitech guards stay exactly as they are:

- `distributorLineFor(logitech)` does not match `/authoriz|partner|certif|samsung/i`.
- `trustCardsFor(logitech)` has no authorized/partner/certified/Samsung wording.

Both remain green because only the Samsung branch and `SAMSUNG_TRUST_CARDS` change. The "always exactly three cards" invariant is unaffected — no card is added or removed.

## Terminology: "Service Partner", not "Service Center"

Claim accuracy was raised with the user during brainstorming and **confirmed on 2026-07-27: Aplus holds both the distribution and the service authorization.** The user left the exact term to us. "Service Partner" was chosen over "Samsung Authorized Service Center" because:

- "Service Center" is higher-volume as a search term in India, but that volume is consumer intent — phone and home-TV repair. On a B2B commercial-display datasheet it attracts the wrong audience and implies a walk-in repair counter rather than an on-site service entity.
- "Service Partner" matches the language the sheet already uses. The trust strip promises "Site survey, mounting and commissioning across India" — partner-level, at the customer's site.
- It keeps the merged line grammatical: one `Authorized Samsung` governs both nouns (*Commercial Display Distributor & Service Partner*). "Service Center" would force an awkward second clause.

## Risks

Structurally none: two string constants in one file, both measured against the layout that consumes them. The claim-accuracy question that was the only real exposure is now resolved (above).
