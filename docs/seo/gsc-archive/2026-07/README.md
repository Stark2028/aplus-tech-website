# GSC archive — exported 2026-07-29

**Why this folder exists:** Google Search Console retains only **16 months** of Performance
data, rolling off month by month. This export is the permanent record of the **old WordPress
site's** search performance — the migration baseline. Once a month ages out of GSC it cannot be
recovered from anywhere, by anyone. Treat these files as write-once.

**Window captured:** `2025-03-27 → 2026-07-26` — 487 days, the full 16-month maximum.
Exported with **no filters**, Search type = Web (`Filters.csv` is empty, confirming this).

## Verified totals

Every figure below was computed from the files in this folder on 2026-07-29, not copied from a
report.

| Metric (16 months) | Value |
|---|---|
| Clicks | **4,681** |
| Impressions | **217,822** |

`Countries.csv` and `Devices.csv` each sum to **exactly** 4,681 / 217,822, matching the daily
series in `Chart.csv`. That three-way agreement is the integrity check — the export is complete
and uncorrupted.

> Do not confuse this with the **365-day** baseline in `docs/seo/README.md` §3
> (3,852 clicks / 167,855 impressions, 2025-07-26 → 2026-07-25). Both are correct; they are
> different windows. Use the 365-day figure for year-over-year comparisons and the
> **~74 clicks/week** derived from it when judging post-migration recovery.

## Files

| Path | What it is |
|---|---|
| `…-Performance-on-Search-2026-07-29/Chart.csv` | Daily time series, 487 rows — the source of truth for totals |
| `…/Queries.csv` | Search queries (1,000-row cap) |
| `…/Pages.csv` | Landing pages, old-site URL structure (1,000-row cap) |
| `…/Countries.csv` | 214 countries |
| `…/Devices.csv` | Desktop / mobile / tablet |
| `…/Search appearance.csv` | 1 row — 14 clicks, 2,274 impressions |
| `…/Filters.csv` | Empty — proves no filters were applied |
| `…-Crawl-stats-2026-07-29/` | Crawl stats (GSC retains only **90 days** — this is the more perishable set) |
| `…-Latest links-2026-07-29.csv` | External backlinks |
| `…-More sample links-2026-07-29.csv` | Additional backlink sample |

## Read these caveats before quoting any number

1. **Clicks are complete; impressions are not.** Both `Pages.csv` and `Queries.csv` hit the
   1,000-row cap, but both reach **zero-click rows inside it** (260 and 833 rows respectively).
   Rows are sorted by clicks descending, so every click-earning page and query is present. What
   is truncated is the impression-only tail below the cap. Click analysis: trustworthy. Total
   impressions by page/query: understated.
2. **Denominator.** `Pages.csv` sums to **4,813** clicks — 132 more than the property total of
   4,681 (+2.8%). This is normal GSC dimension-table behaviour, not a parsing error, and it
   matches the +2.9% seen in the 365-day export. Always compute percentages against **4,681**,
   and say "approximately".
3. **Query truncation.** `Queries.csv` discloses only **1,516 of 4,681 clicks (32.4%)**. Google
   anonymises long-tail queries, so any share computed here is a share *of disclosed queries*.
   Directional conclusions hold; precise percentages do not generalise. This is Google's
   anonymisation, not the row cap — re-exporting or segmenting will not recover it.
4. **This is the OLD site.** Only **one** new-format URL appears in `Pages.csv`, earning 21
   clicks. Everything else uses the WordPress structure and now 301s. These numbers are a
   baseline, not a result — judge the migration against them no earlier than week 8
   post-cutover (`docs/seo/README.md` §12).

## What this archive is *for*

It is the "before" line. Its entire value is making the week-8+ recovery judgment possible —
without it there is no defensible answer to "did consolidating 7,507 URLs into 248 work?"
The supporting analysis already drawn from this data lives in `docs/seo/README.md` §2–§3.
