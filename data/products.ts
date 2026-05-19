export interface Product {
  id: string;
  name: string;
  /** Must match ProductCategory.name exactly */
  category: string;
  series: string;
  description: string;
  /** Multi-paragraph product overview shown on the product detail page */
  longDescription?: string;
  features: string[];
  specs: {
    resolution: string;
    brightness: string;
    screenSizes: string[];
    operationTime: string;
  };
  /** Extra specs shown in the detail page table (connectivity, OS, dimensions, etc.) */
  additionalSpecs?: Record<string, string>;
  images: string[];
  /** Sub-label shown in listings (e.g. "Hotel TV", "Business TV") */
  subCategory?: string;
}

export const products: Product[] = [

  // ── DIGITAL SIGNAGE ──────────────────────────────────────────────────────────

  {
    id: "samsung-qet-series",
    name: "Samsung Smart Signage QET Series",
    category: "Digital Signage",
    series: "QET Series",
    description:
      "Upgrade your business with efficient and reliable digital signage technology. Crystal Display delivers optimized color expression with a bezel-less design built for 16/7 operation.",
    longDescription: `The Samsung QET Series brings reliable 4K UHD digital signage to businesses that need professional-grade displays without the complexity of enterprise-tier solutions. Its Crystal Display panel delivers optimized color expression and enhanced visual clarity, making it ideal for retail environments, restaurant menu boards, corporate lobbies, and event venues.

The QET's bezel-less design eliminates the visual boundary between the screen and its surroundings, creating a cleaner, more immersive installation. Running on Samsung's Tizen 7.0 operating system with MagicINFO Player S6, the display enables on-premises and cloud-based content management without an external media player.

With a 16/7 operation rating and a size range from 43" to 82", the QET Series adapts to virtually any signage application — from countertop information displays to large-format wall installations. Built-in Wi-Fi and LAN connectivity allow easy integration into existing network infrastructure.`,
    features: [
      "Crystal Display for optimized color expression",
      "Bezel-less design for immersive viewing",
      "MagicINFO Player S6 for easy content management",
      "16/7 operation reliability",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "65", "70", "75", "82"],
      operationTime: "16/7",
    },
    additionalSpecs: {
      "Operating System": "Tizen 7.0",
      "Content Player": "MagicINFO Player S6",
      "Input Ports": "HDMI × 2, USB × 2, RS-232C (In/Out), RJ-45 (LAN)",
      "Wi-Fi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
      "Bluetooth": "5.0",
      "Processor": "Quad-core 1.5 GHz",
      "Memory / Storage": "2.5 GB / 16 GB",
      "Color Gamut": "72% NTSC (typical)",
      "Viewing Angle (H/V)": "178° / 178°",
      "VESA Mount": "400 × 400 mm (55\")",
    },
    images: [
      "/products/smart-signage/samsung-qet-series/1.avif",
      "/products/smart-signage/samsung-qet-series/2.avif",
      "/products/smart-signage/samsung-qet-series/3.avif",
      "/products/smart-signage/samsung-qet-series/4.avif",
      "/products/smart-signage/samsung-qet-series/5.avif",
      "/products/smart-signage/samsung-qet-series/6.avif",
      "/products/smart-signage/samsung-qet-series/7.avif",
      "/products/smart-signage/samsung-qet-series/8.avif",
      "/products/smart-signage/samsung-qet-series/9.avif",
      "/products/smart-signage/samsung-qet-series/10.avif",
    ],
  },
  {
    id: "samsung-signage-qbc",
    name: "Samsung Signage Display QBC Series",
    category: "Digital Signage",
    series: "QBC",
    description:
      "Ultra-slim signage with Dynamic Crystal Color and enhanced performance for lobbies, retail, and corporate spaces.",
    features: [
      "Dynamic Crystal Color for vibrant visuals",
      "Ultra-slim depth (28.5 mm)",
      "Centered IR for easy remote control",
      "MagicINFO S6 content management",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "350 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: ["/products/digital-signage/samsung-signage-qbc/1.webp", "/products/digital-signage/samsung-signage-qbc/2.webp", "/products/digital-signage/samsung-signage-qbc/3.webp"],
  },
  {
    id: "samsung-signage-qhc",
    name: "Samsung Signage QHC Series — High Brightness",
    category: "Digital Signage",
    series: "QHC",
    description:
      "High-brightness displays engineered for bright environments such as atriums, showrooms, and sun-lit lobbies.",
    features: [
      "700 nit brightness for high-ambient environments",
      "Non-glare panel for clear daytime viewing",
      "Ultra-slim design",
      "24/7 operation grade",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "700 nit",
      screenSizes: ["43", "50", "55", "65", "75"],
      operationTime: "24/7",
    },
    images: ["/products/digital-signage/samsung-signage-qhc/1.webp", "/products/digital-signage/samsung-signage-qhc/2.webp", "/products/digital-signage/samsung-signage-qhc/3.webp"],
  },
  {
    id: "samsung-signage-qmc",
    name: "Samsung Crystal UHD Signage QMC Series",
    category: "Digital Signage",
    series: "QMC",
    description:
      "The thinnest display in Samsung's commercial signage lineup — maximized space efficiency without compromising brightness.",
    features: [
      "Ultra-slim depth (thinnest in lineup)",
      "500 nit brightness",
      "Anti-glare panel",
      "24/7 operation grade",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "500 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "24/7",
    },
    images: ["/products/digital-signage/samsung-signage-qmc/1.webp", "/products/digital-signage/samsung-signage-qmc/2.webp", "/products/digital-signage/samsung-signage-qmc/3.webp"],
  },
  {
    id: "samsung-signage-qbr-b",
    name: "Samsung Small Display Full HD QBR-B Series",
    category: "Digital Signage",
    series: "QBR-B",
    description:
      "Compact, powerful displays for impactful messaging in tight spaces — reception counters, checkout queues, and indoor kiosks.",
    features: [
      "Compact 13\" and 24\" sizes",
      "Knox enterprise security",
      "Built-in Wi-Fi",
      "MagicINFO compatible",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "250–300 nit",
      screenSizes: ["13", "24"],
      operationTime: "16/7",
    },
    images: ["/products/digital-signage/samsung-signage-qbr-b/1.webp", "/products/digital-signage/samsung-signage-qbr-b/2.webp", "/products/digital-signage/samsung-signage-qbr-b/3.webp"],
  },
  {
    id: "samsung-touch-qmr-t",
    name: "Samsung Touch Signage QMR-T Series",
    category: "Digital Signage",
    subCategory: "Touch Signage",
    series: "QMR-T",
    description:
      "All-in-one capacitive touch signage for wayfinding kiosks, self-service counters, and interactive information points.",
    features: [
      "Capacitive multi-touch panel",
      "IP5x dust protection",
      "Glare-free display",
      "Embedded content player",
    ],
    specs: {
      resolution: "FHD (32\") / 4K UHD (43\", 55\")",
      brightness: "300 nit",
      screenSizes: ["32", "43", "55"],
      operationTime: "16/7",
    },
    images: ["/products/digital-signage/samsung-touch-qmr-t/1.webp", "/products/digital-signage/samsung-touch-qmr-t/2.webp", "/products/digital-signage/samsung-touch-qmr-t/3.webp"],
  },
  {
    id: "samsung-touch-qbc-t",
    name: "Samsung Interactive Signage QMB-T Series",
    category: "Digital Signage",
    subCategory: "Touch Signage",
    series: "QMB-T",
    description:
      "Mid-to-large capacitive touch signage for interactive retail campaigns, wayfinding walls, and self-service kiosks.",
    features: [
      "Capacitive touch overlay",
      "Ultra-slim depth",
      "Internal content player",
      "4K UHD resolution",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "55"],
      operationTime: "16/7",
    },
    images: ["/products/digital-signage/samsung-touch-qbc-t/1.jpg", "/products/digital-signage/samsung-touch-qbc-t/2.jpg", "/products/digital-signage/samsung-touch-qbc-t/3.jpg"],
  },
  {
    id: "samsung-mp016f",
    name: "Samsung LED Display MP016F",
    category: "Digital Signage",
    subCategory: "LED Display",
    series: "MP016F",
    description:
      "High-quality fine-pitch LED signage module for custom large-format indoor displays — lobbies, stages, and brand walls.",
    features: [
      "Pixel pitch 1.6 mm for crisp close-range viewing",
      "HDR support",
      "Magnetic service access for easy maintenance",
      "1,200 nit brightness for indoor impact",
    ],
    specs: {
      resolution: "Custom",
      brightness: "1,200 nit",
      screenSizes: ["Custom"],
      operationTime: "24/7",
    },
    images: ["/products/digital-signage/samsung-mp016f/1.jpg", "/products/digital-signage/samsung-mp016f/2.jpg", "/products/digital-signage/samsung-mp016f/3.jpg"],
  },

  // ── VIDEO WALLS ──────────────────────────────────────────────────────────────

  {
    id: "samsung-vm55c-r",
    name: "Samsung VM55C-R Razor-Thin Bezel Video Wall",
    category: "Video Wall",
    series: "VM55C-R",
    description:
      "Seamless video walls with a razor-thin 0.44 mm bezel for an immersive 24/7 viewing experience in control rooms and atriums.",
    longDescription: `The Samsung VM55C-R sets the benchmark for LCD video wall performance with its razor-thin 0.44 mm bezel-to-bezel specification — the narrowest gap achievable in an LCD tile format. Designed for 24/7 environments such as security control rooms, network operations centers, airport information displays, and corporate command centers, the VM55C-R delivers uninterrupted visual continuity across large multi-screen arrays.

Image Enhancement Technology ensures accurate color reproduction and picture uniformity across all tiles in an array, eliminating the color and brightness drift that can occur during extended operation. The 178°/178° wide viewing angles mean content remains visible and accurate from virtually any position in the room.

UHD Daisy Chain support allows up to a 5×5 (25-tile) array to be driven without an external video processor, dramatically reducing installation complexity and cost. The display integrates natively with Samsung's MagicINFO S6 platform for centralized content scheduling and remote monitoring across the entire installation.`,
    features: [
      "0.44 mm bezel-to-bezel for near-seamless imagery",
      "178°/178° wide viewing angles",
      "Image Enhancement Technology for vibrant colors",
      "UHD Daisy Chain up to 5×5 without extra hardware",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    additionalSpecs: {
      "Panel Type": "S-PVA",
      "Bezel-to-Bezel": "0.44 mm (all sides)",
      "Contrast Ratio": "4,000:1 (typical)",
      "Viewing Angle (H/V)": "178° / 178°",
      "Input Ports": "HDMI 1.4 × 2, DisplayPort 1.2 × 1, DVI-D × 1",
      "Daisy Chain": "UHD Daisy Chain (up to 5×5)",
      "External Control": "RS-232C, RJ-45 (LAN)",
      "Power Consumption": "~100 W (typical)",
      "Dimensions (W×H×D)": "1,209.6 × 680.4 × 77.6 mm",
      "Weight": "~19.6 kg (without stand)",
      "VESA Mount": "400 × 400 mm",
    },
    images: [
      "/products/video-walls/vm55c-r/1.avif",
      "/products/video-walls/vm55c-r/2.avif",
      "/products/video-walls/vm55c-r/3.avif",
      "/products/video-walls/vm55c-r/4.avif",
      "/products/video-walls/vm55c-r/5.avif",
      "/products/video-walls/vm55c-r/6.avif",
      "/products/video-walls/vm55c-r/7.avif",
      "/products/video-walls/vm55c-r/8.avif",
      "/products/video-walls/vm55c-r/9.avif",
    ],
  },
  {
    id: "samsung-vh55c-r",
    name: "Samsung VH55C-R Razor-Thin Bezel Video Wall",
    category: "Video Wall",
    series: "VH55C-R",
    description:
      "High-brightness razor-thin bezel video wall with non-glare panel, ideal for broadcast studios and command centers.",
    features: [
      "0.088 cm bezel-to-bezel (0.88 mm)",
      "700 nit high brightness",
      "Non-glare panel",
      "Wide viewing angle",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "700 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: [
      "/products/video-walls/vh55c-r/1.avif",
      "/products/video-walls/vh55c-r/2.avif",
      "/products/video-walls/vh55c-r/3.avif",
      "/products/video-walls/vh55c-r/4.avif",
      "/products/video-walls/vh55c-r/5.avif",
      "/products/video-walls/vh55c-r/6.avif",
      "/products/video-walls/vh55c-r/7.avif",
      "/products/video-walls/vh55c-r/8.avif",
    ],
  },
  {
    id: "samsung-vh55c-e",
    name: "Samsung VH55C-E Extreme Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VH55C-E",
    description:
      "Extreme narrow bezel video wall with 0.174 cm bezel-to-bezel for demanding seamless display installations.",
    features: [
      "0.174 cm bezel-to-bezel",
      "Non-glare panel",
      "700 nit brightness",
      "Wide viewing angle",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "700 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: [
      "/products/video-walls/vh55c-e/1.avif",
      "/products/video-walls/vh55c-e/2.avif",
      "/products/video-walls/vh55c-e/3.avif",
      "/products/video-walls/vh55c-e/4.avif",
      "/products/video-walls/vh55c-e/5.avif",
      "/products/video-walls/vh55c-e/6.avif",
      "/products/video-walls/vh55c-e/7.avif",
      "/products/video-walls/vh55c-e/8.avif",
    ],
  },
  {
    id: "samsung-vm55c-e",
    name: "Samsung VM55C-E Extreme Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VM55C-E",
    description:
      "Extreme narrow bezel video wall with non-glare panel for immersive seamless displays.",
    features: [
      "0.174 cm bezel-to-bezel (1.74 mm)",
      "Non-glare panel",
      "Wide viewing angle",
      "500 nit brightness",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: [
      "/products/video-walls/vm55c-e/1.avif",
      "/products/video-walls/vm55c-e/2.avif",
      "/products/video-walls/vm55c-e/3.avif",
      "/products/video-walls/vm55c-e/4.avif",
      "/products/video-walls/vm55c-e/5.avif",
      "/products/video-walls/vm55c-e/6.avif",
      "/products/video-walls/vm55c-e/7.avif",
      "/products/video-walls/vm55c-e/8.avif",
      "/products/video-walls/vm55c-e/9.avif",
    ],
  },
  {
    id: "samsung-vmb-u-46",
    name: "Samsung VMB-U 46\" Ultra Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VMB-U",
    description:
      "46-inch ultra narrow bezel video wall tile for compact multi-screen installations.",
    longDescription: `The Samsung VMB-U 46" is purpose-built for compact multi-screen video wall installations where space efficiency and visual continuity are paramount. Its ultra-narrow bezel design minimizes visible gaps between tiles, creating a near-seamless canvas ideal for retail display walls, hotel lobbies, and corporate reception areas.

The VMB-U features a non-glare panel that delivers clear, comfortable viewing even in mixed-lighting environments. With 500-nit brightness and FHD (1,920 × 1,080) resolution per tile, the display maintains consistent, vibrant output across extended 24/7 operation cycles — making it suitable for always-on deployments.

Built-in daisy chain connectivity simplifies multi-display wiring, allowing signal and power connections to be cascaded without additional hardware. The display is compatible with Samsung's MagicINFO content management platform, enabling centralized scheduling and monitoring of all tiles from a single dashboard.`,
    features: [
      "Ultra narrow bezel",
      "Wide viewing angle",
      "Non-glare panel",
      "24/7 operation",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["46"],
      operationTime: "24/7",
    },
    additionalSpecs: {
      "Panel Type": "S-PVA",
      "Bezel-to-Bezel": "5.3 mm (all sides)",
      "Contrast Ratio": "4,000:1 (typical)",
      "Viewing Angle (H/V)": "178° / 178°",
      "Input Ports": "HDMI 1.3 × 1, DVI-D × 1, DisplayPort 1.1 × 1",
      "External Control": "RS-232C, RJ-45 (LAN)",
      "Power Consumption": "~95 W (typical)",
      "Dimensions (W×H×D)": "1,041.9 × 587.7 × 74.7 mm",
      "Weight": "~17.0 kg (without stand)",
      "VESA Mount": "400 × 200 mm",
    },
    images: [
      "/products/video-walls/vmb-u-46/1.avif",
      "/products/video-walls/vmb-u-46/2.avif",
      "/products/video-walls/vmb-u-46/3.avif",
      "/products/video-walls/vmb-u-46/4.avif",
      "/products/video-walls/vmb-u-46/5.avif",
      "/products/video-walls/vmb-u-46/6.avif",
      "/products/video-walls/vmb-u-46/7.avif",
      "/products/video-walls/vmb-u-46/8.avif",
      "/products/video-walls/vmb-u-46/9.avif",
    ],
  },
  {
    id: "samsung-vmb-u-55",
    name: "Samsung VMB-U 55\" Ultra Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VMB-U",
    description:
      "55-inch ultra-narrow bezel video wall with non-glare panels for vibrant, seamless large-scale screens.",
    features: [
      "3.5 mm bezel-to-bezel",
      "Wide viewing angles",
      "Non-glare panels",
      "500 nit brightness",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: [
      "/products/video-walls/vmb-u-55/1.avif",
      "/products/video-walls/vmb-u-55/2.avif",
      "/products/video-walls/vmb-u-55/3.avif",
      "/products/video-walls/vmb-u-55/4.avif",
      "/products/video-walls/vmb-u-55/5.avif",
      "/products/video-walls/vmb-u-55/6.avif",
      "/products/video-walls/vmb-u-55/7.avif",
    ],
  },
  {
    id: "samsung-videowall-vmb-r",
    name: "Samsung VMB-R Razor Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VMB-R",
    description:
      "Razor-thin bezel video wall ensuring an immersive viewing experience with image enhancement technology.",
    features: [
      "Razor-thin bezel",
      "Image enhancement",
      "Wide viewing angle",
      "24/7 operation",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: ["/products/video-walls/samsung-videowall-vmb-r/1.png", "/products/video-walls/samsung-videowall-vmb-r/2.png", "/products/video-walls/samsung-videowall-vmb-r/3.png"],
  },
  {
    id: "samsung-videowall-vmc-r",
    name: "Samsung VMC-R Series Video Wall",
    category: "Video Wall",
    series: "VMC-R",
    description:
      "Efficient video wall solution with ultra-narrow bezels and DP 1.2 daisy chain support for seamless large-scale screens.",
    features: [
      "Ultra-narrow bezel",
      "DP 1.2 Daisy Chain",
      "Factory calibration",
      "500 nit brightness",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: ["/products/video-walls/samsung-videowall-vmc-r/1.webp", "/products/video-walls/samsung-videowall-vmc-r/2.webp", "/products/video-walls/samsung-videowall-vmc-r/3.webp"],
  },

  // ── INTERACTIVE DISPLAYS ─────────────────────────────────────────────────────

  {
    id: "samsung-flip-pro-wm85b",
    name: "Samsung Flip Pro (WM85B) Interactive Display",
    category: "Interactive Display",
    series: "Flip Pro",
    description:
      "Premium interactive display that inspires collaboration and creativity in corporate meeting rooms and boardrooms.",
    longDescription: `The Samsung Flip Pro (WM85B) redefines the meeting room experience by replacing traditional whiteboards and projectors with an intelligent, touch-sensitive 4K UHD canvas. Designed for corporate boardrooms, executive meeting rooms, and collaborative workspaces, the Flip Pro supports up to 20 simultaneous touch points — enabling true multi-user ideation sessions without lag or queuing.

A single USB-C cable delivers up to 65 W of power to connected laptops while simultaneously mirroring their screen, dramatically simplifying cable management in a modern meeting setup. Participants can also join wirelessly via AirPlay, Miracast, or Samsung Screen Mirroring, allowing full BYOD participation without installing drivers or software.

The Flip Pro runs on Tizen OS with Samsung Knox security built in, ensuring session content is protected and devices can be remotely managed across a fleet. The intuitive writing experience — with stylus or finger — replicates the natural feel of pen on paper, making the transition from physical whiteboards seamless for any team.`,
    features: [
      "Multi-touch for up to 20 simultaneous users",
      "USB-C connectivity with 65W charging and screen share",
      "Intuitive writing and drawing experience",
      "Wireless screen sharing from any device",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "350 nit",
      screenSizes: ["75", "85"],
      operationTime: "16/7",
    },
    additionalSpecs: {
      "Operating System": "Tizen 6.5 (Samsung Knox)",
      "Touch Points": "Up to 20 simultaneous",
      "USB-C": "USB-C 3.1 Gen1 × 1 (65 W Power Delivery + display)",
      "Other Inputs": "HDMI 2.0 × 2, USB 3.0 × 2, USB 2.0 × 2",
      "Wireless": "802.11 a/b/g/n/ac, Bluetooth 4.2",
      "Screen Share": "AirPlay, Miracast, Screen Mirroring",
      "Processor": "Quad-core 1.4 GHz",
      "Memory / Storage": "4 GB / 64 GB",
      "Color Gamut": "99% sRGB",
      "VESA Mount": "600 × 400 mm",
    },
    images: ["/products/interactive/samsung-flip-pro-wm85b/1.webp", "/products/interactive/samsung-flip-pro-wm85b/2.webp", "/products/interactive/samsung-flip-pro-wm85b/3.webp"],
  },
  {
    id: "samsung-interactive-flip-3",
    name: "Samsung Flip 3 Interactive Display",
    category: "Interactive Display",
    series: "Flip 3",
    description:
      "The evolution of the digital flipchart — realistic writing experience with embedded safety and collaboration features.",
    features: [
      "Realistic pen-on-paper writing experience",
      "Antimicrobial coating",
      "Embedded safety and privacy features",
      "One-cable USB-C setup",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "350 nit",
      screenSizes: ["75", "85"],
      operationTime: "16/7",
    },
    images: ["/products/interactive/samsung-interactive-flip-3/1.webp", "/products/interactive/samsung-interactive-flip-3/2.webp", "/products/interactive/samsung-interactive-flip-3/3.webp"],
  },
  {
    id: "samsung-interactive-wac",
    name: "Samsung WAC Series Interactive Display",
    category: "Interactive Display",
    series: "WAC",
    description:
      "Android-based interactive display designed for scalable, connected classrooms and collaborative workspaces.",
    features: [
      "Android OS — apps and browser built-in",
      "EDLA certified for Google Play Store",
      "Multi-touch support",
      "Remote device management",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "400 nit",
      screenSizes: ["65", "75", "86"],
      operationTime: "16/7",
    },
    images: ["/products/interactive/samsung-interactive-wac/1.jpg", "/products/interactive/samsung-interactive-wac/2.jpg", "/products/interactive/samsung-interactive-wac/3.jpg"],
  },
  {
    id: "samsung-interactive-wad",
    name: "Samsung WAD Series Interactive Display",
    category: "Interactive Display",
    series: "WAD",
    description:
      "Google EDLA certified interactive display with full Google ecosystem integration for modern education.",
    features: [
      "Google Play Store access",
      "Seamless Google Workspace integration",
      "Central device management via EMM",
      "Crystal-clear 4K UHD resolution",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "400 nit",
      screenSizes: ["65", "75", "86"],
      operationTime: "16/7",
    },
    images: ["/products/interactive/samsung-interactive-wad/1.webp", "/products/interactive/samsung-interactive-wad/2.webp", "/products/interactive/samsung-interactive-wad/3.webp"],
  },

  // ── COMMERCIAL TV (HOTEL + BUSINESS) ─────────────────────────────────────────

  {
    id: "samsung-business-tv-bea-h",
    name: "Samsung Business TV BEA-H Series",
    category: "Commercial TV",
    subCategory: "Business TV",
    series: "BEA-H",
    description:
      "Built for business — simple content management, reliable 16/7 operation, and Crystal 4K picture for offices and waiting rooms.",
    features: [
      "Crystal Processor 4K",
      "Simple content management via USB",
      "16/7 operation reliability",
      "Business TV app support",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "250 nit",
      screenSizes: ["43", "50", "55", "65", "75"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-business-tv-bea-h/1.webp", "/products/commercial-tv/samsung-business-tv-bea-h/2.webp", "/products/commercial-tv/samsung-business-tv-bea-h/3.webp"],
  },
  {
    id: "samsung-business-tv-bec-h",
    name: "Samsung Business TV BEC-H Series",
    category: "Commercial TV",
    subCategory: "Business TV",
    series: "BEC-H",
    description:
      "UHD Crystal 4K business television with HDR 10+ and clean cable management for professional environments.",
    features: [
      "HDR 10+ for enhanced dynamic range",
      "Clean Cable Solution",
      "Business TV App support",
      "4K UHD Crystal display",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "250 nit",
      screenSizes: ["43", "50", "55", "65", "70", "75", "85"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-business-tv-bec-h/1.webp", "/products/commercial-tv/samsung-business-tv-bec-h/2.webp", "/products/commercial-tv/samsung-business-tv-bec-h/3.webp"],
  },
  {
    id: "samsung-business-tv-bed-h",
    name: "Samsung Business TV Pro BED-H Series",
    category: "Commercial TV",
    subCategory: "Business TV",
    series: "BED-H",
    description:
      "Professional business TV with 3-year warranty and extended operation for demanding commercial deployments.",
    features: [
      "4K UHD display",
      "Business TV App",
      "3-year manufacturer warranty",
      "Wide size range 43\"–75\"",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "60", "65", "70", "75"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-business-tv-bed-h/1.webp", "/products/commercial-tv/samsung-business-tv-bed-h/2.webp", "/products/commercial-tv/samsung-business-tv-bed-h/3.webp"],
  },
  {
    id: "samsung-hotel-tv-hg55au800t",
    name: "Samsung Hotel TV HG55AU800T",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "AU800T",
    description:
      "Elevate the guest experience with Dynamic Crystal Color, AirPlay 2, and LYNK Cloud central management.",
    features: [
      "Dynamic Crystal Color 4K UHD",
      "AirPlay 2 built-in for guest device mirroring",
      "LYNK Cloud remote content & room management",
      "Slim design for space efficiency",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "HDR",
      screenSizes: ["55", "65", "75"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-hotel-tv-hg55au800t/1.jpg", "/products/commercial-tv/samsung-hotel-tv-hg55au800t/2.jpg", "/products/commercial-tv/samsung-hotel-tv-hg55au800t/3.jpg"],
  },
  {
    id: "samsung-hotel-tv-hgbu800",
    name: "Samsung Hotel TV HGBU800 Crystal 4K UHD",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HGBU800",
    description:
      "Premium hospitality display offering personalized guest engagement with customizable home menus and slim design.",
    features: [
      "Crystal UHD 4K display",
      "Customizable Home Menu for hotel branding",
      "Slim fit design for modern interiors",
      "LYNK Cloud compatible",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "Standard",
      screenSizes: ["43", "50", "55", "65", "75"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-hotel-tv-hgbu800/1.webp", "/products/commercial-tv/samsung-hotel-tv-hgbu800/2.webp", "/products/commercial-tv/samsung-hotel-tv-hgbu800/3.webp"],
  },
  {
    id: "samsung-hotel-tv-hg55au700f",
    name: "Samsung Hotel TV HG55AU700F",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "AU700F",
    description:
      "Essential hospitality display with 4K Crystal Processor, Universal Guide, and Slim Fit Wall Mount support.",
    features: [
      "Crystal Processor 4K",
      "Universal Guide for content discovery",
      "Slim Fit Wall Mount support",
      "Multiple HDMI inputs",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "Standard",
      screenSizes: ["43", "50", "55", "65", "75"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-hotel-tv-hg55au700f/1.webp", "/products/commercial-tv/samsung-hotel-tv-hg55au700f/2.webp", "/products/commercial-tv/samsung-hotel-tv-hg55au700f/3.webp"],
  },

  // ── ADDITIONAL DIGITAL SIGNAGE ──────────────────────────────────────────────

  {
    id: "samsung-qpdx105",
    name: "Samsung Commercial Display QPDX 5K (105\")",
    category: "Digital Signage",
    subCategory: "Large Format",
    series: "QPDX",
    description:
      "Immersive 105-inch 5K commercial display for flagship installations — boardrooms, corporate lobbies, and event spaces where maximum visual impact is required.",
    features: [
      "105-inch 5K UHD for breathtaking clarity",
      "Ultra-wide 21:9 aspect ratio for cinematic content",
      "Mega Dynamic Contrast for deep blacks and vivid highlights",
      "Built-in MagicINFO S6 content management",
      "24/7 operation certified",
    ],
    specs: {
      resolution: "5,120 × 2,160 (5K UHD)",
      brightness: "500 nit",
      screenSizes: ["105"],
      operationTime: "24/7",
    },
    images: ["/products/digital-signage/samsung-qpdx105/1.jpg", "/products/digital-signage/samsung-qpdx105/2.jpg"],
  },
  {
    id: "samsung-qh115fx",
    name: "Samsung Commercial Display QH115FX (115\")",
    category: "Digital Signage",
    subCategory: "Large Format",
    series: "QH115FX",
    description:
      "Monumental 115-inch commercial display for airports, sports arenas, and large-format digital out-of-home installations.",
    features: [
      "115-inch direct-lit LED panel",
      "High brightness for large ambient-light spaces",
      "Seamless tiling capability for multi-unit walls",
      "MagicINFO compatible",
      "24/7 operation grade",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "1,000 nit",
      screenSizes: ["115"],
      operationTime: "24/7",
    },
    images: ["/products/digital-signage/samsung-qh115fx/1.jpg", "/products/digital-signage/samsung-qh115fx/2.jpg", "/products/digital-signage/samsung-qh115fx/3.jpg"],
  },

  // ── ADDITIONAL VIDEO WALLS ──────────────────────────────────────────────────

  {
    id: "samsung-vhc-e",
    name: "Samsung VHC-E FHD Video Wall Display",
    category: "Video Wall",
    series: "VHC-E",
    description:
      "Entry-level video wall display with standard narrow bezel — ideal for retail displays, reception walls, and smaller multi-screen installations.",
    features: [
      "Standard narrow bezel for multi-screen tiling",
      "Full HD 1080p resolution",
      "Wide viewing angle 178°/178°",
      "24/7 operation certified",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: ["/products/video-walls/samsung-vhc-e/1.webp", "/products/video-walls/samsung-vhc-e/2.webp", "/products/video-walls/samsung-vhc-e/3.webp"],
  },
  {
    id: "samsung-vmb-e",
    name: "Samsung VMB-E Extreme Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VMB-E",
    description:
      "Extreme narrow bezel video wall optimised for immersive seamless installations in control rooms and broadcast environments.",
    features: [
      "Extreme narrow bezel (B-to-B)",
      "Non-glare panel for ambient-light environments",
      "Wide viewing angle",
      "Image enhancement technology",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: ["/products/video-walls/samsung-vmb-e/1.webp", "/products/video-walls/samsung-vmb-e/2.webp", "/products/video-walls/samsung-vmb-e/3.webp"],
  },
  {
    id: "samsung-vhb-e",
    name: "Samsung VHB-E High-Brightness Extreme Narrow Bezel Video Wall",
    category: "Video Wall",
    series: "VHB-E",
    description:
      "High-brightness extreme narrow bezel video wall for demanding environments with high ambient light levels.",
    features: [
      "Extreme narrow bezel design",
      "700 nit high-brightness panel",
      "Non-glare coating",
      "Wide 178°/178° viewing angles",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "700 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: ["/products/video-walls/samsung-vhb-e/1.webp", "/products/video-walls/samsung-vhb-e/2.webp", "/products/video-walls/samsung-vhb-e/3.webp"],
  },
  {
    id: "samsung-vh55r",
    name: "Samsung VH55R Razor Thin Bezel Video Wall",
    category: "Video Wall",
    series: "VH55R",
    description:
      "Razor-thin bezel video wall with near-zero gap for virtually seamless large-scale display canvases in premium installations.",
    features: [
      "Razor-thin bezel for near-seamless tiling",
      "Image Enhancement Technology",
      "Wide viewing angle",
      "24/7 operation reliability",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "700 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: ["/products/video-walls/samsung-vh55r/1.png", "/products/video-walls/samsung-vh55r/2.png", "/products/video-walls/samsung-vh55r/3.png"],
  },

  // ── ADDITIONAL INTERACTIVE DISPLAYS ────────────────────────────────────────

  {
    id: "samsung-flip-2",
    name: "Samsung Flip 2 (WM55R) Interactive Display",
    category: "Interactive Display",
    series: "Flip 2",
    description:
      "The second-generation Samsung Flip digital whiteboard — bringing intuitive writing and wireless collaboration to meeting rooms and classrooms.",
    features: [
      "Natural writing experience on a 55-inch panel",
      "Wireless screen sharing from multiple devices simultaneously",
      "Roll and view content in landscape or portrait",
      "Auto-erase and content export via NFC tap",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["55"],
      operationTime: "16/7",
    },
    images: ["/products/interactive/samsung-flip-2/1.webp", "/products/interactive/samsung-flip-2/2.webp", "/products/interactive/samsung-flip-2/3.webp"],
  },
  {
    id: "samsung-waf-series",
    name: "Samsung WAF Series Interactive Display",
    category: "Interactive Display",
    series: "WAF",
    description:
      "Large-format Android interactive display for education and corporate collaboration — available up to 86 inches for auditoriums and large classrooms.",
    features: [
      "Android-based OS for full app flexibility",
      "Multi-touch for whole-class or team participation",
      "Built-in speakers and microphone array",
      "Centralised remote device management",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "400 nit",
      screenSizes: ["65", "75", "86"],
      operationTime: "16/7",
    },
    images: ["/products/interactive/samsung-waf-series/1.webp", "/products/interactive/samsung-waf-series/2.webp", "/products/interactive/samsung-waf-series/3.webp"],
  },
  {
    id: "samsung-qbc-t",
    name: "Samsung QBC-T Interactive Touch Display",
    category: "Interactive Display",
    series: "QBC-T",
    description:
      "Compact touch-enabled display combining the slim QBC design with capacitive touch — ideal for reception desks, POS counters, and interactive information points.",
    features: [
      "Capacitive multi-touch recognition",
      "Ultra-slim 28.5 mm depth",
      "Dynamic Crystal Color display",
      "MagicINFO Player S6 built-in",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["24", "43", "55"],
      operationTime: "16/7",
    },
    images: ["/products/interactive/samsung-qbc-t/1.webp", "/products/interactive/samsung-qbc-t/2.webp", "/products/interactive/samsung-qbc-t/3.webp"],
  },

  // ── ADDITIONAL COMMERCIAL TV ────────────────────────────────────────────────

  {
    id: "samsung-business-tv-befx-h2",
    name: "Samsung Business TV BEFX-H2 Series",
    category: "Commercial TV",
    subCategory: "Business TV",
    series: "BEFX-H2",
    description:
      "Commercial-grade business television with enhanced brightness and a wide size range — designed for lobbies, waiting rooms, and common-area deployments.",
    features: [
      "Enhanced 300 nit brightness for commercial spaces",
      "Crystal Processor 4K for upscaled content",
      "Business TV App for content scheduling",
      "Clean cable solution for tidy installations",
      "16/7 operation",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-business-tv-befx-h2/1.jpg", "/products/commercial-tv/samsung-business-tv-befx-h2/2.jpg", "/products/commercial-tv/samsung-business-tv-befx-h2/3.jpg"],
  },
  {
    id: "samsung-hotel-tv-hgu701f",
    name: "Samsung Hotel TV HGU701F",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HGU701F",
    description:
      "Reliable entry-level hospitality TV with hotel-mode features and LYNK Cloud management for small and mid-scale hotel properties.",
    features: [
      "Hotel Mode for locked-down guest settings",
      "LYNK Cloud remote management compatible",
      "Multiple HDMI and USB ports",
      "Slim wall-mount design",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-hotel-tv-hgu701f/1.jpg", "/products/commercial-tv/samsung-hotel-tv-hgu701f/2.jpg", "/products/commercial-tv/samsung-hotel-tv-hgu701f/3.jpg"],
  },
  {
    id: "samsung-hotel-tv-hg75u700f",
    name: "Samsung Hotel TV HG75U700F (75\")",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HG75U700F",
    description:
      "Large-screen 75-inch hospitality television for premium guest room and suite installations with immersive 4K picture quality.",
    features: [
      "75-inch Crystal 4K UHD display",
      "Purcolor technology for vivid colours",
      "Hotel Mode and LYNK Cloud management",
      "Slim Fit Wall Mount compatible",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["75"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-hotel-tv-hg75u700f/1.webp", "/products/commercial-tv/samsung-hotel-tv-hg75u700f/2.webp", "/products/commercial-tv/samsung-hotel-tv-hg75u700f/3.webp"],
  },
  {
    id: "samsung-hotel-tv-hgu800f",
    name: "Samsung Hotel TV HGU800F",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HGU800F",
    description:
      "Premium hotel TV series with Google Cast, LYNK Cloud management, and Dynamic Crystal Color for a superior guest experience.",
    features: [
      "Google Cast for seamless guest device mirroring",
      "Dynamic Crystal Color 4K UHD",
      "LYNK Cloud centralised room management",
      "Slim Fit design for modern interiors",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "HDR",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: ["/products/commercial-tv/samsung-hotel-tv-hgu800f/1.jpg", "/products/commercial-tv/samsung-hotel-tv-hgu800f/2.jpg", "/products/commercial-tv/samsung-hotel-tv-hgu800f/3.jpg"],
  },
];
