import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogBySlug } from "@/data/blogs";
import type { Metadata } from "next";

interface BlogPageParams {
  slug: string;
}

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

  const publishedDate = new Date(post.date);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    datePublished: post.date,
    author: { "@type": "Organization", name: "Aplus Technology Solutions" },
    publisher: {
      "@type": "Organization",
      name: "Aplus Technology Solutions",
      logo: { "@type": "ImageObject", url: "https://www.aplustechsol.com/assets/img/logo.webp" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://www.aplustechsol.com/blogs/${post.slug}` },
  };

  return (
    <div className="bg-gray-50 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blogs" className="hover:text-blue-600">
            Blogs & Insights
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        {/* Meta */}
        <header className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Aplus Technology Solutions · Samsung Commercial Displays
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <time dateTime={post.date}>
              {publishedDate.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
            <span>•</span>
            <span>{post.readingTimeMinutes} min read</span>
            {post.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Body (simple paragraphs) */}
        <article className="prose prose-blue max-w-none">
          {post.body.split("\n").map((paragraph, index) =>
            paragraph.trim().length === 0 ? (
              <p key={index}>&nbsp;</p>
            ) : (
              <p key={index}>{paragraph}</p>
            )
          )}
        </article>
      </div>
    </div>
  );
}

