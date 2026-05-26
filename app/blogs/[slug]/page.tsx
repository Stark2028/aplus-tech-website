import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogBySlug } from "@/data/blogs";
import type { Metadata } from "next";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/ShareButtons";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { SITE, breadcrumbLd, jsonLdString } from "@/lib/jsonLd";

const ORG_REF = { "@id": `${SITE}/#organization` };

interface BlogPageParams {
  slug: string;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};

  const url = `https://www.aplustechsol.com/blogs/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      tags: post.tags,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<BlogPageParams>;
}) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return notFound();
  }

  // Related posts: share at least one tag, exclude self, max 3
  const related = blogPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  // Fallback: if fewer than 2 related, fill with any other posts
  const fallback = blogPosts.filter((p) => p.slug !== slug);
  const relatedFinal =
    related.length >= 2 ? related : fallback.slice(0, 3);

  const publishedDate = new Date(post.date);
  const pageUrl = `${SITE}/blogs/${post.slug}`;

  const wordCount = post.body.trim().split(/\s+/).filter(Boolean).length;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    articleSection: post.tags[0] ?? "Insights",
    wordCount,
    timeRequired: `PT${post.readingTimeMinutes}M`,
    inLanguage: "en-IN",
    datePublished: post.date,
    dateModified: post.date,
    image: {
      "@type": "ImageObject",
      url: `${SITE}/og-default.png`,
      width: 1200,
      height: 630,
    },
    author: ORG_REF,
    publisher: ORG_REF,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };

  const jsonLd = [
    articleLd,
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blogs" },
      { name: post.title, url: `/blogs/${post.slug}` },
    ]),
  ];

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <div className="bg-gray-50 min-h-screen">
        {/* Hero band */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="mb-5 text-sm text-gray-400 flex items-center justify-end gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blogs" className="hover:text-blue-600 transition-colors">Blogs &amp; Insights</Link>
              <span>/</span>
              <span className="text-gray-600 truncate max-w-50">{post.title}</span>
            </nav>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-base text-gray-500 mb-6 leading-relaxed">{post.excerpt}</p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  A
                </span>
                Aplus Technology Solutions
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                <time dateTime={post.date}>
                  {publishedDate.toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {post.readingTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <article className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 sm:px-10 py-10 prose prose-blue max-w-none prose-p:text-gray-700 prose-p:leading-relaxed">
            {post.body.split("\n").map((paragraph, index) =>
              paragraph.trim().length === 0 ? (
                <div key={index} className="h-4" />
              ) : (
                <p key={index}>{paragraph}</p>
              )
            )}
          </article>

          {/* Share row */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <ShareButtons title={post.title} url={pageUrl} />
          </div>

          {/* Quote CTA */}
          <div className="mt-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">
              Ready to get started?
            </p>
            <h2 className="text-2xl font-bold mb-3">
              Talk to a Samsung Display Specialist
            </h2>
            <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
              Get expert advice tailored to your space — hospitality, corporate, retail, or education. Free consultation, no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors"
              >
                Request a Free Quote
                <ArrowRight size={15} />
              </Link>
              <a
                href="tel:+919310509909"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Call +91 93105 09909
              </a>
            </div>
          </div>

          {/* Related posts */}
          {relatedFinal.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Related Articles</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedFinal.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blogs/${related.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {related.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{related.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                      Read article <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
