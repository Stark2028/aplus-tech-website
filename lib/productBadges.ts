export type BadgeType = "Best Seller" | "Popular" | "New";

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// ~30% of products get a badge; distribution: 10% Best Seller, 15% Popular, 5% New
export function getProductBadge(productId: string): BadgeType | null {
  const n = hash(productId) % 20;
  if (n === 0 || n === 1) return "Best Seller";
  if (n >= 2 && n <= 4) return "Popular";
  if (n === 5) return "New";
  return null;
}

// Realistic inquiry count seeded by product ID (range: 11–58)
export function getInquiryCount(productId: string): number {
  return 11 + (hash(productId + "inq") % 48);
}
