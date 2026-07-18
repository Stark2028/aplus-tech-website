# LED Products — Phase 2a research notes

Web-verified specs (Samsung official + resellers + 2026 catalog PDF) and the
actual images downloaded per product. Image counts are best-effort (min 3);
actuals below.

## The Wall (MPF) — `samsung-the-wall-mpf`
- Series MPF; flip-chip RGB micro-LED; pixel pitch **P0.8 / P1.2 / P1.6**.
- Brightness (peak): **1,800 nit** (P0.8, P1.2) / **1,600 nit** (P1.6).
- Contrast: 29,000:1 (P0.8) / 41,000:1 (P1.2) / 43,000:1 (P1.6).
- Processing: NQM AI Gen2, 20-bit, Linear Grayscale, MICRO HDR, Black Seal, PANTONE-validated.
- Cert: EMC Class B, TUV Eye Comfort, Safety 62368-1/60950-1. IP40/20 (front/rear). Front service. 24/7.
- Current model codes: LH012MPFAAA (P1.2), LH016MPFAAA (P1.6). Related IW-series micro-LED.
- **Images: 9** (bluesquare IW008J gallery — The Wall micro-LED, 1000×667).

## The Wall (MMF) — `samsung-the-wall-mmf`
- Series MMF; flip-chip RGB; pixel pitch **P0.9 / P1.2 / P1.5**.
- Brightness: **600 nit**. Contrast: 8,000:1 (P0.9, P1.2) / 10,000:1 (P1.5).
- Cert: EMC Class A, TUV Eye Comfort. 24/7.
- **Images: 5** (creationnetworks The Wall All-in-One gallery, webp).

## Indoor LED (IE Series) — `samsung-indoor-led-ie`
- Series IEA/IEF; SMD; pixel pitch **P1.2 / P1.5 / P2.0 / P2.5 / P4.0**.
- Brightness: 1,000 nit (P1.5–P2.5) / 800 nit (P4.0) / 600 nit (IEF P1.2).
- Contrast: 6,000:1 (P1.5) / 7,500:1 (P2.0) / 5,000:1 (P2.5, P4.0) / 4,000:1 (IEF P1.2).
- Features: HDR10/10+, 4K AI upscaling, NQM AI Processor, GoB technology; portrait/landscape/curved/L-shaped/ceiling install.
- Current codes: IE015A (P1.5), IE020A (P2.0), IE025A (P2.5). 24/7.
- **Images: 9** (bluesquare IE025A gallery, mixed sizes).

## All-in-One LED (IAB) — `samsung-all-in-one-led-iab`
- Series IAB; 146" (3.70 m); flip-chip RGB; pixel pitch **P0.8 / P1.2 / P1.6**.
- Brightness: 1,600 nit (P0.8, 24,000:1) / 1,400 nit (P1.6, 22,000:1).
- Features: Quick Build, built-in control box, all-inclusive (control box, wall brackets, speakers, décor bezels), MICRO HDR, NQM AI, 20-bit.
- Cert: EMC Class A, TUV Eye Comfort. IP20. ~160 kg. 24/7.
- **Images: 4** (bluesquare The_Wall_IAB gallery, 600×600).

## All-in-One LED (IAC) — `samsung-all-in-one-led-iac`
- Series IAC; 130" (also 146") 2K FHD; SMD; pixel pitch **P1.5**.
- Brightness: 1,000 nit. Contrast: 6,000:1. Refresh: 3,840 Hz.
- Features: Quick Build, built-in control box, all-inclusive package.
- Current code: LH015IACCHS. 24/7.
- **Images: 5** (knitec Shopify gallery — high-res IAC shots, up to 4500×3000).

## Sourcing notes
- Reliable static-HTML image sources: bluesquare.digital (Magento), knitec.com
  and creationnetworks.net (Shopify). Samsung.com galleries are JS-rendered;
  B&H rate-limits; avendor exposes 1 static image per page.
- All downloaded files validated as real images (`file`), non-zero, deduped.
