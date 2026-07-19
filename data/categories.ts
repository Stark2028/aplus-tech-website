export type CategorySlug =
  | "digital-signage"
  | "video-walls"
  | "interactive"
  | "commercial-tv"
  | "led-signage"
  | "video-conferencing"
  | "software";

export interface ProductCategory {
  id: CategorySlug;
  /** Canonical category name used in product data */
  name: string;
  /** Label used in navigation */
  navLabel: string;
  description: string;
  /** Short tagline shown in category grid */
  tagline: string;
  /** Short subtitle shown in the category hero banner */
  subtitle: string;
  /** Multi-sentence SEO overview rendered on the category landing page */
  overview: string;
  /** Use-case chips shown in the category hero banner */
  useCases: string[];
}

export const productCategories: ProductCategory[] = [
  {
    id: "digital-signage",
    name: "Digital Signage",
    navLabel: "Digital Signage",
    tagline: "Lobbies, retail, campuses & more",
    subtitle: "Commercial-grade Samsung displays engineered for high-traffic environments.",
    useCases: ["Lobbies & Atriums", "Retail Stores", "Campuses", "Wayfinding", "Airports"],
    description: "Enterprise-grade digital signage offering scalable sizes and high-brightness options for any commercial installation.",
    overview:
      "Samsung digital signage displays are commercial-grade screens built for continuous operation in retail stores, corporate lobbies, restaurants, campuses, and transport hubs. Unlike consumer TVs, they deliver higher brightness, 16/7 to 24/7 duty ratings, built-in Tizen media players with MagicINFO, and remote fleet management — so content can be scheduled and updated across sites without an external player. As an authorized Samsung distributor, Aplus Technology Solutions supplies the full signage range across India, from compact shelf-edge displays to 115-inch large-format panels, with GST invoicing, certified installation, and AMC support.",
  },
  {
    id: "video-walls",
    name: "Video Wall",
    navLabel: "Video Walls",
    tagline: "Seamless large-format impact",
    subtitle: "Ultra-narrow bezel displays for seamless, large-format visual installations.",
    useCases: ["Control Rooms", "Command Centers", "Corporate Lobbies", "Event Venues"],
    description: "High-impact video walls featuring ultra-narrow bezels for near-seamless, immersive viewing in control rooms and large venues.",
    overview:
      "Samsung video walls tile ultra-narrow-bezel LCD panels into a single large canvas for control rooms, command centres, corporate lobbies, broadcast studios, and retail flagships. Razor-thin bezel-to-bezel gaps and 24/7-rated panels deliver seamless, always-on visuals, while DisplayPort daisy-chaining and factory colour calibration simplify large-array installations. Aplus Technology Solutions supplies and installs the complete Samsung video wall lineup across India — including the VMB, VHC, and VMC series — with professional mounting, colour matching, and AMC support.",
  },
  {
    id: "interactive",
    name: "Interactive Display",
    navLabel: "Interactive Displays",
    tagline: "Collaboration & smart classrooms",
    subtitle: "Advanced multi-touch panels for collaborative workspaces and smart classrooms.",
    useCases: ["Meeting Rooms", "Classrooms", "Training Centres", "Collaboration Spaces"],
    description: "Interactive flat panels featuring integrated multi-touch, wireless casting, and powerful collaboration tools for modern environments.",
    overview:
      "Samsung interactive displays replace whiteboards and projectors with 4K multi-touch panels for meeting rooms, classrooms, training centres, and collaboration spaces. The Flip and WAC/WAD/WAF series support multi-point touch, wireless screen sharing, USB-C connectivity, and Tizen with Samsung Knox security, so teams can annotate, cast, and save sessions without extra hardware. Aplus Technology Solutions delivers and installs the full interactive display range across India with warranty, onboarding, and AMC support.",
  },
  {
    id: "commercial-tv",
    name: "Commercial TV",
    navLabel: "Hospitality & Business TV",
    tagline: "Hotel rooms, offices & waiting areas",
    subtitle: "Enterprise-grade commercial TVs for hospitality, corporate, and public environments.",
    useCases: ["Hotel Rooms", "Serviced Apartments", "Waiting Areas", "Corporate Offices"],
    description: "Durable commercial TVs featuring centralized management, designed specifically for demanding hospitality and business applications.",
    overview:
      "Samsung commercial and hospitality TVs are purpose-built for hotels, serviced apartments, hospitals, and corporate spaces — with centralized content management, LYNK Cloud and pro:idiom compatibility, and durable panels rated for extended daily use. The range spans Hotel TVs (HGU and HBU Crystal UHD series) and Business TVs (BE-H series) from 32 inches up to 98 inches. Aplus Technology Solutions supplies, configures, and installs commercial TV fleets across India with GST invoicing, bulk pricing, and AMC support.",
  },
  {
    id: "led-signage",
    name: "LED Signage",
    navLabel: "LED Signage",
    tagline: "Seamless direct-view LED at any scale",
    subtitle: "Fine-pitch direct-view LED for large-format walls, lobbies, and flagship spaces.",
    useCases: ["Corporate Lobbies", "Control Rooms", "Retail Flagships", "Auditoriums", "Experience Centres"],
    description: "Direct-view LED display solutions — from The Wall's micro-LED to all-in-one packages — delivering bezel-free, large-format visuals that scale to any space.",
    overview:
      "Samsung direct-view LED signage delivers bezel-free, large-format visuals that scale to virtually any size — from The Wall's micro-LED to IE-series indoor cabinets and All-in-One (IAB and IAC) packages. Fine pixel pitches produce crisp, seamless imagery for corporate lobbies, auditoriums, control rooms, retail flagships, and experience centres, without the seams of a tiled LCD wall. Aplus Technology Solutions handles LED site survey, supply, and turnkey installation across India, with service and AMC support.",
  },
  {
    id: "video-conferencing",
    name: "Video Conferencing",
    navLabel: "Video Conferencing",
    tagline: "Boardrooms, huddle rooms & meeting spaces",
    subtitle: "Logitech video bars, cameras and room controllers for Microsoft Teams and Zoom Rooms.",
    useCases: ["Boardrooms", "Huddle Rooms", "Microsoft Teams Rooms", "Zoom Rooms", "Training Rooms"],
    description: "Logitech video conferencing systems — video bars, PTZ cameras, tap controllers and room compute for meeting spaces of every size.",
    overview:
      "Logitech video conferencing brings enterprise-grade meeting-room hardware to boardrooms, huddle spaces, training rooms and executive suites — video bars with AI-driven framing, PTZ cameras, tap touch controllers, schedulers and compute appliances that run Microsoft Teams Rooms and Zoom Rooms out of the box. Aplus Technology Solutions supplies, installs and maintains the full Logitech room lineup across India — from all-in-one huddle-room bars to modular boardroom systems — with GST invoicing, professional installation, and AMC support.",
  },
  {
    id: "software",
    name: "Software Solutions",
    navLabel: "Software",
    tagline: "Cloud platforms for signage & hospitality",
    subtitle: "Samsung cloud software to manage signage content and hospitality TV fleets remotely.",
    useCases: ["Signage Networks", "Hotels & Resorts", "Retail Chains", "Remote Management", "Content Scheduling"],
    description: "Samsung cloud software platforms — VXT for signage content management and LYNK Cloud for hospitality — to control content and devices across every site from one dashboard.",
    overview:
      "Samsung software solutions move signage and hospitality management to the cloud. Samsung VXT is the cloud content-management platform (the successor to MagicINFO) that lets teams design, schedule, and publish content to Samsung signage across every location from a browser, with playlists, templates, and device monitoring built in. Samsung LYNK Cloud is the hospitality platform for managing in-room hotel TV content, channel line-ups, and guest-facing experiences remotely across a property or chain. As an authorized Samsung distributor, Aplus Technology Solutions supplies, provisions, and supports both platforms across India — with licensing, onboarding, and AMC support.",
  },
];

export function getCategoryById(id: CategorySlug): ProductCategory | undefined {
  return productCategories.find((category) => category.id === id);
}

export function getCategoryByName(name: string): ProductCategory | undefined {
  return productCategories.find((category) => category.name === name);
}
