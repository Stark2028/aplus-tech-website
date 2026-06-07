import type { Product } from "@/data/products";
import { IMAGE_ALIAS } from "@/lib/imageAlias";

/**
 * Re-orders a product list so that no two *adjacent* items show the same
 * primary picture. Several Samsung models are officially the same panel family
 * and ship with identical product shots; placing those side by side in the grid
 * reads as a mistake to customers.
 *
 * Duplicates are compared by *visual content*, not path: many of these images
 * are byte-identical files living under different per-product folders, so a
 * plain path comparison would miss them. `IMAGE_ALIAS` (generated from the
 * images' content hashes) collapses each duplicate to a canonical key.
 *
 * This is a stable, minimal-movement pass: it walks the already-sorted list and,
 * whenever the next item would repeat the previous item's picture, it pulls the
 * nearest following item with a different picture into that slot instead. The
 * relative order is otherwise preserved, so the upstream sort (popularity) still
 * dominates — only genuine duplicate clashes are nudged apart.
 *
 * If a run of duplicates can't be separated (e.g. every remaining item shares
 * the picture), the leftovers are appended as-is rather than dropped.
 */
export function declusterByImage(items: Product[]): Product[] {
  if (items.length < 3) return items;

  const remaining = [...items];
  const result: Product[] = [];
  // Resolve each primary image to its canonical (content-deduped) key so that
  // identical pictures stored at different paths compare equal.
  const imgOf = (p: Product) => {
    const src = p.images?.[0] ?? "";
    return IMAGE_ALIAS[src] ?? src;
  };

  while (remaining.length > 0) {
    const prevImg = result.length > 0 ? imgOf(result[result.length - 1]) : null;

    // Prefer the first remaining item whose image differs from the last placed.
    let pickIndex = 0;
    if (prevImg !== null && imgOf(remaining[0]) === prevImg) {
      const alt = remaining.findIndex((p) => imgOf(p) !== prevImg);
      if (alt !== -1) pickIndex = alt;
      // alt === -1 → everything left is the same image; fall through to 0.
    }

    result.push(remaining[pickIndex]);
    remaining.splice(pickIndex, 1);
  }

  return result;
}
