import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import { vcRoomGuides, getVcRoomGuide } from "@/data/vcRoomGuides";
import { SITE, breadcrumbLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { subPageCrumbs } from "@/lib/subPageCrumbs";
import VcRoomGuideView from "@/components/vc/VcRoomGuide";

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
  return vcRoomGuides.map((g) => ({ slug: "video-conferencing", sub: g.slug }));
}

/** Resolve a (slug, sub) pair to its page payload, or null. */
function resolve(slug: CategorySlug, sub: string) {
  const category = getCategoryById(slug);
  if (!category) return null;
  if (slug === "video-conferencing") {
    const guide = getVcRoomGuide(sub);
    return guide ? ({ kind: "vc", category, guide } as const) : null;
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
  const { title, intro, navLabel } = found.guide;
  return {
    title,
    description: intro,
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

  const { category, guide } = found;
  const jsonLd = [
    breadcrumbLd(subPageCrumbs(category, guide)),
    faqPageLd(guide.faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <VcRoomGuideView guide={guide} category={category} />
    </>
  );
}
