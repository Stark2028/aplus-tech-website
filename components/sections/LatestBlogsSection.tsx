import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/data/blogs";

export default function LatestBlogsSection() {
  // Get the latest 3 posts based on date
  const latestPosts = [...blogPosts]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 3);

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">
              Knowledge Base
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              Latest Articles & Insights
            </h3>
            <p className="text-lg text-gray-600">
              Discover industry trends, setup guides, and best practices for your Samsung display solutions.
            </p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full font-semibold hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap shrink-0 shadow-sm hover:shadow"
          >
            View all articles <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
            >
              <div className="h-1.5 w-full bg-linear-to-r from-gray-200 to-gray-100 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300" />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-gray-500 mb-6 leading-relaxed line-clamp-3 flex-1 text-sm">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {post.readingTimeMinutes} min
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
