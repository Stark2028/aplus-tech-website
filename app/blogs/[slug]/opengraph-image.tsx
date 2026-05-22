import { ImageResponse } from "next/og";
import { getBlogBySlug } from "@/data/blogs";

export const alt = "Aplus Technology Solutions — Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f1e",
          color: "white",
          fontSize: 32,
          fontFamily: "sans-serif",
        }}
      >
        Post Not Found
      </div>,
      { ...size }
    );
  }

  const publishedDate = new Date(post.date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a35 55%, #050b18 100%)",
        padding: "56px 64px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.15)",
          filter: "blur(90px)",
        }}
      />

      {/* Top label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "auto" }}>
        <div
          style={{
            background: "rgba(99,102,241,0.2)",
            border: "1px solid rgba(99,102,241,0.35)",
            color: "#a5b4fc",
            padding: "6px 16px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          Aplus Tech · Insights
        </div>
      </div>

      {/* Blog title */}
      <div
        style={{
          color: "#ffffff",
          fontSize: post.title.length > 60 ? 36 : post.title.length > 45 ? 42 : 50,
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: 28,
          maxWidth: 900,
        }}
      >
        {post.title}
      </div>

      {/* Excerpt */}
      <div
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 18,
          lineHeight: 1.5,
          marginBottom: 32,
          maxWidth: 820,
        }}
      >
        {post.excerpt}
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
        {post.tags.slice(0, 3).map((tag) => (
          <div
            key={tag}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            {tag}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 15 }}>
            {publishedDate}
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 15 }}>·</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 15 }}>
            {post.readingTimeMinutes} min read
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 16, fontWeight: 500 }}>
          aplustechsol.com/blogs
        </div>
      </div>
    </div>,
    { ...size }
  );
}
