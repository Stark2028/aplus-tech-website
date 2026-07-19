import { ImageResponse } from "next/og";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import { products } from "@/data/products";
import { categoryOgAltFor } from "./ogAlt";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryById(slug as CategorySlug);

  return [
    {
      id: "og",
      alt: category ? categoryOgAltFor(category) : "Aplus Technology Solutions",
      size,
      contentType,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryById(slug as CategorySlug);

  if (!category) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1526",
          color: "white",
          fontSize: 32,
          fontFamily: "sans-serif",
        }}
      >
        Category Not Found
      </div>,
      { ...size }
    );
  }

  const categoryProducts = products.filter((p) => p.category === category.name);
  const productCount = categoryProducts.length;

  // Eyebrow pill: the site is Samsung-led, but Video Conferencing (Logitech)
  // and Education (Class Saathi / TagHive) must never carry Samsung wording.
  const isEducation = category.id === "education";
  const eyebrow = isEducation
    ? "Education"
    : category.id === "video-conferencing"
    ? "Video Conferencing"
    : "Samsung Category";

  // Education swaps the site-blue chrome for a Class Saathi emerald ramp.
  const theme = isEducation
    ? {
        bg: "linear-gradient(135deg, #04140c 0%, #0b3a25 60%, #06281a 100%)",
        glow: "rgba(16,185,129,0.18)",
        chipBg: "rgba(16,185,129,0.2)",
        chipBorder: "1px solid rgba(16,185,129,0.4)",
        chipText: "#6ee7b7",
        label: "#34d399",
        pillBg: "rgba(16,185,129,0.15)",
        pillBorder: "1px solid rgba(16,185,129,0.3)",
        cta: "rgba(5,150,105,0.9)",
      }
    : {
        bg: "linear-gradient(135deg, #050b15 0%, #0d1f40 60%, #0a1628 100%)",
        glow: "rgba(37, 99, 235, 0.18)",
        chipBg: "rgba(37,99,235,0.2)",
        chipBorder: "1px solid rgba(37,99,235,0.4)",
        chipText: "#93c5fd",
        label: "#60a5fa",
        pillBg: "rgba(37,99,235,0.15)",
        pillBorder: "1px solid rgba(37,99,235,0.3)",
        cta: "rgba(37,99,235,0.9)",
      };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        padding: "56px 64px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: theme.glow,
          filter: "blur(80px)",
        }}
      />

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "auto" }}>
        <div
          style={{
            background: theme.chipBg,
            border: theme.chipBorder,
            color: theme.chipText,
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
          {eyebrow}
        </div>
      </div>

      {/* Category label */}
      <div
        style={{
          color: theme.label,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {isEducation ? "Class Saathi by TagHive" : "Browse Products"}
      </div>

      {/* Category name */}
      <div
        style={{
          color: "#ffffff",
          fontSize: category.navLabel.length > 30 ? 48 : 56,
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 800,
        }}
      >
        {category.navLabel}
      </div>

      {/* Description */}
      <div
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 18,
          lineHeight: 1.5,
          marginBottom: 32,
          maxWidth: 820,
        }}
      >
        {category.description}
      </div>

      {/* Product count pill */}
      <div
        style={{
          background: theme.pillBg,
          border: theme.pillBorder,
          color: theme.chipText,
          padding: "10px 20px",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          // Satori (next/og) supports only flex/block/contents/none — NOT
          // inline-flex, which throws and fails the whole OG image. Use flex +
          // alignSelf:"flex-start" so the pill shrinks to its content (Satori
          // ignores width:"fit-content"). The flex display also satisfies the
          // >1-child rule for `{count} Products…`.
          display: "flex",
          alignItems: "center",
          alignSelf: "flex-start",
          marginBottom: 48,
        }}
      >
        {isEducation
          ? "Class Saathi — smart classrooms & AI-powered learning"
          : `${productCount} Products in This Category`}
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
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, fontWeight: 500 }}>
          aplustechsol.com
        </div>
        <div
          style={{
            background: theme.cta,
            color: "white",
            padding: "10px 24px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Explore Now →
        </div>
      </div>
    </div>,
    { ...size }
  );
}
