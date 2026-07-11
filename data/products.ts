
export interface Product {
  id: string;
  popularity?: number;
  /** True for products in the current (2026) Samsung catalog.
   *  Sole source of truth for the "latest first" sort. */
  catalog2026?: boolean;
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
  /** Grouped specs — each key is a section header (e.g. "Display", "Connectivity").
   *  When present, takes priority over additionalSpecs on the detail page and PDF. */
  specGroups?: Record<string, Record<string, string>>;
  images: string[];
  /** Sub-label shown in listings (e.g. "Hotel TV", "Business TV") */
  subCategory?: string;
}

export const products: Product[] = [

  // ── DIGITAL SIGNAGE ──────────────────────────────────────────────────────────

  {
    id: "samsung-qet-series",
    popularity: 71,
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
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 70\" / 75\" / 82\"",
        "Panel Type": "Crystal Display (IPS)",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "300 nit",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RS-232C": "In/Out",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
        "Bluetooth": "5.0",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400 (55\")",
      },
      "SoC": {
        "OS Version": "Tizen 7.0",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "2.5 GB",
        "Flash Memory Size": "16 GB",
        "Content Player": "MagicINFO Player S6",
      },
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
    popularity: 81,
    catalog2026: true,
    name: "Samsung Crystal UHD Signage QBC Series",
    category: "Digital Signage",
    series: "QBC",
    description:
      "Ultra-slim 28.5 mm Crystal UHD signage with Dynamic Crystal Color, MagicInfo S10, and ENERGY STAR certification — for lobbies, retail, and corporate spaces.",
    features: [
      "Dynamic Crystal Color — one billion shades",
      "Ultra-slim 28.5 mm depth with Slim Fit Wall Mount",
      "Even bezels and centered VESA for landscape/portrait flexibility",
      "Tizen 7.0 with built-in MagicInfo S10 (SSSP 10.0)",
      "ENERGY STAR 8.0 & EPEAT Bronze certified",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "350 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: [
      "/products/digital-signage/samsung-signage-qbc/1.webp",
      "/products/digital-signage/samsung-signage-qbc/2.webp",
      "/products/digital-signage/samsung-signage-qbc/3.webp",
      "/products/digital-signage/samsung-signage-qbc/4.jpg",
      "/products/digital-signage/samsung-signage-qbc/5.jpg",
      "/products/digital-signage/samsung-signage-qbc/6.jpg",
      "/products/digital-signage/samsung-signage-qbc/7.jpg",
      "/products/digital-signage/samsung-signage-qbc/8.jpg",
      "/products/digital-signage/samsung-signage-qbc/9.jpg",
    ],

    longDescription: `The Samsung QBC Series delivers the same unparalleled slim 28.5 mm profile as the premium QMC Series, bringing ultra-slim Crystal UHD signage to a wider range of deployments without compromising on design elegance or picture quality. Available in six sizes from 43" to 85", the QBC fits seamlessly into any business environment — retail, healthcare, hospitality, or corporate — with even bezels on all four sides and centered VESA mounting holes that allow easy landscape-to-portrait adjustment.

Dynamic Crystal Color with one billion shades delivers lifelike color variations and consistent imagery across the display, while the Quantum Processor Lite 4K upscales any source content for polished, professional results. Tizen 7.0 with built-in MagicInfo S10 content management means signage deployments require no external media players — content updates, schedules, and device monitoring are all managed from a single secure platform.

With Smart Calibration via the Samsung mobile app, teams can guarantee brand color consistency across every display in a multi-site chain. ENERGY STAR 8.0 and EPEAT Bronze certification demonstrate a commitment to energy efficiency, while the Slim Fit Wall Mount makes installation neat and straightforward in any environment.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\" / 85\"",
        "Panel Type": "VA",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "350 nit",
        "Contrast Ratio": "4,000:1",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC",
        "Glass Haze": "2%",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "3 (HDMI 2.0)",
        "USB": "2 × USB 2.0",
        "RS-232C": "In/Out",
        "RJ45 In": "Yes",
        "WiFi": "2.4 / 5.0 GHz dual-band",
        "Bluetooth": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "Depth": "28.5 mm (ultra-slim)",
        "VESA Mount (mm)": "200 × 200 (43\"–55\") / 400 × 300 (65\") / 400 × 400 (75\") / 600 × 400 (85\")",
        "IP Rating": "IP5x",
      },
      "SoC": {
        "OS Version": "Tizen 7.0",
        "Processor": "CA53 1.3 GHz Quad-Core",
        "Flash Memory Size": "8 GB (3 GB available)",
        "Content Player": "MagicInfo S10 (SSSP 10.0)",
      },
      "Eco": {
        "Certifications": "ENERGY STAR 8.0, EPEAT Bronze",
      },
      "Certification and Compliance": {
        "Security": "802.1x WPA2 Enterprise (EAP-TLS, EAP-TTLS, EAP-PEAP)",
      },
    },
  },
  {
    id: "samsung-signage-qhc",
    popularity: 70,
    catalog2026: true,
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
    images: [
      "/products/digital-signage/samsung-signage-qhc/1.webp",
      "/products/digital-signage/samsung-signage-qhc/2.webp",
      "/products/digital-signage/samsung-signage-qhc/3.webp",
      "/products/digital-signage/samsung-signage-qhc/4.png",
      "/products/digital-signage/samsung-signage-qhc/5.png",
      "/products/digital-signage/samsung-signage-qhc/6.png",
      "/products/digital-signage/samsung-signage-qhc/7.png",
      "/products/digital-signage/samsung-signage-qhc/8.png",
      "/products/digital-signage/samsung-signage-qhc/9.png",
      "/products/digital-signage/samsung-signage-qhc/10.png",
    ],
  
    longDescription: `The Samsung QHC Series transforms high-ambient environments into captivating display canvases with its class-leading 700-nit brightness and non-glare panel technology. Purpose-built for atriums, sun-lit showrooms, and outdoor-adjacent lobbies where daylight competes with screen content, the QHC delivers exceptional visibility without reflecting glare that fatigues viewers or obscures messaging.

With its ultra-slim 28.5 mm frame depth and bezel-less design, the QHC fits seamlessly behind modern architectural elements while maintaining professional aesthetics. The display's 24/7 operation certification ensures uninterrupted service in facilities that never close, and integrated MagicINFO Player S6 eliminates external media players from your AV rack.

The QHC's 4K UHD resolution combined with Samsung's Crystal Display technology produces vibrant, detailed content that scales beautifully across the 43" to 75" size range. Whether showcasing automotive displays in dealer showrooms, real estate listings in bright offices, or hospitality information in lobbies, the QHC maintains consistent picture quality and color accuracy from any viewing angle.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\"",
        "Panel Type": "IPS Crystal Display (non-glare)",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "700 nit",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RS-232C": "In/Out",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
        "Bluetooth": "5.0",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
        "Anti-Glare": "Yes (non-glare coating)",
      },
      "SoC": {
        "OS Version": "Tizen 6.5",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "2.5 GB",
        "Flash Memory Size": "16 GB",
        "Content Player": "MagicINFO Player S6",
      },
    },
  },
  {
    id: "samsung-signage-qmc",
    popularity: 95,
    catalog2026: true,
    name: "Samsung Crystal UHD Signage QMC Series",
    category: "Digital Signage",
    series: "QMC",
    description:
      "The thinnest display in Samsung's UHD signage lineup — 28.5 mm depth, 500 nit brightness, SmartView+, and MagicInfo S10 for 24/7 commercial deployments.",
    features: [
      "Ultra-slim 28.5 mm depth — thinnest in UHD signage lineup",
      "500 nit brightness for 24/7 operation",
      "SmartView+ wireless screen sharing",
      "Tizen 7.0 with built-in MagicInfo S10 (SSSP 10.0)",
      "ENERGY STAR 8.0, EPEAT Bronze & TÜV Rheinland Carbon Footprint (50\" model)",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "500 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "24/7",
    },
    images: [
      "/products/digital-signage/samsung-signage-qmc/1.webp",
      "/products/digital-signage/samsung-signage-qmc/2.webp",
      "/products/digital-signage/samsung-signage-qmc/3.webp",
      "/products/digital-signage/samsung-signage-qmc/4.png",
      "/products/digital-signage/samsung-signage-qmc/5.png",
      "/products/digital-signage/samsung-signage-qmc/6.png",
      "/products/digital-signage/samsung-signage-qmc/7.png",
      "/products/digital-signage/samsung-signage-qmc/8.png",
      "/products/digital-signage/samsung-signage-qmc/9.png",
      "/products/digital-signage/samsung-signage-qmc/10.png",
    ],

    longDescription: `The Samsung QMC Series redefines space efficiency in commercial signage, boasting the thinnest profile in Samsung's UHD signage lineup at just 28.5 mm without sacrificing the 500-nit brightness required for professional environments. Designed for 24/7 operation, the QMC powers menus, corporate communications, retail campaigns, and informational displays in hospitality, healthcare, and retail sectors.

Even bezels on all four sides and centered VESA mounting holes ensure a consistent look and easy adjustability to portrait mode. SmartView+ enables wireless screen sharing and quick screen switching with a single click, making the QMC ideal for collaboration as well as pure signage. Dynamic Crystal Color and Quantum Processor Lite 4K deliver consistent, lifelike colors to any content regardless of source resolution.

The QMC's integrated MagicInfo S10 with built-in Wi-Fi and LAN connectivity enables rapid content deployment and remote management across multiple locations. Smart Calibration via the Samsung mobile app guarantees brand color consistency across every display in a chain. ENERGY STAR 8.0, EPEAT Bronze, and TÜV Rheinland Carbon Footprint certification (50" model) reflect a commitment to environmental responsibility.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\" / 85\"",
        "Panel Type": "IPS (43\", 50\") / VA (55\"–85\")",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Pixel Pitch (HxV, mm)": "0.245 × 0.245 (43\")",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "1,200:1 (IPS) / 4,000:1 (VA)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Response Time": "8 ms",
        "Color Gamut": "72% NTSC",
        "Glass Haze": "25%",
        "H-Scanning Frequency": "30–81 kHz",
        "V-Scanning Frequency": "48–75 Hz",
        "Maximum Pixel Frequency": "594 MHz",
        "Contrast Ratio (Dynamic)": "Mega",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "3 (HDMI 2.0)",
        "DP In": "1 (DP 1.2)",
        "Version of HDMI": "2.0",
        "Version of DP": "1.2",
        "Version of HDCP": "2.2",
        "USB": "2 × USB 2.0",
        "IR In": "Yes",
        "Audio In": "No",
        "Audio Out": "Stereo Mini Jack",
        "RS232 In": "Yes",
        "RS232 Out": "Yes",
        "RJ45 In": "Yes",
        "WiFi": "Yes (2.4 / 5.0 GHz dual-band)",
        "Bluetooth": "Yes",
      },
      "Power": {
        "Power Supply": "AC100–240 V 50/60 Hz",
        "Power Consumption (On Mode, W)": "121 W (43\")",
        "Power Consumption (Off Mode, W)": "—",
        "Power Consumption (Sleep Mode, W)": "0.5 W",
      },
      "Dimension": {
        "Set Dimension (WxHxD, mm)": "969.5 × 557.8 × 28.5 mm (43\")",
        "Package Dimension (WxHxD, mm)": "1093 × 667 × 126 mm (43\")",
      },
      "Weight": {
        "Set Weight": "8.8 kg / 11.8 kg with stand (43\")",
        "Package Weight": "11.3 kg / 14.9 kg with stand (43\")",
      },
      "Operation Conditions": {
        "Temperature": "0°C – 40°C",
        "Humidity": "10–80%, non-condensing",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200 (43\"–55\") / 400 × 300 (65\") / 400 × 400 (75\") / 600 × 400 (85\")",
        "Bezel Width (mm)": "11.5 mm (even)",
        "Frame Material": "Non-Glossy",
      },
      "Optional Feature": {
        "Mount": "WMN-B50SC",
        "Stand": "STN-L4355C",
      },
      "SoC": {
        "OS Version": "Tizen 7.0",
        "Flash Memory Size": "16 GB",
        "Processor": "CA73 1.6 GHz Quad-Core",
        "RAM": "2.5 GB",
        "Content Player": "MagicInfo S10 (SSSP 10.0)",
      },
      "Eco": {
        "Energy Efficiency Class": "B (A)",
        "Certifications": "ENERGY STAR 8.0, EPEAT Bronze, TÜV Rheinland Carbon Footprint (50\" model)",
      },
      "Certification and Compliance": {
        "EMC": "Class B",
        "Safety": "60950-1, 62368-1",
      },
    },
  },
  {
    id: "samsung-signage-qbr-b",
    popularity: 61,
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
    images: [
      "/products/digital-signage/samsung-signage-qbr-b/1.webp",
      "/products/digital-signage/samsung-signage-qbr-b/2.webp",
      "/products/digital-signage/samsung-signage-qbr-b/3.webp",
      "/products/digital-signage/samsung-signage-qbr-b/4.png",
      "/products/digital-signage/samsung-signage-qbr-b/5.png",
      "/products/digital-signage/samsung-signage-qbr-b/6.png",
      "/products/digital-signage/samsung-signage-qbr-b/7.png",
      "/products/digital-signage/samsung-signage-qbr-b/8.png",
      "/products/digital-signage/samsung-signage-qbr-b/9.png",
      "/products/digital-signage/samsung-signage-qbr-b/10.png",
    ],
  
    longDescription: `The Samsung QBR-B Series brings professional digital signage capabilities to compact spaces where traditional large-format displays are impractical or budget-prohibitive. With sizes as small as 13 inches, the QBR-B fits naturally into reception counters, POS terminals, check-out queues, and kiosk installations while delivering full HD clarity that maintains crisp content even at close viewing distances.

Built with enterprise-grade Knox security from the ground up, the QBR-B protects sensitive content and prevents unauthorized access or modification. Integration with MagicINFO content management allows these compact displays to operate as part of a larger signage ecosystem, with centralized scheduling and remote monitoring from your main command center.

The QBR-B's 16/7 operation rating and robust industrial design ensure dependable service in high-traffic retail and hospitality environments where durability and reliability are non-negotiable. The 24-inch variant bridges the gap between pure information kiosks and full-scale displays, making the QBR-B lineup remarkably versatile for businesses transitioning to digital-first customer communication strategies.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "13\" / 24\"",
        "Panel Type": "IPS",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "250–300 nit",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n (2.4 GHz)",
        "Bluetooth": "4.2",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "100 × 100 (13\") / 200 × 200 (24\")",
      },
      "SoC": {
        "OS Version": "Tizen 5.5",
        "RAM": "1.5 GB",
        "Flash Memory Size": "8 GB",
        "Content Player": "MagicINFO Player S6",
      },
      "Certification and Compliance": {
        "Security": "Knox enterprise security",
      },
    },
  },
  {
    id: "samsung-touch-qmr-t",
    popularity: 89,
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
      brightness: "300 nit (32\") / up to 500 nit (43\", 55\", w/o glass)",
      screenSizes: ["32", "43", "55"],
      operationTime: "16/7 (32\") / 24/7 (43\", 55\")",
    },
    images: [
      "/products/digital-signage/samsung-touch-qmr-t/1.webp",
      "/products/digital-signage/samsung-touch-qmr-t/2.webp",
      "/products/digital-signage/samsung-touch-qmr-t/3.webp",
      "/products/digital-signage/samsung-touch-qmr-t/4.png",
      "/products/digital-signage/samsung-touch-qmr-t/5.png",
      "/products/digital-signage/samsung-touch-qmr-t/6.png",
      "/products/digital-signage/samsung-touch-qmr-t/7.png",
      "/products/digital-signage/samsung-touch-qmr-t/8.png",
      "/products/digital-signage/samsung-touch-qmr-t/9.png",
      "/products/digital-signage/samsung-touch-qmr-t/10.png",
    ],
  
    longDescription: `The Samsung QMR-T Series transforms passive signage into interactive gateways, enabling wayfinding kiosks, self-service information points, and customer engagement touchpoints that drive brand loyalty and operational efficiency. The capacitive multi-touch panel recognizes up to 10 simultaneous touch points with sub-100ms response time, creating a responsive, intuitive interaction experience that rivals modern consumer tablets.

IP5x dust protection shields the QMR-T from debris and contamination in retail environments, food courts, and busy public spaces, eliminating the need for protective glass overlays that diminish touch responsiveness. The glare-free display ensures content remains readable and engaging whether mounted horizontally, vertically, or in custom orientations.

With embedded MagicINFO Player and native Samsung Tizen OS, the QMR-T can deploy self-contained applications for restaurant ordering, hotel check-in, store directories, and real estate walkthroughs without requiring external PCs or servers. Available in FHD (32") for budget-conscious deployments and 4K UHD (43", 55") for premium experiences, the QMR-T scales to match venue ambitions and visitor expectations.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "32\" / 43\" / 55\"",
        "Resolution": "1,920 × 1,080 FHD (32\") / 3,840 × 2,160 4K UHD (43\", 55\")",
        "Brightness (Type)": "300 nit (32\", w/ glass) / up to 500 nit (43\", 55\", w/o glass)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7 (32\") / 24/7 (43\", 55\")",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "3 × USB",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200 (32\") / 400 × 400 (43\", 55\")",
        "IP Rating": "IP5x",
      },
      "SoC": {
        "OS Version": "Tizen 6.0",
        "RAM": "2 GB",
        "Flash Memory Size": "16 GB",
        "Touch Technology": "Capacitive multi-touch (10 points)",
        "Touch Response": "Sub-100ms",
      },
    },
  },
  {
    id: "samsung-touch-qbc-t",
    popularity: 97,
    catalog2026: true,
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
      brightness: "500 nit (w/o touch glass)",
      screenSizes: ["43", "55"],
      operationTime: "24/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 55\"",
        "Panel Type": "IPS (capacitive touch overlay)",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "500 nit (w/o touch glass)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "WiFi": "Built-in",
      },
      "SoC": {
        "Touch Technology": "Capacitive multi-touch",
        "Content Player": "Embedded content player",
      },
    },
    images: [
      "/products/digital-signage/samsung-touch-qbc-t/1.jpg",
      "/products/digital-signage/samsung-touch-qbc-t/2.jpg",
      "/products/digital-signage/samsung-touch-qbc-t/3.jpg",
      "/products/digital-signage/samsung-touch-qbc-t/4.png",
      "/products/digital-signage/samsung-touch-qbc-t/5.png",
      "/products/digital-signage/samsung-touch-qbc-t/6.png",
      "/products/digital-signage/samsung-touch-qbc-t/7.png",
      "/products/digital-signage/samsung-touch-qbc-t/8.png",
      "/products/digital-signage/samsung-touch-qbc-t/9.png",
      "/products/digital-signage/samsung-touch-qbc-t/10.png",
    ],
  },
  {
    id: "samsung-mp016f",
    popularity: 69,
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
      "1,400 nit peak brightness for indoor impact",
    ],
    specs: {
      resolution: "Custom",
      brightness: "1,400 nit (peak)",
      screenSizes: ["Custom"],
      operationTime: "24/7",
    },
    images: [
      "/products/digital-signage/samsung-mp016f/1.jpg",
      "/products/digital-signage/samsung-mp016f/2.jpg",
      "/products/digital-signage/samsung-mp016f/3.jpg",
    ],
  
    longDescription: `The Samsung MP016F fine-pitch LED module opens the door to custom large-format displays that command attention in high-traffic venues — corporate atriums, flagship retail spaces, concert stages, and sports arenas. At 1.6 mm pixel pitch, the MP016F delivers cinema-quality resolution from close viewing distances while maintaining impact at distance, allowing viewers to enjoy seamless content whether they're 3 feet away or 30 feet away.

The modular MP016F architecture enables virtually unlimited scaling, from intimate 2×2 arrays to massive installation walls covering entire building facades. HDR support ensures content retains highlight detail and shadow depth even in extreme brightness environments, while the 1,400-nit peak brightness dominates interior spaces without requiring specialized dark rooms or controlled lighting.

Magnetic service access design allows technicians to swap panels or perform maintenance without disassembling the entire installation, dramatically reducing downtime and maintenance costs. 24/7 operation rating makes the MP016F ideal for command centers, entertainment venues, and 24-hour retail environments where reliability and visual impact are equally critical to business success.`,
    specGroups: {
      "Display": {
        "Pixel Pitch": "1.6 mm",
        "Resolution": "Custom (modular scalable)",
        "Brightness (Type)": "1,400 nit (peak)",
        "Contrast Ratio": "5,000:1 (typical)",
        "Viewing Angle (H/V)": "160° / 160°",
        "Color Depth": "16.7M colors (8-bit per channel)",
        "Refresh Rate": "3,840 Hz (typical)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 2.0)",
        "DP In": "1 (DisplayPort 1.2)",
        "USB": "2 × USB",
      },
      "Dimension": {
        "Module Size (W×H, mm)": "640 × 360 mm per module",
      },
      "Power": {
        "Power Consumption": "~1,200 W per 2 m² at 100% white",
      },
      "Mechanical Specification": {
        "Service Access": "Magnetic front access for maintenance",
      },
    },
  },

  // ── VIDEO WALLS ──────────────────────────────────────────────────────────────

  {
    id: "samsung-vm55c-r",
    popularity: 62,
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
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Bezel-to-Bezel": "0.44 mm (all sides)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 1.4)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "UHD Daisy Chain (up to 5×5)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~100 W (typical)",
      },
      "Dimension": {
        "Set Dimension (W×H×D, mm)": "1,209.6 × 680.4 × 77.6 mm",
      },
      "Weight": {
        "Set Weight": "~19.6 kg (without stand)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
      },
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
    popularity: 81,
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
  
    longDescription: `The Samsung VH55C-R sets the performance benchmark for high-brightness video walls with its razor-thin 0.88 mm bezel-to-bezel specification combined with class-leading 700-nit brightness. Engineered for broadcast studios, command centers, and security control rooms where lighting is controlled yet visibility across large multi-tile arrays is absolutely critical, the VH55C-R delivers professional-grade picture uniformity and color accuracy.

The non-glare panel eliminates reflections that would otherwise create hot spots across the video wall surface, ensuring content remains readable from any position within the control room. The 178°/178° wide viewing angles mean operators and observers positioned to the side of the installation see the same accurate colors and brightness as those viewing head-on, a critical requirement in emergency response and surveillance operations.

Image Enhancement Technology ensures each tile in a multi-screen array maintains identical brightness, color saturation, and contrast — eliminating the visual "seams" that occur when tiles age at different rates or experience uneven ambient lighting exposure. With daisy chain support, up to 25 tiles (5×5) can operate as a unified canvas without an external video processor, simplifying installation and reducing overall system cost.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA (non-glare)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "700 nit",
        "Contrast Ratio": "4,500:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Response Time": "8 ms (typical)",
        "Bezel-to-Bezel": "0.88 mm (all sides)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 1.4)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support (5×5 max)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~120 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
      },
    },
  },
  {
    id: "samsung-vh55c-e",
    popularity: 60,
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
  
    longDescription: `The Samsung VH55C-E achieves extreme narrow bezel performance with its 0.174 cm (1.74 mm) bezel-to-bezel specification — pushing the boundaries of LCD video wall seamlessness while maintaining the 700-nit brightness that high-ambient environments demand. Designed for demanding seamless display installations in sports arenas, broadcast facilities, and luxury retail environments, the VH55C-E creates near-invisible tile boundaries that pull audiences into immersive content experiences.

The non-glare panel coating reduces reflections and ambient light washout, ensuring vibrant, detailed imagery remains visible even when video walls are positioned near windows or bright architectural lighting. The exceptional picture quality and minimal bezel presence combine to create installations where viewers forget they're watching tiled displays and instead experience unified, continuous storytelling.

With 24/7 operation certification and Samsung's Image Enhancement Technology, each tile in a multi-screen VH55C-E array maintains pixel-perfect alignment and color uniformity — critical for applications like weather radar displays, sports statistics walls, and immersive retail brand experiences where content continuity drives customer engagement.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA (non-glare coating)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "700 nit",
        "Contrast Ratio": "4,500:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms (typical)",
        "Bezel-to-Bezel": "1.74 mm (extreme narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 1.4)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~115 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
      },
    },
  },
  {
    id: "samsung-vm55c-e",
    popularity: 77,
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
  
    longDescription: `The Samsung VM55C-E delivers extreme narrow bezel performance at a mid-range brightness level, making it ideal for climate-controlled control rooms, broadcast studios, and indoor retail environments where bright ambient light is not a challenge. The 1.74 mm bezel-to-bezel specification combined with 500-nit brightness creates an exceptional price-to-performance ratio for organizations deploying large video wall installations.

The non-glare panel technology prevents light reflections from sources like fluorescent ceiling fixtures and monitor backlighting that would otherwise create visual distractions across the video wall canvas. The result is a seamless, immersive viewing experience where content appears to float on an invisible panel rather than being divided into distinct LCD tiles.

With full daisy chain support and Samsung's Image Enhancement Technology ensuring color uniformity across all tiles, the VM55C-E scales seamlessly from compact 2×2 arrays to massive installations spanning entire control room walls. MagicINFO S6 integration enables centralized content scheduling, monitoring, and management across fleets of video walls, making the VM55C-E a scalable solution for organizations with multiple facilities.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA (non-glare)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms (typical)",
        "Bezel-to-Bezel": "1.74 mm (extreme narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 1.4)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support (5×5 max)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~100 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
      },
    },
  },
  {
    id: "samsung-vmb-u-46",
    popularity: 97,
    catalog2026: true,
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
    specGroups: {
      "Display": {
        "Diagonal Size": "46\"",
        "Panel Type": "S-PVA",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Bezel-to-Bezel": "5.3 mm (all sides)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 1.3)",
        "DP In": "1 (DisplayPort 1.1)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~95 W (typical)",
      },
      "Dimension": {
        "Set Dimension (W×H×D, mm)": "1,041.9 × 587.7 × 74.7 mm",
      },
      "Weight": {
        "Set Weight": "~17.0 kg (without stand)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 200",
      },
    },
    images: [
      "/products/video-walls/vmb-u-46/4.avif",
      "/products/video-walls/vmb-u-46/1.avif",
      "/products/video-walls/vmb-u-46/2.avif",
      "/products/video-walls/vmb-u-46/3.avif",
      "/products/video-walls/vmb-u-46/5.avif",
      "/products/video-walls/vmb-u-46/6.avif",
      "/products/video-walls/vmb-u-46/7.avif",
      "/products/video-walls/vmb-u-46/8.avif",
      "/products/video-walls/vmb-u-46/9.avif",
    ],
  },
  {
    id: "samsung-vmb-u-55",
    popularity: 98,
    catalog2026: true,
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
      "/products/video-walls/vmb-u-55/4.avif",
      "/products/video-walls/vmb-u-55/1.avif",
      "/products/video-walls/vmb-u-55/2.avif",
      "/products/video-walls/vmb-u-55/3.avif",
      "/products/video-walls/vmb-u-55/5.avif",
      "/products/video-walls/vmb-u-55/6.avif",
      "/products/video-walls/vmb-u-55/7.avif",
    ],
  
    longDescription: `The Samsung VMB-U 55-inch represents the ideal middle ground in the video wall market — delivering ultra-narrow bezel performance at a screen size and price point that makes large-scale installations accessible to mid-market organizations and smaller venues. The 3.5 mm bezel-to-bezel specification creates visually unified multi-screen arrays that maintain high perceived image continuity while the 500-nit brightness ensures content visibility in mixed-lighting retail and hospitality environments.

The non-glare panel combined with 178°/178° viewing angles enables installations where observers positioned throughout a space all see consistent, vibrant content without color shift or brightness fade. This makes the VMB-U 55" ideal for retail display walls, hotel lobby installations, restaurant menu boards, and corporate reception areas where diverse viewing angles must be accommodated.

With factory-calibrated color performance and Samsung's daisy chain connectivity, deploying VMB-U 55" arrays dramatically reduces installation complexity and cost compared to traditional video processor-based systems. The display integrates seamlessly with MagicINFO content management, enabling retail chains and hospitality groups to synchronize messaging across hundreds of locations from a centralized dashboard.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA (non-glare)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms (typical)",
        "Bezel-to-Bezel": "3.5 mm (ultra-narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 1.3)",
        "DP In": "1 (DisplayPort 1.1)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~95 W (typical)",
      },
    },
  },
  {
    id: "samsung-videowall-vmb-r",
    popularity: 96,
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
    images: [
      "/products/video-walls/samsung-videowall-vmb-r/6.png",
      "/products/video-walls/samsung-videowall-vmb-r/1.png",
      "/products/video-walls/samsung-videowall-vmb-r/2.png",
      "/products/video-walls/samsung-videowall-vmb-r/3.png",
      "/products/video-walls/samsung-videowall-vmb-r/4.png",
      "/products/video-walls/samsung-videowall-vmb-r/5.png",
      "/products/video-walls/samsung-videowall-vmb-r/7.png",
      "/products/video-walls/samsung-videowall-vmb-r/8.png",
      "/products/video-walls/samsung-videowall-vmb-r/9.png",
      "/products/video-walls/samsung-videowall-vmb-r/10.png",
    ],
  
    longDescription: `The Samsung VMB-R brings an intelligent approach to professional video wall installations by combining razor-thin bezel technology with proven Image Enhancement Technology that ensures consistent picture quality across large multi-tile arrays. Designed for organizations that demand seamless visual continuity without the premium pricing of ultra-narrow bezel models, the VMB-R achieves exceptional value through precision engineering and Samsung's advanced panel calibration.

Image Enhancement Technology embedded in the VMB-R automatically compensates for common video wall challenges — tile-to-tile brightness variations, color drift over time, and luminance changes that occur at different screen temperatures. The result is a video wall that looks better year after year, with minimal maintenance intervention required.

With 24/7 operation certification and wide 178°/178° viewing angles, the VMB-R scales from intimate 2×2 arrays in small conference rooms to massive 5×5 installations in command centers and broadcast facilities. The 500-nit brightness performs excellently in professional environments while remaining power-efficient compared to high-brightness competitor models.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms",
        "Bezel-to-Bezel": "5.5 mm (razor-narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 1.3)",
        "DP In": "1 (DisplayPort 1.1)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~90 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
        "Image Enhancement": "Yes (automatic tile calibration)",
      },
    },
  },
  {
    id: "samsung-videowall-vmc-r",
    popularity: 62,
    catalog2026: true,
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
    images: [
      "/products/video-walls/samsung-videowall-vmc-r/1.webp",
      "/products/video-walls/samsung-videowall-vmc-r/2.webp",
      "/products/video-walls/samsung-videowall-vmc-r/3.webp",
      "/products/video-walls/samsung-videowall-vmc-r/4.png",
      "/products/video-walls/samsung-videowall-vmc-r/5.png",
      "/products/video-walls/samsung-videowall-vmc-r/6.png",
      "/products/video-walls/samsung-videowall-vmc-r/7.png",
      "/products/video-walls/samsung-videowall-vmc-r/8.png",
      "/products/video-walls/samsung-videowall-vmc-r/9.png",
      "/products/video-walls/samsung-videowall-vmc-r/10.png",
    ],
  
    longDescription: `The Samsung VMC-R represents the intelligent evolution of professional video wall displays, combining ultra-narrow bezel performance with modern DisplayPort 1.2 daisy chain support that eliminates external video processors from many installations. Factory-calibrated at the Samsung facility, every VMC-R arrives ready to be tiled without requiring field color matching or brightness equalization — a benefit that translates directly to faster installation and superior color consistency.

With 500-nit brightness and a slim form factor, the VMC-R performs exceptionally well in professional environments ranging from security operations centers to broadcast control rooms to retail flagship installations. The display's S-PVA panel technology and 178°/178° wide viewing angles ensure content remains vibrant and accurate whether viewed head-on or from the side of a large array.

DP 1.2 daisy chain support allows up to 4K content to be driven through a single DisplayPort cable from a host computer, dramatically simplifying the AV infrastructure behind video wall installations. Combined with Samsung's MagicINFO S6 platform, the VMC-R enables organizations to build scalable, centrally managed video wall systems that grow with their needs.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms",
        "Bezel-to-Bezel": "5.5 mm (ultra-narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 1.3)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "DP 1.2 Daisy Chain support",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~92 W (typical)",
      },
      "Mechanical Specification": {
        "Factory Calibration": "Yes (color factory-matched)",
      },
    },
  },

  // ── INTERACTIVE DISPLAYS ─────────────────────────────────────────────────────

  {
    id: "samsung-flip-pro-wm85b",
    popularity: 99,
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
    specGroups: {
      "Display": {
        "Diagonal Size": "75\" / 85\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "350 nit",
        "Color Gamut": "99% sRGB",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI 2.0",
        "USB-C": "USB-C 3.1 Gen1 × 1 (65 W PD + display)",
        "USB": "USB 3.0 × 2, USB 2.0 × 2",
        "WiFi": "802.11 a/b/g/n/ac",
        "Bluetooth": "4.2",
        "Screen Share": "AirPlay, Miracast, Screen Mirroring",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "600 × 400",
      },
      "SoC": {
        "OS Version": "Tizen 6.5 (Samsung Knox)",
        "Processor": "Quad-core 1.4 GHz",
        "RAM": "4 GB",
        "Flash Memory Size": "64 GB",
        "Touch Technology": "Capacitive multi-touch (20 points)",
      },
    },
    images: [
      "/products/interactive/samsung-flip-pro-wm85b/1.webp",
      "/products/interactive/samsung-flip-pro-wm85b/2.webp",
      "/products/interactive/samsung-flip-pro-wm85b/3.webp",
      "/products/interactive/samsung-flip-pro-wm85b/4.png",
      "/products/interactive/samsung-flip-pro-wm85b/5.png",
      "/products/interactive/samsung-flip-pro-wm85b/6.png",
      "/products/interactive/samsung-flip-pro-wm85b/7.png",
      "/products/interactive/samsung-flip-pro-wm85b/8.png",
      "/products/interactive/samsung-flip-pro-wm85b/9.png",
      "/products/interactive/samsung-flip-pro-wm85b/10.png",
    ],
  },
  {
    id: "samsung-interactive-flip-3",
    popularity: 99,
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
      screenSizes: ["55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: [
      "/products/interactive/samsung-interactive-flip-3/1.webp",
      "/products/interactive/samsung-interactive-flip-3/2.webp",
      "/products/interactive/samsung-interactive-flip-3/3.webp",
      "/products/interactive/samsung-interactive-flip-3/4.png",
      "/products/interactive/samsung-interactive-flip-3/5.png",
      "/products/interactive/samsung-interactive-flip-3/6.png",
      "/products/interactive/samsung-interactive-flip-3/7.png",
      "/products/interactive/samsung-interactive-flip-3/8.png",
      "/products/interactive/samsung-interactive-flip-3/9.png",
      "/products/interactive/samsung-interactive-flip-3/10.png",
    ],
  
    longDescription: `The Samsung Flip 3 represents the third-generation evolution of the digital flipchart concept, building on a decade of classroom and boardroom feedback to deliver the most intuitive writing experience in any interactive display. With a surface that feels like pen-on-paper — textured finish, responsive stylus recognition, natural friction — the Flip 3 eliminates the learning curve that typically accompanies interactive displays and instead enables instant, productive collaboration.

Built with antimicrobial coating that inhibits bacterial growth on the touchscreen surface, the Flip 3 addresses hygiene concerns in educational settings while maintaining superior touch responsiveness. Embedded safety and privacy features ensure user content is protected, meeting GDPR and COPPA compliance requirements for global deployments.

With a single USB-C connection delivering power, data, and high-bandwidth content streaming, the Flip 3 simplifies installation and eliminates cable clutter in modern meeting rooms. Dual-stack resolution support (portrait and landscape) and intuitive gesture controls enable natural interaction patterns that match how humans naturally communicate — drawing, writing, gesturing, pointing.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\" / 65\" / 75\" / 85\" (WMA series)",
        "Panel Type": "New Edge with antimicrobial coating",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "350 nit (w/o glass)",
        "Contrast Ratio": "4,000:1 (w/o glass)",
        "Color Gamut": "99% sRGB",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Writing & Interaction": {
        "Latency": "34 ms",
        "Pressure Levels": "2,048",
        "Touch": "Electromagnetic stylus + 10-point multi-touch",
      },
      "Connectivity": {
        "USB-C": "USB-C 3.1 Gen1 × 1 (65 W Power Delivery)",
        "WiFi": "802.11 a/b/g/n/ac",
        "Bluetooth": "5.0",
        "Screen Share": "AirPlay, Miracast, Screen Mirroring",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200 (55\") / 400 × 400 (65\", 75\") / 600 × 400 (85\")",
      },
      "SoC": {
        "OS Version": "Tizen 6.0 (Samsung Knox)",
        "RAM": "3 GB",
        "Flash Memory Size": "32 GB",
        "Touch Technology": "Electromagnetic stylus + 10-point multi-touch",
      },
    },
  },
  {
    id: "samsung-interactive-wac",
    popularity: 99,
    name: "Samsung WAC Series Interactive Display",
    category: "Interactive Display",
    series: "WAC",
    description:
      "Android 11 AOSP interactive display for classrooms — 20-point multi-touch, Dual Pen, powerful screen sharing, and intelligent classroom apps.",
    features: [
      "Android 11 (AOSP) — intuitive, familiar interface",
      "20-point IR multi-touch for whole-class participation",
      "Dual Pen — front nib and back highlighter without mode switching",
      "Share up to 9 screens simultaneously",
      "Split screen and multi-window multitasking",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "400 cd/m²",
      screenSizes: ["65", "75", "86"],
      operationTime: "16/7",
    },
    images: [
      "/products/interactive/samsung-interactive-wac/1.jpg",
      "/products/interactive/samsung-interactive-wac/2.jpg",
      "/products/interactive/samsung-interactive-wac/3.jpg",
      "/products/interactive/samsung-interactive-wac/4.png",
      "/products/interactive/samsung-interactive-wac/5.png",
      "/products/interactive/samsung-interactive-wac/6.png",
      "/products/interactive/samsung-interactive-wac/7.png",
      "/products/interactive/samsung-interactive-wac/8.png",
      "/products/interactive/samsung-interactive-wac/9.png",
      "/products/interactive/samsung-interactive-wac/10.jpg",
    ],

    longDescription: `The Samsung WAC Series brings full Android OS flexibility to large-format interactive displays, enabling educators and trainers to deploy familiar apps and tools directly on the display without requiring external computers. Running Android 11 (AOSP), the WAC offers excellent compatibility with Android-based devices, enabling lively, interactive classes where content flows naturally between student devices and the main screen.

Multi-touch capability supporting up to 20 simultaneous touch points enables whole-class participation where every student can contribute ideas, solve problems, and collaborate in real-time. The Dual Pen design — with a front nib and a back highlighter — lets teachers switch writing modes effortlessly without interrupting the lesson flow. Split screen and multi-window modes make it easy to display and work with multiple applications simultaneously.

Powerful screen sharing supports up to nine simultaneous screens so content flows bidirectionally between the large display and individual student devices. Intelligent classroom apps such as timers and stopwatches, easily pinned to the home screen bar, help teachers keep lessons structured and engaging.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "65\" / 75\" / 86\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "400 cd/m²",
        "Viewing Angle (H/V)": "178° / 178°",
        "Glass": "25% haze, 3.2T, ≥8H hardness",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "3 (Rear 2, Front 1)",
        "USB-C": "1 (Front)",
        "USB": "5 ports (USB 2.0 × 1, USB 3.0 × 4)",
        "Output": "HDMI Out (Rear), Touch Out × 2",
        "RS-232C": "In/Out",
        "RJ45 In/Out": "Yes",
        "Speaker": "Built-in 12W × 2CH",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "600 × 400 (65\") / 800 × 400 (75\")",
      },
      "SoC": {
        "OS Version": "Android 11 (AOSP)",
        "Processor": "A55 × 4 (Quad-core)",
        "RAM": "4 GB",
        "Flash Memory Size": "32 GB",
        "Touch Technology": "IR multi-touch (20 points)",
        "Touch Response Time": "≤10ms",
        "Drawing Speed": "≤45ms",
      },
      "Certification and Compliance": {
        "Security": "802.1x WPA2 Enterprise (EAP-TLS, EAP-TTLS, EAP-PEAP)",
      },
    },
  },
  {
    id: "samsung-interactive-wad",
    popularity: 92,
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
      operationTime: "12/7",
    },
    images: [
      "/products/interactive/samsung-interactive-wad/1.webp",
      "/products/interactive/samsung-interactive-wad/2.webp",
      "/products/interactive/samsung-interactive-wad/3.webp",
      "/products/interactive/samsung-interactive-wad/4.png",
      "/products/interactive/samsung-interactive-wad/5.png",
      "/products/interactive/samsung-interactive-wad/6.png",
      "/products/interactive/samsung-interactive-wad/7.png",
      "/products/interactive/samsung-interactive-wad/8.png",
      "/products/interactive/samsung-interactive-wad/9.png",
      "/products/interactive/samsung-interactive-wad/10.png",
    ],
  
    longDescription: `The Samsung WAD Series takes Android-based interactive displays to the next level with deep integration of the Google ecosystem, making it the ideal choice for schools and organizations already leveraging Google Workspace, Google Classroom, and Google Meet. With native, optimized support for these platforms built directly into the display OS, teachers and instructors can launch lessons, share content, and facilitate collaborative work without navigating through third-party apps.

Google Play Store access enables deployment of thousands of educational apps, assessment tools, and productivity applications without requiring device rooting or modification. Central device management through Google Admin Console allows IT teams to enforce security policies, manage app deployments, and monitor device status across entire school districts from a single dashboard.

The WAD's 4K UHD resolution, wide 178°/178° viewing angles, and 400-nit brightness ensure content remains crystal-clear and visible from every seat in the classroom. Multi-touch capability with support for up to 20 simultaneous touch points means students across the room can collaborate on digital assignments simultaneously.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "65\" / 75\" / 86\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "400 nit",
        "Color Gamut": "99% sRGB",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "12/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI 2.0",
        "USB": "USB 3.0 × 2, USB 2.0 × 2",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
        "Bluetooth": "5.0",
      },
      "SoC": {
        "OS Version": "Android 11 (Google EDLA certified)",
        "Processor": "Octa-core 2.0 GHz",
        "RAM": "4 GB",
        "Flash Memory Size": "32 GB",
        "Touch Technology": "Infrared multi-touch (20 points)",
        "Google Workspace": "Native integration",
        "Google Classroom": "Native integration",
        "Google Meet": "Native integration",
      },
    },
  },

  // ── COMMERCIAL TV (HOTEL + BUSINESS) ─────────────────────────────────────────

  {
    id: "samsung-business-tv-bea-h",
    popularity: 82,
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
    images: [
      "/products/commercial-tv/samsung-business-tv-bea-h/1.webp",
      "/products/commercial-tv/samsung-business-tv-bea-h/2.webp",
      "/products/commercial-tv/samsung-business-tv-bea-h/3.webp",
      "/products/commercial-tv/samsung-business-tv-bea-h/4.png",
      "/products/commercial-tv/samsung-business-tv-bea-h/5.png",
      "/products/commercial-tv/samsung-business-tv-bea-h/6.png",
      "/products/commercial-tv/samsung-business-tv-bea-h/7.png",
      "/products/commercial-tv/samsung-business-tv-bea-h/8.png",
      "/products/commercial-tv/samsung-business-tv-bea-h/9.jpg",
    ],
  
    longDescription: `The Samsung BEA-H Series brings reliable, straightforward 4K UHD displays to business environments where simplicity and dependability outweigh complexity and feature creep. With Crystal Processor 4K that intelligently upscales lower-resolution content to near-4K clarity, the BEA-H excels at displaying mixed-source feeds — PowerPoint presentations, video calls, real-time data feeds, and streaming content.

Simple content management via USB stick eliminates the need for external media players or cloud subscriptions, making the BEA-H ideal for small businesses, professional offices, and waiting rooms where IT resources are limited. The 16/7 operation rating ensures displays running throughout business hours maintain reliability without overheating or premature component failure.

With built-in Business TV app support and a range of sizes from 43" to 75", the BEA-H adapts to any corporate environment — from intimate board rooms to expansive office lobbies to dental clinic waiting areas. The 250-nit brightness provides professional picture quality in typical office lighting while maintaining eye comfort for extended viewing.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\"",
        "Panel Type": "IPS Crystal",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "250 nit",
        "Color Gamut": "72% NTSC (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~80 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "300 × 300 (43\"–65\") / 400 × 400 (75\")",
      },
      "SoC": {
        "OS Version": "Tizen 5.5",
        "Processor": "Crystal Processor 4K",
        "RAM": "1.5 GB",
        "Flash Memory Size": "8 GB",
        "Content Management": "USB stick or Business TV App",
      },
    },
  },
  {
    id: "samsung-business-tv-bec-h",
    popularity: 87,
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
    images: [
      "/products/commercial-tv/samsung-business-tv-bec-h/1.webp",
      "/products/commercial-tv/samsung-business-tv-bec-h/2.webp",
      "/products/commercial-tv/samsung-business-tv-bec-h/3.webp",
      "/products/commercial-tv/samsung-business-tv-bec-h/4.png",
      "/products/commercial-tv/samsung-business-tv-bec-h/5.png",
      "/products/commercial-tv/samsung-business-tv-bec-h/6.png",
      "/products/commercial-tv/samsung-business-tv-bec-h/7.png",
      "/products/commercial-tv/samsung-business-tv-bec-h/8.png",
      "/products/commercial-tv/samsung-business-tv-bec-h/9.jpg",
    ],
  
    longDescription: `The Samsung BEC-H Series elevates business television with HDR 10+ support and enhanced picture processing that transforms office environments into engaging digital communication spaces. HDR 10+ delivers exceptional highlight detail and shadow depth, bringing video content, corporate videos, and marketing materials to life with cinematic quality that captures and holds viewer attention.

Clean Cable Solution technology routes all connectivity — power, HDMI, LAN, and control signals — through a single elegant conduit system, dramatically improving aesthetics while reducing cable clutter behind display mounts. This design thoughtfulness particularly benefits modern office environments where visual cleanliness and professional appearance are paramount.

With Business TV App support for content scheduling and a comprehensive size range from 43" to 85", the BEC-H serves diverse business deployments — from boardrooms to lobby installations to training facilities. The 16/7 operation rating and robust thermal design ensure dependability in professional settings where display reliability directly impacts business operations.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 70\" / 75\" / 85\"",
        "Panel Type": "IPS Crystal",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "250 nit",
        "HDR": "HDR 10+",
        "Color Gamut": "72% NTSC (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
        "Clean Cable": "Yes (single conduit routing)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "300 × 300 (43\"–65\") / 400 × 400 (70\"–85\")",
      },
      "SoC": {
        "OS Version": "Tizen 6.0",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "2 GB",
        "Flash Memory Size": "8 GB",
        "Content Management": "Business TV App",
      },
    },
  },
  {
    id: "samsung-business-tv-bed-h",
    popularity: 69,
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
    images: [
      "/products/commercial-tv/samsung-business-tv-bed-h/5.png",
      "/products/commercial-tv/samsung-business-tv-bed-h/1.webp",
      "/products/commercial-tv/samsung-business-tv-bed-h/2.webp",
      "/products/commercial-tv/samsung-business-tv-bed-h/3.webp",
      "/products/commercial-tv/samsung-business-tv-bed-h/4.png",
      "/products/commercial-tv/samsung-business-tv-bed-h/6.png",
      "/products/commercial-tv/samsung-business-tv-bed-h/7.png",
      "/products/commercial-tv/samsung-business-tv-bed-h/8.png",
      "/products/commercial-tv/samsung-business-tv-bed-h/9.jpg",
    ],
  
    longDescription: `The Samsung BED-H Series represents the premium tier of business television, combining professional-grade features with a comprehensive 3-year manufacturer warranty that reflects Samsung's confidence in long-term reliability. Designed for demanding commercial deployments where display failure disrupts business operations and damages professional reputation, the BED-H delivers the performance consistency required in executive boardrooms, corporate command centers, and high-visibility lobbies.

With 300-nit brightness and 4K UHD resolution paired with Samsung's Crystal Processor technology, the BED-H displays corporate presentations, financial dashboards, video calls, and streaming content with exceptional clarity and color accuracy. Business TV App integration enables content scheduling and remote management across large corporate deployments, reducing IT overhead.

The wide 43" to 75" size range and 16/7 operation rating make the BED-H adaptable to any business environment — from intimate executive suites to large corporate atriums. The extended warranty provides peace-of-mind for organizations that view these displays as critical infrastructure worthy of long-term protection.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 60\" / 65\" / 70\" / 75\"",
        "Panel Type": "IPS Crystal",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "300 nit",
        "Color Gamut": "72% NTSC (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~100 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "300 × 300 (43\"–60\") / 400 × 400 (65\"–75\")",
      },
      "SoC": {
        "OS Version": "Tizen 6.0",
        "Processor": "Crystal Processor 4K",
        "RAM": "2 GB",
        "Flash Memory Size": "8 GB",
        "Content Management": "Business TV App",
      },
      "Certification and Compliance": {
        "Warranty": "3 years manufacturer",
      },
    },
  },
  {
    id: "samsung-hotel-tv-hg55au800t",
    popularity: 76,
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
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/1.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/2.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/3.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/4.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/5.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/6.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/7.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/8.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au800t/9.png",
    ],
  
    longDescription: `The Samsung HG55AU800T delivers the ultimate guest room experience by combining Dynamic Crystal Color vibrancy with seamless AirPlay 2 integration that enables guests to instantly mirror their personal devices without technical support or pairing codes. When guests can stream their favorite shows, music, or photos with a single tap, satisfaction scores climb and repeat bookings increase.

LYNK Cloud central management transforms hotel operations by enabling revenue teams to push targeted content to guest rooms — promotional messages, pay-per-view options, hotel services, and emergency communications — all from a centralized dashboard. Room managers can monitor display status, manage content scheduling, and troubleshoot issues remotely, reducing on-site engineering overhead.

With a slim form factor optimized for mounting above modern hospitality furniture, the HG55AU800T fits naturally into contemporary hotel room designs. The 4K UHD resolution ensures streaming content — Netflix, YouTube, Disney+ — displays with the clarity and color saturation that premium guests expect, delivering a streaming experience that rivals what they enjoy at home.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\" / 65\" / 75\"",
        "Panel Type": "IPS Dynamic Crystal Color",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "HDR": "HDR standard",
        "Color Gamut": "99% BT.709",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
        "AirPlay": "AirPlay 2 built-in",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "SoC": {
        "OS Version": "Tizen 6.5 (Hotel Edition)",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "2 GB",
        "Flash Memory Size": "8 GB",
        "LYNK Cloud": "Compatible with central management",
      },
    },
  },
  {
    id: "samsung-hotel-tv-hgbu800",
    popularity: 94,
    name: "Samsung Smart Hospitality Display HBU8000 Series",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HBU8000",
    description:
      "Smart hospitality display with Netflix access, LYNK Cloud management, Dynamic Crystal Colour, and AirSlim design — delivering home comforts to hotel guests worldwide.",
    features: [
      "Netflix & leading streaming services built-in",
      "Samsung LYNK Cloud — centralised remote management",
      "Dynamic Crystal Colour with HDR10+",
      "AirSlim ultra-slim design, 3 Bezel-less",
      "SmartThings Pro for connected hospitality",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "HDR",
      screenSizes: ["43", "50", "55", "65"],
      operationTime: "16/7",
    },
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/1.webp",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/2.webp",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/3.webp",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/4.png",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/5.png",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/6.png",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/7.png",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/8.png",
      "/products/commercial-tv/samsung-hotel-tv-hgbu800/9.png",
    ],

    longDescription: `The Samsung HBU8000 Series delivers the comforts of home to guests worldwide. Modern travellers expect the same entertainment amenities they enjoy at home, and the HBU8000 answers with quick access to leading streaming services — including Netflix — in stunning 4K UHD quality with Dynamic Crystal Colour. The instantly familiar Smart TV UI lets guests sign in and enjoy their favourite content without any setup friction.

Safe credentials management via Samsung LYNK Cloud ensures guest logins are retained during their stay and automatically wiped upon check-out through the hotel's Property Management System. Hotel managers can curate the in-room experience remotely — creating and deploying web-based content, updating channel maps, and controlling basic display functions from a centralised LYNK Cloud dashboard across all properties worldwide.

Dynamic Crystal Colour technology with HDR10+ and a billion shades of colour elevates every viewing experience. The AirSlim ultra-slim design with a 3 Bezel-less finish complements any interior and saves space, while the Quantum Processor Lite 4K upscales all content for crisp, vibrant imagery.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\"",
        "Panel Type": "Dynamic Crystal Colour",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "HDR": "HDR, HDR10+, HLG",
        "Micro Dimming": "UHD Dimming",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
        "Design": "AirSlim, 3 Bezel-less",
      },
      "Connectivity": {
        "HDMI In": "3 × HDMI",
        "USB": "2 × USB",
        "Ethernet (LAN)": "1",
        "Digital Audio Out": "Optical (SPDIF) × 1",
        "WiFi": "Wi-Fi 5",
        "Bluetooth": "5.2",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200 (43\"–55\") / 400 × 300 (65\")",
      },
      "SoC": {
        "OS Version": "Tizen Smart TV",
        "Picture Engine": "Quantum Processor Lite 4K",
        "LYNK Cloud": "Yes",
      },
      "Eco": {
        "Eco Sensor": "Yes",
      },
    },
  },
  {
    id: "samsung-hotel-tv-hg55au700f",
    popularity: 67,
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
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/1.webp",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/2.webp",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/3.webp",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/4.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/5.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/6.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/7.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/8.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/9.png",
      "/products/commercial-tv/samsung-hotel-tv-hg55au700f/10.png",
    ],
  
    longDescription: `The Samsung HG55AU700F provides essential hospitality television technology for properties seeking reliable 4K UHD displays without premium pricing or advanced feature complexity. The Crystal Processor 4K intelligently upscales standard-definition cable broadcasts and video content to near-4K clarity, delivering sharper, more vivid images than typical hospitality televisions.

Universal Guide integration enables guests to discover content across multiple streaming services, cable channels, and local information without navigating between different apps or interfaces. This unified discovery experience increases guest engagement and satisfaction while reducing support calls from confused guests.

Slim Fit Wall Mount support ensures seamless integration with modern hospitality interior designs where displays are recessed, hung above contemporary furniture, or positioned in minimalist arrangements. The comprehensive 43" to 75" size range adapts to any guest room configuration — from compact business hotel rooms to sprawling resort suites.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\"",
        "Panel Type": "IPS Crystal",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "250 nit",
        "Color Gamut": "72% NTSC (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~80 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "300 × 300 (43\"–55\") / 400 × 400 (65\"–75\")",
        "Slim Fit Mount": "Compatible",
      },
      "SoC": {
        "OS Version": "Tizen 5.5",
        "Processor": "Crystal Processor 4K",
        "RAM": "1.5 GB",
        "Flash Memory Size": "8 GB",
        "Universal Guide": "Yes (content discovery)",
      },
    },
  },

  // ── ADDITIONAL DIGITAL SIGNAGE ──────────────────────────────────────────────

  {
    id: "samsung-qpdx105",
    popularity: 77,
    catalog2026: true,
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
    images: [
      "/products/digital-signage/samsung-qpdx105/1.jpg",
      "/products/digital-signage/samsung-qpdx105/2.jpg",
      "/products/digital-signage/samsung-qpdx105/3.png",
      "/products/digital-signage/samsung-qpdx105/4.png",
      "/products/digital-signage/samsung-qpdx105/5.png",
      "/products/digital-signage/samsung-qpdx105/6.png",
      "/products/digital-signage/samsung-qpdx105/7.png",
      "/products/digital-signage/samsung-qpdx105/8.png",
      "/products/digital-signage/samsung-qpdx105/9.png",
    ],
  
    longDescription: `The Samsung QPDX redefines flagship installations with its monumental 105-inch 5K ultrawide canvas — delivering 5,120 × 2,160 resolution that unlocks cinematic storytelling and data visualization capabilities impossible on conventional 16:9 displays. The 21:9 ultrawide aspect ratio naturally accommodates sports analytics, financial dashboards, architectural renderings, and immersive video content that demands panoramic scope.

Mega Dynamic Contrast technology ensures shadow detail in night scenes remains visible while whites maintain their luminosity, creating dramatic visual depth that captures and holds audience attention even in high-ambient environments. The 500-nit brightness paired with the expansive screen real estate creates an immersive installation that commands the center of corporate lobbies, museum atriums, and event venues.

With 24/7 operation certification and integrated MagicINFO S6 content management, the QPDX enables synchronized multi-screen campaigns, real-time data display, and interactive brand experiences. The stunning 5K clarity makes the QPDX ideal for environments where visual excellence defines the customer experience — luxury hospitality lobbies, automotive dealer showrooms, premium retail flagships, and corporate headquarters where first impressions are everything.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "105\"",
        "Panel Type": "IPS Mega Dynamic Contrast",
        "Resolution": "5,120 × 2,160 (5K UHD)",
        "Aspect Ratio": "21:9 ultrawide",
        "Brightness (Type)": "500 nit",
        "Color Gamut": "79% NTSC (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "DP In": "1 (DisplayPort 1.2)",
        "USB": "2 × USB",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
        "Bluetooth": "5.0",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "SoC": {
        "OS Version": "Tizen 7.0",
        "Content Player": "MagicINFO Player S6",
      },
    },
  },
  {
    id: "samsung-qh115fx",
    popularity: 97,
    catalog2026: true,
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
    images: [
      "/products/digital-signage/samsung-qh115fx/1.jpg",
      "/products/digital-signage/samsung-qh115fx/2.jpg",
      "/products/digital-signage/samsung-qh115fx/3.jpg",
      "/products/digital-signage/samsung-qh115fx/4.png",
      "/products/digital-signage/samsung-qh115fx/5.png",
      "/products/digital-signage/samsung-qh115fx/6.png",
      "/products/digital-signage/samsung-qh115fx/7.png",
      "/products/digital-signage/samsung-qh115fx/8.png",
      "/products/digital-signage/samsung-qh115fx/9.png",
      "/products/digital-signage/samsung-qh115fx/10.png",
    ],
  
    longDescription: `The Samsung QH115FX represents the ultimate in large-format commercial display technology — a monumental 115-inch direct-lit LED canvas engineered for airports, sports arenas, stadiums, and large-scale digital out-of-home installations where content must command attention from hundreds of feet away. At 1,000 nits peak brightness, the QH115FX punches through daylight and ambient lighting that would overwhelm conventional displays, ensuring messaging remains legible and impactful from any distance.

The ultra-high brightness combined with Samsung's HDR processing creates vivid, pop-off-the-screen visuals that define modern experiential retail and entertainment. Seamless tiling capability allows multiple QH115FX units to be networked into multi-unit walls, creating even larger canvases for mega-venues, corporate campuses, and public spaces.

With 24/7 operation certification and MagicINFO compatibility, the QH115FX becomes the centerpiece of integrated digital signage ecosystems spanning entire venues. The exceptional brightness and massive scale combine to create irreplaceable brand experiences — from sports fans' first impressions at stadium entrances to travelers' welcome moments at airport terminals.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "115\"",
        "Panel Type": "Direct-lit LED",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "1,000 nit (peak)",
        "Contrast Ratio": "3,000:1 (typical)",
        "Color Gamut": "95% DCI-P3 (typical)",
        "Viewing Angle (H/V)": "176° / 176°",
        "Refresh Rate": "240 Hz (typical)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 2.0)",
        "DP In": "1 (DisplayPort 1.4)",
        "USB": "2 × USB",
        "RS-232C": "Yes",
        "Daisy Chain": "Yes (Daisy Chain compatible)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~3,500 W (at 75% brightness)",
      },
    },
  },

  // ── ADDITIONAL VIDEO WALLS ──────────────────────────────────────────────────

  {
    id: "samsung-vhc-e",
    popularity: 60,
    catalog2026: true,
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
      brightness: "700 nit",
      screenSizes: ["55"],
      operationTime: "24/7",
    },
    images: [
      "/products/video-walls/samsung-vhc-e/1.webp",
      "/products/video-walls/samsung-vhc-e/2.webp",
      "/products/video-walls/samsung-vhc-e/3.webp",
      "/products/video-walls/samsung-vhc-e/4.png",
      "/products/video-walls/samsung-vhc-e/5.png",
      "/products/video-walls/samsung-vhc-e/6.png",
      "/products/video-walls/samsung-vhc-e/7.png",
      "/products/video-walls/samsung-vhc-e/8.png",
      "/products/video-walls/samsung-vhc-e/9.png",
      "/products/video-walls/samsung-vhc-e/10.png",
    ],
  
    longDescription: `The Samsung VHC-E represents the entry point into professional video wall deployments, combining standard narrow bezel performance with proven reliability that makes it ideal for organizations taking their first steps into multi-screen installations. With 700-nit brightness and FHD (1,920 × 1,080) resolution per 55" tile, the VHC-E delivers excellent visual impact for retail display walls, reception area installations, and smaller corporate video wall projects.

The 178°/178° wide viewing angles ensure content remains visible and accurately colored whether viewed head-on or from the side of the installation, a critical requirement for public-facing retail and hospitality environments. 24/7 operation certification confirms the VHC-E is engineered for installations that never power down — retail display walls that run during all business hours, casino gaming areas, and 24-hour information displays.

With factory-calibrated color performance and straightforward daisy chain connectivity, the VHC-E enables organizations to build professional video walls without the complexity and cost of dedicated video processing hardware. As business needs evolve and organizations require more advanced video wall capabilities, the VHC-E provides a proven foundation for future expansion.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "700 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms",
        "Bezel-to-Bezel": "8.5 mm (standard narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 1.3)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~85 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
      },
    },
  },
  {
    id: "samsung-vmb-e",
    popularity: 96,
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
    images: [
      "/products/video-walls/samsung-vmb-e/1.webp",
      "/products/video-walls/samsung-vmb-e/2.webp",
      "/products/video-walls/samsung-vmb-e/3.webp",
      "/products/video-walls/samsung-vmb-e/4.png",
      "/products/video-walls/samsung-vmb-e/5.png",
      "/products/video-walls/samsung-vmb-e/6.png",
      "/products/video-walls/samsung-vmb-e/7.png",
      "/products/video-walls/samsung-vmb-e/8.png",
      "/products/video-walls/samsung-vmb-e/9.png",
      "/products/video-walls/samsung-vmb-e/10.png",
    ],
  
    longDescription: `The Samsung VMB-E delivers extreme narrow bezel performance optimized for immersive installations in control rooms, broadcast facilities, and high-end retail environments where visual seamlessness directly impacts user experience. The extreme narrow bezel specification combined with non-glare panel technology and Samsung's Image Enhancement Technology creates video walls that pull audiences into content rather than dividing their attention across visible tile boundaries.

The 500-nit brightness ensures content remains visible and vibrant in professional environments with controlled lighting — security operations centers, broadcast studios, and executive command centers. The S-PVA panel technology and 178°/178° wide viewing angles mean content appears correctly colored and bright from any position in the room, even when observers are positioned to the extreme sides of large multi-tile arrays.

With daisy chain support eliminating external video processors from many installations, the VMB-E provides professional video wall performance that scales efficiently as operations expand and require larger installation footprints. The proven reliability of the VMB-E platform makes it a trusted choice for mission-critical installations where display failure is simply not an option.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA (non-glare)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit",
        "Contrast Ratio": "4,000:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms",
        "Bezel-to-Bezel": "3.5 mm (extreme narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "1 (HDMI 1.3)",
        "DP In": "1 (DisplayPort 1.1)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~90 W (typical)",
      },
      "Mechanical Specification": {
        "Image Enhancement": "Yes (automatic tile calibration)",
      },
    },
  },
  {
    id: "samsung-vhb-e",
    popularity: 67,
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
    images: [
      "/products/video-walls/samsung-vhb-e/1.webp",
      "/products/video-walls/samsung-vhb-e/2.webp",
      "/products/video-walls/samsung-vhb-e/3.webp",
      "/products/video-walls/samsung-vhb-e/4.png",
      "/products/video-walls/samsung-vhb-e/5.png",
      "/products/video-walls/samsung-vhb-e/6.png",
      "/products/video-walls/samsung-vhb-e/7.png",
      "/products/video-walls/samsung-vhb-e/8.png",
      "/products/video-walls/samsung-vhb-e/9.png",
      "/products/video-walls/samsung-vhb-e/10.png",
    ],
  
    longDescription: `The Samsung VHB-E combines the extreme narrow bezel design favored by immersive video wall creators with class-leading 700-nit brightness that dominates in high-ambient light environments. Designed for challenging installation scenarios — retail spaces near windows, broadcast studios with theatrical lighting, sports arenas with powerful floodlighting — the VHB-E maintains visibility and color accuracy regardless of environmental illumination.

The non-glare coating reduces reflections and ambient light washout, ensuring video wall content remains the focal point rather than competing with reflected ceiling lights, window glare, or architectural lighting fixtures. This combination of extreme narrow bezel and high brightness creates video walls that appear nearly seamless while remaining visible in even the brightest professional environments.

With 24/7 operation certification and Samsung's Image Enhancement Technology maintaining tile-to-tile color and brightness uniformity over months and years of continuous operation, the VHB-E provides investment protection for organizations deploying large-scale video wall installations in demanding environments.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA (non-glare coating)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "700 nit",
        "Contrast Ratio": "4,500:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms",
        "Bezel-to-Bezel": "3.5 mm (extreme narrow)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 1.4)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support (5×5 max)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~115 W (typical)",
      },
      "Mechanical Specification": {
        "Image Enhancement": "Yes (automatic calibration)",
      },
    },
  },
  {
    id: "samsung-vh55r",
    popularity: 96,
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
    images: [
      "/products/video-walls/samsung-vh55r/7.png",
      "/products/video-walls/samsung-vh55r/1.png",
      "/products/video-walls/samsung-vh55r/2.png",
      "/products/video-walls/samsung-vh55r/3.png",
      "/products/video-walls/samsung-vh55r/4.png",
      "/products/video-walls/samsung-vh55r/5.png",
      "/products/video-walls/samsung-vh55r/6.png",
      "/products/video-walls/samsung-vh55r/8.png",
      "/products/video-walls/samsung-vh55r/9.png",
      "/products/video-walls/samsung-vh55r/10.png",
    ],
  
    longDescription: `The Samsung VH55R achieves near-zero visible gaps between tiles through razor-thin bezel engineering that creates the impression of a unified, continuous display even when viewing large multi-tile arrays at close range. The 700-nit high brightness combined with the minimal bezel presence creates video walls that dominate premium retail spaces, broadcast facilities, and luxury hospitality installations.

Image Enhancement Technology embedded in the VH55R ensures each tile maintains perfect color and brightness alignment with its neighbors throughout the lifespan of the installation. This intelligent technology automatically compensates for the minor variations in brightness and color that naturally occur as LCD panels age at different rates, maintaining the visual seamlessness that premium installations demand.

With 24/7 operation reliability and wide 178°/178° viewing angles, the VH55R serves as the premium choice for organizations where the video wall is itself a brand statement — luxury boutique retail, high-end automotive showrooms, and corporate headquarters where the quality of the visual environment communicates corporate values to visitors.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "S-PVA",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "700 nit",
        "Contrast Ratio": "4,500:1 (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Color Gamut": "72% NTSC (typical)",
        "Response Time": "8 ms",
        "Bezel-to-Bezel": "3.5 mm (razor-thin)",
        "Operation Time Support": "24/7",
      },
      "Connectivity": {
        "HDMI In": "2 (HDMI 1.4)",
        "DP In": "1 (DisplayPort 1.2)",
        "DVI-D": "1",
        "RS-232C": "Yes",
        "RJ45 In": "Yes",
        "Daisy Chain": "Daisy Chain support",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~115 W (typical)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "400 × 400",
        "Image Enhancement": "Yes (automatic calibration)",
      },
    },
  },

  // ── ADDITIONAL INTERACTIVE DISPLAYS ────────────────────────────────────────

  {
    id: "samsung-flip-2",
    popularity: 98,
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
      brightness: "350 nit",
      screenSizes: ["55"],
      operationTime: "16/7",
    },
    images: [
      "/products/interactive/samsung-flip-2/4.png",
      "/products/interactive/samsung-flip-2/1.webp",
      "/products/interactive/samsung-flip-2/2.webp",
      "/products/interactive/samsung-flip-2/3.webp",
    ],
  
    longDescription: `The Samsung Flip 2 represents the second generation of the revolutionary digital flipchart concept, building on the original Flip's success while addressing educator feedback and modern workplace collaboration requirements. The 55-inch form factor fits naturally into meeting rooms and classrooms where space efficiency matters, combining the intimate scale of traditional flipcharts with the collaborative power of a networked digital canvas.

The writing experience on the Flip 2 replicates the natural feedback and responsiveness of pen-on-paper, eliminating friction that typically occurs when transitioning from physical whiteboards to digital interactive displays. Wireless screen sharing from multiple devices simultaneously enables dynamic collaboration where one participant can present a deck while another pulls up reference materials, and a third captures notes.

Roll-and-view capability enables the Flip 2 to be used in either landscape or portrait orientation, adapting to diverse collaboration scenarios — wide landscape for presentations, tall portrait for brainstorming sessions. Content export via simple NFC tap allows participants to save collaborative work directly to their devices, and auto-erase ensures the canvas is ready for the next meeting.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "55\"",
        "Panel Type": "IPS",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "350 nit (w/o glass)",
        "Color Gamut": "72% NTSC",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "WiFi": "802.11 a/b/g/n/ac",
        "Bluetooth": "4.2",
        "Screen Share": "Miracast, AirPlay, Screen Mirroring",
        "NFC": "Yes (tap to export content)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200",
      },
      "SoC": {
        "OS Version": "Tizen 5.5",
        "RAM": "2 GB",
        "Flash Memory Size": "16 GB",
        "Touch Technology": "Infrared multi-touch (10 points)",
        "Stylus": "Electromagnetic stylus",
      },
    },
  },
  {
    id: "samsung-waf-series",
    popularity: 66,
    catalog2026: true,
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
      operationTime: "12/7",
    },
    images: [
      "/products/interactive/samsung-waf-series/2.webp",
      "/products/interactive/samsung-waf-series/1.webp",
      "/products/interactive/samsung-waf-series/3.webp",
      "/products/interactive/samsung-waf-series/4.png",
      "/products/interactive/samsung-waf-series/5.png",
      "/products/interactive/samsung-waf-series/6.png",
      "/products/interactive/samsung-waf-series/7.png",
      "/products/interactive/samsung-waf-series/8.png",
      "/products/interactive/samsung-waf-series/9.png",
      "/products/interactive/samsung-waf-series/10.png",
    ],
  
    longDescription: `The Samsung WAF Series brings robust Android-based interactive display capabilities to large-format auditoriums and training facilities where group participation and remote collaboration are central to the educational mission. Available in sizes up to 86 inches, the WAF can accommodate whole-class participation in large lecture halls or training auditoriums where traditional interactive displays would be too small for back-row visibility.

Android-based OS provides full app flexibility — educators can deploy specialized learning applications, assessment tools, video conferencing platforms, and productivity software directly on the display without requiring external computers. Built-in speakers and microphone array enable two-way audio for hybrid learning scenarios where remote participants engage alongside in-person attendees.

Centralized remote device management through MDM/EMM platforms enables IT teams to monitor all WAF displays across a school district, deploy app updates, enforce security policies, and collect usage analytics. The multi-touch capability supporting up to 20 simultaneous touch points means large classrooms can function as fully collaborative spaces where every student has equal opportunity to participate.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "65\" / 75\" / 86\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "400 nit",
        "Color Gamut": "99% sRGB",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "12/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI 2.0",
        "USB": "USB 3.0 × 2, USB 2.0 × 2",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
        "Bluetooth": "5.0",
      },
      "SoC": {
        "OS Version": "Android 10+",
        "Processor": "Octa-core 2.0 GHz",
        "RAM": "4 GB",
        "Flash Memory Size": "32 GB",
        "Touch Technology": "Infrared multi-touch (20 points)",
        "Built-in Audio": "Yes (speakers + microphone array)",
        "MDM/EMM": "Supported",
      },
    },
  },
  {
    id: "samsung-qbc-t",
    popularity: 64,
    catalog2026: true,
    name: "Samsung QBC-T Small Signage Touch Display",
    category: "Interactive Display",
    series: "QBC-T",
    description:
      "Compact 13\" and 24\" Full HD capacitive touch signage — ideal for reception desks, POS counters, and interactive information points where space is constrained.",
    features: [
      "Capacitive multi-touch recognition",
      "Compact 13\" / 24\" form factor",
      "Full HD 1080p display",
      "Built-in media player",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit (13\") / 250 nit (24\")",
      screenSizes: ["13", "24"],
      operationTime: "16/7",
    },
    images: [
      "/products/interactive/samsung-qbc-t/1.webp",
      "/products/interactive/samsung-qbc-t/2.webp",
      "/products/interactive/samsung-qbc-t/3.webp",
      "/products/interactive/samsung-qbc-t/4.png",
      "/products/interactive/samsung-qbc-t/5.png",
      "/products/interactive/samsung-qbc-t/6.png",
      "/products/interactive/samsung-qbc-t/7.png",
      "/products/interactive/samsung-qbc-t/8.png",
      "/products/interactive/samsung-qbc-t/9.png",
      "/products/interactive/samsung-qbc-t/10.png",
    ],
  
    longDescription: `The Samsung QBC-T is a compact small-signage touch display available in 13" and 24" sizes, purpose-built for reception desks, POS counters, information kiosks, and self-service check-in points where physical space is constrained. Its Full HD (1,920 × 1,080) panel delivers crisp, readable content at close viewing distances.

Capacitive touch technology eliminates the need for an external touch frame, maintaining the sleek aesthetic that professional environments demand. Multi-touch recognition enables gesture controls and interactive workflows, transforming static information displays into engaging touchpoints. The 13" model offers 500-nit brightness for bright counter-top settings, while the 24" model is rated at 250 nit.

The compact form factor integrates seamlessly into built-in cabinetry, reception desk counters, and modern interiors where larger displays would be impractical. A built-in media player enables content management without an external computer, making the QBC-T a self-contained interactive solution for tight spaces.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "13\" / 24\"",
        "Panel Type": "Full HD LED-LCD",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit (13\") / 250 nit (24\")",
        "Color Gamut": "72% NTSC",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RS-232C": "In/Out",
        "RJ45 In": "Yes",
        "WiFi": "802.11 a/b/g/n/ac (2.4 / 5 GHz)",
        "Bluetooth": "5.0",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "75 × 75",
      },
      "SoC": {
        "OS Version": "Tizen",
        "Content Player": "Embedded media player",
        "Touch Technology": "Capacitive multi-touch",
      },
    },
  },

  // ── ADDITIONAL COMMERCIAL TV ────────────────────────────────────────────────

  {
    id: "samsung-business-tv-befx-h2",
    popularity: 81,
    catalog2026: true,
    name: "Samsung Business TV BEFX-H2 Series",
    category: "Commercial TV",
    subCategory: "Business TV",
    series: "BEFX-H2",
    description:
      "400 nit 4K UHD business TV with VXT cloud CMS, PlayLock, SmartThings Pro, and Samsung Business TV App — optimised for cafés, clinics, retail, and lobbies.",
    features: [
      "400 nit 4K UHD for well-lit commercial spaces",
      "Samsung VXT cloud content management (S Series plan)",
      "PlayLock — pin-code screen protection",
      "SmartThings Pro for smart building integration",
      "Samsung Business TV App (Android & iOS)",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "400 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: [
      "/products/commercial-tv/samsung-business-tv-befx-h2/1.jpg",
      "/products/commercial-tv/samsung-business-tv-befx-h2/2.jpg",
      "/products/commercial-tv/samsung-business-tv-befx-h2/3.jpg",
      "/products/commercial-tv/samsung-business-tv-befx-h2/4.png",
      "/products/commercial-tv/samsung-business-tv-befx-h2/5.png",
      "/products/commercial-tv/samsung-business-tv-befx-h2/6.png",
      "/products/commercial-tv/samsung-business-tv-befx-h2/7.png",
      "/products/commercial-tv/samsung-business-tv-befx-h2/8.png",
      "/products/commercial-tv/samsung-business-tv-befx-h2/9.jpg",
    ],

    longDescription: `The Samsung BEFX-H2 Series is optimised for a wide range of business environments — from cafés and boutiques to pharmacies, clinics, and retail chains. Built on the trusted performance of Samsung's consumer TV platform, it delivers stunning 4K UHD picture quality that captures attention and elevates your space.

Combined with practical tools like the Samsung Business TV App and VXT cloud content management, you can easily create, schedule, and manage promotional content without extra hardware or complex systems. PlayLock prevents unauthorised users from tampering with the screen using a pin-code system, ensuring only your selected content is displayed. SmartThings Pro connectivity enhances convenience, safety, and energy efficiency across varied business settings.

Available in six sizes from 43" to 85", the BEFX-H2 adapts to any commercial space. HDR10+ support and Crystal Processor 4K deliver vibrant upscaled imagery, while the 16/7 operation rating ensures the display holds up reliably throughout extended business hours.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\" / 85\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "400 nit",
        "HDR": "HDR10+",
        "Color Gamut": "98% sRGB",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "3 × HDMI",
        "USB": "1 × USB",
        "RF": "1 Terrestrial / 1 Cable / 1 Satellite",
        "RJ45 In": "Yes",
        "WiFi": "Wi-Fi 5",
        "Bluetooth": "5.2",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Audio Output": "20W, 2CH (10W + 10W)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200 (43\"–55\") / 400 × 300 (65\"–85\")",
      },
      "SoC": {
        "OS Version": "Tizen Smart TV",
        "Picture Engine": "Crystal Processor 4K",
        "Business TV App": "Yes (Android / iOS)",
        "VXT CMS": "Yes (S Series plan)",
        "PlayLock": "Yes",
        "SmartThings Pro": "Yes",
      },
    },
  },
  {
    id: "samsung-hotel-tv-hgu701f",
    popularity: 65,
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
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/1.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/2.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/3.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/4.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/5.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/6.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/7.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/8.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/9.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu701f/10.png",
    ],
  
    longDescription: `The Samsung HGU701F provides reliable entry-level hospitality television for small and mid-scale hotel properties seeking to upgrade guest room experiences without premium pricing. With hotel-specific features like locked-down guest settings and simplified remote controls, the HGU701F ensures guests can enjoy entertainment while preventing accidental changes to critical settings.

LYNK Cloud remote management compatibility enables hoteliers to monitor display status, manage firmware updates, and troubleshoot issues from a central operations dashboard — dramatically reducing on-site engineering overhead. The ability to push promotional content to guest rooms enables revenue optimization through targeted VOD suggestions, restaurant reservation options, and spa service promotions.

With multiple HDMI and USB ports supporting diverse guest devices — from older set-top boxes to modern streaming appliances to personal USB media — the HGU701F accommodates the full spectrum of guest technology expectations. The slim wall-mount design adapts to modern hospitality room layouts where space efficiency and aesthetic integration are paramount.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\"",
        "Panel Type": "IPS",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "300 nit",
        "Color Gamut": "72% NTSC (typical)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "200 × 200 (43\"–50\") / 300 × 300 (55\")",
        "Slim Design": "Yes",
      },
      "SoC": {
        "OS Version": "Tizen 5.5 (Hotel Edition)",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "1.5 GB",
        "Flash Memory Size": "8 GB",
        "Hotel Mode": "Yes",
        "LYNK Cloud": "Compatible",
      },
    },
  },
  {
    id: "samsung-hotel-tv-hg75u700f",
    popularity: 97,
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
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/1.webp",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/2.webp",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/3.webp",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/4.png",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/5.png",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/6.png",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/7.png",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/8.png",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/9.png",
      "/products/commercial-tv/samsung-hotel-tv-hg75u700f/10.png",
    ],
  
    longDescription: `The Samsung HG75U700F represents the ideal large-screen hospitality television for resort suites, premium hotel rooms, and hospitality properties where guest room size and budget allow for immersive entertainment experiences. The 75-inch form factor commands guest room interiors, transforming relaxation spaces into premium entertainment destinations that justify higher nightly rates and generate positive guest reviews.

Crystal 4K UHD resolution ensures streaming services, premium cable channels, and hotel-provided content all display with stunning clarity. PurColor technology delivers vibrant, lifelike colors that enhance both entertainment consumption and guest perception of room quality. The Slim Fit Wall Mount compatibility enables seamless integration into modern hospitality interior designs without compromising aesthetics.

Hotel Mode restricts guest access to critical settings while enabling easy streaming app access, and LYNK Cloud integration allows revenue teams to push targeted promotions, room service options, and check-out reminders. The 16/7 operation rating ensures displays remain available and reliable throughout the day and evening guest cycles.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "75\"",
        "Panel Type": "IPS PurColor",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "300 nit",
        "Color Gamut": "99% BT.709",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Power Consumption (On Mode, W)": "~120 W (typical)",
      },
      "Mechanical Specification": {
        "Slim Fit Mount": "Compatible",
      },
      "SoC": {
        "OS Version": "Tizen 5.5 (Hotel Edition)",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "1.5 GB",
        "Flash Memory Size": "8 GB",
        "Hotel Mode": "Yes",
        "LYNK Cloud": "Compatible",
      },
    },
  },
  {
    id: "samsung-hotel-tv-hgu800f",
    popularity: 78,
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
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/1.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/2.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/3.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/4.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/5.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/6.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/7.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/8.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/9.png",
      "/products/commercial-tv/samsung-hotel-tv-hgu800f/10.png",
    ],
  
    longDescription: `The Samsung HGU800F represents the premium tier of hospitality television, combining Google Cast seamless guest device mirroring with Dynamic Crystal Color vibrancy and LYNK Cloud centralized room management. Designed for luxury hotel properties and high-end resort destinations where guest expectations are highest and room revenues justify premium equipment investments, the HGU800F transforms guest rooms into premium entertainment sanctuaries.

Google Cast integration enables guests to instantly stream content from their personal devices without pairing codes, authentication screens, or technical complexity. Whether guests want to mirror YouTube videos, share Netflix screens, or play personal music libraries, Google Cast makes it seamless.

Dynamic Crystal Color technology delivers exceptional color saturation and vibrancy that makes standard cable broadcasts look stunning and transforms streaming content into cinema-quality experiences. The comprehensive 43" to 85" size range adapts to any property segment — from compact business hotel rooms to sprawling resort penthouse suites. LYNK Cloud enables centralized management of hundreds of displays across multiple properties from a single operations dashboard.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\" / 85\"",
        "Panel Type": "IPS Dynamic Crystal Color",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "300 nit",
        "HDR": "HDR standard",
        "Color Gamut": "99% BT.709",
        "Viewing Angle (H/V)": "178° / 178°",
        "Operation Time Support": "16/7",
      },
      "Connectivity": {
        "HDMI In": "2 × HDMI",
        "USB": "2 × USB",
        "RJ45 In": "Yes",
        "RS-232C": "Yes",
        "Google Cast": "Yes (built-in)",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "300 × 300 (43\"–65\") / 400 × 400 (75\"–85\")",
        "Slim Fit": "Yes",
      },
      "SoC": {
        "OS Version": "Tizen 6.5 (Hotel Edition)",
        "Processor": "Quad-core 1.5 GHz",
        "RAM": "2 GB",
        "Flash Memory Size": "8 GB",
        "LYNK Cloud": "Compatible with centralized management",
      },
    },
  },
  {
    id: "samsung-interactive-wafx-p",
    popularity: 91,
    catalog2026: true,
    name: "Samsung WAFX-P Series Interactive Display",
    category: "Interactive Display",
    series: "WAFX-P",
    description:
      "Next-generation interactive display with Android 15, EDLA certification, 48MP camera, 8-mic far-field array, and embedded AI — for classrooms and meeting rooms.",
    features: [
      "Android 15 with EDLA — full Google Play, Chrome, YouTube, Drive",
      "48MP built-in camera with 114.9° wide-angle FOV",
      "8-mic far-field array with 10 m pickup range",
      "50-point IR touch with ≤3ms response time",
      "AI Write & Search — circle handwriting to search instantly",
      "Wi-Fi 6 (802.11ax) and 1 Gbps Ethernet",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "450 cd/m²",
      screenSizes: ["65", "75", "86"],
      operationTime: "12/7",
    },
    images: [
      "/products/interactive/samsung-interactive-wafx-p/5.png",
      "/products/interactive/samsung-interactive-wafx-p/1.jpg",
      "/products/interactive/samsung-interactive-wafx-p/2.jpg",
      "/products/interactive/samsung-interactive-wafx-p/3.jpg",
      "/products/interactive/samsung-interactive-wafx-p/4.png",
      "/products/interactive/samsung-interactive-wafx-p/6.png",
      "/products/interactive/samsung-interactive-wafx-p/7.png",
      "/products/interactive/samsung-interactive-wafx-p/8.png",
      "/products/interactive/samsung-interactive-wafx-p/9.png",
      "/products/interactive/samsung-interactive-wafx-p/10.png",
    ],

    longDescription: `The Samsung WAFX-P Series is a next-generation interactive display built for both classrooms and meeting rooms, delivering unlimited learning and collaboration possibilities. Powered by Android 15 and a high-performance Octa-core CPU (A78 × 4 + A55 × 4), it delivers a fast, intuitive experience for accessing essential apps and tools. As an EDLA-certified device, the WAFX-P provides official access to Google apps and services — including Google Play, Chrome, YouTube, and Google Drive — optimised for education and collaboration.

The built-in 48MP camera with 114.9° diagonal field of view and an 8-mic far-field array with 10-metre 180° pickup range make the WAFX-P a true all-in-one video call system — no extra equipment required. Dual 20W speakers with a dedicated woofer deliver clear, room-filling audio for presentations, lessons, and calls. NFC support enables tap-to-connect and tap-to-authenticate workflows.

Embedded AI functions unlock AI Write & Search: simply circle handwritten notes on screen and tap the search icon to instantly surface web results, images, and resources without typing. A dedicated Annotation button lets users annotate over any content — videos, documents, live feeds — without switching apps. An on-premise Device Management Solution supports local network environments, enabling IT teams to remotely manage whiteboard settings and apps across multiple rooms.`,
    specGroups: {
      "Display": {
        "Diagonal Size": "65\" / 75\" / 86\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "450 cd/m²",
        "Contrast Ratio": "1,200:1 (typical) / 4,000:1 (dynamic)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Response Time (G-to-G)": "8 ms",
        "Glass Haze": "25%",
        "Backlight Life": "50,000 hrs",
        "Operation Time Support": "12/7",
      },
      "Connectivity": {
        "HDMI In": "3 (Rear 2, Front 1)",
        "DP In": "1 (DisplayPort)",
        "USB-C": "1 (Front)",
        "USB": "5 ports (USB 2.0 × 3, USB 3.0 × 2)",
        "Output": "HDMI Out (Rear), Touch Out × 2, Audio Out (Stereo Mini Jack)",
        "RS-232C In": "Yes",
        "RJ45 In/Out": "Yes",
        "WiFi": "Wi-Fi 6 (802.11ax), dual-band",
        "Bluetooth": "5.0",
        "Ethernet": "1 Gbps",
        "NFC": "ISO/IEC 14443 A/B, MIFARE/FeliCa",
        "Screen Share": "Yes (up to 9 simultaneous screens)",
        "WebRTC": "Yes",
      },
      "Power": {
        "Power Supply": "AC 100–240 V, 50/60 Hz",
        "Speaker Output": "20W × 2CH + Woofer (4Ω 20W)",
      },
      "Mechanical Specification": {
        "VESA Mount (mm)": "600 × 400 (65\") / 800 × 400 (75\") / 800 × 600 (86\")",
      },
      "SoC": {
        "OS Version": "Android 15 (EDLA certified)",
        "Processor": "Octa-core (A78 × 4 + A55 × 4)",
        "RAM": "16 GB",
        "Flash Memory Size": "128 GB",
        "Touch Technology": "IR multi-touch (50 points)",
        "Touch Response Time": "≤3ms",
        "Drawing Speed": "35ms",
        "Camera": "48MP, 114.9° diagonal FOV",
        "Microphone": "8-mic array, 10 m pickup range (180°)",
      },
      "Eco": {
        "Certifications": "ENERGY STAR",
      },
      "Certification and Compliance": {
        "Security": "WPA/WPA2/WPA3 Personal, WPS 2.0",
      },
    },
  },

  // ── LED SIGNAGE (2026 catalog) ──────────────────────────────────────────────

  {
    id: "samsung-the-wall-mpf",
    popularity: 96,
    catalog2026: true,
    name: "Samsung The Wall (MPF)",
    category: "LED Signage",
    subCategory: "The Wall",
    series: "MPF",
    description:
      "Premium micro-LED direct-view display with flip-chip RGB LEDs, Black Seal contrast, and modular any-size scalability — the flagship of Samsung's LED signage line.",
    longDescription: `The Samsung The Wall (MPF) is the flagship of Samsung's direct-view LED lineup, built on flip-chip RGB micro-LED technology that places each red, green, and blue sub-pixel directly on the board for exceptional brightness, color purity, and longevity. Available in P0.8, P1.2, and P1.6 pixel pitches, it scales seamlessly from close-viewing lobby installations to expansive feature walls without bezels interrupting the image.

Black Seal Technology delivers a uniform, ultra-black canvas that deepens contrast and reveals fine shadow detail, while PANTONE-validated color reproduction and 20-bit processing with Linear Grayscale ensure accurate, lifelike imagery. The NQM AI Gen2 processor analyses every frame in real time, upscaling content toward 8K and removing noise for consistently vivid results.

Engineered for permanent commercial installation, The Wall MPF supports 24/7 operation, front-serviceable cabinets, and a one-body modular structure that simplifies large-scale builds. It is the definitive choice for corporate lobbies, experience centres, broadcast studios, and premium retail flagships.`,
    features: [
      "Flip-chip RGB micro-LED for deep blacks and wide color",
      "Black Seal Technology for superior contrast",
      "PANTONE-validated color, 20-bit processing, MICRO HDR",
      "NQM AI Gen2 processor with up-to-8K scaling",
      "Modular, bezel-free any-size installation",
      "24/7 operation, front-serviceable",
    ],
    specs: {
      resolution: "P0.8 / P1.2 / P1.6 pixel pitch",
      brightness: "1,800 nit (peak)",
      screenSizes: ["110", "130", "146"],
      operationTime: "24/7",
    },
    specGroups: {
      "LED": {
        "Pixel Pitch": "P0.8 / P1.2 / P1.6",
        "Diode Type": "Flip-chip RGB LED",
        "Brightness (peak)": "1,800 nit (P0.8, P1.2) / 1,600 nit (P1.6)",
        "Contrast Ratio": "29,000:1 (P0.8) / 41,000:1 (P1.2) / 43,000:1 (P1.6)",
        "Model Codes": "LH012MPFAAA (P1.2), LH016MPFAAA (P1.6)",
      },
      "Processing & Picture": {
        "Processor": "NQM AI Gen2",
        "Color": "20-bit processing, Linear Grayscale, MICRO HDR",
        "Contrast Enhancement": "Black Seal Technology",
        "Color Validation": "PANTONE Validated",
      },
      "Mechanical & Operation": {
        "Service": "Front",
        "IP Rating": "IP40 / IP20 (Front / Rear)",
        "Operation Time Support": "24/7",
        "Design": "One-body modular, bezel-free",
      },
      "Certification": {
        "EMC": "EMC Class B",
        "Eye Comfort": "TUV Eye Comfort",
        "Safety": "IEC 62368-1 / 60950-1",
      },
    },
    images: [
      "/products/led-signage/samsung-the-wall-mpf/1.jpg",
      "/products/led-signage/samsung-the-wall-mpf/2.jpg",
      "/products/led-signage/samsung-the-wall-mpf/3.jpg",
      "/products/led-signage/samsung-the-wall-mpf/4.jpg",
      "/products/led-signage/samsung-the-wall-mpf/5.jpg",
      "/products/led-signage/samsung-the-wall-mpf/6.jpg",
      "/products/led-signage/samsung-the-wall-mpf/7.jpg",
      "/products/led-signage/samsung-the-wall-mpf/8.jpg",
      "/products/led-signage/samsung-the-wall-mpf/9.jpg",
    ],
  },
  {
    id: "samsung-the-wall-mmf",
    popularity: 90,
    catalog2026: true,
    name: "Samsung The Wall (MMF)",
    category: "LED Signage",
    subCategory: "The Wall",
    series: "MMF",
    description:
      "Modular flip-chip RGB LED display delivering The Wall's signature deep blacks and seamless canvas at an accessible brightness tier for indoor commercial spaces.",
    longDescription: `The Samsung The Wall (MMF) brings the design language and picture quality of Samsung's flagship LED line to a broader range of indoor commercial environments. Built on flip-chip RGB LED technology in P0.9, P1.2, and P1.5 pixel pitches, it produces a seamless, bezel-free canvas with the deep blacks and smooth grayscale that define The Wall family.

Rated at 600 nits, the MMF is tuned for controlled indoor lighting — corporate lobbies, meeting spaces, broadcast sets, and retail interiors — where its high contrast (up to 10,000:1) and modular scalability let designers build displays to any dimension. TUV Eye Comfort certification supports comfortable long-duration viewing.

As part of The Wall ecosystem, the MMF offers a simple modular structure for straightforward installation and maintenance, making premium direct-view LED accessible for everyday commercial signage.`,
    features: [
      "Flip-chip RGB LED, seamless bezel-free canvas",
      "Deep blacks and smooth Linear Grayscale",
      "Up to 10,000:1 contrast (P1.5)",
      "Modular any-size installation",
      "TUV Eye Comfort certified",
      "24/7 operation",
    ],
    specs: {
      resolution: "P0.9 / P1.2 / P1.5 pixel pitch",
      brightness: "600 nit",
      screenSizes: ["110", "130", "146"],
      operationTime: "24/7",
    },
    specGroups: {
      "LED": {
        "Pixel Pitch": "P0.9 / P1.2 / P1.5",
        "Diode Type": "Flip-chip RGB LED",
        "Brightness": "600 nit",
        "Contrast Ratio": "8,000:1 (P0.9, P1.2) / 10,000:1 (P1.5)",
      },
      "Picture": {
        "Color": "20-bit processing, Linear Grayscale",
        "Contrast Enhancement": "Black Seal Technology",
      },
      "Mechanical & Operation": {
        "Operation Time Support": "24/7",
        "Design": "Modular, bezel-free",
      },
      "Certification": {
        "EMC": "EMC Class A",
        "Eye Comfort": "TUV Eye Comfort",
        "Safety": "IEC 62368-1 / 60950-1",
      },
    },
    images: [
      "/products/led-signage/samsung-the-wall-mmf/1.webp",
      "/products/led-signage/samsung-the-wall-mmf/2.webp",
      "/products/led-signage/samsung-the-wall-mmf/3.webp",
      "/products/led-signage/samsung-the-wall-mmf/4.webp",
      "/products/led-signage/samsung-the-wall-mmf/5.webp",
    ],
  },
  {
    id: "samsung-indoor-led-ie",
    popularity: 88,
    catalog2026: true,
    name: "Samsung Indoor LED Signage (IE Series)",
    category: "LED Signage",
    subCategory: "Indoor LED",
    series: "IEA/IEF",
    description:
      "Versatile indoor direct-view LED signage with HDR10/10+ picture quality, GoB durability, and flexible curved, L-shaped, and ceiling installation across a wide pixel-pitch range.",
    longDescription: `Samsung Indoor LED Signage (IE Series) delivers best-in-class direct-view LED picture quality for retail stores, corporate spaces, and public venues. Available across P1.2, P1.5, P2.0, P2.5, and P4.0 pixel pitches, the range spans fine-pitch close-viewing walls to larger-format displays for wider viewing distances — all driven by Samsung's LED HDR technology for accurate color and sharp detail without additional metadata.

The NQM AI Processor with 4K AI upscaling optimises brightness and contrast while suppressing glare, and HDR10/10+ support preserves highlight and shadow detail across content types. GoB (Glue-on-Board) technology adds a protective layer over the LED surface, guarding against water droplets, electrical shock, and physical impact while improving handling during installation.

Advanced modular design supports portrait, landscape, curved, L-shaped, and ceiling installations, giving businesses full control to build the ideal display for their space. Managed via LED Signage Manager 2 and Samsung VXT, the IE Series pairs striking visuals with straightforward, centralised operation.`,
    features: [
      "LED HDR with HDR10/10+ support",
      "NQM AI Processor with 4K AI upscaling",
      "GoB technology for surface durability",
      "Curved, L-shaped, portrait & ceiling installation",
      "Wide pixel-pitch range (P1.2–P4.0)",
      "24/7 operation",
    ],
    specs: {
      resolution: "P1.2 / P1.5 / P2.0 / P2.5 / P4.0 pixel pitch",
      brightness: "1,000 nit",
      screenSizes: ["110", "130", "146", "165"],
      operationTime: "24/7",
    },
    specGroups: {
      "LED": {
        "Pixel Pitch": "P1.2 (IEF) / P1.5 / P2.0 / P2.5 / P4.0 (IEA)",
        "Diode Type": "Surface Mount Device (SMD)",
        "Brightness": "1,000 nit (P1.5–P2.5) / 800 nit (P4.0) / 600 nit (P1.2 IEF)",
        "Contrast Ratio": "6,000:1 (P1.5) / 7,500:1 (P2.0) / 5,000:1 (P2.5, P4.0) / 4,000:1 (P1.2 IEF)",
        "Model Codes": "IE015A (P1.5), IE020A (P2.0), IE025A (P2.5)",
      },
      "Picture & Processing": {
        "Processor": "NQM AI Processor",
        "HDR": "HDR10 / HDR10+",
        "Upscaling": "4K AI upscaling",
        "Durability": "GoB (Glue-on-Board) technology",
      },
      "Installation & Management": {
        "Orientations": "Portrait, landscape, curved, L-shaped, ceiling",
        "Management": "LED Signage Manager 2, Samsung VXT, Signage Setup Assistant",
        "Operation Time Support": "24/7",
      },
      "Certification": {
        "EMC": "EMC Class A",
        "Safety": "IEC 62368-1 / 60950-1",
      },
    },
    images: [
      "/products/led-signage/samsung-indoor-led-ie/1.jpg",
      "/products/led-signage/samsung-indoor-led-ie/2.jpg",
      "/products/led-signage/samsung-indoor-led-ie/3.jpg",
      "/products/led-signage/samsung-indoor-led-ie/4.jpg",
      "/products/led-signage/samsung-indoor-led-ie/5.jpg",
      "/products/led-signage/samsung-indoor-led-ie/6.jpg",
      "/products/led-signage/samsung-indoor-led-ie/7.jpg",
      "/products/led-signage/samsung-indoor-led-ie/8.jpg",
      "/products/led-signage/samsung-indoor-led-ie/9.jpg",
    ],
  },
  {
    id: "samsung-all-in-one-led-iab",
    popularity: 92,
    catalog2026: true,
    name: "Samsung All-in-One LED (IAB)",
    category: "LED Signage",
    subCategory: "All-in-One LED",
    series: "IAB",
    description:
      "146-inch all-in-one direct-view LED display with Quick Build installation, built-in control box, and everything needed to deploy a big-impact wall in hours.",
    longDescription: `The Samsung All-in-One LED (IAB) is a true all-in-one direct-view LED solution engineered for fast, high-impact installation. At 146 inches with P0.8 and P1.6 pixel-pitch options, it delivers a bold, seamless canvas backed by flip-chip RGB LEDs, MICRO HDR, and the NQM AI Processor for vivid color and deep, Black-Seal blacks.

Exclusive Quick Build technology lets integrators complete a large-scale display in just a few hours: combine the two background plates and attach four preset modules. The control box is built directly into the display, streamlining configuration and eliminating the external processing hardware conventional LED walls require.

Every component needed for operation ships in one package — control box, wall brackets, speakers, and decorative bezels — with no additional purchases. Rated for 24/7 operation, the IAB is ideal for corporate lobbies, retail flagships, auditoriums, and experience centres that need a premium LED wall without the complexity of a custom build.`,
    features: [
      "146\" all-in-one LED, up to 4K",
      "Quick Build — installs in hours",
      "Built-in control box (no external processor)",
      "All-inclusive: brackets, speakers, décor bezels",
      "MICRO HDR, NQM AI Processor, 20-bit, Black Seal",
      "24/7 operation",
    ],
    specs: {
      resolution: "P0.8 / P1.2 / P1.6 pixel pitch",
      brightness: "1,600 nit (peak)",
      screenSizes: ["146"],
      operationTime: "24/7",
    },
    specGroups: {
      "LED": {
        "Diagonal": "3.70 m (146\")",
        "Pixel Pitch": "P0.8 / P1.2 / P1.6",
        "Diode Type": "Flip-chip RGB LED",
        "Brightness (peak)": "1,600 nit (P0.8) / 1,400 nit (P1.6)",
        "Contrast Ratio": "24,000:1 (P0.8) / 22,000:1 (P1.6)",
      },
      "All-in-One & Installation": {
        "Installation": "Quick Build (background plates + 4 preset modules)",
        "Control Box": "Built-in",
        "Included": "Control box, wall brackets, speakers, décor bezels",
        "Weight": "~160 kg",
        "Service": "Front",
      },
      "Picture & Processing": {
        "Processor": "NQM AI Processor",
        "Color": "20-bit processing, Linear Grayscale, MICRO HDR",
        "Contrast Enhancement": "Black Seal / True Black Presentation",
      },
      "Certification & Operation": {
        "IP Rating": "IP20",
        "EMC": "EMC Class A",
        "Eye Comfort": "TUV Eye Comfort",
        "Operation Time Support": "24/7",
      },
    },
    images: [
      "/products/led-signage/samsung-all-in-one-led-iab/1.jpg",
      "/products/led-signage/samsung-all-in-one-led-iab/2.jpg",
      "/products/led-signage/samsung-all-in-one-led-iab/3.jpg",
      "/products/led-signage/samsung-all-in-one-led-iab/4.jpg",
    ],
  },
  {
    id: "samsung-all-in-one-led-iac",
    popularity: 89,
    catalog2026: true,
    name: "Samsung All-in-One LED (IAC)",
    category: "LED Signage",
    subCategory: "All-in-One LED",
    series: "IAC",
    description:
      "130-inch 2K all-in-one direct-view LED display with Quick Build installation and an all-inclusive package — big-screen impact deployed fast, out of the box.",
    longDescription: `The Samsung All-in-One LED (IAC) packages a 130-inch 2K (Full HD) direct-view LED display into a complete, ready-to-install solution. With a P1.5 pixel pitch and a 6,000:1 contrast ratio, it produces vivid color expression, reduced noise, and a full range of grays and blacks — a genuine big-screen alternative to projection and tiled LCD.

Quick Build structure simplifies installation: dock the two background plates and hang four preset modules to complete the wall in hours rather than days. The control box is integrated into the display, and a 3,840 Hz refresh rate keeps motion smooth and camera-capture flicker-free.

Everything needed to begin operating is in one package — control box, wall brackets, speakers, and decorative bezels — so there are no extra components to source. Rated for 24/7 operation, the IAC suits meeting spaces, lobbies, showrooms, and retail environments that want a premium LED display without a bespoke integration project.`,
    features: [
      "130\" 2K (Full HD) all-in-one LED",
      "P1.5 pixel pitch, 6,000:1 contrast",
      "3,840 Hz refresh for smooth, flicker-free capture",
      "Quick Build — installs in hours",
      "All-inclusive: control box, brackets, speakers, bezels",
      "24/7 operation",
    ],
    specs: {
      resolution: "P1.5 pixel pitch (2K / FHD)",
      brightness: "1,000 nit",
      screenSizes: ["130", "146"],
      operationTime: "24/7",
    },
    specGroups: {
      "LED": {
        "Diagonal": "3.30 m (130\")",
        "Pixel Pitch": "P1.5",
        "Diode Type": "Surface Mount Device (SMD)",
        "Resolution": "2K (Full HD)",
        "Brightness": "1,000 nit",
        "Contrast Ratio": "6,000:1",
        "Refresh Rate": "3,840 Hz",
        "Model Code": "LH015IACCHS",
      },
      "All-in-One & Installation": {
        "Installation": "Quick Build (background plates + 4 preset modules)",
        "Control Box": "Built-in",
        "Included": "Control box, wall brackets, speakers, décor bezels",
        "Service": "Front",
      },
      "Certification & Operation": {
        "IP Rating": "IP20",
        "EMC": "EMC Class A",
        "Eye Comfort": "TUV Eye Comfort",
        "Operation Time Support": "24/7",
      },
    },
    images: [
      "/products/led-signage/samsung-all-in-one-led-iac/1.jpg",
      "/products/led-signage/samsung-all-in-one-led-iac/2.jpg",
      "/products/led-signage/samsung-all-in-one-led-iac/3.jpg",
      "/products/led-signage/samsung-all-in-one-led-iac/4.jpg",
      "/products/led-signage/samsung-all-in-one-led-iac/5.jpg",
    ],
  },

  // ── SMART SIGNAGE — SPECIALTY & NEXT-GEN (2026 catalog) ──────────────────────

  {
    id: "samsung-spatial-smhx",
    popularity: 95,
    catalog2026: true,
    name: "Samsung Spatial Signage (SMHX)",
    category: "Digital Signage",
    subCategory: "Spatial",
    series: "SMHX",
    description:
      "Glasses-free 3D signage powered by patented 3D Plate technology — turns ordinary content into striking, lifelike depth in a slim 5.2 cm profile.",
    longDescription: `The Samsung Spatial Signage (SMHX) delivers an immersive glasses-free 3D experience using Samsung's patented 3D Plate technology, which applies binocular parallax to send a different image to each eye — creating cinematic depth and 360° product rotation without special glasses or separately authored 3D content.

At 85 inches with 4K UHD clarity (a compact 32-inch 9:16 portrait model is also available), Spatial Signage combines a striking visual with an UltraThin 5.2 cm profile that integrates cleanly into retail, lobby, and experience-centre environments. A 500-nit panel with anti-glare treatment keeps content vivid under commercial lighting.

Samsung VXT with the AI Studio app makes 3D content creation simple: upload an image and write a prompt to generate dynamic 3D video, then manage and monitor devices remotely. Recognised as a CES 2026 Innovation Award honoree, Spatial Signage redefines attention-grabbing display for premium commercial spaces.`,
    features: [
      "Glasses-free Virtual 3D via patented 3D Plate technology",
      "UltraThin 5.2 cm profile",
      "4K UHD (85\") / FHD 9:16 (32\")",
      "AI Studio 3D content generation in Samsung VXT",
      "Quantum Processor, anti-glare",
      "24/7 operation",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "500 nit",
      screenSizes: ["32", "85"],
      operationTime: "24/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "85\" (4K UHD) / 32\" (FHD, 9:16 portrait)",
        "Resolution": "3,840 × 2,160 (85\") / 1,080 × 1,920 (32\")",
        "Brightness (Type)": "500 nit",
        "3D Technology": "Patented 3D Plate (glasses-free binocular parallax)",
        "Depth": "52 mm (UltraThin)",
        "Operation Time Support": "24/7",
      },
      "Processing & Software": {
        "Processor": "Quantum Processor",
        "Panel": "Anti-glare",
        "Content": "Samsung VXT with AI Studio (image-to-3D-video)",
        "Platform": "Tizen 7.0",
      },
      "Recognition": {
        "Award": "CES 2026 Innovation Award honoree",
        "Model Code": "LH85SMHPBGCXZA (SM85HX-P)",
      },
    },
    images: [
      "/products/digital-signage/samsung-spatial-smhx/1.jpg",
      "/products/digital-signage/samsung-spatial-smhx/2.jpg",
      "/products/digital-signage/samsung-spatial-smhx/3.jpg",
      "/products/digital-signage/samsung-spatial-smhx/4.jpg",
      "/products/digital-signage/samsung-spatial-smhx/5.jpg",
      "/products/digital-signage/samsung-spatial-smhx/6.jpg",
      "/products/digital-signage/samsung-spatial-smhx/7.jpg",
      "/products/digital-signage/samsung-spatial-smhx/8.jpg",
    ],
  },
  {
    id: "samsung-color-epaper-emdx",
    popularity: 90,
    catalog2026: true,
    name: "Samsung Color E-Paper (EMDX)",
    category: "Digital Signage",
    subCategory: "Color E-Paper",
    series: "EMDX",
    description:
      "Paper-thin colour e-paper signage with a built-in battery and near-zero power draw — digitises posters and notices without cabling or daily charging.",
    longDescription: `The Samsung Color E-Paper (EMDX) is a lightweight, paper-thin display that brings printed communication into the digital realm. Its 32-inch WQHD (2,560 × 1,440) E-Ink Spectra 6 panel reproduces rich, natural colour while preserving the calm, glare-free readability of paper — ideal for retail shelf edges, restaurant menus, transit notices, and office signage.

Because e-paper only draws power when the image changes, the EMDX consumes zero watts while displaying a static image, and its built-in 4,600 mAh battery can run for up to ~200 days on a single charge at one update per day. A 17.9 mm profile, Wi-Fi/Bluetooth/USB-C connectivity, and a dedicated mobile app mean it can be placed almost anywhere without dedicated infrastructure.

Managed through Samsung VXT and the Tizen Enterprise Platform, and built with recycled materials, Color E-Paper is a practical, energy-conscious way to replace static paper with dynamic, remotely-updatable content. A compact 13-inch model is also available.`,
    features: [
      "E-Ink Spectra 6 colour e-paper, paper-like readability",
      "Zero-watt power on static images",
      "Built-in 4,600 mAh battery (~200 days / update-a-day)",
      "Paper-thin 17.9 mm design",
      "Wi-Fi, Bluetooth, USB-C; Samsung VXT + E-Paper app",
      "Made with recycled materials",
    ],
    specs: {
      resolution: "2,560 × 1,440 (WQHD)",
      brightness: "Reflective e-paper (0 W on static image)",
      screenSizes: ["13", "32"],
      operationTime: "Always-on (battery)",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "32\" (also 13\")",
        "Panel Type": "E-Ink Spectra 6 colour e-paper",
        "Resolution": "2,560 × 1,440 (WQHD)",
        "Colours": "Up to 77K (with dithering)",
        "Viewing Angle (H/V)": "178° / 178°",
        "Depth": "17.9 mm",
      },
      "Power & Battery": {
        "Battery": "4,600 mAh Li-ion (built-in)",
        "Battery Life": "~200 days at 1 update/day",
        "Static Power": "0 W (image unchanged)",
      },
      "Connectivity & Platform": {
        "Wireless": "Wi-Fi, Bluetooth",
        "Wired": "USB-C (data/power)",
        "Platform": "Tizen 8.0, Samsung VXT + E-Paper app",
        "IP Rating": "IP5X",
      },
      "Eco": {
        "Materials": "Recycled plastics (bio-resin on 13\" model)",
        "Model Code": "LH32EMDIBGBXZA (EM32DX)",
      },
    },
    images: [
      "/products/digital-signage/samsung-color-epaper-emdx/1.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/2.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/3.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/4.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/5.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/6.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/7.jpg",
      "/products/digital-signage/samsung-color-epaper-emdx/8.jpg",
    ],
  },
  {
    id: "samsung-outdoor-oh",
    popularity: 87,
    catalog2026: true,
    name: "Samsung Outdoor Signage (OH Series)",
    category: "Digital Signage",
    subCategory: "Outdoor",
    series: "OHA/OHDX/OHB",
    description:
      "Weatherproof high-brightness outdoor signage — UL-verified for outdoor visibility at 3,500 nits (peak 4,000) with IP56 and IK10 durability for 24/7 storefront and street-facing use.",
    longDescription: `The Samsung Outdoor Signage (OH Series) is engineered to deliver clear, vivid messaging in the harshest environments — direct sunlight, rain, dust, and wide temperature swings. With 3,500-nit brightness (peak 4,000 nit) and UL-verified outdoor visibility, content stays legible around the clock, while an advanced heat-dissipation structure keeps the panel stable under load.

The range spans the 75-inch 4K OHA, the 46-/55-inch FHD OHDX with a 6,000:1 contrast ratio, and the compact OHB — covering everything from drive-thru menu boards to building-mounted brand displays. IP56-rated protection and IK10 impact resistance mean the displays shrug off water jets, dust, and physical knocks, and an auto-brightness sensor adapts output to ambient light.

Managed through Samsung VXT with support for additional protective glass installation, the OH Series lets businesses take impactful digital signage confidently outdoors, 24/7.`,
    features: [
      "UL-verified outdoor visibility, 3,500 nit (peak 4,000)",
      "IP56 dust/water protection, IK10 impact resistance",
      "Advanced heat-dissipation structure",
      "Auto brightness sensor",
      "Additional-glass-installable structure",
      "24/7 operation, Samsung VXT",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K) / FHD by model",
      brightness: "3,500 nit (peak 4,000)",
      screenSizes: ["24", "46", "55", "75"],
      operationTime: "24/7",
    },
    specGroups: {
      "Display": {
        "OHA": "75\" (1.90 m), 4K UHD, 3,500 nit (peak 4,000), 1,200:1",
        "OHDX": "46\"/55\" (1.16 m/1.39 m), FHD, 3,500 nit (peak 4,000), 6,000:1, UL-verified outdoor visibility",
        "OHB": "24\" (61 cm), FHD, 1,500 nit, 1,000:1",
        "Operation Time Support": "24/7",
      },
      "Durability": {
        "IP Rating": "IP56 (dust & water)",
        "Impact": "IK10-certified",
        "Cooling": "Heat-dissipation structure (OHDX)",
        "Brightness Control": "Auto brightness sensor",
        "Glass": "Additional glass installable",
      },
      "Software": {
        "Management": "Samsung VXT",
        "Model Code": "LH75OHAEBGBXZA (OH75A)",
      },
    },
    images: [
      "/products/digital-signage/samsung-outdoor-oh/1.jpg",
      "/products/digital-signage/samsung-outdoor-oh/2.jpg",
      "/products/digital-signage/samsung-outdoor-oh/3.jpg",
      "/products/digital-signage/samsung-outdoor-oh/4.jpg",
    ],
  },
  {
    id: "samsung-window-om",
    popularity: 86,
    catalog2026: true,
    name: "Samsung Window Signage (OM Series)",
    category: "Digital Signage",
    subCategory: "Window",
    series: "OMA/OMN/OMB/OMDX",
    description:
      "High-brightness window-facing signage up to 4,000 nits with polarized-sunglass support and IP5X protection — cuts through sunlit storefront glass to attract passers-by.",
    longDescription: `The Samsung Window Signage (OM Series) is built to command attention through glass, even against direct sunlight. With brightness up to 4,000 nits and polarized-sunglass support, storefront content stays vivid and legible to passers-by, while a slim profile preserves valuable window space.

The lineup covers the 75-inch 4K OMA, the OMB (46-inch FHD at 4,000 nit / 55-inch 4K at 3,000 nit), the OMN/OMN-D (4,000 nit, with OMN-D offering a dual-sided 3,000/1,000-nit configuration for inside-and-out messaging), and the compact 32-inch OMDX with a 4.56 cm window-facing depth. IP5X dust protection and proprietary overheating-mitigation technology keep the displays reliable in demanding window installations.

Auto brightness control, built-in Wi-Fi, and clean cable management make the OM Series a polished, low-maintenance way to turn any window into a high-impact advertising surface, 24/7.`,
    features: [
      "High brightness up to 4,000 nit",
      "Polarized-sunglass support",
      "IP5X dust protection + overheating mitigation",
      "Dual-sided option (OMN-D)",
      "Auto brightness control, built-in Wi-Fi",
      "24/7 operation, slim window-facing design",
    ],
    specs: {
      resolution: "4K UHD / FHD by model",
      brightness: "up to 4,000 nit",
      screenSizes: ["32", "46", "55", "75"],
      operationTime: "24/7",
    },
    specGroups: {
      "Display": {
        "OMA": "75\" (1.90 m), 4K UHD",
        "OMB": "46\" FHD 4,000 nit / 55\" 4K 3,000 nit, 6,000:1",
        "OMN / OMN-D": "FHD 4,000 nit (OMN-D dual-sided 3,000 / 1,000 nit)",
        "OMDX": "32\" FHD 2,000 nit, 4.56 cm depth",
        "Operation Time Support": "24/7",
      },
      "Durability & Features": {
        "IP Rating": "IP5X (dust)",
        "Overheating": "Proprietary overheating-mitigation technology",
        "Brightness Control": "Auto brightness control",
        "Sunglasses": "Polarized-sunglass support",
        "Connectivity": "Built-in Wi-Fi, clean cable management",
      },
      "Model": {
        "Model Code": "LH55OMBEBGBXZA (OM55B)",
      },
    },
    images: [
      "/products/digital-signage/samsung-window-om/1.png",
      "/products/digital-signage/samsung-window-om/2.webp",
      "/products/digital-signage/samsung-window-om/3.jpg",
      "/products/digital-signage/samsung-window-om/4.jpg",
      "/products/digital-signage/samsung-window-om/5.jpg",
    ],
  },
  {
    id: "samsung-stretched-shc",
    popularity: 82,
    catalog2026: true,
    name: "Samsung Stretched Signage (SHC)",
    category: "Digital Signage",
    subCategory: "Stretched",
    series: "SHC",
    description:
      "Ultra-wide 16:4.5 stretched display for shelf edges, transit, and narrow spaces — communicates clearly at 700 nits where a standard panel won't fit.",
    longDescription: `The Samsung Stretched Signage (SH37C) is a versatile, cost-effective display purpose-built for narrow spaces where conventional 16:9 panels don't fit. Its 37-inch 16:4.5 ultra-wide format (1,920 × 540) is ideal for shelf edges, above-door boards, transit information strips, and check-out lanes — turning otherwise unusable slivers of space into clear communication surfaces.

A 700-nit, non-glare panel keeps messaging readable in bright retail lighting and from wide angles, and an embedded media player lets the display run content without an external PC. The SHC supports both horizontal and vertical installation, adapting to the shape of the space.

Backed by ENERGY STAR 8.0 and EPEAT certification with recycled-plastic construction, the Stretched Signage pairs practical, space-savvy design with energy-conscious operation for 24/7 commercial use.`,
    features: [
      "16:4.5 ultra-wide stretched format",
      "700-nit non-glare panel",
      "Embedded media player (no external PC)",
      "Horizontal or vertical installation",
      "24/7 operation",
      "ENERGY STAR 8.0 / EPEAT, recycled plastics",
    ],
    specs: {
      resolution: "1,920 × 540 (16:4.5)",
      brightness: "700 nit",
      screenSizes: ["37"],
      operationTime: "24/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "37\" (94 cm)",
        "Aspect Ratio": "16:4.5 (stretched)",
        "Resolution": "1,920 × 540",
        "Brightness (Type)": "700 nit",
        "Contrast Ratio": "4,000:1",
        "Panel": "Anti-glare",
        "Operation Time Support": "24/7",
      },
      "Features": {
        "Media Player": "Embedded",
        "Installation": "Horizontal / vertical",
        "Platform": "Tizen 7.0",
      },
      "Eco & Model": {
        "Certifications": "ENERGY STAR 8.0, EPEAT",
        "Model Code": "LH37SHCEBGBXZA (SH37C)",
      },
    },
    images: [
      "/products/digital-signage/samsung-stretched-shc/1.jpg",
    ],
  },
  {
    id: "samsung-small-qbc",
    popularity: 84,
    catalog2026: true,
    name: "Samsung Small Signage (QBC)",
    category: "Digital Signage",
    subCategory: "Small Signage",
    series: "QB13C/QB24C",
    description:
      "Compact 13\" and 24\" Full HD signage for close-range, space-constrained spots — reception desks, shelf edges, and information points where larger displays don't fit.",
    longDescription: `The Samsung Small Signage (QBC) brings clear, effective communication to areas with limited space. Available in compact 13-inch (33 cm) and 24-inch (61 cm) Full HD formats, it is designed for close-range viewing — reception desks, counters, shelf edges, meeting-room name plates, and customer-facing information points where a large display would be impractical.

The 13-inch model's slim 19.9 mm profile lets it slot into tight spaces and mount cleanly on a wall, while an intuitive Home UI keeps device setup, content playback, and settings simple. Dual-band Wi-Fi (2.4 GHz + 5 GHz) delivers faster, more reliable network connections — useful in busy, high-traffic environments.

Managed through Samsung VXT, the Small Signage is a flexible, low-footprint way to add dynamic digital messaging exactly where it's needed. (This is the non-touch QBC small signage; a touch variant is available separately.)`,
    features: [
      "Compact 13\" / 24\" Full HD form factor",
      "Slim 19.9 mm design (13\")",
      "Intuitive Home UI",
      "Dual Wi-Fi (2.4 GHz + 5 GHz)",
      "Samsung VXT management",
      "16/7 operation",
    ],
    specs: {
      resolution: "1,920 × 1,080 (FHD)",
      brightness: "500 nit (13\") / 250 nit (24\")",
      screenSizes: ["13", "24"],
      operationTime: "16/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "13\" (33 cm) / 24\" (61 cm)",
        "Resolution": "1,920 × 1,080 (FHD)",
        "Brightness (Type)": "500 nit (13\") / 250 nit (24\")",
        "Contrast Ratio": "800:1 (13\") / 1,000:1 (24\")",
        "Depth": "19.9 mm (13\")",
        "Operation Time Support": "16/7",
      },
      "Features": {
        "Interface": "Home UI",
        "Wireless": "Dual Wi-Fi (2.4 GHz + 5 GHz)",
        "Management": "Samsung VXT",
        "Platform": "Tizen 7.0",
      },
      "Model": {
        "Model Code": "LH13QBCEBGBXZA (QB13C) / QB24C",
        "Note": "Non-touch small signage (touch variant sold separately)",
      },
    },
    images: [
      "/products/digital-signage/samsung-small-qbc/1.jpg",
    ],
  },
  {
    id: "samsung-flip-wmfx",
    popularity: 98,
    catalog2026: true,
    name: "Samsung Flip (WMFX)",
    category: "Interactive Display",
    subCategory: "Flip",
    series: "WMFX",
    description:
      "The 2026 Samsung Flip — a 4K interactive whiteboard with natural 26 ms writing, an enhanced multi-window workspace on Tizen 9.0, and Samsung Knox security.",
    longDescription: `The Samsung Flip (WMFX) is the latest generation of Samsung's interactive whiteboard, built for meeting rooms, classrooms, and collaborative spaces where ideas need to flow the moment inspiration strikes. Available in 55, 65, 75, and 85 inches with 4K UHD clarity and a 450-nit anti-glare panel, it delivers instant, natural writing at 26 ms response with 2,048 pressure levels and dual-pen support.

Running on the enhanced Tizen 9.0 platform, the WMFX moves beyond a digital whiteboard to a PC-like workspace: multi-window multitasking, a taskbar, Annotation On over any content, and an integrated Workspace for direct access to remote PCs, network drives, and cloud apps like Microsoft 365. SmartView+ lets up to nine devices share content wirelessly at once.

The Enhanced Whiteboard makes it easy to edit, move, and resize notes and turn handwriting into clean visuals, while a rotatable design adapts between portrait and landscape. Samsung Knox provides multi-layered security from power-on to shutdown, making the Flip a secure, versatile hub for modern collaboration.`,
    features: [
      "Natural writing — 26 ms response, 2,048 pressure levels, dual pen",
      "Enhanced Whiteboard + Flip Home",
      "Tizen 9.0 multi-window workspace & taskbar",
      "SmartView+ — up to 9 devices share wirelessly",
      "Rotatable design (portrait / landscape)",
      "Samsung Knox security, USB-C Hub / HDMI Out / OPS",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "450 nit",
      screenSizes: ["55", "65", "75", "85"],
      operationTime: "16/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "55\" / 65\" / 75\" / 85\"",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "Brightness (Type)": "450 nit",
        "Panel": "Anti-glare",
        "Operation Time Support": "16/7",
      },
      "Writing & Interaction": {
        "Response Time": "26 ms",
        "Pressure Levels": "2,048",
        "Pen": "Dual pen",
        "Wireless Sharing": "SMARTVIEW+ (up to 9 devices)",
      },
      "Software & Security": {
        "Platform": "Tizen 9.0",
        "Workspace": "Multi-window, taskbar, Annotation On, Workspace (remote PC / M365)",
        "Whiteboard": "Enhanced Whiteboard, Flip Home",
        "Security": "Samsung Knox",
      },
      "Connectivity & Model": {
        "Connectivity": "USB-C Hub, HDMI Out, OPS",
        "Design": "Rotatable (portrait / landscape)",
        "Model Code": "LH55WMFWBGCX (WM55FX)",
      },
    },
    images: [
      "/products/interactive/samsung-flip-wmfx/1.jpg",
      "/products/interactive/samsung-flip-wmfx/2.jpg",
      "/products/interactive/samsung-flip-wmfx/3.jpg",
    ],
  },

  // ── CRYSTAL UHD HOSPITALITY TV (2026 catalog) ───────────────────────────────

  {
    id: "samsung-hotel-tv-hu8000f",
    popularity: 97,
    catalog2026: true,
    name: "Samsung Crystal UHD Hotel TV (HU8000F)",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HU8000F",
    description:
      "The 2026 Crystal UHD hospitality flagship — AirSlim 4K with LYNK Cloud management, Google Cast, Apple AirPlay, and Samsung Knox for a premium, home-like guest experience.",
    longDescription: `The Samsung Crystal UHD Hotel TV (HU8000F) is the 2026 flagship of Samsung's hospitality lineup, giving guests a familiar, home-like 4K experience while giving hotel managers powerful centralized control. Powered by the Crystal Processor 4K with AI-driven 4K upscaling, HDR10+, and Dynamic Crystal Color, it renders content in over a billion shades with lifelike clarity, while adaptive sound tunes 20W stereo audio to whatever is on screen.

Its AirSlim design creates an elegant, nearly bezel-free profile that complements any guest room. Guests can cast directly from their own devices via Google Cast and Apple AirPlay, or browse built-in apps — Netflix, Prime Video, and Samsung TV Plus — straight from the Tizen home screen, with no dongles or logins required.

For operators, Samsung LYNK Cloud delivers remote, multi-property display management and guest-usage analytics that surface marketing insights and drive incremental revenue, while the Tizen Enterprise Platform, SmartThings Pro, and Samsung Knox provide enterprise-grade integration and security. Available from 43" to 85".`,
    features: [
      "AirSlim nearly bezel-free 4K design",
      "Crystal Processor 4K with AI 4K upscaling, HDR10+, Dynamic Crystal Color",
      "Google Cast + Apple AirPlay device casting",
      "LYNK Cloud remote management & guest analytics",
      "Built-in Netflix, Prime Video, Samsung TV Plus (Tizen)",
      "Samsung Knox security, SmartThings Pro",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "65", "75", "85"],
      operationTime: "16/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\" / 85\"",
        "Panel Type": "4K VA, direct backlight",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "HDR": "HDR10 / HDR10+",
        "Processor": "Crystal Processor 4K",
        "Picture": "AI 4K upscaling, Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer",
        "Refresh Rate": "60 Hz",
        "Design": "AirSlim",
      },
      "Hospitality Features": {
        "Management": "LYNK Cloud, Tizen Enterprise Platform",
        "Casting": "Google Cast, Apple AirPlay",
        "Apps": "Smart Hub, Samsung TV Plus, Netflix, Prime Video",
        "Control": "Multi-Code Remote, SmartThings Pro",
        "Security": "Samsung Knox",
      },
      "Audio & Connectivity": {
        "Speakers": "20 W stereo + adaptive sound",
        "Wireless": "Wi-Fi 5, Bluetooth 5.2",
        "HDMI": "3 × HDMI",
        "USB": "2 × USB-A",
      },
      "Model": {
        "Model Codes": "HG43U800FNFXZA … HG85U800FNFXZA",
      },
    },
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/1.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/2.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/3.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/4.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/5.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/6.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/7.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu8000f/8.jpg",
    ],
  },
  {
    id: "samsung-hotel-tv-hu7010f",
    popularity: 93,
    catalog2026: true,
    name: "Samsung Crystal UHD Hotel TV (HU7010F)",
    category: "Commercial TV",
    subCategory: "Hotel TV",
    series: "HU7010F",
    description:
      "2026 Crystal UHD hospitality TV for India — 4K with LYNK Cloud management, Google Cast, Apple AirPlay, and Samsung Knox, delivering a home-like guest experience at a smart price point.",
    longDescription: `The Samsung Crystal UHD Hotel TV (HU7010F) brings the 2026 Crystal UHD guest experience to hotels across India. Driven by the Crystal Processor 4K with AI 4K upscaling, HDR, and Dynamic Crystal Color, it delivers crisp, vibrant 4K content that makes every guest room feel like home, complemented by Motion Xcelerator for smooth motion and a Contrast Enhancer for depth.

Guests can cast their own content via Google Cast and Apple AirPlay or use built-in apps and Samsung TV Plus from the Tizen home screen. For operators, Samsung LYNK Cloud enables remote, centralized management across properties along with guest-usage analytics, while the Tizen Enterprise Platform, SmartThings Pro, and Samsung Knox provide secure integration into hotel systems.

Positioned just below the AirSlim HU8000F flagship, the HU7010F focuses on core hospitality value and is launched in India. Available from 43" to 75".`,
    features: [
      "Crystal Processor 4K with AI 4K upscaling & HDR",
      "Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer",
      "Google Cast + Apple AirPlay device casting",
      "LYNK Cloud remote management & guest analytics",
      "Samsung TV Plus & Smart Hub (Tizen)",
      "Samsung Knox security, SmartThings Pro — launched in India",
    ],
    specs: {
      resolution: "3,840 × 2,160 (4K UHD)",
      brightness: "300 nit",
      screenSizes: ["43", "50", "55", "65", "75"],
      operationTime: "16/7",
    },
    specGroups: {
      "Display": {
        "Diagonal Size": "43\" / 50\" / 55\" / 65\" / 75\"",
        "Panel Type": "4K VA, direct backlight",
        "Resolution": "3,840 × 2,160 (4K UHD)",
        "HDR": "HDR",
        "Processor": "Crystal Processor 4K",
        "Picture": "AI 4K upscaling, Dynamic Crystal Color, Motion Xcelerator, Contrast Enhancer",
        "Refresh Rate": "60 Hz",
      },
      "Hospitality Features": {
        "Management": "LYNK Cloud, Tizen Enterprise Platform",
        "Casting": "Google Cast, Apple AirPlay",
        "Apps": "Smart Hub, Samsung TV Plus",
        "Control": "Multi-Code Remote, SmartThings Pro",
        "Security": "Samsung Knox",
      },
      "Audio & Connectivity": {
        "Speakers": "20 W stereo + adaptive sound (Dolby Digital MS12)",
        "Wireless": "Wi-Fi 5, Bluetooth 5.2",
        "HDMI": "2 × HDMI",
        "USB": "2 × USB-A",
      },
      "Availability": {
        "Region": "Launched in India only",
        "Model Code": "HG55U701FNFXZA (HU701F)",
      },
    },
    images: [
      "/products/commercial-tv/samsung-hotel-tv-hu7010f/1.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu7010f/2.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu7010f/3.jpg",
      "/products/commercial-tv/samsung-hotel-tv-hu7010f/4.jpg",
    ],
  },
];
