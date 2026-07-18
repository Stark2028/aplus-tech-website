import { Product } from "@/data/products";

/** Card SKU line, e.g. "QET SERIES · 43–82″".
 *  Label prefers series, then subCategory, then category (spec: real fields
 *  only — Product has no model-code or availability fields). Size range comes
 *  from the numeric entries of specs.screenSizes; non-numeric entries like
 *  "Custom" are ignored, and with no numeric sizes the label stands alone. */
export function formatSkuLine(product: Product): string {
  const label = (product.series || product.subCategory || product.category).toUpperCase();
  const sizes = product.specs.screenSizes
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));
  if (sizes.length === 0) return label;
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  const range = min === max ? `${min}″` : `${min}–${max}″`;
  return `${label} · ${range}`;
}
