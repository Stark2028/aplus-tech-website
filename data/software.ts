import type { Product } from "@/data/products";

/**
 * Samsung software solutions (2 products) — the cloud platforms from the 2026
 * Display Solutions catalog §04 "Solution".
 *
 * These are SOFTWARE, not displays: no screen size, brightness, or resolution.
 * The three `specs` cells are repurposed (see lib/vcSpecLabels.ts `specLabels`
 * for category "Software Solutions"): resolution→Deployment, brightness→Platform,
 * operationTime→Designed For. `screenSizes: []` is valid (VC cameras use it too);
 * it just means the size-range surfaces render nothing for this category.
 *
 * brand is left ABSENT ⇒ Samsung (the historical default). These ARE genuine
 * 2026 Samsung catalog products, so catalog2026 is true and all the "authorized
 * Samsung" trust copy on the category/detail pages applies correctly.
 *
 * Both share subCategory "Cloud Platform" — a single distinct subCategory means
 * the category page renders a flat grid (grouping needs >1 distinct value).
 */
export const softwareProducts: Product[] = [
  {
    id: "samsung-vxt",
    catalog2026: true,
    name: "Samsung VXT",
    category: "Software Solutions",
    series: "VXT",
    subCategory: "Cloud Platform",
    description:
      "Samsung's cloud-native content management platform — the successor to MagicINFO — for designing, scheduling, and publishing content to Samsung signage from any browser.",
    longDescription: `Samsung VXT (Visual Experience Transformation) is a cloud-native content management system built for Samsung signage, and the successor to MagicINFO. It lets teams create, schedule, and publish content across every display in the network from a single web browser — no on-premise server to maintain.

VXT ships with a built-in design canvas, ready-made templates, and a content marketplace, plus playlist scheduling, multi-user roles, and real-time device monitoring so operators can see the health and current playback of every screen. Because it is delivered as a subscription cloud service, updates and new features arrive automatically. Aplus Technology Solutions, an authorized Samsung distributor, supplies VXT licenses and helps with provisioning, onboarding, and support across India with GST invoicing.`,
    features: [
      "Cloud-native CMS — the successor to MagicINFO, managed from any browser",
      "Built-in design canvas, templates, and content marketplace",
      "Playlist scheduling and multi-site content deployment",
      "Real-time device monitoring and remote management",
      "Role-based multi-user access for teams",
    ],
    specs: {
      resolution: "Cloud SaaS",
      brightness: "Signage CMS",
      screenSizes: [],
      operationTime: "Signage networks",
    },
    specGroups: {
      Platform: {
        Type: "Cloud content management system (CMS)",
        Category: "Digital signage software",
        Replaces: "Samsung MagicINFO",
      },
      Deployment: {
        Hosting: "Cloud (SaaS subscription)",
        Access: "Web browser — no on-premise server",
        Licensing: "Per-device / subscription",
      },
      Capabilities: {
        Authoring: "Design canvas, templates, content marketplace",
        Scheduling: "Playlists and calendar-based publishing",
        Management: "Real-time device monitoring, remote control, user roles",
      },
      Compatibility: {
        Displays: "Samsung signage (Tizen-powered SMART Signage)",
        "Designed For": "Retail chains, campuses, corporate, transport hubs",
      },
    },
    images: ["/products/software/samsung-vxt/1.webp"],
  },
  {
    id: "samsung-lynk-cloud",
    catalog2026: true,
    name: "Samsung LYNK Cloud",
    category: "Software Solutions",
    series: "LYNK Cloud",
    subCategory: "Cloud Platform",
    description:
      "Samsung's cloud hospitality platform for managing in-room hotel TV content, channel line-ups, and guest-facing experiences remotely across a property or chain.",
    longDescription: `Samsung LYNK Cloud is a cloud-based hospitality platform that lets hotels manage the in-room TV experience remotely — without a set-back box or on-site server for every property. From a central dashboard, staff can update the interactive welcome screen, channel line-up, hotel information, and promotional content across every room and every site.

LYNK Cloud supports scheduling, group management for multi-property chains, and analytics on guest engagement, while integrating with Samsung Hospitality TVs. Delivered as a cloud service, it keeps the guest-facing experience current across the estate from one place. Aplus Technology Solutions, an authorized Samsung distributor, supplies LYNK Cloud and helps with provisioning, onboarding, and support across India with GST invoicing.`,
    features: [
      "Cloud hospitality platform — manage in-room TV content remotely",
      "Central control of welcome screens, channels, and hotel info",
      "Multi-property / chain group management",
      "No per-room set-back box or on-site server required",
      "Integrates with Samsung Hospitality TVs",
    ],
    specs: {
      resolution: "Cloud SaaS",
      brightness: "Hospitality",
      screenSizes: [],
      operationTime: "Hotels & resorts",
    },
    specGroups: {
      Platform: {
        Type: "Cloud hospitality management platform",
        Category: "Hospitality TV software",
        Manages: "In-room guest experience and content",
      },
      Deployment: {
        Hosting: "Cloud (SaaS subscription)",
        Access: "Central web dashboard",
        Infrastructure: "No per-room set-back box or on-site server",
      },
      Capabilities: {
        Content: "Welcome screens, channel line-up, hotel information",
        Management: "Scheduling, multi-property group management",
        Insight: "Guest engagement analytics",
      },
      Compatibility: {
        Displays: "Samsung Hospitality TVs",
        "Designed For": "Hotels, resorts, serviced apartments, chains",
      },
    },
    images: ["/products/software/samsung-lynk-cloud/1.webp"],
  },
];
