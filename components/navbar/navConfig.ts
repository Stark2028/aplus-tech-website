export const SOLUTIONS = [
  { label: "Hospitality", href: "/solutions/hospitality" },
  { label: "Corporate & Workplace", href: "/solutions/corporate" },
  { label: "Education", href: "/solutions/education" },
  { label: "Retail & Public Spaces", href: "/solutions/retail" },
];

// Re-exported from the canonical contact module so existing
// `@/components/navbar/navConfig` imports keep working.
export { PHONE_DISPLAY as PHONE_NUMBER, PHONE_TEL } from "@/lib/contact";
