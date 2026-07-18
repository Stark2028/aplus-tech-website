import { ImageResponse } from "next/og";
import { products } from "@/data/products";
import { formatSizeRange } from "@/lib/formatSize";
import { ogBadgeLabel } from "./ogBadge";

export const alt = "Samsung Commercial Display — Aplus Technology Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);

  if (!product) {
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
        Product Not Found
      </div>,
      { ...size }
    );
  }

  const sizesLabel = formatSizeRange(product.specs.screenSizes);

  const specs = [
    product.specs.resolution,
    product.specs.brightness,
    sizesLabel,
    `${product.specs.operationTime} Operation`,
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #050b15 0%, #0d1f40 60%, #0a1628 100%)",
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
          background: "rgba(37, 99, 235, 0.18)",
          filter: "blur(80px)",
        }}
      />

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "auto" }}>
        <div
          style={{
            background: "rgba(37,99,235,0.2)",
            border: "1px solid rgba(37,99,235,0.4)",
            color: "#93c5fd",
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
          {ogBadgeLabel(product)}
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#9ca3af",
            padding: "6px 14px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
          }}
        >
          {product.category}
        </div>
      </div>

      {/* Series badge */}
      <div
        style={{
          color: "#60a5fa",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {product.series}
      </div>

      {/* Product name */}
      <div
        style={{
          color: "#ffffff",
          fontSize: product.name.length > 45 ? 38 : 46,
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 760,
        }}
      >
        {product.name}
      </div>

      {/* Spec pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48 }}>
        {specs.map((spec) => (
          <div
            key={spec}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.85)",
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            {spec}
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
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 17, fontWeight: 500 }}>
          aplustechsol.com
        </div>
        <div
          style={{
            background: "rgba(37,99,235,0.9)",
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
          Request a Free Quote →
        </div>
      </div>
    </div>,
    { ...size }
  );
}
