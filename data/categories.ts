export type CategorySlug =
  | "digital-signage"
  | "video-walls"
  | "interactive"
  | "commercial-tv";

export interface ProductCategory {
  id: CategorySlug;
  /** Canonical category name used in product data */
  name: string;
  /** Label used in navigation */
  navLabel: string;
  description: string;
  /** Short tagline shown in category grid */
  tagline: string;
}

export const productCategories: ProductCategory[] = [
  {
    id: "digital-signage",
    name: "Digital Signage",
    navLabel: "Digital Signage",
    tagline: "Lobbies, retail, campuses & more",
    description: "Professional-grade Samsung digital signage for commercial environments — available in a range of sizes and brightness levels to suit any installation.",
  },
  {
    id: "video-walls",
    name: "Video Wall",
    navLabel: "Video Walls",
    tagline: "Seamless large-format impact",
    description: "High-impact Samsung video wall displays engineered for control rooms, lobbies, and large venues — with ultra-narrow bezels for a near-seamless visual experience.",
  },
  {
    id: "interactive",
    name: "Interactive Display",
    navLabel: "Interactive Displays",
    tagline: "Collaboration & smart classrooms",
    description: "Samsung interactive flat panels designed for modern meeting rooms and classrooms — featuring multi-touch, wireless sharing, and built-in collaboration tools.",
  },
  {
    id: "commercial-tv",
    name: "Commercial TV",
    navLabel: "Hospitality & Business TV",
    tagline: "Hotel rooms, offices & waiting areas",
    description: "Samsung commercial TVs purpose-built for hospitality and business use — including hotel room entertainment systems and professional displays for offices and waiting areas.",
  },
];

export function getCategoryById(id: CategorySlug): ProductCategory | undefined {
  return productCategories.find((category) => category.id === id);
}

export function getCategoryByName(name: string): ProductCategory | undefined {
  return productCategories.find((category) => category.name === name);
}
