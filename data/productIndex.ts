import { products } from "./products";

/**
 * A minimal, id-keyed projection of the catalog: only the light fields that
 * client-global surfaces need. `ComparisonProvider` is mounted in the root
 * layout, so anything it value-imports lands in the first-load JS of *every*
 * route (/contact, /privacy, /blogs…). Importing the full data/products.ts
 * (~187 KB / 3,691 lines) there parsed the whole catalog client-side on pages
 * with no product UI at all. The provider only needs to validate that a
 * persisted id still exists and to refresh a chip's name/image — this index
 * carries exactly that and nothing heavy (no specs, features, or prose).
 *
 * This file DOES value-import products, so it must only ever be imported by
 * code that genuinely needs a light lookup — never as a stand-in that pulls
 * the heavy module back in transitively.
 */
export type ProductSummary = {
  id: string;
  name: string;
  images: string[];
};

export const productIndex: Record<string, ProductSummary> = Object.fromEntries(
  products.map((p) => [p.id, { id: p.id, name: p.name, images: p.images }])
);
