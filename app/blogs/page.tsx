import { blogPosts } from "@/data/blogs";
import BlogListingClient from "@/components/BlogListingClient";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blogs & Insights | Aplus Technology Solutions",
  description:
    "Read insights, guides, and best practices for deploying Samsung commercial displays across enterprise, retail, and hospitality.",
  alternates: { canonical: "https://www.aplustechsol.com/blogs" },
  openGraph: {
    type: "website",
    url: "https://www.aplustechsol.com/blogs",
    title: "Blogs & Insights | Aplus Technology Solutions",
    description:
      "Read insights, guides, and best practices for deploying Samsung commercial displays across enterprise, retail, and hospitality.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Aplus Technology Solutions Blogs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogs & Insights | Aplus Technology Solutions",
    description:
      "Read insights, guides, and best practices for deploying Samsung commercial displays across enterprise, retail, and hospitality.",
    images: ["/og-default.png"],
  },
};

export default function BlogListingPage() {
  const sorted = [...blogPosts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const [featured, ...rest] = sorted;

  const allTags = Array.from(new Set(sorted.flatMap((p) => p.tags))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Knowledge Base
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blogs &amp; Insights
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {featured ? (
          <BlogListingClient featured={featured} rest={rest} allTags={allTags} />
        ) : (
          <p className="text-center text-gray-400 py-20">No articles yet.</p>
        )}

        {/* CTA strip */}
        <div className="mt-14 bg-white rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-gray-900 mb-1">Want display advice for your project?</p>
            <p className="text-sm text-gray-500">Our specialists are happy to help — no obligation.</p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Talk to a Specialist
          </Link>
        </div>
      </div>
    </div>
  );
}
