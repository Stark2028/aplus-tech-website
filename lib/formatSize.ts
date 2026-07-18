/**
 * Format Samsung display screen sizes for presentation.
 *
 * Most products have numeric diagonal sizes (e.g. "55" → 55") but some — like
 * modular MicroLED — use a non-numeric value such as "Custom". Blindly appending
 * an inch mark produced strings like `Custom"`. These helpers append the inch
 * mark only to numeric values.
 */

const INCH = "″"; // ″ (double prime)

/** True when the raw size is a plain number we can suffix with an inch mark. */
function isNumericSize(size: string): boolean {
  return /^\d+(\.\d+)?$/.test(size.trim());
}

/** Format a single size token: `55` → `55″`, `Custom` → `Custom`. */
export function formatSize(size: string): string {
  return isNumericSize(size) ? `${size}${INCH}` : size;
}

/**
 * Format a list of sizes as a compact label:
 *  - one size            → `55″` (or `Custom`)
 *  - multiple numeric     → `43″ – 82″`
 *  - mixed/non-numeric    → joined individually, each formatted, e.g. `55″, Custom`
 */
export function formatSizeRange(sizes: string[]): string {
  if (!sizes || sizes.length === 0) return "";
  if (sizes.length === 1) return formatSize(sizes[0]);

  const allNumeric = sizes.every(isNumericSize);
  if (allNumeric) {
    // Sort numerically so the range reads low → high regardless of source order
    // (e.g. ["55","43","32"] still renders `32″ – 55″`, not `55″ – 32″`).
    const sorted = [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
    return `${formatSize(sorted[0])} – ${formatSize(sorted[sorted.length - 1])}`;
  }
  return sizes.map(formatSize).join(", ");
}
