import type { Product } from "@/data/products";

export interface SpecLabels {
  resolution: string;
  brightness: string;
  operation: string;
}

const DEFAULT_LABELS: SpecLabels = {
  resolution: "Resolution",
  brightness: "Brightness",
  operation: "Operation",
};

/** Display labels for the two spec cells + operation line on a product card
 *  and the product detail page. Samsung products keep the historical labels.
 *  Video Conferencing swaps them so "113° FOV" reads under "Field of View",
 *  not "Brightness". Driven by subCategory, never by inferring brand. */
export function specLabels(
  product: Pick<Product, "category" | "subCategory">
): SpecLabels {
  if (product.category !== "Video Conferencing") return DEFAULT_LABELS;
  switch (product.subCategory) {
    case "Controllers & Scheduling":
      return { resolution: "Display", brightness: "Panel", operation: "Designed For" };
    case "Room Compute":
      return { resolution: "Video Out", brightness: "Platform", operation: "Designed For" };
    // Cameras + Video Bars & Systems (and any future VC subcat) default here
    default:
      return { resolution: "Video", brightness: "Field of View", operation: "Designed For" };
  }
}
