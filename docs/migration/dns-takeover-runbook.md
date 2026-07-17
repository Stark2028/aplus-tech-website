# DNS Takeover Runbook — move DNS operation to GoDaddy (safely)

**Date:** 2026-07-17
**Goal:** Take independent control of `aplustechsol.com` DNS at GoDaddy **without** breaking the live website or Zoho email — a pure "lift and shift" of the zone. The site keeps serving from the old server and email keeps flowing through Zoho; only *who operates the DNS zone* changes. This is reversible (switch nameservers back) and is the prerequisite for both GSC verification and the eventual Vercel cutover.

## Current topology (verified 2026-07-17 via public DNS)

- **Registrar:** GoDaddy (you control this).
- **DNS operator:** the web/hosting server itself — vanity nameservers `ns1.aplustechsol.com` / `ns2.aplustechsol.com`, both → `66.116.244.108`. SOA reveals the real host: `ns1.server-718740.vrdcreative.com` (**VRD Creative** = the current agency/host).
- **Website:** old Apache site at `66.116.244.108` (US GoRock server).
- **Email:** Zoho India (MX → `zoho.in`). **Must be preserved exactly.**

## Known records to replicate at GoDaddy (publicly discoverable)

| Type | Host / Name | Value | Priority | Notes |
| --- | --- | --- | --- | --- |
| A | `@` (root) | `66.116.244.108` | — | old site — keep as-is for now |
| CNAME | `www` | `aplustechsol.com` | — | www → root |
| A | `mail` | `66.116.244.108` | — | cPanel convenience host |
| A | `ftp` | `66.116.244.108` | — | cPanel convenience host |
| MX | `@` | `mx.zoho.in` | 10 | **email — critical** |
| MX | `@` | `mx2.zoho.in` | 20 | **email — critical** |
| MX | `@` | `mx3.zoho.in` | 50 | **email — critical** |
| TXT | `@` | `v=spf1 include:zohomail.in ~all` | — | **SPF — critical for email** |
| TXT | `@` | `google-site-verification=UXU4kGNDX5P3f0XDgV4ZFuAbfCQwT1rYSnKkU6KWUWg` | — | existing (agency) GSC token |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | — | DMARC policy |

Subdomains checked and NOT present (no record needed): `webmail`, `cpanel`, `autodiscover`. No wildcard detected.

## The gap — records NOT visible from outside (MUST get from the zone file)

Public DNS queries cannot reveal these. Replicating without them risks breaking email signing or a hidden service:

- **Zoho DKIM** — not at the default `zoho._domainkey` selector, so it uses a custom selector. Invisible externally.
- Any **other subdomains** (staging, dev, app, vpn, tracking CNAMEs, etc.).
- Any additional **verification TXT** records.

### How to close the gap (pick one)
1. **Best — get the authoritative zone file.** Request a **full DNS zone export** for `aplustechsol.com` (or cPanel/WHM "Zone Editor" access) from VRD Creative as part of the handover. This gives the exact, complete record set.
2. **If unavailable — reconstruct + regenerate.** Use the table above and re-enable **DKIM in the Zoho Admin Console** (Zoho gives you the exact TXT + selector to add). SPF + DMARC `p=none` mean email will still deliver even if DKIM is briefly absent, but restore DKIM promptly.

## Procedure (do in this order — never skip the verify step)

1. **Get the complete record set** (zone file from VRD Creative, reconciled against the table above).
2. In **GoDaddy → DNS**, add **every** record from the complete set. Keep the root A at `66.116.244.108` for now (do NOT point at Vercel yet — that's a later, separate step).
3. **Double-check the email records** (3 Zoho MX + SPF + DKIM + DMARC) letter-for-letter. This is the make-or-break check.
4. **Lower TTLs** to 600s on the records you'll later change (root A, www) so the future cutover propagates fast.
5. Only now, **switch nameservers** at GoDaddy registrar from `ns1/ns2.aplustechsol.com` to **GoDaddy's default nameservers** (the "change your nameservers" link).
6. **Wait for propagation** (up to a few hours). Then confirm nothing broke:
   - Website still loads.
   - **Send + receive a test email** on a Zoho mailbox.
   - Re-check MX/SPF/DKIM/DMARC resolve correctly.
7. **Rollback if needed:** switch nameservers back to `ns1/ns2.aplustechsol.com`. (Reversible because the old server still has the zone.)

## After takeover (unlocks immediately)

- **GSC:** add your own `google-site-verification` TXT at GoDaddy → verify your Domain property → export **Indexing → Pages → All known pages** (the orphan-URL inventory + performance baseline).
- **Cutover (later, separate):** when the new Next.js site is live on Vercel and tested, change **only** the root A / `www` to Vercel's target. Email untouched.

## What this does NOT do

- Does not move the website off the old server (still `66.116.244.108`).
- Does not touch email routing (still Zoho).
- Does not require the agency's cooperation — only their zone file, and even that is optional if we reconstruct + re-key DKIM.
