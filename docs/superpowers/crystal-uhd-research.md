# Crystal UHD Hospitality TVs — Phase 2c research notes

Web-verified specs (Samsung Global Newsroom HITEC 2025 + Samsung US/India +
resellers) and images downloaded per product.

## HU8000F — `samsung-hotel-tv-hu8000f` (Commercial TV / Hotel TV)
- 43/50/55/65/75/85", 4K VA direct-backlit, HDR10/HDR10+, 60 Hz, Crystal Processor 4K, AI 4K upscaling, Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer, 20W stereo + adaptive sound. **AirSlim** design.
- Hospitality: LYNK Cloud, Tizen Enterprise, Google Cast, Apple AirPlay, Smart Hub, Samsung TV Plus, Netflix, Prime Video, Multi-Code Remote, SmartThings Pro, Samsung Knox. Wi-Fi 5, BT 5.2, 3×HDMI, 2×USB-A.
- Model codes: HG43U800FNFXZA … HG85U800FNFXZA.
- **Images: 8** (Samsung Global Newsroom HITEC 2025 press: dl1–4 product + main1–4 lifestyle).

## HU7010F — `samsung-hotel-tv-hu7010f` (Commercial TV / Hotel TV)
- 43/50/55/65/75", 4K, Crystal Processor 4K, AI 4K upscaling, HDR, Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer, 20W 2-ch + adaptive sound, Dolby Digital MS12.
- Hospitality: LYNK Cloud, Tizen Enterprise, Google Cast, Apple AirPlay, Smart Hub, Samsung TV Plus, Multi-Code Remote, SmartThings Pro, Samsung Knox. Wi-Fi 5, BT 5.2, 2×HDMI, 2×USB-A. Swivel stand. **No AirSlim.**
- **Launched in India only.** Model code: HG55U701FNFXZA (HU701F).
- **Images: 4** (officewonderland Shopify JSON — HG50U701F front/angled/side/back).

## Sourcing notes
- HU8000F: Samsung Global Newsroom (best source — clean hi-res press images).
- HU7010F: low web presence; resolved via the Shopify `/products/<slug>.json`
  endpoint (officewonderland) which exposes image URLs even when the HTML is
  JS-rendered. Useful trick for thin-presence models.
- All files validated as real images; distinct (no dupes).
