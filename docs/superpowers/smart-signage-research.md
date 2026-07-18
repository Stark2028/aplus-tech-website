# Smart Signage Products — Phase 2b research notes

Web-verified specs (Samsung newsroom + official pages + resellers + 2026 catalog)
and actual images downloaded per product. Image counts are best-effort (min 3
target); Stretched + Small came up short (1 each) — flagged for backfill.

## Spatial Signage (SMHX) — `samsung-spatial-smhx` (Digital Signage / Spatial)
- 85" 4K UHD (also 32" FHD 9:16 portrait), 500 nit, glasses-free Virtual 3D via 3D Plate tech, 52mm slim, 24/7, Tizen 7.0, Quantum Processor, anti-glare, Samsung VXT + AI Studio. CES 2026 Innovation Award. Model LH85SMHPBGCXZA (SM85HX-P).
- **Images: 8** (Samsung Global Newsroom press: ISE 2026 + 32" launch, jpg up to 3840×2160).

## Color E-Paper (EMDX) — `samsung-color-epaper-emdx` (Digital Signage / Color E-Paper)
- 32" WQHD 2,560×1,440 E-Ink Spectra 6 (also 13"); up to 77K colours; 4,600mAh battery (~200 days at 1 update/day); 0W static; Wi-Fi/BT/USB-C; IP5X; Tizen 8.0; VXT + E-Paper app; 17.9mm; recycled materials. Model LH32EMDIBGBXZA (EM32DX).
- **Images: 8** (Samsung Global Newsroom EM32DX launch press).

## Outdoor Signage (OH Series) — `samsung-outdoor-oh` (Digital Signage / Outdoor)
- OHA (75" 4K), OHDX (46"/55" FHD), OHB (24"); 3,500 nit (peak 4,000), OHB 1,500 nit; UL-verified outdoor visibility; IP56; IK10; auto brightness; heat-dissipation; 24/7; Samsung VXT. Model LH75OHAEBGBXZA.
- **Images: 4** (screenmoove OH75A/OHA feature shots).

## Window Signage (OM Series) — `samsung-window-om` (Digital Signage / Window)
- OMA (75" 4K), OMB (46" FHD 4,000 nit / 55" 4K 3,000 nit), OMN/OMN-D (FHD 4,000 nit; OMN-D dual-sided 3,000/1,000), OMDX (32" FHD 2,000 nit, 4.56cm depth); IP5X; polarized-sunglass support; auto brightness; 24/7. Model LH55OMBEBGBXZA.
- **Images: 5** (timelineproav OM55B gallery + displaydetails OM46B).

## Stretched Signage (SHC) — `samsung-stretched-shc` (Digital Signage / Stretched)
- SH37C, 94cm (37"), 16:4.5 stretched ratio, 1,920×540, 700 nit, 4,000:1, anti-glare, 24/7, embedded media player, vertical install, Tizen 7.0, ENERGY STAR 8.0 / EPEAT. Model LH37SHCEBGBXZA.
- **Images: 1** (bluesquare 02_sh37c_pc). BACKFILL NEEDED — clean galleries not available from static sources for this niche model.

## Small Signage (QBC) — `samsung-small-qbc` (Digital Signage / Small Signage)
- QB13C (13"/33cm) / QB24C (24"/61cm), FHD 1,920×1,080, 500 nit (13") / 250 nit (24"), 800:1 (13") / 1,000:1 (24"), 16/7, slim 19.9mm (13"), Home UI, Dual Wi-Fi (2.4+5GHz), Samsung VXT, Tizen 7.0. Model LH13QBCEBGBXZA. NOTE: non-touch, distinct from `samsung-qbc-t` (touch).
- **Images: 1** (AVI-SPL SAMQB13C). BACKFILL NEEDED — same as Stretched.

## Samsung Flip (WMFX) — `samsung-flip-wmfx` (Interactive Display / Flip)
- 55/65/75/85", 4K UHD, 450 nit, anti-glare, 26ms response, 2,048 pressure, dual pen; Enhanced Whiteboard, Flip Home, rotatable, Workspace, SMARTVIEW+ (up to 9 devices), Samsung Knox, USB-C Hub / HDMI Out / OPS; Tizen 9.0. Model LH55WMFWBGCX.
- **Images: 3** (Samsung DE Newsroom WMFX press: front ×2 + R-perspective).

## Sourcing notes
- Best source: **Samsung Global Newsroom** (news.samsung.com) press images —
  clean, high-res, authoritative (used for Spatial, E-Paper, Flip).
- Reseller static-HTML images: bluesquare.digital, timelineproav.com,
  screenmoove.com, shop.avispl.com, displaydetails.com.
- Stretched (SH37C) + Small (QB13C) have thin web image presence; only 1 clean
  product shot each was findable. Shipped with 1 image, flagged for backfill.
- All downloaded files validated as real images (`file`); 404-HTML saved as
  .webp were detected and removed.
