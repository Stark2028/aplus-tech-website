export type CategorySlug =
  | "digital-signage"
  | "video-walls"
  | "interactive"
  | "commercial-tv"
  | "led-signage";

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
  },
  {
    id: "video-walls",
    name: "Video Wall",
    navLabel: "Video Walls",
    tagline: "Seamless large-format impact",
    subtitle: "Ultra-narrow bezel displays for seamless, large-format visual installations.",
    useCases: ["Control Rooms", "Command Centers", "Corporate Lobbies", "Event Venues"],
    description: "High-impact video walls featuring ultra-narrow bezels for near-seamless, immersive viewing in control rooms and large venues.",
  },
  {
    id: "interactive",
    name: "Interactive Display",
    navLabel: "Interactive Displays",
    tagline: "Collaboration & smart classrooms",
    subtitle: "Advanced multi-touch panels for collaborative workspaces and smart classrooms.",
    useCases: ["Meeting Rooms", "Classrooms", "Training Centres", "Collaboration Spaces"],
    description: "Interactive flat panels featuring integrated multi-touch, wireless casting, and powerful collaboration tools for modern environments.",
  },
  {
    id: "commercial-tv",
    name: "Commercial TV",
    navLabel: "Hospitality & Business TV",
    tagline: "Hotel rooms, offices & waiting areas",
    subtitle: "Enterprise-grade commercial TVs for hospitality, corporate, and public environments.",
    useCases: ["Hotel Rooms", "Serviced Apartments", "Waiting Areas", "Corporate Offices"],
    description: "Durable commercial TVs featuring centralized management, designed specifically for demanding hospitality and business applications.",
  },
  {
    id: "led-signage",
    name: "LED Signage",
    navLabel: "LED Signage",
    tagline: "Seamless direct-view LED at any scale",
    subtitle: "Fine-pitch direct-view LED for large-format walls, lobbies, and flagship spaces.",
    useCases: ["Corporate Lobbies", "Control Rooms", "Retail Flagships", "Auditoriums", "Experience Centres"],
    description: "Direct-view LED display solutions — from The Wall's micro-LED to all-in-one packages — delivering bezel-free, large-format visuals that scale to any space.",
  },
];

export function getCategoryById(id: CategorySlug): ProductCategory | undefined {
  return productCategories.find((category) => category.id === id);
}

export function getCategoryByName(name: string): ProductCategory | undefined {
  return productCategories.find((category) => category.name === name);
}
