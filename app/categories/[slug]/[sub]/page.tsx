import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import { vcRoomGuides, getVcRoomGuide } from "@/data/vcRoomGuides";
import { educationSegments, getEducationSegment } from "@/data/educationSegments";
import { SITE, breadcrumbLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { subPageCrumbs } from "@/lib/subPageCrumbs";
import VcRoomGuideView from "@/components/vc/VcRoomGuide";
import EducationSegmentPage from "@/components/education/EducationSegmentPage";

export const revalidate = 3600;

// The valid (slug, sub) pairs are the fixed set enumerated below. Any other
// pair must 404 at the routing layer — without this, unknown pairs stream
// through loading.tsx + ISR and notFound() returns a soft 200 instead of a
// real 404 (vercel/next.js#63478, #76501).
export const dynamicParams = false;

interface PageParams {
  slug: CategorySlug;
  sub: string;
}

export async function generateStaticParams() {
  return [
    ...vcRoomGuides.map((g) => ({ slug: "video-conferencing", sub: g.slug })),
    ...educationSegments.map((s) => ({ slug: "education", sub: s.slug })),
  ];
}

/** Resolve a (slug, sub) pair to its page payload, or null. */
function resolve(slug: CategorySlug, sub: string) {
  const category = getCategoryById(slug);
  if (!category) return null;
  if (slug === "video-conferencing") {
    const guide = getVcRoomGuide(sub);
    return guide ? ({ kind: "vc", category, guide } as const) : null;
  }
  if (slug === "education") {
    const segment = getEducationSegment(sub);
    return segment ? ({ kind: "education", category, segment } as const) : null;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const found = resolve(slug, sub);
  if (!found) return {};
  const url = `${SITE}/categories/${slug}/${sub}`;
  // Both kinds share these fields — the route never needs the rest of either shape.
  const page = found.kind === "vc" ? found.guide : found.segment;
  const { title, intro, navLabel } = page;
  // Without an explicit keywords array, Next.js has these pages inherit
  // app/layout.tsx's global Samsung-signage keywords — which puts "Samsung
  // authorized distributor" in the <head> of Logitech and Class Saathi pages.
  // Same branch as the parent app/categories/[slug]/page.tsx, extended per
  // guide/segment via navLabel rather than a hardcoded list per slug.
  const keywords =
    found.kind === "vc"
      ? [
          `Logitech ${navLabel}`,
          `${navLabel} video conferencing India`,
          "Logitech video conferencing price India",
          "Microsoft Teams Rooms hardware India",
          "Zoom Rooms hardware India",
          "Aplus Technology Solutions",
        ]
      : [
          `Class Saathi ${navLabel}`,
          "Class Saathi",
          "classroom clickers",
          "student response system",
          "smart classroom India",
          "Aplus Technology Solutions",
        ];
  return {
    title,
    description: intro,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${navLabel} | Aplus Technology Solutions`,
      description: intro,
      // OG image comes from opengraph-image.tsx (file convention) — never
      // hardcode the URL here, generateImageMetadata mounts it under /og.
    },
    twitter: {
      card: "summary_large_image",
      title: `${navLabel} | Aplus Technology Solutions`,
      description: intro,
    },
  };
}

export default async function CategorySubPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, sub } = await params;
  const found = resolve(slug, sub);
  if (!found) notFound();

  const { category } = found;
  const page = found.kind === "vc" ? found.guide : found.segment;
  const jsonLd = [
    breadcrumbLd(subPageCrumbs(category, page)),
    faqPageLd(page.faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {found.kind === "vc" ? (
        <VcRoomGuideView guide={found.guide} category={category} />
      ) : (
        <EducationSegmentPage segment={found.segment} category={category} />
      )}
    </>
  );
}
