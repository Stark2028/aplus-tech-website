# GoDaddy DNS records — go-live record set (aplustechsol.com)

**Date assembled:** 2026-07-17
**Purpose:** The complete DNS zone to recreate at GoDaddy when taking over DNS and pointing the domain at the new Vercel site. Web → Vercel, email → Zoho (unchanged). All email records verified against the live DNS on 2026-07-17; web records from the Vercel project `aplus-tech-website`.

## Website (Vercel)

| Type | Name / Host | Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | — | 600 |
| CNAME | `www` | `17c9da7b9bb72bfd.vercel-dns-017.com` | — | 600 |

- Apex→www redirect is handled inside Vercel (308). No GoDaddy forwarding rule needed.
- Legacy Vercel values `76.76.21.21` (A) and `cname.vercel-dns.com` (CNAME) also work, per Vercel's notice, but prefer the project-specific values above.

## Email (Zoho — DO NOT change; these keep mail working)

| Type | Name / Host | Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| MX | `@` | `mx.zoho.in` | 10 | 3600 |
| MX | `@` | `mx2.zoho.in` | 20 | 3600 |
| MX | `@` | `mx3.zoho.in` | 50 | 3600 |
| TXT | `@` | `v=spf1 include:zohomail.in ~all` | — | 3600 |
| TXT | `zoho._domainkey` | `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCYp6mt/oxrxoiEVrLwgS800eeF2LpVydg/0b3J8mqPnzNWDPjN9R5Nf3o+NUOaf76OeQuSlyToEUT+g58srzD7uouXlnMTpHMfW2iopnMIHqs2JgccJMKNzIrEZ5aH1kCUgsuEXxiiGocv+3qc2fZpT37iMsSBQwl+Bf9SwaP7pwIDAQAB` | — | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | — | 3600 |

## Other

| Type | Name / Host | Value | Notes |
| --- | --- | --- | --- |
| TXT | `@` | `google-site-verification=UXU4kGNDX5P3f0XDgV4ZFuAbfCQwT1rYSnKkU6KWUWg` | Agency's existing GSC token. Harmless to keep; remove later once own GSC is set up. |

## NOT recreated (intentionally dropped)

- `mail` A → 66.116.244.108 and `ftp` A → 66.116.244.108 — old cPanel convenience hosts on the retiring server. Zoho email does not depend on them. Only recreate if something actually uses `mail.aplustechsol.com` / `ftp.aplustechsol.com`.
- Custom vanity nameservers `ns1/ns2.aplustechsol.com` and their glue — become irrelevant once nameservers move to GoDaddy.

## Switch procedure (do steps 2–3 back-to-back, in one sitting)

1. **Pre-flight:** confirm the site works at `aplus-tech-website.vercel.app`, and both domains are added in the Vercel project (showing "Invalid Configuration" — expected).
2. **GoDaddy → DNS → Nameservers → Change Nameservers →** switch from custom (`ns1/ns2.aplustechsol.com`) to **GoDaddy default nameservers**. Save.
3. **Immediately: GoDaddy → DNS → DNS Records →** delete any default parked records (a default `A @` and/or `CNAME www` GoDaddy adds), then add **every** record from the tables above. Leave GoDaddy's own `NS` and `SOA` records untouched.
4. **Wait** for propagation (minutes to a few hours). During this window the old zone still answers, so the site and email keep working; mail servers auto-retry regardless.
5. **Verify (Stage 3):**
   - Vercel Domains page flips both to **"Valid Configuration."**
   - `https://www.aplustechsol.com` loads the **new** site.
   - **Send an email to a Zoho mailbox from an outside account (e.g. Gmail), and reply from it** — both directions must work.
6. **Rollback if needed:** switch nameservers back to `ns1/ns2.aplustechsol.com`.

## After go-live

- Add your **own** `google-site-verification` TXT → verify your GSC **Domain** property → submit `https://www.aplustechsol.com/sitemap.xml`.
- Watch GSC Coverage/Pages daily for 2–4 weeks for any 404 spikes.
