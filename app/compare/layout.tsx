import type { Metadata } from "next";

// /compare is a transactional utility page (side-by-side product comparison
// driven by query params). It has no standalone SEO value, so we both disallow
// it in robots.ts AND emit an explicit noindex — robots.txt alone does not stop
// Google from indexing a URL it discovers via internal links.
export const metadata: Metadata = {
  title: "Compare Products",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.aplustechsol.com/compare" },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
