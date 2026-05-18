"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Tag } from "lucide-react";
import type { BlogPost } from "@/data/blogs";

interface BlogListingClientProps {
  featured: BlogPost;
  rest: BlogPost[];
  allTags: string[];
}

export default function BlogListingClient({ featured, rest, allTags }: BlogListingClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredRest = activeTag
    ? rest.filter((p) => p.tags.includes(activeTag))
    : rest;

  const featuredVisible = activeTag ? featured.tags.includes(activeTag) : true;

  return (
    <>
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveTag(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            activeTag === null
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTag === tag
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Featured post */}
      {featuredVisible && (
        <Link
          href={`/blogs/${featured.slug}`}
          className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 mb-8"
        >
          {/* Gradient banner */}
          <div className="h-2 w-full bg-linear-to-r from-blue-600 to-cyan-400" />
          <div className="p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full">
                Featured
              </span>
              {featured.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors leading-tight">
              {featured.title}
            </h2>
            <p className="text-gray-500 text-base mb-6 leading-relaxed max-w-3xl">
              {featured.excerpt}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <time dateTime={featured.date}>
                    {new Date(featured.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {featured.readingTimeMinutes} min read
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                Read article <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Rest of the posts — 2-column grid */}
      {filteredRest.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {filteredRest.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col"
            >
              <div className="h-1 w-full bg-linear-to-r from-gray-200 to-gray-100 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {post.readingTimeMinutes} min
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No articles found for this tag.</p>
          <button
            onClick={() => setActiveTag(null)}
            className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </>
  );
}
