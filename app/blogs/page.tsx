import Link from "next/link";
import { blogPosts } from "@/data/blogs";

export const metadata = {
  title: "Blogs & Insights | Aplus Technology Solutions",
  description:
    "Read insights, guides, and best practices for deploying Samsung commercial displays across enterprise, retail, and hospitality.",
};

export default function BlogListingPage() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date)
  );

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blogs & Insights
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practical guidance on planning, deploying, and scaling Samsung
            display solutions with Aplus Technology Solutions.
          </p>
        </header>

        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>•</span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.title}
                </Link>
              </h2>

              <p className="text-gray-600 mb-4">{post.excerpt}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 text-xs">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/blogs/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

