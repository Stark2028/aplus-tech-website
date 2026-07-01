# Full Spec Audit — all 52 products (2026-07-01)

Cross-checked every product's key specs (resolution, brightness, sizes,
operation) against Samsung official pages, reseller datasheets, and the 2026
catalog. Report-first: mismatches listed below for approval before any fix.

## Summary

- **25 catalog/latest products** (Phase 1 audit + Phase 2a/2b/2c research):
  previously web-verified; re-confirmed correct here.
- **27 older products:** first-time audit. Most are correct; **6 have real
  mismatches**, 1 is a probable duplicate.

## CONFIRMED CORRECT (no change needed)

Older products verified accurate: QET (300 nit/4K/16-7/43–82"), QBR-B
(300 nit 13" / 250 nit 24", FHD, 16/7), BEC-H (250 nit/4K/16-7), BED-H (300 nit),
VMB-R (500 nit), VMB-E (500 nit), VH55R (700 nit), VHB-E (700 nit),
VM55C-R/VH55C-R/VM55C-E/VH55C-E (match the VMC/VHC 500/700-nit pattern),
Flip Pro WM85B (350 nit, 75/85"), AU800T / HBU8000 / AU700F / HGU701F /
HG75U700F / HGU800F (hotel TVs, 4K). Plus all 25 catalog products.

## MISMATCHES TO FIX (pending approval)

| # | Product | Field | Site value | Correct value (source) |
|---|---------|-------|-----------|------------------------|
| 1 | `samsung-interactive-wac` (WAC) | brightness | 390 cd/m² | **400 cd/m²** (Samsung WA65C spec) |
| 2 | `samsung-interactive-wac` (WAC) | screenSizes | 65, 75 | **65, 75, 86** (WA65C/75C/86C) |
| 3 | `samsung-interactive-wad` (WAD) | operationTime | 16/7 | **12/7** (Samsung WAD datasheet) |
| 4 | `samsung-touch-qmr-t` (QMR-T) | resolution | "FHD (32")" only | **FHD (32") / 4K UHD (43", 55")** — 43/55 are 4K |
| 5 | `samsung-touch-qmr-t` (QMR-T) | operationTime | 16/7 | **16/7 (32") / 24/7 (43", 55")** — 43/55 are 24/7 |
| 6 | `samsung-touch-qmr-t` (QMR-T) | brightness | 300 nit | **300 nit (32", w/ glass) / up to 500 nit (43"/55" w/o glass)** — clarify |
| 7 | `samsung-flip-2` (Flip 2 WM55R) | brightness | 300 nit | **350 nit** (w/o glass; 220 with glass) |
| 8 | `samsung-mp016f` (MP016F) | brightness | 1,200 nit | **1,400 nit (peak)** — MP016F = MPF The Wall |

## FLAG — probable duplicate

- `samsung-mp016f` (MP016F) is Samsung's **MPF "The Wall" Premium Indoor LED**
  (LH016MPFAAA) — the **same product** as the newly-added
  `samsung-the-wall-mpf` (Phase 2a). Currently MP016F sits in Digital Signage
  as a one-off "LED Display" while The Wall MPF is in LED Signage. Options:
  (a) keep both (MP016F as a legacy Digital-Signage LED entry, The Wall MPF as
  the current LED-Signage entry), (b) retire `samsung-mp016f` in favour of the
  LED-Signage entry, or (c) recategorize MP016F into LED Signage. Needs a user
  decision — not auto-fixed.

## FLAG — possible mislabel (no spec change)

- `samsung-interactive-flip-3` (labelled "Flip 3", sizes 75/85") actually
  carries Flip-Pro (WMB)-class specs. The genuine Flip 3 is the WMA series
  (55/65/75/85"). Specs (4K, ~350 nit) aren't *wrong*, but the model identity
  may be muddled. Left as-is unless you want it reconciled.

## Notes

- Hotel TVs (AU/HBU/HGU) use "HDR"/"Standard"/nit conventions inconsistently in
  the existing data; not treated as mismatches since Samsung markets hospitality
  TVs on features rather than a headline nit. Left as-is.
- "w/ glass / w/o glass" brightness nuance applies to touch models (QMR-T like
  QMB-T/QBC-T); corrections preserve the distinction.
